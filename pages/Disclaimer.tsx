import React from 'react';
import Card from '../components/common/Card';
import { Icon } from '../components/icons/Icon';

const AlertTriangleIcon = () => <Icon className="h-16 w-16 text-red-500 mx-auto mb-4"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" x2="12" y1="9" y2="13"></line><line x1="12" x2="12.01" y1="17" y2="17"></line></Icon>;

const Disclaimer: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Termos de Responsabilidade</h1>
      <Card>
        <div className="text-center p-4">
          <AlertTriangleIcon />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Aviso Legal do Vigil</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            As informações fornecidas no Vigil são apenas para fins de informação geral e discussão. 
            Não garantimos a precisão, integridade ou utilidade de qualquer informação na plataforma. 
            Qualquer confiança que você deposite em tais informações é estritamente por sua conta e risco.
          </p>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">1. Conteúdo do Usuário</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            O Vigil é uma plataforma para que os usuários compartilhem e discutam teorias. 
            As opiniões expressas pelos usuários são de sua exclusiva responsabilidade e não 
            refletem necessariamente as opiniões do Vigil. Não endossamos nem verificamos 
            a veracidade de nenhuma teoria ou informação postada pelos usuários.
          </p>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">2. Sem Aconselhamento Profissional</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            As informações no Vigil não se destinam a ser, e não devem ser interpretadas como, 
            aconselhamento profissional de qualquer tipo (legal, financeiro, médico, etc.). 
            Sempre procure o aconselhamento de profissionais qualificados para qualquer dúvida 
            que possa ter.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Ao usar o Vigil, você reconhece e concorda com este aviso legal.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Disclaimer;