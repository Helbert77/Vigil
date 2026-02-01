import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface GoogleAdProps {
  /**
   * O ID do cliente do AdSense (ex: ca-pub-1234567890123456)
   * Você encontra isso no painel do AdSense -> Conta -> Configurações -> Informações da conta
   */
  client: string;
  /**
   * O ID do bloco de anúncios (slot). Criado no menu "Anúncios" -> "Por bloco de anúncios"
   */
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  responsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const GoogleAd: React.FC<GoogleAdProps> = ({ 
  client, 
  slot, 
  format = 'auto', 
  responsive = true,
  style,
  className 
}) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      // Verifica se o script do AdSense já está carregado, se não, carrega
      if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
        const script = document.createElement('script');
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
        script.async = true;
        script.crossOrigin = "anonymous";
        document.head.appendChild(script);
      }

      // Empurra o anúncio para a fila do Google
      const pushAd = () => {
        try {
          if (window.adsbygoogle) {
            window.adsbygoogle.push({});
          }
        } catch (e) {
          console.error('Erro ao carregar anúncio do AdSense:', e);
        }
      };

      // Pequeno delay para garantir que o DOM esteja pronto
      const timeout = setTimeout(pushAd, 100);
      return () => clearTimeout(timeout);

    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, [client, slot]);

  // Em ambiente de desenvolvimento (localhost), mostramos um placeholder
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  if (isDev) {
    return (
      <div 
        className={`bg-gray-200 dark:bg-gray-800 border-2 border-dashed border-gray-400 flex items-center justify-center text-center p-4 text-sm text-gray-500 ${className}`}
        style={{ minHeight: '100px', ...style }}
      >
        <div>
          <p className="font-bold">Google AdSense Placeholder</p>
          <p className="text-xs">Slot: {slot}</p>
          <p className="text-xs text-amber-600 mt-1">Anúncios não aparecem em localhost</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
};

export default GoogleAd;
