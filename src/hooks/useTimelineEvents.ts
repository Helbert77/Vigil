import { useState, useEffect, useCallback } from 'react';
import { TimelineEvent } from '../../types';
import { fetchTimelineEvents, updateEventPosition } from '../services/api';

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
        year: event.year,
        category: event.category,
        description: event.description,
        impact: event.impact,
        status: event.status,
        country: event.country,
        parent_id: event.parent_id,
        x_position: event.x_position || 0,
        y_position: event.y_position || 0,
        children_ids: event.children_ids || [],
        source_1: event.source_1,
        source_2: event.source_2,
        evidence_level: event.evidence_level,
        social_damage: event.social_damage,
        verification_priority: event.verification_priority,
        event_date: event.event_date,
        image_url: event.image_url
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

  return {
    events,
    loading,
    error,
    updatePosition,
    refetch: loadEvents
  };
};