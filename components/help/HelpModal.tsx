import React from 'react';
import GenericModal from '../../src/components/common/GenericModal';
import { Icon } from '../icons/Icon';

const BookOpenIcon = () => <Icon className="h-6 w-6"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></Icon>;

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  prdNumber?: string;
  content?: string;
  categoryIcon?: React.ReactNode;
  categoryColor?: string;
}

const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  title,
  prdNumber,
  content,
  categoryIcon,
  categoryColor
}) => {
  return (
    <GenericModal isOpen={isOpen} onClose={onClose} title="" size="xl">
      {/* Header Info */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-light-border dark:border-dark-border">
        <div className={`w-12 h-12 rounded-lg ${categoryColor ? `bg-gradient-to-br ${categoryColor}` : 'bg-primary/10'} flex items-center justify-center text-white`}>
          {categoryIcon || <BookOpenIcon />}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
        </div>
      </div>

      {/* Content */}
      {content ? (
        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
            {content.split('\n\n').map((paragraph, index) => {
              // Pular títulos h1 (já temos o título no header)
              if (paragraph.startsWith('# ')) {
                return null;
              }
              
              // Renderizar subtítulos h2
              if (paragraph.startsWith('## ')) {
                return (
                  <h2 key={index} className="text-lg md:text-xl font-bold mt-6 mb-3 text-gray-900 dark:text-white">
                    {paragraph.substring(3)}
                  </h2>
                );
              }
              
              // Renderizar subtítulos h3
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={index} className="text-base md:text-lg font-semibold mt-4 mb-2 text-gray-900 dark:text-white">
                    {paragraph.substring(4)}
                  </h3>
                );
              }
              
              // Renderizar listas
              if (paragraph.includes('\n- ')) {
                const items = paragraph.split('\n').filter(line => line.startsWith('- '));
                return (
                  <ul key={index} className="list-disc list-inside space-y-1 ml-2">
                    {items.map((item, i) => (
                      <li key={i} className="text-gray-700 dark:text-gray-300">
                        {item.substring(2)}
                      </li>
                    ))}
                  </ul>
                );
              }
              
              // Renderizar parágrafos normais
              if (paragraph.trim()) {
                return (
                  <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {paragraph}
                  </p>
                );
              }
              
              return null;
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <BookOpenIcon />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Conteúdo em Desenvolvimento
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            A documentação completa para este tópico estará disponível em breve.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Precisa de ajuda agora?</strong>
              <br />
              Entre em contato com nosso suporte em{' '}
              <a
                href="mailto:suporte@myvigil.co"
                className="underline hover:text-blue-600 dark:hover:text-blue-300"
              >
                suporte@myvigil.co
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-light-border dark:border-dark-border">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Ainda tem dúvidas?{' '}
          <a
            href="mailto:suporte@myvigil.co"
            className="text-primary hover:underline font-medium"
          >
            Fale com o suporte
          </a>
        </div>
        <button
          onClick={onClose}
          className="bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          Fechar
        </button>
      </div>
    </GenericModal>
  );
};

export default HelpModal;
