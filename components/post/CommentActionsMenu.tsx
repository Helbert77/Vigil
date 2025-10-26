import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '../icons/Icon';
import { Comment, User } from '@/types';

const MoreHorizontalIcon = () => <Icon><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></Icon>;
const TrashIcon = () => <Icon className="h-5 w-5 text-red-500"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></Icon>;
const EditIcon = () => <Icon className="h-5 w-5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></Icon>;

interface CommentActionsMenuProps {
  comment: Comment;
  currentUser: User;
  onDelete: (commentId: string) => void;
  onEdit: () => void;
}

const CommentActionsMenu: React.FC<CommentActionsMenuProps> = ({ comment, currentUser, onDelete, onEdit }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isCurrentUserComment = comment.user.id === currentUser.id;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isCurrentUserComment) {
    return null; // Não mostra o menu para comentários de outros usuários
  }

  const handleDelete = () => {
    onDelete(comment.id);
    setIsOpen(false);
  };

  const handleEdit = () => {
    onEdit();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
        <MoreHorizontalIcon />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg shadow-lg z-20">
          <button
            onClick={handleEdit}
            className="w-full text-left flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <EditIcon />
            <span>Editar Comentário</span>
          </button>
          <button
            onClick={handleDelete}
            className="w-full text-left flex items-center space-x-3 px-4 py-2 text-sm text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <TrashIcon />
            <span>Apagar Comentário</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentActionsMenu;