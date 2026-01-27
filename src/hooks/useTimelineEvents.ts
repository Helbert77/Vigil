import { useState, useEffect, useCallback, startTransition } from 'react';
import { TimelineEvent } from '../../types';
import { fetchTimelineEvents, updateEventPosition } from '../services/api';
import { supabase } from '../../integrations/supabase/client';

export const useTimelineEvents = () => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await fetchTimelineEvents();
      
      if (error) throw error;
      
      const formattedEvents: TimelineEvent[] = data.map((event: any) => ({
        id: event.id,
        title: event.title,
        title_en: event.title_en,
        year: event.year,
        category: event.category,
        description: event.description,
        description_en: event.description_en,
        country: event.country,
        parent_id: event.parent_id,
        x_position: event.x_position || 0,
        y_position: event.y_position || 0,
        children_ids: event.children_ids || [],
        source_1: event.source_1,
        source_2: event.source_2,
        event_date: event.event_date,
        image_url: event.image_url,
        upvotes: event.upvotes || 0,
        downvotes: event.downvotes || 0,
        user_votes: event.user_votes || {}
      }));
      
      setEvents(formattedEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load timeline events');
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePosition = useCallback(async (eventId: string, x: number, y: number) => {
    try {
      const { error } = await updateEventPosition(eventId, x, y);
      if (error) throw error;
      
      // Update local state
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, x_position: x, y_position: y }
          : event
      ));
    } catch (err) {
        // Error log removed for production
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Realtime listener for timeline events - ultra optimized with startTransition
  useEffect(() => {
    const channel = supabase
      .channel('timeline_events_changes', {
        config: {
          broadcast: { self: false },
          presence: { key: '' }
        }
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'timeline_events'
        },
        (payload) => {
          // Defer ALL processing to next microtask - handler returns immediately
          queueMicrotask(() => {
            const eventType = payload.eventType;
            
            if (eventType === 'UPDATE') {
              const id = payload.new.id;
              const upvotes = payload.new.upvotes;
              const downvotes = payload.new.downvotes;
              const userVotes = payload.new.user_votes;
              
              startTransition(() => {
                setEvents(prev => {
                  const index = prev.findIndex(e => e.id === id);
                  if (index === -1) return prev;
                  
                  const existing = prev[index];
                  if (existing.upvotes === upvotes && existing.downvotes === downvotes) {
                    return prev;
                  }
                  
                  const updated = [...prev];
                  updated[index] = {
                    ...existing,
                    upvotes,
                    downvotes,
                    user_votes: userVotes
                  };
                  return updated;
                });
              });
              
            } else if (eventType === 'INSERT') {
              const newEvent = payload.new as TimelineEvent;
              
              startTransition(() => {
                setEvents(prev => {
                  if (prev.some(e => e.id === newEvent.id)) return prev;
                  const updated = [...prev, newEvent];
                  // Only sort if last event is out of order
                  if (updated.length > 1 && updated[updated.length - 2].year > newEvent.year) {
                    return updated.sort((a, b) => a.year - b.year);
                  }
                  return updated;
                });
              });
              
            } else if (eventType === 'DELETE') {
              const id = payload.old.id;
              
              startTransition(() => {
                setEvents(prev => {
                  const index = prev.findIndex(e => e.id === id);
                  if (index === -1) return prev;
                  const updated = [...prev];
                  updated.splice(index, 1);
                  return updated;
                });
              });
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    events,
    loading,
    error,
    updatePosition,
    refetch: loadEvents
  };
};