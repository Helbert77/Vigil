import React, { useState } from 'react';
import { Community } from '../../types';
import Card from '../common/Card';
import { Icon } from '../icons/Icon';

const UsersIcon = () => <Icon className="h-4 w-4 mr-1"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></Icon>;

interface CommunityCardProps {
  community: Community;
  onViewCommunity: (communityId: string) => void;
}

const CommunityCard: React.FC<CommunityCardProps> = ({ community, onViewCommunity }) => {
  const [isJoined, setIsJoined] = useState(false);

  const handleJoinToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking the button
    setIsJoined(!isJoined);
  };

  return (
    <div onClick={() => onViewCommunity(community.id)} className="cursor-pointer h-full">
        <Card className="p-0 sm:p-0 overflow-hidden flex flex-col h-full hover:border-primary dark:hover:border-primary transition-colors">
        <img src={community.bannerUrl} alt={`${community.name} banner`} className="h-24 w-full object-cover" />
        <div className="p-4 flex-grow flex flex-col">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{community.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex-grow">{community.description}</p>
            <div className="flex items-center justify-between mt-4">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <UsersIcon />
                <span>{community.memberCount.toLocaleString()} members</span>
            </div>
            <button
                onClick={handleJoinToggle}
                className={`font-bold py-1 px-4 rounded-full text-sm transition-colors duration-200 z-10 ${
                isJoined
                    ? 'bg-transparent border border-primary text-primary hover:bg-primary/10'
                    : 'bg-primary hover:bg-gray-600 text-white'
                }`}
            >
                {isJoined ? 'Joined' : 'Join'}
            </button>
            </div>
        </div>
        </Card>
    </div>
  );
};

export default CommunityCard;