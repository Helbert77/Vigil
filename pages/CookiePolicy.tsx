import React from 'react';
import Card from '../components/common/Card';
import { Icon } from '../components/icons/Icon';

const FileTextIcon = () => <Icon className="h-16 w-16 text-primary mx-auto mb-4"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></Icon>;

const CookiePolicy: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Política de Cookies</h1>
      <Card>
        <div className="text-center p-4">
          <FileTextIcon />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Nossa Política de Cookies</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Esta Política de Cookies explica como o Vigil utiliza cookies e tecnologias semelhantes para 
            reconhecer você quando visita nosso aplicativo. Ela explica o que são essas tecnologias e 
            por que as usamos, bem como seus direitos de controlar nosso uso delas.
          </p>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">1. O que são cookies?</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Cookies são pequenos arquivos de dados que são colocados em seu computador ou dispositivo móvel 
            quando você visita um site. Os cookies são amplamente utilizados pelos proprietários de sites 
            para fazer com que seus sites funcionem, ou para funcionar de forma mais eficiente, bem como 
            para fornecer informações de relatórios.
          </p>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">2. Como usamos cookies?</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Usamos cookies para várias razões, incluindo para autenticar usuários, lembrar suas preferências, 
            personalizar conteúdo e analisar o tráfego do site. Os tipos específicos de cookies que usamos 
            incluem cookies essenciais, de desempenho e de funcionalidade.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Ao usar o Vigil, você concorda com o uso de cookies de acordo com esta política.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default CookiePolicy;