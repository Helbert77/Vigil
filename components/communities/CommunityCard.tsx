import React from 'react'; // Removed useState as isJoined is now a prop
import { Community } from '../../types';
import Card from '../common/Card';
import { Icon } from '../icons/Icon';
import { getRequiredPlanLabel, getRequiredPlanColor } from '@/src/utils/communityAccess';

const UsersIcon = () => <Icon className="h-3 w-3 md:h-4 md:w-4 mr-1 flex-shrink-0"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></Icon>;
const MessageSquareIcon = () => <Icon className="h-3 w-3 md:h-4 md:w-4 mr-1 flex-shrink-0"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></Icon>;

interface CommunityCardProps {
  community: Community;
  onViewCommunity: (communityId: string) => void;
  isJoined: boolean; // New prop: indicates if the current user has joined this community
  onJoinToggle: (communityId: string) => void; // New prop: function to join/leave
}

const CommunityCard: React.FC<CommunityCardProps> = ({ community, onViewCommunity, isJoined, onJoinToggle }) => {
  // Removed local useState for isJoined, now controlled by props

  const handleJoinToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking the button
    onJoinToggle(community.id); // Call the prop function
  };

  return (
    <div onClick={() => onViewCommunity(community.id)} className="cursor-pointer h-full">
        <Card className="p-0 sm:p-0 overflow-hidden flex flex-col h-full hover:border-primary dark:hover:border-primary transition-colors">
        <div className="relative">
          <img src={community.bannerUrl} alt={`${community.name} banner`} className="h-20 md:h-24 w-full object-cover" />
          {community.requiredPlan && community.requiredPlan !== 'all' && (
            <div className={`absolute top-2 right-2 ${getRequiredPlanColor(community.requiredPlan)} text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg`}>
              {getRequiredPlanLabel(community.requiredPlan)}
            </div>
          )}
        </div>
        <div className="p-3 md:p-4 flex-grow flex flex-col">
            <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white truncate">{community.name}</h3>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1 flex-grow line-clamp-2">{community.description}</p>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3 md:mt-4 space-y-2 sm:space-y-0">
            <div className="flex items-center text-xs md:text-sm text-gray-500 dark:text-gray-400 space-x-3 md:space-x-4">
                <div className="flex items-center min-w-0">
                    <UsersIcon />
                    <span className="truncate">{(community.memberCount ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center min-w-0">
                    <MessageSquareIcon />
                    <span className="truncate">{(community.postsCount ?? 0).toLocaleString()}</span>
                </div>
            </div>
            <button
                onClick={handleJoinToggle}
                className={`font-bold py-1 px-3 md:px-4 rounded-full text-xs md:text-sm transition-colors duration-200 z-10 transform active:scale-95 flex-shrink-0 ${
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