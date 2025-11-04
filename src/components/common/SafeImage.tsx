import React, { useEffect, useRef, useState } from 'react';
import { logger } from '@/src/utils/Logger';

type SafeImageStatus = 'idle' | 'loading' | 'loaded' | 'error';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  minWidth?: number;
  minHeight?: number;
  allowExternalHosts?: string[];
}

const SUPPORTED_FORMATS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

// Cache global para evitar logs repetidos para o mesmo src
const erroredSrcs = new Set<string>();

const getFormatFromUrl = (url?: string): string | null => {
  if (!url) return null;
  try {
    const clean = url.split('?')[0].toLowerCase();
    const ext = clean.split('.').pop();
    return ext || null;
  } catch {
    return null;
  }
};

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className,
  fallbackSrc = '/logo.png',
  minWidth = 64,
  minHeight = 64,
  srcSet,
  sizes,
  loading = 'lazy',
  decoding = 'async',
  allowExternalHosts,
  ...rest
}) => {
  const [status, setStatus] = useState<SafeImageStatus>('idle');
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(src);
  const startTime = useRef<number>(0);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    // Reset quando src muda
    setStatus('loading');
    setCurrentSrc(src);
    startTime.current = performance.now();

    const format = getFormatFromUrl(src);
    if (format && !SUPPORTED_FORMATS.includes(format)) {
      logger.warn('Formato de imagem não suportado, usando fallback', { src, format }, 'library', 'SafeImage');
      if (fallbackSrc) {
        setCurrentSrc(fallbackSrc);
        // mantém status como 'loading' para medir o fallback
        startTime.current = performance.now();
      }
      return; // evita tentar carregar src inválido
    }

    // Permitir apenas mesma origem e hosts explicitamente permitidos
    try {
      if (src) {
        const url = new URL(src, window.location.origin);
        const isSameOrigin = url.origin === window.location.origin;
        const allowedHosts = allowExternalHosts ?? ['images.unsplash.com'];
        const isAllowed = isSameOrigin || allowedHosts.includes(url.hostname);
        if (!isAllowed) {
          logger.warn('Domínio de imagem não permitido, usando fallback', { src, host: url.hostname }, 'library', 'SafeImage');
          if (fallbackSrc) {
            setCurrentSrc(fallbackSrc);
            startTime.current = performance.now();
          }
          return;
        }
      }
    } catch {
      // Se não conseguir parsear a URL, tenta fallback
      if (fallbackSrc) {
        setCurrentSrc(fallbackSrc);
        startTime.current = performance.now();
      }
      return;
    }
  }, [src]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setStatus('loaded');
    const end = performance.now();
    const loadTime = end - startTime.current;
    const el = e.currentTarget;
    const naturalW = el.naturalWidth;
    const naturalH = el.naturalHeight;

    if (naturalW < minWidth || naturalH < minHeight) {
      logger.warn('Imagem com dimensões abaixo do mínimo', { src, naturalW, naturalH, minWidth, minHeight }, 'library', 'SafeImage');
    }

    if (loadTime > 2500) {
      logger.warn('Carregamento de imagem lento', { src, loadTimeMs: Math.round(loadTime) }, 'performance', 'SafeImage');
    } else {
      logger.debug('Imagem carregada', { src, loadTimeMs: Math.round(loadTime), naturalW, naturalH }, 'library', 'SafeImage');
    }
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setStatus('error');
    if (src && !erroredSrcs.has(src)) {
      logger.error('Falha no carregamento da imagem', { src }, 'library', 'SafeImage');
      erroredSrcs.add(src);
    }
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setStatus('loading');
      startTime.current = performance.now();
    }
  };

  return (
    <div className="relative flex items-center justify-center" aria-busy={status === 'loading'}>
      {status !== 'loaded' && (
        <div
          className="absolute inset-0 rounded-md"
          style={{
            background: 'linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 37%, #e5e7eb 63%)',
            backgroundSize: '400% 100%',
            animation: 'safeImageShimmer 1.4s ease infinite'
          }}
        />
      )}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        className={className}
        srcSet={srcSet}
        sizes={sizes}
        loading={loading}
        decoding={decoding}
        crossOrigin={"anonymous"}
        onLoad={handleLoad}
        onError={handleError}
        {...rest}
      />
      <style>{`
        @keyframes safeImageShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
};

export default SafeImage;