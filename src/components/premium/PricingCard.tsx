import React from "react";
import { motion } from "framer-motion";
import Button from "@/src/components/common/Button";
import { CheckIcon } from "@/src/components/icons/CheckIcon";
import { useTranslation } from 'react-i18next';

interface PricingCardProps {
  title: string;
  price: string;
  originalPrice?: string | null;
  promotionalDiscount?: number;
  features: string[];
  highlighted?: boolean;
  onSelect: () => void;
  onConfirm: () => void;
  isSelected: boolean;
  currentPlan?: string;
  isUpdatingPlan?: boolean;
  billingCycle: 'monthly' | 'annually';
  annualSavingsPercentage?: number;
  showTrialButton?: boolean;
  trialDays?: number;
  onStartTrial?: () => void;
  annualBonus?: { freeMonths: number; totalMonths: number };
  isPromotional?: boolean;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  originalPrice,
  promotionalDiscount,
  features,
  highlighted = false,
  onSelect,
  onConfirm,
  isSelected,
  currentPlan,
  isUpdatingPlan = false,
  billingCycle,
  annualSavingsPercentage,
  showTrialButton = false,
  trialDays,
  onStartTrial,
  annualBonus,
  isPromotional = false,
}) => {
  const { t } = useTranslation(['premium']);
  const isCurrentPlan = currentPlan?.toLowerCase() === title.toLowerCase();
  
  const buttonText = isCurrentPlan 
    ? t('premium:pricingCard.currentPlan') 
    : t('premium:pricingCard.choosePlan', { plan: title });

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      onClick={onSelect}
      className={`relative flex flex-col justify-between rounded-2xl p-4 md:p-6 shadow-lg border transition-all duration-300 cursor-pointer min-w-0 h-full
        ${highlighted
          ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white border-transparent"
          : "bg-light-card dark:bg-dark-card border-light-border dark:border-dark-border text-gray-900 dark:text-white"
        }
        ${isSelected ? 'ring-4 ring-primary animate-pulse-glow' : ''}
      `}
    >
      <div className="w-full">
        {/* Badges no topo */}
        <div className="flex flex-wrap gap-2 mb-3">
          {showTrialButton && trialDays && (
            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              {t('premium:pricingCard.trialDaysBanner', { days: trialDays })}
            </span>
          )}
          {isPromotional && (
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              {t('premium:pricingCard.launchPriceBanner')}
            </span>
          )}
          {annualBonus && billingCycle === 'annually' && (
            <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              {t('premium:pricingCard.bonusMonthsBanner', { months: annualBonus.freeMonths })}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg md:text-2xl font-semibold truncate">{title}</h3>
          <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-primary bg-primary' : 'border-gray-400'}`}>
            {isSelected && <CheckIcon className="w-3 h-3 md:w-4 md:h-4 text-white" />}
          </div>
        </div>
        
        {/* Preço com comparação (se houver preço original) */}
        <div className="mb-3">
          {originalPrice && (
            <div className="flex items-center gap-2 mb-1">
              <p className={`text-xs md:text-sm line-through ${highlighted ? 'text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
                {originalPrice}
              </p>
              {promotionalDiscount !== undefined && (
                <span className={`text-xs md:text-sm font-bold px-2 py-0.5 rounded ${highlighted ? 'bg-green-200 text-green-800' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                  -{promotionalDiscount}%
                </span>
              )}
            </div>
          )}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold break-words overflow-hidden w-full">{price}</p>
        </div>
        {billingCycle === 'annually' && annualSavingsPercentage !== undefined && annualSavingsPercentage > 0 && (
          <p className={`text-xs md:text-sm font-medium mb-4 md:mb-6 ${highlighted ? 'text-green-200' : 'text-green-600 dark:text-green-400'}`}>
            {t('premium:pricingCard.savePercent', { percent: Math.round(annualSavingsPercentage) })}
          </p>
        )}
        <ul className="space-y-2 md:space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <CheckIcon className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm md:text-base">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="space-y-2">
        {showTrialButton && onStartTrial && !isCurrentPlan && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onStartTrial();
            }}
            className="w-full text-sm md:text-base bg-green-600 text-white hover:bg-green-700"
          >
            {t('premium:pricingCard.startTrial')}
          </Button>
        )}
      <Button
        onClick={(e) => {
          e.stopPropagation(); // Impede que o clique no botão acione o onSelect do card
          onConfirm();
        }}
        className={`mt-6 md:mt-8 w-full text-sm md:text-base bg-secondary text-white hover:bg-blue-700
          ${!isSelected || isCurrentPlan || isUpdatingPlan ? 'opacity-70 cursor-not-allowed' : ''}
        `}
        disabled={!isSelected || isCurrentPlan || isUpdatingPlan}
      >
        {isUpdatingPlan && isSelected ? t('premium:pricingCard.updating') : buttonText}
      </Button>
      </div>
    </motion.div>
  );
};
