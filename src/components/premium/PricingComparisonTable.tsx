import React from 'react';
import Card from '@/components/common/Card';
import { Icon } from '@/components/icons/Icon';
import { CheckIcon } from '@/src/components/icons/CheckIcon';

// Ícone X para recursos ausentes
const XIcon = () => <Icon className="h-5 w-5 text-red-500 mx-auto"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></Icon>;

interface PricingComparisonTableProps {
  currentPlan: string;
}

interface Feature {
  name: string;
  free: string | boolean;
  basic: string | boolean;
  pro: string | boolean;
  premium: string | boolean;
}

// Features com valores de texto (aparecem primeiro)
const TEXT_FEATURES: Feature[] = [
  { name: "Limite de caracteres por post", free: "280", basic: "1.000", pro: "5.000", premium: "25.000" },
  { name: "Anúncios", free: true, basic: true, pro: true, premium: false },
  { name: "Suporte por e-mail", free: true, basic: true, pro: true, premium: true },
  { name: "Suporte via chat", free: false, basic: false, pro: false, premium: true },
];

// Features com ícones (aparecem depois)
const ICON_FEATURES: Feature[] = [
  { name: "Editar posts", free: false, basic: true, pro: true, premium: true },
  { name: "Acesso a comunidades", free: false, basic: true, pro: true, premium: true },
  { name: "Acesso à biblioteca", free: false, basic: false, pro: true, premium: true },
  { name: "Criar comunidades", free: false, basic: false, pro: false, premium: true },
  { name: "Selo verificado", free: false, basic: false, pro: true, premium: true },
  { name: "Acesso antecipado", free: false, basic: false, pro: false, premium: true },
];

// Combinar features: texto primeiro, ícones depois
const FEATURES: Feature[] = [...TEXT_FEATURES, ...ICON_FEATURES];

const PricingComparisonTable: React.FC<PricingComparisonTableProps> = ({ currentPlan }) => {
  const getPlanClass = (plan: string) => {
    if (currentPlan.toLowerCase() === plan.toLowerCase()) {
      return 'bg-primary/10 dark:bg-primary/20 border-primary';
    }
    return 'bg-light-bg dark:bg-dark-bg border-light-border dark:border-dark-border';
  };

  return (
    <div className="mt-16 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
        Compare os Planos
      </h2>
      <Card className="p-0 overflow-hidden border border-light-border dark:border-dark-border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-light-border dark:divide-dark-border">
            <thead className="bg-light-card dark:bg-dark-card">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Recursos
                </th>
                <th scope="col" className={`px-4 py-3 text-center text-sm font-semibold uppercase tracking-wider ${getPlanClass('free')}`}>
                  Free
                </th>
                <th scope="col" className={`px-4 py-3 text-center text-sm font-semibold uppercase tracking-wider ${getPlanClass('basic')}`}>
                  Basic
                </th>
                <th scope="col" className={`px-4 py-3 text-center text-sm font-semibold uppercase tracking-wider ${getPlanClass('pro')}`}>
                  Pro
                </th>
                <th scope="col" className={`px-4 py-3 text-center text-sm font-semibold uppercase tracking-wider ${getPlanClass('premium')}`}>
                  Premium
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border dark:divide-dark-border">
              {FEATURES.map((feature, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">
                    {feature.name}
                  </td>
                  <td className={`px-4 py-2 whitespace-nowrap text-center ${getPlanClass('free')}`}>
                    {typeof feature.free === 'string' ? (
                      <span className="text-sm text-gray-700 dark:text-gray-300">{feature.free}</span>
                    ) : feature.free ? (
                      <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <XIcon />
                    )}
                  </td>
                  <td className={`px-4 py-2 whitespace-nowrap text-center ${getPlanClass('basic')}`}>
                    {typeof feature.basic === 'string' ? (
                      <span className="text-sm text-gray-700 dark:text-gray-300">{feature.basic}</span>
                    ) : feature.basic ? (
                      <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <XIcon />
                    )}
                  </td>
                  <td className={`px-4 py-2 whitespace-nowrap text-center ${getPlanClass('pro')}`}>
                    {typeof feature.pro === 'string' ? (
                      <span className="text-sm text-gray-700 dark:text-gray-300">{feature.pro}</span>
                    ) : feature.pro ? (
                      <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <XIcon />
                    )}
                  </td>
                  <td className={`px-4 py-2 whitespace-nowrap text-center ${getPlanClass('premium')}`}>
                    {typeof feature.premium === 'string' ? (
                      <span className="text-sm text-gray-700 dark:text-gray-300">{feature.premium}</span>
                    ) : feature.premium ? (
                      <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <XIcon />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default PricingComparisonTable;