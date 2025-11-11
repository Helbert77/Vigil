import React from 'react';

interface TrialBannerProps {
  trialEndsAt: string;
  plan: string;
}

export const TrialBanner: React.FC<TrialBannerProps> = ({ trialEndsAt, plan }) => {
  const daysLeft = Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  return (
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-lg mb-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-lg">Teste Grátis do Plano {plan.toUpperCase()}</p>
          <p className="text-sm mt-1">
            {daysLeft > 0 
              ? `Restam ${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'}. Assine agora e continue com todos os benefícios!`
              : 'Seu período de teste expirou. Assine para continuar aproveitando os benefícios!'
            }
          </p>
        </div>
        {daysLeft > 0 && (
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 ml-4">
            <span className="text-2xl font-bold">{daysLeft}</span>
            <span className="text-xs block text-center">{daysLeft === 1 ? 'dia' : 'dias'}</span>
          </div>
        )}
      </div>
    </div>
  );
};

