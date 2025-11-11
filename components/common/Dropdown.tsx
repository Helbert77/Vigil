import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Icon } from '../icons/Icon';

interface DropdownOption {
  value: string;
  label: string;
  count?: number;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  'aria-label'?: string;
}

const ChevronDownIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
  <Icon className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
    <polyline points="6 9 12 15 18 9"></polyline>
  </Icon>
);

const CheckIcon = () => (
  <Icon className="h-4 w-4">
    <polyline points="20 6 9 17 4 12"></polyline>
  </Icon>
);

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Selecione uma opção',
  className = '',
  'aria-label': ariaLabel
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find(opt => opt.value === value) || options[0];
  const [minWidth, setMinWidth] = useState<string>('auto');

  // Calcular largura mínima baseada no maior texto
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      setMinWidth('180px');
      return;
    }
    
    // Usar fonte similar à do botão
    context.font = '500 16px system-ui, -apple-system, sans-serif';
    let maxWidth = 0;
    
    options.forEach(option => {
      let text = option.label;
      if (option.count !== undefined) {
        text += ` (${option.count})`;
      }
      const width = context.measureText(text).width;
      if (width > maxWidth) {
        maxWidth = width;
      }
    });
    
    // Adicionar padding (32px cada lado) e espaço para o ícone chevron (24px)
    const calculatedWidth = Math.max(maxWidth + 88, 150);
    setMinWidth(`${calculatedWidth}px`);
  }, [options]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside as EventListener);
      document.addEventListener('touchstart', handleClickOutside as EventListener);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside as EventListener);
      document.removeEventListener('touchstart', handleClickOutside as EventListener);
    };
  }, [isOpen]);

  // Fechar dropdown ao pressionar Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Manter foco dentro do dropdown quando aberto
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const firstOption = dropdownRef.current.querySelector('[role="option"]') as HTMLElement;
      firstOption?.focus();
    }
  }, [isOpen]);

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent, optionValue: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleOptionClick(optionValue);
    }
  };

  const handleButtonKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
      event.preventDefault();
      setIsOpen(true);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setIsOpen(true);
    }
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleButtonKeyDown}
        aria-label={ariaLabel || `Filtro: ${selectedOption.label}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`
          px-4 py-2.5 bg-light-bg dark:bg-dark-bg 
          border border-light-border dark:border-dark-border 
          rounded-lg text-left
          flex items-center justify-between gap-2
          focus:outline-none focus:ring-0
          text-gray-900 dark:text-white
          font-medium
          min-h-[42px]
          whitespace-nowrap
        `}
        style={{ minWidth: minWidth !== 'auto' ? minWidth : undefined }}
      >
        <span className="flex items-center gap-2 flex-1 min-w-0">
          <span>{selectedOption.label}</span>
          {selectedOption.count !== undefined && (
            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
              ({selectedOption.count})
            </span>
          )}
        </span>
        <ChevronDownIcon isOpen={isOpen} />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className={`
            absolute z-50 w-full mt-2
            bg-light-card dark:bg-dark-card
            border border-light-border dark:border-dark-border
            rounded-lg shadow-lg
            overflow-hidden
            max-h-64 overflow-y-auto
            min-w-full
          `}
          style={{
            minWidth: minWidth !== 'auto' ? minWidth : undefined
          }}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <div
                key={option.value}
                role="option"
                aria-selected={isSelected}
                tabIndex={0}
                onClick={() => handleOptionClick(option.value)}
                onKeyDown={(e) => handleKeyDown(e, option.value)}
                className={`
                  px-4 py-3 cursor-pointer
                  flex items-center justify-between
                  ${isSelected 
                    ? 'bg-primary text-white' 
                    : 'text-gray-900 dark:text-white'
                  }
                  whitespace-nowrap
                `}
              >
                <span className="flex items-center gap-2 flex-1 min-w-0">
                  <span>{option.label}</span>
                  {option.count !== undefined && (
                    <span className={`text-xs whitespace-nowrap ${
                      isSelected ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      ({option.count})
                    </span>
                  )}
                </span>
                {isSelected && (
                  <CheckIcon />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dropdown;

