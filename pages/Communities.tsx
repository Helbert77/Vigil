import React, { useState } from 'react';
import { Community, User } from '../types';
import CommunityCard from '../components/communities/CommunityCard';
import CreateCommunityModal, { NewCommunityData } from '@/components/communities/CreateCommunityModal';
import EditCommunityModal, { UpdateCommunityData } from '@/components/communities/EditCommunityModal';
import { Icon } from '../components/icons/Icon';

const PlusIcon = () => <Icon className="h-5 w-5 mr-2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></Icon>;

interface CommunitiesProps {
  communities: Community[];
  joinedCommunityIds: string[];
  onViewCommunity: (communityId: string) => void;
  onJoinCommunityToggle: (communityId: string) => void;
  onCreateCommunity: (communityData: NewCommunityData) => Promise<void>;
  onUpdateCommunity: (communityId: string, communityData: UpdateCommunityData) => Promise<void>;
  user: User; // Adicionado: objeto de usuário para verificar o plano
  setCurrentPage: (page: any) => void; // Adicionado: para redirecionar para a página Premium
}

const Communities: React.FC<CommunitiesProps> = ({ communities, joinedCommunityIds, onViewCommunity, onJoinCommunityToggle, onCreateCommunity, onUpdateCommunity, user, setCurrentPage }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [communityToEdit, setCommunityToEdit] = useState<Community | null>(null);

  const handleCreateCommunity = async (communityData: NewCommunityData) => {
    setIsCreating(true);
    await onCreateCommunity(communityData);
    setIsCreating(false);
    setIsCreateModalOpen(false);
  };

  const handleUpdateCommunity = async (communityId: string, communityData: UpdateCommunityData) => {
    setIsUpdating(true);
    await onUpdateCommunity(communityId, communityData);
    setIsUpdating(false);
    setIsEditModalOpen(false);
    setCommunityToEdit(null);
  };

  const handleOpenEditModal = (community: Community) => {
    setCommunityToEdit(community);
    setIsEditModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    if (user.plan === 'premium') {
      setIsCreateModalOpen(true);
    } else {
      setCurrentPage('Premium'); // Redireciona para a página Premium
    }
  };

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">Comunidades</h1>
          <button
            onClick={handleOpenCreateModal} // Usar o novo manipulador
            className="flex items-center bg-secondary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition-colors
              /* Mobile adjustments: smaller size */
              md:py-2 md:px-4 py-1.5 px-3 text-sm md:text-base"
          >
            Criar Comunidade
          </button>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Conecte-se com outros buscadores da verdade em comunidades dedicadas a teorias e investigações específicas.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {communities.map((community) => (
            <CommunityCard 
              key={community.id} 
              community={community} 
              onViewCommunity={onViewCommunity} 
              isJoined={joinedCommunityIds.includes(community.id)}
              onJoinToggle={onJoinCommunityToggle}
              currentUser={user}
              onEdit={handleOpenEditModal}
            />
          ))}
        </div>
      </div>
      <CreateCommunityModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateCommunity}
        isCreating={isCreating}
      />
      {communityToEdit && (
        <EditCommunityModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setCommunityToEdit(null);
          }}
          onUpdate={handleUpdateCommunity}
          community={communityToEdit}
          isUpdating={isUpdating}
        />
      )}
    </>
  );
};

export default Communities;