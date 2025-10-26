import React from 'react';
import Card from '../components/common/Card';
import { Icon } from '../components/icons/Icon';

const FileTextIcon = () => <Icon className="h-16 w-16 text-primary mx-auto mb-4"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></Icon>;

const TermsOfService: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Termos de Serviço</h1>
      <Card>
        <div className="text-center p-4">
          <FileTextIcon />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Bem-vindo aos Termos de Serviço do Vigil</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Ao acessar ou usar o Vigil, você concorda em cumprir e estar vinculado a estes Termos de Serviço. 
            Por favor, leia-os atentamente antes de usar nossa plataforma.
          </p>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">1. Aceitação dos Termos</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Estes Termos de Serviço ("Termos") regem seu acesso e uso do aplicativo Vigil e de todos os serviços, 
            recursos, conteúdo e funcionalidades oferecidos por nós. Se você não concordar com estes Termos, 
            não use o Vigil.
          </p>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">2. Uso da Plataforma</h3>
          <p className="text-700 dark:text-gray-300 leading-relaxed mb-4">
            Você concorda em usar o Vigil apenas para fins lícitos e de maneira que não infrinja os direitos 
            de, restrinja ou iniba o uso e o desfrute do Vigil por qualquer terceiro.
          </p>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">3. Conteúdo do Usuário</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Você é o único responsável pelo conteúdo que publica no Vigil. Não publique conteúdo que seja 
            ilegal, difamatório, obsceno, ameaçador, invasivo da privacidade, que infrinja direitos de 
            propriedade intelectual ou que seja prejudicial a terceiros.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Reservamo-nos o direito de remover qualquer conteúdo que viole estes Termos.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default TermsOfService;