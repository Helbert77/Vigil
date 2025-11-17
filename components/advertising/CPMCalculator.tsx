import React, { useState, useEffect } from 'react';
import { AD_PRICING_CONFIG, formatPrice, formatNumber, calculateCPMImpressions, getCostPerImpression, isValidBudget } from '@/src/config/adPricing';

interface CPMCalculatorProps {
  onBudgetConfirm: (budget: number, estimatedImpressions: number) => void;
  disabled?: boolean;
}

const CPMCalculator: React.FC<CPMCalculatorProps> = ({ onBudgetConfirm, disabled = false }) => {
  const [budget, setBudget] = useState<number>(AD_PRICING_CONFIG.cpm.minBudget);
  const [estimatedImpressions, setEstimatedImpressions] = useState<number>(0);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const impressions = calculateCPMImpressions(budget);
    setEstimatedImpressions(impressions);

    if (!isValidBudget(budget)) {
      if (budget < AD_PRICING_CONFIG.cpm.minBudget) {
        setError(`Orçamento mínimo: ${formatPrice(AD_PRICING_CONFIG.cpm.minBudget)}`);
      } else {
        setError(`Orçamento máximo: ${formatPrice(AD_PRICING_CONFIG.cpm.maxBudget)}`);
      }
    } else {
      setError('');
    }
  }, [budget]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBudget(parseFloat(e.target.value));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setBudget(value);
  };

  const handleConfirm = () => {
    if (isValidBudget(budget)) {
      onBudgetConfirm(budget, estimatedImpressions);
    }
  };

  const costPerImpression = getCostPerImpression();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-2 border-gray-200 dark:border-gray-700">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Calculadora CPM
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Defina seu orçamento e veja quantas impressões você receberá
        </p>
      </div>

      {/* Exibição do orçamento */}
      <div className="mb-8 text-center">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Orçamento do Anúncio
        </label>
        <div className="flex items-center justify-center space-x-4">
          <input
            type="number"
            value={budget}
            onChange={handleInputChange}
            min={AD_PRICING_CONFIG.cpm.minBudget}
            max={AD_PRICING_CONFIG.cpm.maxBudget}
            step="1"
            disabled={disabled}
            className="
              w-32 text-4xl font-bold text-center rounded-lg
              bg-gray-50 dark:bg-gray-900 border-2 border-primary-500
              text-gray-900 dark:text-white
              focus:ring-2 focus:ring-primary-500 focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          />
          <span className="text-4xl font-bold text-gray-500">€</span>
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>

      {/* Slider */}
      <div className="mb-8">
        <input
          type="range"
          value={budget}
          onChange={handleSliderChange}
          min={AD_PRICING_CONFIG.cpm.minBudget}
          max={AD_PRICING_CONFIG.cpm.maxBudget}
          step="5"
          disabled={disabled}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary-600"
        />
        <div className="flex justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
          <span>{formatPrice(AD_PRICING_CONFIG.cpm.minBudget)}</span>
          <span>{formatPrice(AD_PRICING_CONFIG.cpm.maxBudget)}</span>
        </div>
      </div>

      {/* Métricas previstas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg p-4 text-center border border-primary-200 dark:border-primary-800">
          <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
            {formatNumber(estimatedImpressions)}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 uppercase mt-1">
            Impressões Estimadas
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 text-center border border-green-200 dark:border-green-800">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {formatPrice(AD_PRICING_CONFIG.cpm.rate)}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 uppercase mt-1">
            CPM (por 1.000)
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 text-center border border-blue-200 dark:border-blue-800">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {formatPrice(costPerImpression)}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 uppercase mt-1">
            Por Impressão
          </div>
        </div>
      </div>

      {/* Informações adicionais */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Como funciona o CPM?
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-7">
          <li>• Você paga {formatPrice(AD_PRICING_CONFIG.cpm.rate)} a cada 1.000 impressões</li>
          <li>• Seu anúncio para automaticamente quando o orçamento acabar</li>
          <li>• Você pode acompanhar o gasto em tempo real</li>
          <li>• Sem surpresas: você define o limite máximo</li>
        </ul>
      </div>

      {/* Botão de confirmação */}
      <button
        type="button"
        onClick={handleConfirm}
        disabled={disabled || !isValidBudget(budget)}
        className={`
          w-full py-4 px-6 rounded-lg font-semibold text-lg
          transition-all duration-200 transform
          ${isValidBudget(budget) && !disabled
            ? 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg hover:shadow-xl hover:scale-105'
            : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          }
        `}
      >
        {disabled 
          ? 'Aguarde...' 
          : isValidBudget(budget)
            ? `Usar Orçamento de ${formatPrice(budget)}`
            : 'Orçamento Inválido'
        }
      </button>

      {/* Aviso de aprovação */}
      <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
        ⚠️ Após o pagamento, seu anúncio passará por aprovação de um moderador antes de começar a ser exibido.
      </p>
    </div>
  );
};

export default CPMCalculator;

