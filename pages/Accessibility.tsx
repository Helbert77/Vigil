import React from 'react';
import Card from '../components/common/Card';
import { Icon } from '../components/icons/Icon';

const AccessibilityIcon = () => <Icon className="h-16 w-16 text-primary mx-auto mb-4"><path d="M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path><path d="M12 14v7"></path><path d="M5 11v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1"></path><path d="M18.5 18.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path><path d="M5.5 18.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path></Icon>;

const Accessibility: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Acessibilidade</h1>
      <Card>
        <div className="text-center p-4">
          <AccessibilityIcon />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Compromisso do Vigil com a Acessibilidade</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            No Vigil, estamos empenhados em tornar nossa plataforma acessível a todos, 
            independentemente de suas habilidades ou deficiências. Acreditamos que todos 
            devem ter a oportunidade de explorar teorias e se conectar com a comunidade.
          </p>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Nossos Esforços</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Estamos trabalhando continuamente para melhorar a acessibilidade do Vigil, 
            seguindo as diretrizes de acessibilidade da web (WCAG). Nossas iniciativas incluem:
          </p>
          <ul className="list-disc list-inside text-left mx-auto max-w-md text-gray-700 dark:text-gray-300 space-y-2 mb-4">
            <li>Garantir que o conteúdo seja perceptível, operável, compreensível e robusto.</li>
            <li>Fornecer alternativas de texto para imagens e outros conteúdos não textuais.</li>
            <li>Garantir a navegação por teclado para todos os elementos interativos.</li>
            <li>Manter um contraste de cores adequado para facilitar a leitura.</li>
            <li>Oferecer suporte para leitores de tela e outras tecnologias assistivas.</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Se você encontrar alguma barreira de acessibilidade ou tiver sugestões de melhoria, 
            entre em contato conosco. Sua opinião é valiosa para nos ajudar a criar uma 
            experiência inclusiva para todos.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Accessibility;