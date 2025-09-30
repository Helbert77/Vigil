import React, { useState } from 'react';
import Card from '../common/Card';
import Avatar from '../common/Avatar';
import { TRENDING_TOPICS, USERS_TO_FOLLOW } from '../../constants';
import { User } from '../../types';

interface RightbarProps {
  onViewTag: (tag: string) => void;
  onViewProfile: (userId: string) => void;
}

const Rightbar: React.FC<RightbarProps> = ({ onViewTag, onViewProfile }) => {
  const [followedUsers, setFollowedUsers] = useState<string[]>([]);

  const handleFollowToggle = (userId: string) => {
    setFollowedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="sticky top-20 space-y-6">
      <Card>
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Trending Conspiracies</h2>
        <div className="space-y-3">
          {TRENDING_TOPICS.map((topic) => (
            <div 
              key={topic.tag} 
              className="hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-md cursor-pointer"
              onClick={() => onViewTag(topic.tag)}
            >
              <p className="font-semibold text-gray-800 dark:text-gray-200">#{topic.tag}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{topic.posts} posts</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Who to Follow</h2>
        <div className="space-y-4">
          {USERS_TO_FOLLOW.map((user) => {
            const isFollowing = followedUsers.includes(user.id);
            return (
              <div key={user.id} className="flex items-center justify-between">
                <div 
                  className="flex items-center space-x-3 cursor-pointer"
                  onClick={() => onViewProfile(user.id)}
                >
                  <Avatar src={user.avatarUrl} alt={user.name} size="md" />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleFollowToggle(user.id)}
                  className={`font-bold py-1 px-4 rounded-full text-sm transition-colors duration-200 ${
                    isFollowing 
                      ? 'bg-transparent border border-primary text-primary hover:bg-primary/10'
                      : 'bg-primary hover:bg-gray-600 text-white'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
            );
          })}
        </div>
      </Card>

      <footer className="px-2 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <a href="#" className="hover:underline">Termos de Serviço</a>
          <span>|</span>
          <a href="#" className="hover:underline">Política de Privacidade</a>
          <span>|</span>
          <a href="#" className="hover:underline">Política de cookies</a>
          <span>|</span>
          <a href="#" className="hover:underline">Acessibilidade</a>
          <span>|</span>
          <a href="#" className="hover:underline">Informações de anúncios</a>
          <span>|</span>
          <a href="#" className="hover:underline">Sobre</a>
          <a href="#" className="hover:underline">Baixe o app Vigil</a>
        </div>
        <p className="mt-2">© 2025 Vigil Corp.</p>
      </footer>
    </div>
  );
};

export default Rightbar;