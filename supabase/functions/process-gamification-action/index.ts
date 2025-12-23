import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GamificationAction {
  userId: string;
  actionType: 'post_created' | 'like_received' | 'comment_made' | 'comment_received' | 'login' | 'profile_completed';
  metadata?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, actionType, metadata }: GamificationAction = await req.json();

    if (!userId || !actionType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Mapear ação para XP e missões
    const actionConfig: Record<string, { xp: number; missionType?: string; achievementChecks?: Array<{ type: string; field: string }> }> = {
      post_created: { 
        xp: 10, 
        missionType: 'create_post',
        achievementChecks: [{ type: 'posts', field: 'post_count' }]
      },
      like_received: { 
        xp: 2,
        achievementChecks: [{ type: 'likes_received', field: 'likes_count' }]
      },
      comment_made: { 
        xp: 3, 
        missionType: 'make_comments',
        achievementChecks: [{ type: 'comments_made', field: 'comments_count' }]
      },
      comment_received: {
        xp: 5,
        achievementChecks: [{ type: 'comments_received', field: 'comments_received_count' }]
      },
      login: { 
        xp: 5 
      },
      profile_completed: { 
        xp: 50 
      },
    };

    const config = actionConfig[actionType];
    if (!config) {
      return new Response(
        JSON.stringify({ error: 'Invalid action type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: any = {
      xp_added: false,
      mission_updated: false,
      achievements_unlocked: [],
    };

    // 1. Adicionar XP
    const xpResult = await supabase.rpc('add_xp_to_user', {
      p_user_id: userId,
      p_xp_amount: config.xp,
      p_source_type: actionType,
      p_source_id: metadata?.sourceId,
      p_description: metadata?.description,
    });

    if (!xpResult.error) {
      results.xp_added = true;
      results.xp_result = xpResult.data;
    }

    // 2. Atualizar progresso de missões (se aplicável)
    if (config.missionType) {
      // Buscar missões ativas deste tipo
      const { data: missions } = await supabase
        .from('missions')
        .select('id')
        .eq('action_type', config.missionType)
        .eq('is_active', true);

      if (missions && missions.length > 0) {
        for (const mission of missions) {
          const missionResult = await supabase.rpc('update_mission_progress', {
            p_user_id: userId,
            p_mission_id: mission.id,
            p_increment: 1,
          });

          if (!missionResult.error && missionResult.data?.completed) {
            results.mission_updated = true;
            results.mission_completed = missionResult.data;
          }
        }
      }
    }

    // 3. Verificar conquistas (se aplicável)
    if (config.achievementChecks && metadata) {
      for (const check of config.achievementChecks) {
        const count = metadata[check.field];
        if (count) {
          // Mapeamento de conquistas
          const achievementMap: Record<string, Record<number, string>> = {
            posts: {
              1: 'first_post',
              50: 'content_creator',
              200: 'prolific_writer',
            },
            likes_received: {
              100: 'popular',
              500: 'liked',
            },
            comments_made: {
              100: 'conversationalist',
            },
            comments_received: {
              100: 'commented',
            },
          };

          const achievements = achievementMap[check.type];
          if (achievements && achievements[count]) {
            const achievementCode = achievements[count];
            const achievementResult = await supabase.rpc('unlock_achievement', {
              p_user_id: userId,
              p_achievement_code: achievementCode,
            });

            if (!achievementResult.error && achievementResult.data?.success) {
              results.achievements_unlocked.push(achievementResult.data.achievement);
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[process-gamification-action] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

