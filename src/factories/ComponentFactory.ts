/**
 * Factory Pattern para criação de componentes
 * 
 * Este factory centraliza a criação de diferentes tipos de componentes,
 * permitindo configuração flexível e reutilização de código.
 */

import React from 'react';

// Tipos de componentes suportados pelo factory
export type ComponentType = 'icon' | 'modal' | 'card' | 'button';

// Configurações base para componentes
export interface BaseComponentConfig {
  type: ComponentType;
  variant?: string;
  size?: 'small' | 'medium' | 'large';
  theme?: 'light' | 'dark';
  className?: string;
  id?: string;
}

// Configurações específicas para ícones
export interface IconConfig extends BaseComponentConfig {
  type: 'icon';
  iconType: 'eye' | 'eye-off' | 'check' | 'diamond' | 'post' | 'verified' | 'moderator';
  color?: string;
  strokeWidth?: number;
}

// Configurações específicas para modais
export interface ModalConfig extends BaseComponentConfig {
  type: 'modal';
  modalType: 'generic' | 'report' | 'cancellation' | 'image';
  title?: string;
  content?: React.ReactNode;
  onClose?: () => void;
  onConfirm?: () => void;
}

// Configurações específicas para cards
export interface CardConfig extends BaseComponentConfig {
  type: 'card';
  cardType: 'pricing' | 'moderation' | 'feedback';
  title?: string;
  content?: React.ReactNode;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
}

// Configurações específicas para botões
export interface ButtonConfig extends BaseComponentConfig {
  type: 'button';
  buttonType: 'primary' | 'secondary' | 'danger' | 'cross-browser';
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

// União de todos os tipos de configuração
export type ComponentConfig = IconConfig | ModalConfig | CardConfig | ButtonConfig;

/**
 * Factory principal para criação de componentes
 */
export class ComponentFactory {
  private static instance: ComponentFactory;

  private constructor() {}

  /**
   * Singleton pattern para garantir uma única instância
   */
  public static getInstance(): ComponentFactory {
    if (!ComponentFactory.instance) {
      ComponentFactory.instance = new ComponentFactory();
    }
    return ComponentFactory.instance;
  }

  /**
   * Cria um componente baseado na configuração fornecida
   */
  public createComponent(config: ComponentConfig): React.ComponentType<any> {
    switch (config.type) {
      case 'icon':
        return this.createIcon(config as IconConfig);
      case 'modal':
        return this.createModal(config as ModalConfig);
      case 'card':
        return this.createCard(config as CardConfig);
      case 'button':
        return this.createButton(config as ButtonConfig);
      default:
        throw new Error(`Tipo de componente não suportado: ${(config as any).type}`);
    }
  }

  /**
   * Factory específico para ícones
   */
  private createIcon(config: IconConfig): React.ComponentType<any> {
    const { iconType, size = 'medium', color, strokeWidth = 2, className = '' } = config;

    return (props: any) => {
      const sizeMap = {
        small: 16,
        medium: 24,
        large: 32
      };

      const iconSize = sizeMap[size];
      const iconProps = {
        width: iconSize,
        height: iconSize,
        color: color || 'currentColor',
        strokeWidth,
        className: `factory-icon factory-icon-${iconType} ${className}`,
        ...props
      };

      // Importação dinâmica dos ícones existentes
      switch (iconType) {
        case 'eye':
          const EyeIcon = require('@/components/icons/EyeIcon').default;
          return React.createElement(EyeIcon, iconProps);
        case 'eye-off':
          const EyeOffIcon = require('@/components/icons/EyeOffIcon').default;
          return React.createElement(EyeOffIcon, iconProps);
        case 'check':
          const CheckIcon = require('@/src/components/icons/CheckIcon').default;
          return React.createElement(CheckIcon, iconProps);
        case 'diamond':
          const DiamondIcon = require('@/src/components/icons/DiamondIcon').default;
          return React.createElement(DiamondIcon, iconProps);
        case 'post':
          const PostIcon = require('@/src/components/icons/PostIcon').default;
          return React.createElement(PostIcon, iconProps);
        case 'verified':
          const VerifiedBadgeIcon = require('@/src/components/icons/VerifiedBadgeIcon').default;
          return React.createElement(VerifiedBadgeIcon, iconProps);
        case 'moderator':
          const ModeratorBadgeIcon = require('@/src/components/icons/ModeratorBadgeIcon').default;
          return React.createElement(ModeratorBadgeIcon, iconProps);
        default:
          throw new Error(`Tipo de ícone não suportado: ${iconType}`);
      }
    };
  }

  /**
   * Factory específico para modais
   */
  private createModal(config: ModalConfig): React.ComponentType<any> {
    const { modalType, title, content, onClose, onConfirm, className = '' } = config;

    return (props: any) => {
      const modalProps = {
        title,
        onClose,
        onConfirm,
        className: `factory-modal factory-modal-${modalType} ${className}`,
        ...props
      };

      switch (modalType) {
        case 'generic':
          const GenericModal = require('@/src/components/common/GenericModal').default;
          return React.createElement(GenericModal, { ...modalProps, children: content });
        case 'report':
          const ReportModal = require('@/src/components/post/ReportModal').default;
          return React.createElement(ReportModal, modalProps);
        case 'cancellation':
          const CancellationModal = require('@/src/components/premium/CancellationModal').default;
          return React.createElement(CancellationModal, modalProps);
        case 'image':
          const AddEventImageModal = require('@/src/components/timeline/AddEventImageModal').default;
          return React.createElement(AddEventImageModal, modalProps);
        default:
          throw new Error(`Tipo de modal não suportado: ${modalType}`);
      }
    };
  }

  /**
   * Factory específico para cards
   */
  private createCard(config: CardConfig): React.ComponentType<any> {
    const { cardType, title, content, actions, className = '' } = config;

    return (props: any) => {
      const cardProps = {
        title,
        actions,
        className: `factory-card factory-card-${cardType} ${className}`,
        ...props
      };

      switch (cardType) {
        case 'pricing':
          const PricingCard = require('@/src/components/premium/PricingCard').default;
          return React.createElement(PricingCard, { ...cardProps, children: content });
        case 'moderation':
          const ModerationCard = require('@/src/components/admin/ModerationCard').default;
          return React.createElement(ModerationCard, cardProps);
        case 'feedback':
          const CancellationFeedbackCard = require('@/src/components/admin/CancellationFeedbackCard').default;
          return React.createElement(CancellationFeedbackCard, cardProps);
        default:
          throw new Error(`Tipo de card não suportado: ${cardType}`);
      }
    };
  }

  /**
   * Factory específico para botões
   */
  private createButton(config: ButtonConfig): React.ComponentType<any> {
    const { buttonType, label, onClick, disabled, loading, className = '' } = config;

    return (props: any) => {
      const buttonProps = {
        onClick,
        disabled,
        loading,
        className: `factory-button factory-button-${buttonType} ${className}`,
        children: label,
        ...props
      };

      switch (buttonType) {
        case 'cross-browser':
          const CrossBrowserButton = require('@/src/components/common/CrossBrowserButton').default;
          return React.createElement(CrossBrowserButton, buttonProps);
        case 'primary':
        case 'secondary':
        case 'danger':
          const Button = require('@/src/components/common/Button').default;
          return React.createElement(Button, { ...buttonProps, variant: buttonType });
        default:
          throw new Error(`Tipo de botão não suportado: ${buttonType}`);
      }
    };
  }

  /**
   * Método de conveniência para criar múltiplos componentes
   */
  public createComponents(configs: ComponentConfig[]): React.ComponentType<any>[] {
    return configs.map(config => this.createComponent(config));
  }

  /**
   * Registra um novo tipo de componente (extensibilidade)
   */
  public registerComponentType(
    type: string,
    factory: (config: any) => React.ComponentType<any>
  ): void {
    // Implementação futura para extensibilidade
    console.log(`Registrando novo tipo de componente: ${type}`);
  }
}

// Instância singleton exportada
export const componentFactory = ComponentFactory.getInstance();

// Funções de conveniência para uso direto
export const createIcon = (config: Omit<IconConfig, 'type'>) => 
  componentFactory.createComponent({ ...config, type: 'icon' });

export const createModal = (config: Omit<ModalConfig, 'type'>) => 
  componentFactory.createComponent({ ...config, type: 'modal' });

export const createCard = (config: Omit<CardConfig, 'type'>) => 
  componentFactory.createComponent({ ...config, type: 'card' });

export const createButton = (config: Omit<ButtonConfig, 'type'>) => 
  componentFactory.createComponent({ ...config, type: 'button' });