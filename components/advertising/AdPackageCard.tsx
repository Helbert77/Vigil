import React from 'react';
import { AdPackage, formatPrice, formatNumber } from '@/src/config/adPricing';

interface AdPackageCardProps {
  package: AdPackage;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

const CheckIcon = () => (
  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const AdPackageCard: React.FC<AdPackageCardProps> = ({
  package: pkg,
  isSelected,
  onSelect,
  disabled = false,
}) => {
  const getPackageColor = (name: string) => {
    switch (name) {
      case 'bronze':
        return 'from-orange-800 to-orange-600';
      case 'silver':
        return 'from-gray-400 to-gray-300';
      case 'gold':
        return 'from-yellow-500 to-yellow-400';
      case 'platinum':
        return 'from-purple-600 to-purple-500';
      default:
        return 'from-gray-600 to-gray-500';
    }
  };

  const getPackageIcon = (name: string) => {
    switch (name) {
      case 'bronze':
        return '🥉';
      case 'silver':
        return '🥈';
      case 'gold':
        return '🥇';
      case 'platinum':
        return '💎';
      default:
        return '📦';
    }
  };

  return (
    <div
      onClick={!disabled ? onSelect : undefined}
      className={`
        relative rounded-xl p-6 cursor-pointer transition-all duration-300 transform
        ${isSelected
          ? 'ring-4 ring-primary scale-105 shadow-2xl'
          : 'ring-2 ring-gray-300 dark:ring-dark-border hover:ring-primary hover:scale-102 shadow-lg hover:shadow-xl'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        bg-light-card dark:bg-dark-card
      `}
    >
      {/* Badge de destaque */}
      {pkg.badge && (
        <div className="absolute -top-3 -right-3">
          <span className={`
            inline-flex px-4 py-1 rounded-full text-xs font-semibold
            ${pkg.recommended
              ? 'bg-gradient-to-r from-primary to-blue-600 text-white'
              : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
            }
            shadow-lg
          `}>
            {pkg.badge}
          </span>
        </div>
      )}

      {/* Cabeçalho com ícone e gradiente */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`
            w-12 h-12 rounded-xl bg-gradient-to-br ${getPackageColor(pkg.name)}
            flex items-center justify-center text-2xl shadow-md
          `}>
            {getPackageIcon(pkg.name)}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {pkg.displayName}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Pacote {pkg.name}
            </p>
          </div>
        </div>

        {isSelected && (
          <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-full">
            <CheckIcon />
          </div>
        )}
      </div>

      {/* Preço */}
      <div className="mb-6">
        <div className="flex items-baseline space-x-2">
          <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
            {formatPrice(pkg.price)}
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            pagamento único
          </span>
        </div>
      </div>

      {/* Informações principais */}
      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-light-bg dark:bg-dark-bg rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary dark:text-primary">
            {pkg.duration}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 uppercase">
            Dias
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary dark:text-primary">
            {formatNumber(pkg.impressions)}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 uppercase">
            Impressões
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-3 mb-6">
        {pkg.features.map((feature, index) => (
          <div key={index} className="flex items-start space-x-2">
            <CheckIcon />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {feature}
            </span>
          </div>
        ))}
      </div>

      {/* Botão de seleção */}
      <button
        type="button"
        disabled={disabled}
        className={`
          w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200
          ${isSelected
            ? 'bg-primary text-white ring-2 ring-primary ring-offset-2'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
          }
          ${disabled ? 'cursor-not-allowed' : 'hover:scale-105'}
        `}
      >
        {isSelected ? 'Selecionado ✓' : 'Selecionar Pacote'}
      </button>

      {/* Informação adicional */}
      <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
        Custo por 1.000 impressões (CPM): {formatPrice((pkg.price / pkg.impressions) * 1000)}
      </p>
    </div>
  );
};

export default AdPackageCard;

