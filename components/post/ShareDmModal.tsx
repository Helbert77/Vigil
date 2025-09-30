import React, { useState } from 'react';
// FIX: Removed 'Partial' from import as it's a built-in TypeScript utility type.
import { Post, User } from '../../types';
import { MOCK_FOLLOWERS } from '../../constants';
import Avatar from '../common/Avatar';
import { Icon } from '../icons/Icon';

const XIcon = () => <Icon className="h-6 w-6"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></Icon>;

interface ShareDmModalProps {
  post: Post;
  onClose: () => void;
  onUpdatePost: (postId: string, updates: Partial<Post>) => void;
}

const ShareDmModal: React.FC<ShareDmModalProps> = ({ post, onClose, onUpdatePost }) => {
  const [search, setSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const filteredFollowers = MOCK_FOLLOWERS.filter(
    (follower) =>
      follower.name.toLowerCase().includes(search.toLowerCase()) ||
      follower.username.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSend = () => {
    if (selectedUsers.length === 0) {
      alert("Please select at least one follower to share with.");
      return;
    }
    // In a real app, this would trigger an API call to send DMs
    console.log(`Sharing post ${post.id} with users: ${selectedUsers.join(', ')}`);
    onUpdatePost(post.id, { shares: post.shares + 1 });
    alert(`Post shared with ${selectedUsers.length} follower(s)!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b border-light-border dark:border-dark-border flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold">Share with followers</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
            <XIcon />
          </button>
        </div>
        
        {/* Search */}
        <div className="p-4 border-b border-light-border dark:border-dark-border shrink-0">
          <input
            type="text"
            placeholder="Search followers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Follower list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredFollowers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
              onClick={() => handleToggleUser(user.id)}
            >
              <div className="flex items-center space-x-3">
                <Avatar src={user.avatarUrl} alt={user.name} size="md" />
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={selectedUsers.includes(user.id)}
                readOnly
                className="form-checkbox h-5 w-5 text-secondary rounded focus:ring-secondary cursor-pointer"
              />
            </div>
          ))}
          {filteredFollowers.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400">No followers found.</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-light-border dark:border-dark-border flex justify-end space-x-3 shrink-0">
          <button
            onClick={onClose}
            className="bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 font-bold py-2 px-4 rounded-full transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={selectedUsers.length === 0}
            className="bg-primary hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-full transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareDmModal;