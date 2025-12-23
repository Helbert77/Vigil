import React, { useEffect, useState } from 'react';
import { UserGamification, UserAchievement, Achievement, Mission, UserMissionProgress } from '@/types';
import * as api from '@/src/services/api';
import { useToast } from '@/hooks/useToast';

interface GamificationTabProps {
  userId: string;
  isOwnProfile: boolean;
}

export const GamificationTab: React.FC<GamificationTabProps> = ({ userId, isOwnProfile }) => {
  const { addToast } = useToast();
  const [gamification, setGamification] = useState<UserGamification | null>(null);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [missionProgress, setMissionProgress] = useState<UserMissionProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'overview' | 'achievements' | 'missions'>('overview');

  useEffect(() => {
    loadGamificationData();
  }, [userId]);

  const loadGamificationData = async () => {
    setLoading(true);
    try {
      // Carregar dados de gamificação
      const { data: gamData, error: gamError } = await api.fetchUserGamification(userId);
      if (!gamError && gamData) {
        setGamification(gamData);
      }

      // Carregar conquistas do usuário
      const { data: userAch, error: achError } = await api.fetchUserAchievements(userId);
      if (!achError && userAch) {
        setAchievements(userAch);
      }

      // Carregar todas as conquistas
      const { data: allAch, error: allAchError } = await api.fetchAllAchievements();
      if (!allAchError && allAch) {
        setAllAchievements(allAch);
      }

      // Se for perfil próprio, carregar missões
      if (isOwnProfile) {
        const { data: missionsData, error: missionsError } = await api.fetchActiveMissions();
        if (!missionsError && missionsData) {
          setMissions(missionsData);
        }

        const { data: progressData, error: progressError } = await api.fetchUserMissionProgress(userId);
        if (!progressError && progressData) {
          setMissionProgress(progressData);
        }
      }
    } catch (error) {
      console.error('[GamificationTab] Error loading data:', error);
      addToast('Erro ao carregar dados de gamificação', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    if (!gamification) return 0;
    const xpInCurrentLevel = gamification.total_xp - calculateXPForLevel(gamification.current_level - 1);
    const xpNeededForNextLevel = gamification.xp_to_next_level - calculateXPForLevel(gamification.current_level - 1);
    return (xpInCurrentLevel / xpNeededForNextLevel) * 100;
  };

  const calculateXPForLevel = (level: number) => {
    if (level <= 0) return 0;
    return Math.floor(100 * Math.pow(level, 1.5));
  };

  const getLevelName = (level: number) => {
    if (level <= 5) return 'Iniciante';
    if (level <= 10) return 'Explorador';
    if (level <= 15) return 'Veterano';
    if (level <= 20) return 'Elite';
    return 'Lendário';
  };

  const getAchievementProgress = (achievement: Achievement) => {
    const userAch = achievements.find(a => a.achievement_id === achievement.id);
    return userAch ? 100 : 0;
  };

  const getMissionProgressData = (mission: Mission) => {
    const progress = missionProgress.find(p => p.mission_id === mission.id);
    return progress || null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!gamification) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          Dados de gamificação não disponíveis
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <button
          onClick={() => setActiveSection('overview')}
          className={`px-4 py-2 font-semibold whitespace-nowrap transition-colors ${
            activeSection === 'overview'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          📊 Visão Geral
        </button>
        <button
          onClick={() => setActiveSection('achievements')}
          className={`px-4 py-2 font-semibold whitespace-nowrap transition-colors ${
            activeSection === 'achievements'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          🏆 Conquistas ({achievements.length}/{allAchievements.length})
        </button>
        {isOwnProfile && (
          <button
            onClick={() => setActiveSection('missions')}
            className={`px-4 py-2 font-semibold whitespace-nowrap transition-colors ${
              activeSection === 'missions'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            🎯 Missões
          </button>
        )}
      </div>

      {/* Overview Section */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          {/* Level Card */}
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <div className="text-sm opacity-90 mb-1">Nível Atual</div>
                <div className="text-5xl md:text-6xl font-bold mb-2">{gamification.current_level}</div>
                <div className="text-xl font-semibold">{getLevelName(gamification.current_level)}</div>
              </div>
              <div className="flex-1 w-full md:max-w-md">
                <div className="text-sm opacity-90 mb-2">Progresso para Nível {gamification.current_level + 1}</div>
                <div className="bg-white/20 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-white h-full transition-all duration-500"
                    style={{ width: `${calculateProgress()}%` }}
                  />
                </div>
                <div className="text-sm mt-2 opacity-90">
                  {gamification.total_xp.toLocaleString()} / {gamification.xp_to_next_level.toLocaleString()} XP
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-light-card dark:bg-dark-card rounded-xl p-4 border border-light-border dark:border-dark-border">
              <div className="text-3xl mb-2">⭐</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {gamification.total_xp.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">XP Total</div>
            </div>

            <div className="bg-light-card dark:bg-dark-card rounded-xl p-4 border border-light-border dark:border-dark-border">
              <div className="text-3xl mb-2">🏆</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {achievements.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Conquistas</div>
            </div>

            <div className="bg-light-card dark:bg-dark-card rounded-xl p-4 border border-light-border dark:border-dark-border">
              <div className="text-3xl mb-2">🔥</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {gamification.daily_login_streak}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Dias Consecutivos</div>
            </div>
          </div>

          {/* Recent Achievements */}
          {achievements.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                🏆 Conquistas Recentes
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {achievements.slice(0, 4).map((userAch) => (
                  <div
                    key={userAch.id}
                    className="bg-light-card dark:bg-dark-card rounded-xl p-4 border border-light-border dark:border-dark-border flex items-center gap-3"
                  >
                    <div className="text-4xl">{userAch.achievement?.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 dark:text-white truncate">
                        {userAch.achievement?.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {userAch.achievement?.description}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                        +{userAch.achievement?.xp_reward} XP
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Achievements Section */}
      {activeSection === 'achievements' && (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {achievements.length} de {allAchievements.length} conquistas desbloqueadas
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allAchievements.map((achievement) => {
              const isUnlocked = achievements.some(a => a.achievement_id === achievement.id);
              const userAch = achievements.find(a => a.achievement_id === achievement.id);

              return (
                <div
                  key={achievement.id}
                  className={`rounded-xl p-4 border transition-all ${
                    isUnlocked
                      ? 'bg-light-card dark:bg-dark-card border-green-500 dark:border-green-600'
                      : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`text-4xl ${!isUnlocked && 'grayscale'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {achievement.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {achievement.description}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                          +{achievement.xp_reward} XP
                        </div>
                        {isUnlocked && userAch && (
                          <div className="text-xs text-green-600 dark:text-green-400">
                            ✓ {new Date(userAch.unlocked_at).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Missions Section */}
      {activeSection === 'missions' && isOwnProfile && (
        <div className="space-y-6">
          {/* Daily Missions */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>☀️</span>
              Missões Diárias
              <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                (Reset às 00:00)
              </span>
            </h3>
            <div className="space-y-3">
              {missions.filter(m => m.mission_type === 'daily').map((mission) => {
                const progress = getMissionProgressData(mission);
                const currentCount = progress?.current_count || 0;
                const percentage = (currentCount / mission.target_count) * 100;
                const isCompleted = progress?.completed || false;

                return (
                  <div
                    key={mission.id}
                    className={`bg-light-card dark:bg-dark-card rounded-xl p-4 border ${
                      isCompleted
                        ? 'border-green-500 dark:border-green-600'
                        : 'border-light-border dark:border-dark-border'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          {mission.name}
                          {isCompleted && <span className="text-green-500">✓</span>}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {mission.description}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                          +{mission.xp_reward} XP
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">
                          Progresso: {currentCount}/{mission.target_count}
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {Math.min(100, Math.round(percentage))}%
                        </span>
                      </div>
                      <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            isCompleted ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min(100, percentage)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly Missions */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>📅</span>
              Missões Semanais
              <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                (Reset segunda-feira)
              </span>
            </h3>
            <div className="space-y-3">
              {missions.filter(m => m.mission_type === 'weekly').map((mission) => {
                const progress = getMissionProgressData(mission);
                const currentCount = progress?.current_count || 0;
                const percentage = (currentCount / mission.target_count) * 100;
                const isCompleted = progress?.completed || false;

                return (
                  <div
                    key={mission.id}
                    className={`bg-light-card dark:bg-dark-card rounded-xl p-4 border ${
                      isCompleted
                        ? 'border-green-500 dark:border-green-600'
                        : 'border-light-border dark:border-dark-border'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          {mission.name}
                          {isCompleted && <span className="text-green-500">✓</span>}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {mission.description}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                          +{mission.xp_reward} XP
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">
                          Progresso: {currentCount}/{mission.target_count}
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {Math.min(100, Math.round(percentage))}%
                        </span>
                      </div>
                      <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            isCompleted ? 'bg-green-500' : 'bg-purple-500'
                          }`}
                          style={{ width: `${Math.min(100, percentage)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

