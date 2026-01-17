import { useState, useEffect, useCallback, useRef } from 'react';

export interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unavailable' | null;
  timestamp: number | null;
}

export interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watch?: boolean; // Se true, atualiza continuamente
  updateInterval?: number; // Intervalo de atualização em ms (apenas se watch = true)
}

const DEFAULT_OPTIONS: UseGeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 300000, // 5 minutos
  watch: false,
  updateInterval: 60000 // 1 minuto
};

export const useGeolocation = (options: UseGeolocationOptions = {}) => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: true,
    permissionStatus: null,
    timestamp: null
  });

  const watchIdRef = useRef<number | null>(null);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  const updatePosition = useCallback((position: GeolocationPosition) => {
    setState({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      error: null,
      loading: false,
      permissionStatus: 'granted',
      timestamp: position.timestamp
    });
  }, []);

  const updateError = useCallback((error: GeolocationPositionError) => {
    let errorMessage = 'Erro ao obter localização';
    let permissionStatus: GeolocationState['permissionStatus'] = 'denied';

    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Permissão de localização negada';
        permissionStatus = 'denied';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Localização indisponível';
        permissionStatus = 'unavailable';
        break;
      case error.TIMEOUT:
        errorMessage = 'Tempo esgotado ao obter localização';
        permissionStatus = 'unavailable';
        break;
    }

    setState(prev => ({
      ...prev,
      error: errorMessage,
      loading: false,
      permissionStatus
    }));
  }, []);

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocalização não suportada pelo navegador',
        loading: false,
        permissionStatus: 'unavailable'
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      updatePosition,
      updateError,
      {
        enableHighAccuracy: opts.enableHighAccuracy,
        timeout: opts.timeout,
        maximumAge: opts.maximumAge
      }
    );
  }, [updatePosition, updateError, opts]);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) return;

    // Limpar watch anterior se existir
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      updatePosition,
      updateError,
      {
        enableHighAccuracy: opts.enableHighAccuracy,
        timeout: opts.timeout,
        maximumAge: opts.maximumAge
      }
    );
  }, [updatePosition, updateError, opts]);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalIdRef.current !== null) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  }, []);

  const refresh = useCallback(() => {
    setState(prev => ({ ...prev, loading: true }));
    getCurrentPosition();
  }, [getCurrentPosition]);

  useEffect(() => {
    // Verificar permissão se disponível
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        setState(prev => ({ 
          ...prev, 
          permissionStatus: result.state as 'granted' | 'denied' | 'prompt' 
        }));
      }).catch(() => {
        // Ignorar erro de permissão
      });
    }

    // Obter posição inicial
    getCurrentPosition();

    // Se watch estiver ativado, configurar atualização contínua
    if (opts.watch) {
      if (opts.updateInterval && opts.updateInterval > 0) {
        // Usar intervalo personalizado
        intervalIdRef.current = setInterval(() => {
          getCurrentPosition();
        }, opts.updateInterval);
      } else {
        // Usar watchPosition nativo
        startWatching();
      }
    }

    // Cleanup
    return () => {
      stopWatching();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.watch, opts.updateInterval]);

  return {
    ...state,
    refresh,
    startWatching,
    stopWatching
  };
};
