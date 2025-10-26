import React from 'react';
import Card from '../components/common/Card';
import { Icon } from '../components/icons/Icon';

const ShieldCheckIcon = () => <Icon className="h-16 w-16 text-primary mx-auto mb-4"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></Icon>;

const PrivacyPolicy: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Política de Privacidade</h1>
      <Card>
        <div className="text-center p-4">
          <ShieldCheckIcon />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Sua Privacidade no Vigil</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            No Vigil, levamos sua privacidade a sério. Esta Política de Privacidade descreve como 
            coletamos, usamos e protegemos suas informações pessoais.
          </p>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">1. Informações que Coletamos</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Coletamos informações que você nos fornece diretamente, como seu nome de usuário, 
            endereço de e-mail e conteúdo de posts. Também coletamos dados de uso, como 
            interações com a plataforma e informações do dispositivo.
          </p>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">2. Como Usamos Suas Informações</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Usamos suas informações para operar, manter e melhorar o Vigil, personalizar sua 
            experiência, comunicar com você e garantir a segurança da plataforma.
          </p>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">3. Compartilhamento de Informações</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Não vendemos suas informações pessoais a terceiros. Podemos compartilhar dados 
            com provedores de serviços que nos ajudam a operar o Vigil, sempre sob acordos 
            de confidencialidade.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Sua confiança é fundamental para nós.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default PrivacyPolicy;