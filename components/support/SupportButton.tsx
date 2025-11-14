import React, { useState } from 'react';
import { User } from '@/types';
import SupportModal, { SupportTicket } from './SupportModal';
import * as api from '@/src/services/api';
import { supabase } from '@/integrations/supabase/client';

interface SupportButtonProps {
  user: User;
  variant?: 'floating' | 'inline';
}

const SupportButton: React.FC<SupportButtonProps> = ({ user, variant = 'floating' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        {/* Botão Flutuante */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-6 right-6 bg-primary hover:bg-gray-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 z-40 group support-floating-btn"
          aria-label="Abrir suporte"
          title="Precisa de ajuda?"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            ?
          </span>
        </button>

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
