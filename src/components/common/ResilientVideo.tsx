import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface ResilientVideoProps {
  src: string;
  controls?: boolean;
  className?: string;
  style?: React.CSSProperties;
  poster?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  /**
   * Preload mode. Por padrão, para fontes externas usa 'none' para evitar erros esporádicos.
   */
  preloadMode?: 'none' | 'metadata' | 'auto';
  onLoadedData?: (e: React.SyntheticEvent<HTMLVideoElement, Event>) => void;
}

type VideoState = 'idle' | 'loading' | 'ready' | 'error' | 'aborted' | 'stalled';

const ResilientVideo: React.FC<ResilientVideoProps> = ({
  src,
  controls = true,
  className,
  style,
  poster,
  autoPlay,
  muted,
  loop,
  playsInline = true,
  preloadMode,
  onLoadedData,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [state, setState] = useState<VideoState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState<number>(0);
  const [currentSrc, setCurrentSrc] = useState<string>(src);
  const [usedProxy, setUsedProxy] = useState<boolean>(false);

  const isExternal = useMemo(() => {
    try {
      const url = new URL(src, window.location.origin);
      return url.origin !== window.location.origin;
    } catch {
      return false;
    }
  }, [src]);

  useEffect(() => {
    // Atualiza a fonte quando o prop src mudar
    setCurrentSrc(src);
    setUsedProxy(false);
    setRetryKey((k) => k + 1);
  }, [src]);

  // Extrai classes rounded para aplicar também no overlay
  const roundedMatch = className?.match(/rounded-[^\s]*/);
  const roundedClass = roundedMatch ? roundedMatch[0] : 'rounded-lg';

  const setMediaErrorMessage = useCallback(() => {
    const mediaError = videoRef.current?.error;
    if (!mediaError) {
      setErrorMessage('Falha ao carregar o vídeo.');
      return;
    }
    switch (mediaError.code) {
      case MediaError.MEDIA_ERR_ABORTED:
        setErrorMessage('Reprodução abortada (ERR_ABORTED).');
        break;
      case MediaError.MEDIA_ERR_NETWORK:
        setErrorMessage('Erro de rede ao carregar o vídeo.');
        break;
      case MediaError.MEDIA_ERR_DECODE:
        setErrorMessage('Erro de decodificação. Arquivo corrompido ou formato não suportado.');
        break;
      case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
        setErrorMessage('Origem não suportada ou bloqueada por CORS.');
        break;
      default:
        setErrorMessage('Erro desconhecido ao reproduzir o vídeo.');
        break;
    }
  }, []);

  const handleLoadStart = useCallback(() => {
    setState('loading');
    setErrorMessage(null);
  }, []);

  const handleLoadedData = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
      setState('ready');
      setErrorMessage(null);
      onLoadedData?.(e);
    },
    [onLoadedData]
  );

  const tryProxyIfAvailable = useCallback(() => {
    try {
      const u = new URL(currentSrc, window.location.origin);
      if (!usedProxy && u.hostname === 'www.w3schools.com') {
        const proxied = `/proxy/w3${u.pathname}${u.search}`;
        setUsedProxy(true);
        setCurrentSrc(proxied);
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  }, [currentSrc, usedProxy]);

  const handleError = useCallback(() => {
    setState('error');
    setMediaErrorMessage();
    // Tenta automaticamente via proxy de desenvolvimento, quando aplicável
    const switched = tryProxyIfAvailable();
    if (switched) {
      setRetryKey((k) => k + 1);
      setState('loading');
      setErrorMessage(null);
    }
  }, [setMediaErrorMessage, tryProxyIfAvailable]);

  const handleAbort = useCallback(() => {
    setState('aborted');
    setErrorMessage('Requisição de mídia abortada (ERR_ABORTED).');
  }, []);

  const handleStalled = useCallback(() => {
    setState('stalled');
    setErrorMessage('Carregamento de mídia ficou lento ou parou (stalled).');
  }, []);

  const handleEmptied = useCallback(() => {
    // Fonte trocada ou esvaziada, tratar como erro recuperável
    setState('error');
    setErrorMessage('Fonte de mídia indisponível (emptied).');
  }, []);

  const retry = useCallback(() => {
    setErrorMessage(null);
    setState('idle');
    setRetryKey((k) => k + 1);
    // Tenta recarregar programaticamente
    setTimeout(() => {
      try {
        videoRef.current?.load();
      } catch {
        // Ignora
      }
    }, 10);
  }, []);

  useEffect(() => {
    // Se ficar em "loading" por muito tempo, marca como stalled
    if (state === 'loading') {
      const id = setTimeout(() => {
        if (state === 'loading') {
          setState('stalled');
          setErrorMessage('Tempo excedido ao carregar a mídia.');
        }
      }, 15000);
      return () => clearTimeout(id);
    }
  }, [state]);

  const containerStyle: React.CSSProperties = {
    ...style,
    // Garante altura mínima para o overlay ser visível quando houver erro
    minHeight:
      (style && (style as any).maxHeight) ? (style as any).maxHeight : ((style && (style as any).height) ? (style as any).height : '180px'),
  };

  const effectivePreload = preloadMode ?? (isExternal ? 'none' : 'metadata');

  return (
    <div className={`relative w-full ${roundedClass}`} style={containerStyle}>
      {(state === 'error' || state === 'aborted' || state === 'stalled') && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 text-white p-3 text-center">
          <p className="font-semibold text-sm md:text-base">
            {errorMessage || 'Falha ao carregar o vídeo.'}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={retry}
              className="bg-white/90 text-black font-semibold px-3 py-1 rounded-md hover:bg-white"
            >
              Tentar novamente
            </button>
            {src && (
              <a
                href={currentSrc}
                target="_blank"
                rel="noreferrer"
                className="bg-transparent border border-white/70 text-white font-semibold px-3 py-1 rounded-md hover:bg-white/10"
              >
                Abrir em nova aba
              </a>
            )}
            {src && (
              <a
                href={currentSrc}
                download
                className="bg-transparent border border-white/70 text-white font-semibold px-3 py-1 rounded-md hover:bg-white/10"
              >
                Baixar vídeo
              </a>
            )}
            {!usedProxy && isExternal && (
              <button
                type="button"
                onClick={() => {
                  const switched = tryProxyIfAvailable();
                  if (switched) {
                    setRetryKey((k) => k + 1);
                    setState('loading');
                    setErrorMessage(null);
                  }
                }}
                className="bg-transparent border border-white/70 text-white font-semibold px-3 py-1 rounded-md hover:bg-white/10"
              >
                Tentar via proxy
              </button>
            )}
          </div>
        </div>
      )}

      <video
        key={retryKey}
        ref={videoRef}
        src={currentSrc}
        controls={controls}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline={playsInline}
        preload={effectivePreload}
        // Não define crossOrigin por padrão para evitar bloqueios em hosts externos
        className={className}
        onLoadStart={handleLoadStart}
        onLoadedData={handleLoadedData}
        onError={handleError}
        onAbort={handleAbort}
        onStalled={handleStalled}
        onEmptied={handleEmptied}
      />
    </div>
  );
};

export default ResilientVideo;