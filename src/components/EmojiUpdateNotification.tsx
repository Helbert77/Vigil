import React from 'react';
import { useEmojiUpdates } from '../hooks/useEmojiUpdates';

interface EmojiUpdateNotificationProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  autoHide?: boolean;
  autoHideDelay?: number;
  showUpdateButton?: boolean;
  showCheckButton?: boolean;
  className?: string;
}

const EmojiUpdateNotification: React.FC<EmojiUpdateNotificationProps> = ({
  position = 'top-right',
  autoHide = true,
  autoHideDelay = 5000,
  showUpdateButton = true,
  showCheckButton = true,
  className = ''
}) => {
  const {
    hasUpdates,
    updateData,
    notification,
    dismissNotification,
    applyUpdates,
    checkForUpdates,
    isChecking
  } = useEmojiUpdates();

  // Auto-hide notification
  React.useEffect(() => {
    if (notification && autoHide) {
      const timer = setTimeout(() => {
        dismissNotification();
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [notification, autoHide, autoHideDelay, dismissNotification]);

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  const handleApplyUpdates = async () => {
    const success = await applyUpdates();
    if (success) {
      dismissNotification();
    }
  };

  const handleCheckUpdates = async () => {
    await checkForUpdates();
  };

  // Renderizar notificação de atualização disponível
  if (hasUpdates && updateData) {
    const emojiCount = updateData.newEmojis?.length || 0;
    const stickerCount = updateData.newStickers?.length || 0;

    return (
      <div className={`fixed ${positionClasses[position]} z-50 ${className}`}>
        <div className="bg-blue-500 text-white p-4 rounded-lg shadow-lg max-w-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1">
                🎉 Atualizações Disponíveis!
              </h4>
              <p className="text-xs opacity-90 mb-3">
                {emojiCount > 0 && `${emojiCount} novos emojis`}
                {emojiCount > 0 && stickerCount > 0 && ' e '}
                {stickerCount > 0 && `${stickerCount} novas figurinhas`}
              </p>
              
              <div className="flex gap-2">
                {showUpdateButton && (
                  <button
                    onClick={handleApplyUpdates}
                    className="bg-white text-blue-500 px-3 py-1 rounded text-xs font-medium hover:bg-gray-100 transition-colors"
                  >
                    Atualizar
                  </button>
                )}
                <button
                  onClick={dismissNotification}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-700 transition-colors"
                >
                  Depois
                </button>
              </div>
            </div>
            
            <button
              onClick={dismissNotification}
              className="ml-2 text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar notificação geral
  if (notification) {
    return (
      <div className={`fixed ${positionClasses[position]} z-50 ${className}`}>
        <div className="bg-green-500 text-white p-4 rounded-lg shadow-lg max-w-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm">{notification}</p>
              
              <div className="flex gap-2 mt-2">
                {showCheckButton && (
                  <button
                    onClick={handleCheckUpdates}
                    disabled={isChecking}
                    className="bg-white text-green-500 px-3 py-1 rounded text-xs font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    {isChecking ? 'Verificando...' : 'Verificar'}
                  </button>
                )}
              </div>
            </div>
            
            <button
              onClick={dismissNotification}
              className="ml-2 text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default EmojiUpdateNotification;