import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '../icons/Icon';
import { Ad } from '@/types';
import Tooltip from '@/components/common/Tooltip';
import { useToast } from '@/hooks/useToast';

const MoreHorizontalIcon = () => <Icon><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></Icon>;
const EditIcon = () => <Icon className="h-5 w-5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></Icon>;
const TrendingUpIcon = () => <Icon className="h-5 w-5 text-green-500"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></Icon>;
const TrashIcon = () => <Icon className="h-5 w-5 text-red-500"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></Icon>;

interface AdActionsMenuProps {
    ad: Ad;
    onEdit: (ad: Ad) => void;
    onUpgradePlan: (ad: Ad) => void;
    onDelete: (ad: Ad) => void;
}

const AdActionsMenu: React.FC<AdActionsMenuProps> = ({ ad, onEdit, onUpgradePlan, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { addToast } = useToast();

    // Ocultar menu para anúncios encerrados
    const isAdEnded = ad.status === 'ended';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleEdit = () => {
        onEdit(ad);
        setIsOpen(false);
    };

    const handleUpgradePlan = () => {
        onUpgradePlan(ad);
        setIsOpen(false);
    };

    const handleDelete = () => {
        onDelete(ad);
        setIsOpen(false);
    };

    // Não renderizar o menu para anúncios encerrados
    if (isAdEnded) {
        return null;
    }

    return (
        <div className="relative" ref={menuRef}>
            <Tooltip text="Mais ações" position="bottom">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    aria-haspopup="menu"
                    aria-expanded={isOpen}
                    aria-label="Abrir menu de ações do anúncio"
                >
                    <MoreHorizontalIcon />
                </button>
            </Tooltip>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg shadow-lg z-20 overflow-hidden">
                    <button
                        onClick={handleEdit}
                        className="w-full text-left flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200"
                        aria-label="Editar anúncio"
                        role="menuitem"
                    >
                        <EditIcon />
                        <span>Editar Anúncio</span>
                    </button>

                    <button
                        onClick={handleUpgradePlan}
                        className="w-full text-left flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200"
                        aria-label="Atualizar plano"
                        role="menuitem"
                    >
                        <TrendingUpIcon />
                        <span>Atualizar Plano</span>
                    </button>

                    <button
                        onClick={handleDelete}
                        className="w-full text-left flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-red-600 dark:text-red-400"
                        aria-label="Excluir anúncio"
                        role="menuitem"
                    >
                        <TrashIcon />
                        <span>Excluir Anúncio</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdActionsMenu;
