import React from 'react';
import Card from '../components/common/Card';
import { Icon } from '../components/icons/Icon';

const UsersIcon = () => <Icon className="h-16 w-16 text-gray-400 dark:text-gray-500"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></Icon>;

const Communities: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Communities</h1>
      <Card>
        <div className="text-center p-8 flex flex-col items-center">
            <UsersIcon />
          <h2 className="text-xl font-semibold mt-4">Find your tribe</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm">
              This feature is under development. Communities of like-minded individuals are coming soon.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Communities;
