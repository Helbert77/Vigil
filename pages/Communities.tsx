import React from 'react';
import { MOCK_COMMUNITIES } from '../constants';
import CommunityCard from '../components/communities/CommunityCard';

interface CommunitiesProps {
  onViewCommunity: (communityId: string) => void;
}

const Communities: React.FC<CommunitiesProps> = ({ onViewCommunity }) => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Communities</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Connect with fellow truth-seekers in communities dedicated to specific theories and investigations.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_COMMUNITIES.map(community => (
          <CommunityCard key={community.id} community={community} onViewCommunity={onViewCommunity} />
        ))}
      </div>
    </div>
  );
};

export default Communities;