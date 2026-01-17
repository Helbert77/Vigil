import React from 'react';
import { Icon } from '@/components/icons/Icon';

interface LocationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnableLocation: () => void;
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unavailable' | null;
  locationError: string | null;
  maxDistance?: number;
  onMaxDistanceChange?: (distance: number) => void;
  isLocationEnabled?: boolean;
  onDisableLocation?: () => void;
}

const MapPinIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <Icon className={className}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </Icon>
);

const AlertCircleIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </Icon>
);

const CheckCircleIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <Icon className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </Icon>
);

const XIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <Icon className={className}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </Icon>
);

const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  isOpen,
  onClose,
  onEnableLocation,
  permissionStatus,
  locationError,
  maxDistance = 50,
  onMaxDistanceChange,
  isLocationEnabled = false,
  onDisableLocation
}) => {
  if (!isOpen) return null;

  const isGranted = permissionStatus === 'granted';
  const isDenied = permissionStatus === 'denied';
  const isUnavailable = permissionStatus === 'unavailable';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full my-4 max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header - Compacto */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-2 rounded-full">
              <MapPinIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-orbitron">Radar Discovery</h2>
              <p className="text-xs text-blue-100">Encontre pessoas próximas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors flex-shrink-0"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content - Compacto */}
        <div className="p-4">
          {/* Status da Permissão - Compacto */}
          {isGranted && (
            <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-2">
              <CheckCircleIcon className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm text-green-800 dark:text-green-300">
                  Localização Ativada
                </h3>
                <p className="text-xs text-green-700 dark:text-green-400">
                  Compartilhando com usuários próximos
                </p>
              </div>
            </div>
          )}

          {(isDenied || isUnavailable || locationError) && (
            <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
              <AlertCircleIcon className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm text-red-800 dark:text-red-300">
                  {isDenied ? 'Permissão Negada' : 'Indisponível'}
                </h3>
                <p className="text-xs text-red-700 dark:text-red-400">
                  {locationError || 'Não foi possível acessar.'}
                </p>
              </div>
            </div>
          )}

          {/* Descrição - Compacta */}
          <div className="mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2 text-sm">
              <span className="text-lg">🎯</span>
              Como funciona?
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Encontra usuários próximos em tempo real. Quanto mais perto, mais ao centro do radar.
            </p>
          </div>

          {/* Benefícios - Compactos */}
          <div className="mb-3 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-base">📍</span>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white text-xs">Pessoas próximas</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Usuários na sua região
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-base">🔒</span>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white text-xs">Privacidade</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Não armazenamos sua localização
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-base">⚡</span>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white text-xs">Tempo real</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Usuários conectados agora
                </p>
              </div>
            </div>
          </div>

          {/* Controle de Raio de Busca */}
          {isLocationEnabled && (
            <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-gray-900 dark:text-white text-xs mb-2 flex items-center gap-1">
                📏 Raio de Busca
              </h4>
              
              {/* Botões de Raio Rápido */}
              <div className="grid grid-cols-5 gap-1 mb-2">
                {[10, 50, 100, 500, 1000].map((distance) => (
                  <button
                    key={distance}
                    onClick={() => onMaxDistanceChange?.(distance)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      maxDistance === distance
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    {distance}km
                  </button>
                ))}
              </div>
              
              {/* Botão Global */}
              <button
                onClick={() => onMaxDistanceChange?.(maxDistance >= 20000 ? 50 : 20000)}
                className={`w-full px-3 py-2 rounded-lg text-xs font-semibold mb-2 transition-all ${
                  maxDistance >= 20000
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-gray-600 border border-purple-300 dark:border-purple-700'
                }`}
              >
                {maxDistance >= 20000 ? '🌍 Busca Global Ativa' : '🌍 Ativar Busca Global'}
              </button>
              
              {/* Slider para ajuste fino - SEMPRE ATIVO */}
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="10"
                  max="20000"
                  step="10"
                  value={maxDistance}
                  onChange={(e) => onMaxDistanceChange?.(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400 min-w-[80px] text-right">
                  {maxDistance >= 20000 ? '🌍 Global' : `${maxDistance} km`}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>10 km</span>
                <span>20.000 km</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                {maxDistance >= 20000 
                  ? '🌍 Mostrando usuários do mundo todo'
                  : maxDistance >= 500
                  ? '🌎 Alcance continental'
                  : maxDistance >= 100
                  ? '🗺️ Alcance regional'
                  : '📍 Alcance local'
                }
              </p>
            </div>
          )}

          {/* Informações de Privacidade - Compactas */}
          <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-900 dark:text-white text-xs mb-1 flex items-center gap-1">
              🛡️ Privacidade
            </h4>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
              <li>• Não salva no banco</li>
              <li>• Apenas em tempo real</li>
              <li>• Desative quando quiser</li>
              <li>• Desaparece ao sair</li>
            </ul>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-2">
            {!isLocationEnabled ? (
              <button
                onClick={onEnableLocation}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm"
              >
                Ativar Localização
              </button>
            ) : (
              <button
                onClick={() => {
                  onDisableLocation?.();
                  onClose();
                }}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm"
              >
                Desativar Localização
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-shrink-0 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
            >
              Fechar
            </button>
          </div>

          {/* Ajuda adicional para permissão negada - Compacta */}
          {isDenied && (
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Ative nas configurações do navegador
              </p>
              <button
                onClick={() => {
                  if (navigator.userAgent.includes('Chrome')) {
                    alert('Chrome: Clique no 🔒 ao lado da URL → Localização → Permitir');
                  } else if (navigator.userAgent.includes('Firefox')) {
                    alert('Firefox: Clique no 🔒 ao lado da URL → Localização → Permitir');
                  } else if (navigator.userAgent.includes('Safari')) {
                    alert('Safari: Preferências → Sites → Localização → Permitir');
                  } else {
                    alert('Procure o ícone 🔒 na barra de endereços.');
                  }
                }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Ver instruções
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationPermissionModal;
