import React, { useState } from 'react';
import Card from '../components/common/Card';
import Avatar from '../components/common/Avatar';
import type { Notification, User } from '../types';
import { Icon } from '../components/icons/Icon';
import UserLink from '@/components/common/UserLink';
import { VerifiedBadgeIcon } from '@/src/components/icons/VerifiedBadgeIcon';
import { ModeratorBadgeIcon } from '@/src/components/icons/ModeratorBadgeIcon';
import RejectedAdModal from '@/components/advertising/RejectedAdModal';
import { supabase } from '@/integrations/supabase/client';

const HeartIcon = () => <Icon className="h-6 w-6 text-red-500"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></Icon>;
const MessageCircleIcon = () => <Icon className="h-6 w-6 text-blue-500"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></Icon>;
const UserIcon = () => <Icon className="h-6 w-6 text-green-500"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></Icon>;
const AtSignIcon = () => <Icon className="h-6 w-6 text-purple-500"><circle cx="12" cy="12" r="4"></circle><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"></path></Icon>;
const MailIcon = () => <Icon className="h-6 w-6 text-cyan-500"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></Icon>;
const UsersIcon = () => <Icon className="h-6 w-6 text-indigo-500"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></Icon>;

const getNotificationText = (notification: Notification): string => {
    switch (notification.type) {
        case 'like':
            return 'curtiu sua postagem.';
        case 'comment':
            return 'comentou na sua postagem.';
        case 'follow':
            return 'começou a seguir você.';
        case 'comment_like':
            return 'curtiu seu comentário.';
        case 'mention':
            return 'mencionou você em uma postagem.';
        case 'message':
            return 'enviou uma mensagem para você.';
        case 'ad_approval_pending':
            return 'há um novo anúncio aguardando aprovação.';
        case 'ad_approved':
            return 'seu anúncio foi aprovado e está ativo!';
        case 'ad_rejected':
            // Try to get reason from metadata, fallback to 'não especificado'
            // Check both snake_case and camelCase just in case
            const reason = notification.metadata?.rejection_reason || notification.metadata?.reason || 'não especificado';
            return `seu anúncio foi rejeitado. Motivo: ${reason}`;
        case 'chat_room_invitation':
            const roomName = notification.metadata?.room_name || 'uma sala';
            return `te convidou para a sala "${roomName}".`;
        case 'room_access_request':
            const requestRoomName = notification.metadata?.room_name || 'uma sala';
            return `solicitou acesso à sala "${requestRoomName}".`;
        case 'room_access_approved':
            const approvedRoomName = notification.metadata?.room_name || 'uma sala';
            return `aprovou seu pedido de acesso à sala "${approvedRoomName}".`;
        case 'room_access_rejected':
            const rejectedRoomName = notification.metadata?.room_name || 'uma sala';
            return `rejeitou seu pedido de acesso à sala "${rejectedRoomName}".`;
        case 'timeline_approved':
            return 'aprovou seu evento da timeline!';
        case 'timeline_rejected':
            return 'rejeitou seu evento da timeline.';
        case 'timeline_moderation_pending':
            return 'submeteu um novo evento para moderação na timeline.';
        default:
            return '';
    }
};

const CheckCircleIcon = () => <Icon className="h-6 w-6 text-green-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></Icon>;
const XCircleIcon = () => <Icon className="h-6 w-6 text-red-500"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></Icon>;
const AlertCircleIcon = () => <Icon className="h-6 w-6 text-yellow-500"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></Icon>;

const NotificationIcon: React.FC<{ type: Notification['type'] }> = ({ type }) => {
    if (type === 'like' || type === 'comment_like') return <HeartIcon />;
    if (type === 'comment') return <MessageCircleIcon />;
    if (type === 'follow') return <UserIcon />;
    if (type === 'mention') return <AtSignIcon />;
    if (type === 'message') return <MailIcon />;
    if (type === 'chat_room_invitation') return <UsersIcon />;
    if (type === 'room_access_request' || type === 'room_access_approved' || type === 'room_access_rejected') return <UsersIcon />;
    if (type === 'ad_approval_pending') return <AlertCircleIcon />;
    if (type === 'ad_approved') return <CheckCircleIcon />;
    if (type === 'ad_rejected') return <XCircleIcon />;
    if (type === 'timeline_approved') return <CheckCircleIcon />;
    if (type === 'timeline_rejected') return <XCircleIcon />;
    if (type === 'timeline_moderation_pending') return <AlertCircleIcon />;
    return <div className="h-6 w-6"></div>;
};

interface NotificationItemProps {
    notification: Notification;
    onViewPost: (postId: string) => void;
    onFollowToggle: (userId: string) => void;
    isFollowing: boolean;
    isCurrentUser: boolean;
    onViewProfile: (userId: string) => void;
    onOpenFollowModal: (user: User, tab: 'followers' | 'following') => void;
    onNavigateToAdApproval?: () => void;
    onAdRejectedClick?: (adId: string) => void;
    onJoinChatRoom?: (roomId: string) => void;
    onApproveRoomAccess?: (requestId: string) => void;
    onRejectRoomAccess?: (requestId: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
    notification,
    onViewPost,
    onFollowToggle,
    isFollowing,
    isCurrentUser,
    onViewProfile,
    onOpenFollowModal,
    onNavigateToAdApproval,
    onAdRejectedClick,
    onJoinChatRoom,
    onApproveRoomAccess,
    onRejectRoomAccess
}) => {
    const handleClick = () => {
        if (notification.type === 'ad_approval_pending' && onNavigateToAdApproval) {
            onNavigateToAdApproval();
        } else if (notification.type === 'ad_rejected' && onAdRejectedClick && notification.metadata?.ad_id) {
            onAdRejectedClick(notification.metadata.ad_id);
        } else if (notification.post_id) {
            onViewPost(notification.post_id);
        }
    };

    const isClickable = notification.post_id ||
        (notification.type === 'ad_approval_pending' && onNavigateToAdApproval) ||
        (notification.type === 'ad_rejected' && onAdRejectedClick);

    return (
        <div
            onClick={handleClick}
            className={`flex items-center space-x-4 p-4 hover:bg-gray-100 dark:hover:bg-dark-card/50 border-b border-light-border dark:border-dark-border last:border-b-0 ${isClickable ? 'cursor-pointer' : ''}`}
            role={isClickable ? 'button' : 'listitem'}
            tabIndex={isClickable ? 0 : -1}
            onKeyDown={(e: React.KeyboardEvent) => {
                if ((e.key === 'Enter' || e.key === ' ') && isClickable) {
                    e.preventDefault();
                    handleClick();
                }
            }}
        >
            <div className="flex-shrink-0 pt-1">
                <NotificationIcon type={notification.type} />
            </div>
            <div className="flex-1 flex items-center justify-between">
                <div>
                    <div className="flex items-center space-x-2">
                        <Avatar src={notification.actor.avatarUrl} alt={notification.actor.name} size="md" />
                        <div className="text-gray-800 dark:text-gray-200">
                            <div className="inline-flex items-center gap-1">
                                <UserLink
                                    user={notification.actor}
                                    isFollowing={isFollowing}
                                    onFollowToggle={onFollowToggle}
                                    onViewProfile={onViewProfile}
                                    isCurrentUser={isCurrentUser}
                                    onOpenFollowModal={onOpenFollowModal}
                                >
                                    <span className="font-bold">{notification.actor.name}</span>
                                </UserLink>
                                {(notification.actor.plan === 'pro' || notification.actor.plan === 'premium') && (
                                    <VerifiedBadgeIcon plan={notification.actor.plan} className="h-4 w-4 flex-shrink-0" />
                                )}
                                {notification.actor.role && ['admin', 'moderator'].includes(notification.actor.role) && <ModeratorBadgeIcon className="h-4 w-4 flex-shrink-0" />}
                            </div>
                            {' '}{getNotificationText(notification)}
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 pl-16">{new Date(notification.created_at).toLocaleString()}</p>
                </div>
                {notification.type === 'follow' && !isCurrentUser && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onFollowToggle(notification.actor.id);
                        }}
                        className={`font-bold py-1 px-4 rounded-full text-sm transition-colors duration-200 flex-shrink-0 ${isFollowing
                            ? 'bg-transparent border border-primary text-primary hover:bg-primary/10'
                            : 'bg-primary hover:bg-gray-600 text-white'
                            }`}
                    >
                        {isFollowing ? 'Seguindo' : 'Seguir de volta'}
                    </button>
                )}
                {(() => {
                    // Parse metadata if it's a string (Supabase sometimes returns JSON as string)
                    let metadata = notification.metadata;
                    if (typeof metadata === 'string') {
                        try {
                            metadata = JSON.parse(metadata);
                        } catch (e) {
                            metadata = null;
                        }
                    }
                    const roomId = metadata?.room_id;
                    const requestId = metadata?.request_id;
                    
                    // Chat room invitation button
                    if (notification.type === 'chat_room_invitation' && onJoinChatRoom && roomId) {
                        return (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onJoinChatRoom(roomId);
                                }}
                                className="font-bold py-1 px-4 rounded-full text-sm transition-colors duration-200 flex-shrink-0 bg-primary hover:bg-primary/90 text-white"
                            >
                                Entrar na Sala
                            </button>
                        );
                    }
                    
                    // Room access approved button
                    if (notification.type === 'room_access_approved' && onJoinChatRoom && roomId) {
                        return (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onJoinChatRoom(roomId);
                                }}
                                className="font-bold py-1 px-4 rounded-full text-sm transition-colors duration-200 flex-shrink-0 bg-primary hover:bg-primary/90 text-white"
                            >
                                Entrar na Sala
                            </button>
                        );
                    }
                    
                    // Room access request buttons (for room creator)
                    if (notification.type === 'room_access_request') {
                        if (onApproveRoomAccess && onRejectRoomAccess && requestId) {
                            return (
                                <div className="flex gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onApproveRoomAccess(requestId);
                                        }}
                                        className="font-bold py-1 px-4 rounded-full text-sm transition-colors duration-200 flex-shrink-0 bg-green-500 hover:bg-green-600 text-white"
                                    >
                                        Aceitar
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRejectRoomAccess(requestId);
                                        }}
                                        className="font-bold py-1 px-4 rounded-full text-sm transition-colors duration-200 flex-shrink-0 bg-red-500 hover:bg-red-600 text-white"
                                    >
                                        Negar
                                    </button>
                                </div>
                            );
                        }
                    }
                    
                    return null;
                })()}
            </div>
        </div>
    );
};

interface NotificationsProps {
    notifications: Notification[];
    onViewPost: (postId: string) => void;
    onFollowToggle: (userId: string) => void;
    followedUserIds: string[];
    currentUser: User;
    onViewProfile: (userId: string) => void;
    onOpenFollowModal: (user: User, tab: 'followers' | 'following') => void;
    onClearAll: () => void;
    onNavigateToAdApproval?: () => void;
    onJoinChatRoom?: (roomId: string) => void;
    onApproveRoomAccess?: (requestId: string) => void;
    onRejectRoomAccess?: (requestId: string) => void;
}

const Notifications: React.FC<NotificationsProps> = ({ notifications, onViewPost, onFollowToggle, followedUserIds, currentUser, onViewProfile, onOpenFollowModal, onClearAll, onNavigateToAdApproval, onJoinChatRoom, onApproveRoomAccess, onRejectRoomAccess }) => {
    const [rejectedAdId, setRejectedAdId] = useState<string | null>(null);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
                {notifications.length > 0 && (
                    <button
                        onClick={onClearAll}
                        className="text-sm font-semibold text-primary hover:underline"
                    >
                        Limpar tudo
                    </button>
                )}
            </div>
            <Card className="p-0 sm:p-0 overflow-hidden">
                {notifications.length > 0 ? (
                    notifications.map((notification: Notification) => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onViewPost={onViewPost}
                            onFollowToggle={onFollowToggle}
                            isFollowing={followedUserIds.includes(notification.actor.id)}
                            isCurrentUser={notification.actor.id === currentUser.id}
                            onViewProfile={onViewProfile}
                            onOpenFollowModal={onOpenFollowModal}
                            onNavigateToAdApproval={onNavigateToAdApproval}
                            onJoinChatRoom={onJoinChatRoom}
                            onApproveRoomAccess={onApproveRoomAccess}
                            onRejectRoomAccess={onRejectRoomAccess}
                            onAdRejectedClick={async (adId) => {
                                // Verificar status do anúncio antes de abrir o modal
                                try {
                                    const { data: ad } = await supabase
                                        .from('anuncios')
                                        .select('approval_status')
                                        .eq('id', adId)
                                        .single();

                                    if (ad && ad.approval_status !== 'rejected') {
                                        // Se não estiver mais rejeitado (aprovado ou pendente), não abre o modal
                                        // Opcional: mostrar um toast informando
                                        return;
                                    }

                                    setRejectedAdId(adId);
                                } catch (error) {
                                    // Em caso de erro, abre o modal por precaução
                                    setRejectedAdId(adId);
                                }
                            }}
                        />
                    ))
                ) : (
                    <p className="text-center p-8 text-gray-500 dark:text-gray-400">You have no new notifications.</p>
                )}
            </Card>

            {rejectedAdId && (
                <RejectedAdModal
                    isOpen={!!rejectedAdId}
                    onClose={() => setRejectedAdId(null)}
                    adId={rejectedAdId}
                    user={currentUser}
                />
            )}
        </div>
    );
};

export default Notifications;
