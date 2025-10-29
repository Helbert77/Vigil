import React, { useEffect, useRef, useState } from 'react';
import { detectBrowser, addCompatibleEventListener, handleEventPropagation, applyCompatibleStyles } from '@/src/utils/browserCompatibility';

interface CrossBrowserButtonProps {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
  title?: string;
  style?: React.CSSProperties;
  onFocus?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  disableFocusRing?: boolean;
}

/**
 * Componente de botão otimizado para compatibilidade cross-browser
 * Inclui fallbacks específicos para Chrome, Brave e Trae
 */
const CrossBrowserButton: React.FC<CrossBrowserButtonProps> = ({
  children,
  onClick,
  className = '',
  disabled = false,
  type = 'button',
  'aria-label': ariaLabel,
  title,
  style,
  onFocus,
  onBlur,
  onKeyDown,
  disableFocusRing = false,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isPressed, setIsPressed] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const browser = detectBrowser();

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    // Aplica estilos específicos do navegador
    const browserSpecificStyles: Record<string, string> = {
      // Garante que o botão seja clicável em todos os navegadores
      'pointer-events': disabled ? 'none' : 'auto',
      'user-select': 'none',
      'touch-action': 'manipulation',
      // Previne zoom em dispositivos móveis
      'font-size': 'inherit',
    };

    // Estilos específicos para Chrome
    if (browser.isChrome) {
      browserSpecificStyles['-webkit-tap-highlight-color'] = 'transparent';
      browserSpecificStyles['-webkit-touch-callout'] = 'none';
      browserSpecificStyles['-webkit-user-select'] = 'none';
    }

    // Estilos específicos para Firefox
    if (browser.isFirefox) {
      browserSpecificStyles['-moz-user-select'] = 'none';
      browserSpecificStyles['outline'] = 'none';
    }

    // Estilos específicos para Safari
    if (browser.isSafari) {
      browserSpecificStyles['-webkit-appearance'] = 'none';
      browserSpecificStyles['border-radius'] = '0';
    }

    applyCompatibleStyles(button, browserSpecificStyles);

    // Event listeners compatíveis
    const removeClickListener = addCompatibleEventListener(
      button,
      'click',
      (event) => {
        if (disabled) {
          handleEventPropagation(event, true, true);
          return;
        }



        // Verifica se o clique é válido
        if (event.isTrusted !== false) {
          onClick?.(event as any);
        } else if (browser.isChrome) {
          console.warn('[Chrome Debug] Untrusted click event blocked');
        }
      },
      { passive: false }
    );

    const removeMouseDownListener = addCompatibleEventListener(
      button,
      'mousedown',
      () => setIsPressed(true)
    );

    const removeMouseUpListener = addCompatibleEventListener(
      button,
      'mouseup',
      () => setIsPressed(false)
    );

    const removeMouseLeaveListener = addCompatibleEventListener(
      button,
      'mouseleave',
      () => setIsPressed(false)
    );

    // Event listener para teclado (acessibilidade)
    const removeKeyDownListener = addCompatibleEventListener(
      button,
      'keydown',
      (event) => {
        const keyEvent = event as KeyboardEvent;
        
        if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
          if (!disabled) {
            handleEventPropagation(event, true, true);
            setIsPressed(true);
            
            // Simula clique para acessibilidade
            setTimeout(() => {
              setIsPressed(false);
              if (onClick) {
                const syntheticEvent = new MouseEvent('click', {
                  bubbles: true,
                  cancelable: true,
                  view: window
                });
                onClick(syntheticEvent as any);
              }
            }, 100);
          }
        }
        
        onKeyDown?.(keyEvent as any);
      }
    );

    // Cleanup
    return () => {
      removeClickListener();
      removeMouseDownListener();
      removeMouseUpListener();
      removeMouseLeaveListener();
      removeKeyDownListener();
    };
  }, [onClick, disabled, browser, onKeyDown]);

  // Handlers para focus/blur
  const handleFocus = (event: React.FocusEvent<HTMLButtonElement>) => {
    setIsFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event: React.FocusEvent<HTMLButtonElement>) => {
    setIsFocused(false);
    setIsPressed(false);
    onBlur?.(event);
  };

  // Classes CSS dinâmicas baseadas no estado e navegador
  const getButtonClasses = () => {
    const baseClasses = className;
    const stateClasses = [];
    
    if (isPressed) stateClasses.push('active:scale-95');
    if (isFocused && !disableFocusRing) stateClasses.push('ring-2 ring-blue-500 ring-opacity-50');
    if (disabled) stateClasses.push('opacity-50 cursor-not-allowed');
    
    // Classes específicas do navegador
    if (browser.isChrome) stateClasses.push('browser-chrome-button');
    if (browser.isBrave) stateClasses.push('browser-brave-button');
    if (browser.isTrae) stateClasses.push('browser-trae-button');
    if (browser.isFirefox) stateClasses.push('browser-firefox-button');
    if (browser.isSafari) stateClasses.push('browser-safari-button');
    
    return [baseClasses, ...stateClasses].filter(Boolean).join(' ');
  };

  return (
    <button
      ref={buttonRef}
      type={type}
      className={getButtonClasses()}
      disabled={disabled}
      aria-label={ariaLabel}
      title={title}
      style={style}
      onFocus={handleFocus}
      onBlur={handleBlur}
      role="button"
      tabIndex={disabled ? -1 : 0}
      {...props}
    >
      {children}
    </button>
  );
};

export default CrossBrowserButton;