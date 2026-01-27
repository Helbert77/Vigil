import React from 'react';
import Card from '@/components/common/Card';
import { useTranslation } from 'react-i18next';

const XIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CheckIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const InfoIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

interface CancellationConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing: boolean;
  plan: string;
  activeUntil: string | null;
}

const CancellationConfirmationModal: React.FC<CancellationConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isProcessing,
  plan,
  activeUntil,
}) => {
  const { t } = useTranslation(['premium', 'common']);

  if (!isOpen) return null;

  const planNames: Record<string, string> = {
    basic: 'Basic',
    pro: 'Pro',
    premium: 'Premium',
  };

  const planName = planNames[plan] || plan.toUpperCase();

  const formattedDate = activeUntil
    ? new Date(activeUntil).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 md:p-4"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-2xl max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              {t('premium:confirmCancellation')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('premium:plan')} {planName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 flex-shrink-0 p-1"
            disabled={isProcessing}
          >
            <XIcon />
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-0.5">
              <InfoIcon />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                ⏰ {t('premium:cancellationWarningTitle')}
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                {t('premium:cancellationWarningText', { plan: planName, date: formattedDate })}
              </p>
            </div>
          </div>
        </div>

        {/* O que acontece */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            📋 {t('premium:whatHappensTitle')}
          </h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                  <CheckIcon />
                </div>
              </div>
              <p className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                {t('premium:cancellationWarningText', { plan: planName, date: formattedDate })}
              </p>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                  <CheckIcon />
                </div>
              </div>
              <p className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                {t('premium:noFutureCharges')}
              </p>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                  <CheckIcon />
                </div>
              </div>
              <p className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                {t('premium:dataPreserved')}
              </p>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                  <CheckIcon />
                </div>
              </div>
              <p className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                {t('premium:reactivateAnytime', { date: formattedDate })}
              </p>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                  <CheckIcon />
                </div>
              </div>
              <p className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                {t('premium:planDowngrade', { date: formattedDate })}
              </p>
            </div>
          </div>
        </div>

        {/* O que você receberá */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            {t('premium:confirmationsTitle')}
          </h3>
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
              <span className="mr-2">📧</span>
              <span>
                {t('premium:confirmationEmail')}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
              <span className="mr-2">🔔</span>
              <span>
                {t('premium:appNotification')}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
              <span className="mr-2">📅</span>
              <span>
                {t('premium:reminder')}
              </span>
            </div>
          </div>
        </div>

        {/* Mudou de ideia */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200 mb-2">
            🔄 {t('premium:changedMindTitle')}
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-300">
            {t('premium:changedMindText', { date: formattedDate })}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('common:back')}
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {t('common:processing')}
              </>
            ) : (
              t('premium:confirmCancellation')
            )}
          </button>
        </div>

        {/* Footer note */}
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
          {t('premium:confirmationFooter')}
        </p>
      </Card>
    </div>
  );
};

export default CancellationConfirmationModal;