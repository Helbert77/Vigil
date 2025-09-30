import React from 'react';
import Card from '../components/common/Card';
import Avatar from '../components/common/Avatar';
import { MOCK_NOTIFICATIONS } from '../constants';
import { Notification } from '../types';
import { Icon } from '../components/icons/Icon';

const HeartIcon = () => <Icon className="h-6 w-6 text-red-500"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></Icon>;
const MessageCircleIcon = () => <Icon className="h-6 w-6 text-blue-500"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></Icon>;
const UserIcon = () => <Icon className="h-6 w-6 text-green-500"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></Icon>;

const NotificationIcon: React.FC<{ text: string }> = ({ text }) => {
    if (text.includes('liked')) return <HeartIcon />;
    if (text.includes('commented')) return <MessageCircleIcon />;
    if (text.includes('following')) return <UserIcon />;
    return <div className="h-6 w-6"></div>;
};

interface NotificationItemProps {
    notification: Notification;
    onViewPost: (postId: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onViewPost }) => (
    <div 
        onClick={() => notification.postId && onViewPost(notification.postId)}
        className={`flex items-start space-x-4 p-4 hover:bg-gray-100 dark:hover:bg-dark-card/50 border-b border-light-border dark:border-dark-border last:border-b-0 ${notification.postId ? 'cursor-pointer' : ''}`}
        role={notification.postId ? 'button' : 'listitem'}
        tabIndex={notification.postId ? 0 : -1}
        onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                if (notification.postId) {
                    e.preventDefault();
                    onViewPost(notification.postId);
                }
            }
        }}
    >
        <div className="flex-shrink-0 pt-1">
           <NotificationIcon text={notification.text} />
        </div>
        <div className="flex-1">
             <div className="flex items-center space-x-2">
                <Avatar src={notification.user.avatarUrl} alt={notification.user.name} size="md" />
                <p className="text-gray-800 dark:text-gray-200">
                    <span className="font-bold">{notification.user.name}</span> {notification.text}
                </p>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 pl-16">{notification.timestamp}</p>
        </div>
    </div>
);

interface NotificationsProps {
    onViewPost: (postId: string) => void;
}

const Notifications: React.FC<NotificationsProps> = ({ onViewPost }) => {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Notifications</h1>
            <Card className="p-0 sm:p-0 overflow-hidden">
                {MOCK_NOTIFICATIONS.length > 0 ? (
                    MOCK_NOTIFICATIONS.map(notification => (
                        <NotificationItem 
                          key={notification.id} 
                          notification={notification} 
                          onViewPost={onViewPost}
                        />
                    ))
                ) : (
                    <p className="text-center p-8 text-gray-500 dark:text-gray-400">You have no new notifications.</p>
                )}
            </Card>
        </div>
    );
};

export default Notifications;