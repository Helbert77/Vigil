import React from 'react';
import Card from '../components/common/Card';
import { LogoIcon } from '../components/icons/LogoIcon'; // Importar o LogoIcon do novo caminho

const About: React.FC = () => {
  return (
    <div>
      <h1 className="text-xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white">Sobre o Vigil</h1>
      <Card>
        <div className="text-center p-4">
          <LogoIcon className="h-24 w-24 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Bem-vindo ao Vigil</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Vigil é a sua rede social dedicada à exploração de teorias, mistérios e verdades ocultas. 
            Em um mundo onde a informação é controlada, o Vigil oferece um espaço seguro para 
            pensadores independentes compartilharem suas descobertas, analisarem evidências e 
            conectarem-se com outros que questionam a narrativa oficial.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Acreditamos no poder da curiosidade e na busca incessante pelo conhecimento. 
            Aqui, você pode postar suas próprias teorias, discutir as de outros, 
            participar de comunidades temáticas e até mesmo usar nossa IA para 
            analisar criticamente diferentes perspectivas.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Junte-se a nós na jornada para desvendar os segredos do universo e da sociedade. 
            Mantenha-se vigilante.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default About;