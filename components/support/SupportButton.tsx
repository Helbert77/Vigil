import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import SupportModal, { SupportTicket } from './SupportModal';
import * as api from '@/src/services/api';
import { supabase } from '@/integrations/supabase/client';

interface SupportButtonProps {
  user: User;
  variant?: 'floating' | 'inline';
  onVisibilityChange?: (visible: boolean) => void;
}

const SupportButton: React.FC<SupportButtonProps> = ({ user, variant = 'floating', onVisibilityChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showButton, setShowButton] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Carregar preferência do usuário ao montar o componente
  useEffect(() => {
    const loadUserPreference = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('show_support_button')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        // Se o campo for null (novo usuário), mostrar por padrão
        setShowButton(data.show_support_button !== false);
      }
    };

    loadUserPreference();
  }, [user.id]);

  // Função para ocultar o botão
  const handleHideButton = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Atualizar no banco de dados
    await supabase
      .from('profiles')
      .update({ show_support_button: false })
      .eq('id', user.id);

    // Atualizar estado local
    setShowButton(false);
    
    // Notificar componente pai (App)
    if (onVisibilityChange) {
      onVisibilityChange(false);
    }
  };

  // Se o usuário optou por não mostrar o botão, não renderizar
  if (!showButton && variant === 'floating') {
    return null;
  }

  const handleSubmitTicket = async (ticket: SupportTicket) => {
    // Buscar o email real do Supabase Auth
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const userEmail = authUser?.email || `${user.username}@vigil.app`;
    
    // Converter anexos para Base64
    const attachmentsBase64 = await Promise.all(
      (ticket.attachments || []).map(async (file) => {
        const base64 = await fileToBase64(file);
        return {
          name: file.name,
          content: base64,
          type: file.type
        };
      })
    );
    
    await api.submitSupportTicket({
      category: ticket.category,
      subject: ticket.subject,
      description: ticket.description,
      priority: ticket.priority,
      attachments: attachmentsBase64,
      userId: user.id,
      userEmail: userEmail,
      userName: user.name,
      userPlan: user.plan,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });
  };

  // Função para converter File para Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1]; // Remove o prefixo "data:..."
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  if (variant === 'floating') {
    return (
      <>
        {/* Container para botão e X */}
        <div className="fixed bottom-24 right-6 md:bottom-6 z-40">
          {/* Botão Flutuante */}
          <button
            onClick={() => setIsModalOpen(true)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="bg-primary hover:bg-gray-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 group support-floating-btn"
            aria-label="Abrir suporte"
            title="Precisa de ajuda?"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </button>

          {/* X vermelho - ACIMA e À DIREITA do botão */}
          {isHovered && (
            <button
              onClick={handleHideButton}
              onMouseEnter={() => setIsHovered(true)}
              className="absolute -top-8 right-0 transition-all duration-200"
              aria-label="Ocultar botão de suporte"
              title="Não mostrar este botão"
            >
              <svg className="w-6 h-6 text-red-500 hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <SupportModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          user={user}
          onSubmitTicket={handleSubmitTicket}
        />
      </>
    );
  }

  // Variante inline (para usar em páginas de configurações)
  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-gray-600 text-white rounded-lg transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        Contatar Suporte
      </button>

      <SupportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={user}
        onSubmitTicket={handleSubmitTicket}
      />
    </>
  );
};

export default SupportButton;
