import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';
import { useGeolocation } from '@/src/hooks/useGeolocation';
import { 
  findNearbyUsers, 
  type UserWithLocation, 
  type NearbyUser,
  type Coordinates 
} from '@/src/utils/geoCalculations';

interface GeolocationPresenceContextType {
  // Estado de geolocalização do usuário atual
  currentUserLocation: Coordinates | null;
  locationError: string | null;
  locationLoading: boolean;
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unavailable' | null;
  
  // Usuários próximos
  nearbyUsers: NearbyUser[];
  allUsersWithLocation: UserWithLocation[];
  
  // Controles
  isLocationSharingEnabled: boolean;
  enableLocationSharing: () => void;
  disableLocationSharing: () => void;
  refreshLocation: () => void;
  
  // Configurações
  maxDistance: number;
  setMaxDistance: (distance: number) => void;
}

const GeolocationPresenceContext = createContext<GeolocationPresenceContextType | undefined>(undefined);

interface GeolocationPresenceProviderProps {
  children: ReactNode;
  channelName?: string; // Nome do canal Realtime (padrão: 'chat-geolocation')
  updateInterval?: number; // Intervalo de atualização em ms (padrão: 60000 = 1 minuto)
}

export const GeolocationPresenceProvider: React.FC<GeolocationPresenceProviderProps> = ({ 
  children, 
  channelName = 'chat-geolocation',
  updateInterval = 60000 
}) => {
  const { user } = useSession();
  const [isLocationSharingEnabled, setIsLocationSharingEnabled] = useState(false);
  const [maxDistance, setMaxDistance] = useState(50); // km
  const [allUsersWithLocation, setAllUsersWithLocation] = useState<UserWithLocation[]>([]);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [hasShownLocationToast, setHasShownLocationToast] = useState(false);
  
  // Hook de geolocalização (apenas quando compartilhamento está ativo)
  const geolocation = useGeolocation({
    enableHighAccuracy: true,
    watch: isLocationSharingEnabled,
    updateInterval: updateInterval
  });

  // Usar useMemo para estabilizar a referência do objeto de coordenadas
  const currentUserLocation: Coordinates | null = useMemo(() => {
    if (geolocation.latitude !== null && geolocation.longitude !== null) {
      return { latitude: geolocation.latitude, longitude: geolocation.longitude };
    }
    return null;
  }, [geolocation.latitude, geolocation.longitude]);

  // Mostrar popup quando localização for obtida pela primeira vez
  useEffect(() => {
    console.log('🔍 Verificando popup:', {
      currentUserLocation,
      isLocationSharingEnabled,
      hasShownLocationToast,
      latitude: geolocation.latitude,
      longitude: geolocation.longitude
    });
    
    if (currentUserLocation && isLocationSharingEnabled && !hasShownLocationToast) {
      console.log('✅ Mostrando popup de localização!');
      setHasShownLocationToast(true);
      
      // Criar popup customizado
      const popup = document.createElement('div');
      popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 24px 32px;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        z-index: 10000;
        font-family: system-ui, -apple-system, sans-serif;
        max-width: 90%;
        animation: slideIn 0.3s ease-out;
      `;
      
      popup.innerHTML = `
        <style>
          @keyframes slideIn {
            from { transform: translate(-50%, -60%); opacity: 0; }
            to { transform: translate(-50%, -50%); opacity: 1; }
          }
          @keyframes slideOut {
            from { transform: translate(-50%, -50%); opacity: 1; }
            to { transform: translate(-50%, -40%); opacity: 0; }
          }
        </style>
        <div style="text-align: center;">
          <div style="font-size: 48px; margin-bottom: 12px;">📍</div>
          <h3 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 600;">Localização Ativada!</h3>
          <p style="margin: 0 0 12px 0; font-size: 14px; opacity: 0.9;">Suas coordenadas:</p>
          <div style="background: rgba(255,255,255,0.2); padding: 12px; border-radius: 8px; font-family: monospace; font-size: 13px;">
            <div><strong>Latitude:</strong> ${currentUserLocation.latitude.toFixed(6)}</div>
            <div style="margin-top: 4px;"><strong>Longitude:</strong> ${currentUserLocation.longitude.toFixed(6)}</div>
            ${geolocation.accuracy ? `<div style="margin-top: 4px;"><strong>Precisão:</strong> ±${Math.round(geolocation.accuracy)}m</div>` : ''}
          </div>
          <p style="margin: 12px 0 0 0; font-size: 12px; opacity: 0.8;">Buscando usuários próximos...</p>
        </div>
      `;
      
      document.body.appendChild(popup);
      
      // Remover após 5 segundos
      setTimeout(() => {
        popup.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
          document.body.removeChild(popup);
        }, 300);
      }, 5000);
    }
  }, [currentUserLocation, isLocationSharingEnabled, hasShownLocationToast, geolocation.accuracy]);

  // Habilitar compartilhamento de localização
  const enableLocationSharing = useCallback(() => {
    console.log('🎯 Ativando compartilhamento de localização...');
    setIsLocationSharingEnabled(true);
    setHasShownLocationToast(false); // Reset para mostrar popup novamente
  }, []);

  // Desabilitar compartilhamento de localização
  const disableLocationSharing = useCallback(() => {
    setIsLocationSharingEnabled(false);
    setAllUsersWithLocation([]);
    setNearbyUsers([]);
  }, []);

  // Atualizar localização manualmente
  const refreshLocation = useCallback(() => {
    if (geolocation.refresh) {
      geolocation.refresh();
    }
  }, [geolocation]);

  // Gerenciar presença no Supabase Realtime
  useEffect(() => {
    if (!user || !isLocationSharingEnabled || !currentUserLocation) {
      return;
    }

    // Criar canal de presença
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    // Sincronizar estado de presença
    channel.on('presence', { event: 'sync' }, () => {
      const presenceState = channel.presenceState();
      const users: UserWithLocation[] = [];

      Object.keys(presenceState).forEach(key => {
        const presences = presenceState[key];
        if (presences && presences.length > 0) {
          const presence = presences[0] as any;
          
          // Ignorar o próprio usuário
          if (presence.user_id === user.id) return;
          
          // Validar dados de localização
          if (
            presence.latitude !== undefined && 
            presence.longitude !== undefined &&
            presence.user_id &&
            presence.username
          ) {
            users.push({
              id: presence.user_id,
              name: presence.name || presence.username,
              username: presence.username,
              avatarUrl: presence.avatar_url,
              coordinates: {
                latitude: presence.latitude,
                longitude: presence.longitude
              },
              accuracy: presence.accuracy,
              timestamp: presence.timestamp,
              interests: presence.interests,
              age: presence.age,
              location: presence.location,
              plan: presence.plan,
              role: presence.role
            });
          }
        }
      });

      setAllUsersWithLocation(users);
    });

    // Usuário entrou
    channel.on('presence', { event: 'join' }, ({ newPresences }) => {
      // Atualização será feita no sync
    });

    // Usuário saiu
    channel.on('presence', { event: 'leave' }, ({ leftPresences }) => {
      // Atualização será feita no sync
    });

    // Inscrever no canal e rastrear presença
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: user.id,
          username: user.username,
          name: user.name,
          avatar_url: user.avatarUrl,
          latitude: currentUserLocation.latitude,
          longitude: currentUserLocation.longitude,
          accuracy: geolocation.accuracy,
          timestamp: geolocation.timestamp || Date.now(),
          interests: (user as any).interests,
          age: (user as any).age,
          location: (user as any).location,
          plan: user.plan,
          role: user.role,
          online_at: new Date().toISOString()
        });
      }
    });

    // Cleanup: remover canal ao desmontar
    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [
    user, 
    isLocationSharingEnabled, 
    currentUserLocation, 
    channelName, 
    geolocation.accuracy, 
    geolocation.timestamp
  ]);

  // Calcular usuários próximos quando localização ou lista de usuários mudar
  useEffect(() => {
    if (!currentUserLocation || allUsersWithLocation.length === 0) {
      setNearbyUsers([]);
      return;
    }

    const nearby = findNearbyUsers(
      currentUserLocation,
      allUsersWithLocation,
      maxDistance
    );

    setNearbyUsers(nearby);
  }, [currentUserLocation, allUsersWithLocation, maxDistance]);

  const value: GeolocationPresenceContextType = {
    currentUserLocation,
    locationError: geolocation.error,
    locationLoading: geolocation.loading,
    permissionStatus: geolocation.permissionStatus,
    nearbyUsers,
    allUsersWithLocation,
    isLocationSharingEnabled,
    enableLocationSharing,
    disableLocationSharing,
    refreshLocation,
    maxDistance,
    setMaxDistance
  };

  return (
    <GeolocationPresenceContext.Provider value={value}>
      {children}
    </GeolocationPresenceContext.Provider>
  );
};

export const useGeolocationPresence = () => {
  const context = useContext(GeolocationPresenceContext);
  if (context === undefined) {
    throw new Error('useGeolocationPresence must be used within a GeolocationPresenceProvider');
  }
  return context;
};
