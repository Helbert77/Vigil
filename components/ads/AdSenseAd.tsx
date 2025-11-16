import React, { useEffect, useRef } from 'react';

interface AdSenseAdProps {
  client?: string;
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  responsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * Componente para exibir anúncios do Google AdSense
 * Usado como fallback quando não há anúncios próprios disponíveis
 */
const AdSenseAd: React.FC<AdSenseAdProps> = ({
  client = import.meta.env.VITE_ADSENSE_CLIENT_ID || '',
  slot = import.meta.env.VITE_ADSENSE_SLOT_FEED || '',
  format = 'auto',
  responsive = true,
  style = { display: 'block' },
  className = '',
}) => {
  const adRef = useRef<HTMLModElement>(null);
  const isAdPushed = useRef(false);

  useEffect(() => {
    // Verifica se o AdSense está configurado
    if (!client || !slot) {
      console.warn('AdSense não configurado. Defina VITE_ADSENSE_CLIENT_ID e VITE_ADSENSE_SLOT_FEED no .env');
      return;
    }

    // Carrega o script do AdSense se ainda não estiver carregado
    if (!window.adsbygoogle) {
      const script = document.createElement('script');
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }

    // Aguarda o script carregar e então inicializa o anúncio
    const initAd = () => {
      try {
        if (window.adsbygoogle && !isAdPushed.current) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          isAdPushed.current = true;
        }
      } catch (err) {
        console.error('Erro ao inicializar AdSense:', err);
      }
    };

    // Se o AdSense já estiver carregado, inicializa imediatamente
    if (window.adsbygoogle) {
      initAd();
    } else {
      // Caso contrário, aguarda o script carregar
      const checkAdSense = setInterval(() => {
        if (window.adsbygoogle) {
          clearInterval(checkAdSense);
          initAd();
        }
      }, 100);

      return () => clearInterval(checkAdSense);
    }
  }, [client, slot]);

  // Se não estiver configurado, não renderiza nada
  if (!client || !slot) {
    return null;
  }

  return (
    <div className={`adsense-container ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={style}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
};

// Declaração de tipos para window.adsbygoogle
declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export default AdSenseAd;

