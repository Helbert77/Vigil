import React, { createContext, useContext, ReactNode } from 'react';
import { User } from '@/types';

interface UsersContextType {
  users: User[];
  getUserById: (id: string) => User | undefined;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider: React.FC<{ children: ReactNode, users: User[] }> = ({ children, users }) => {
  const getUserById = (id: string): User | undefined => {
    return users.find(u => u.id === id);
  };

  const value = {
    users,
    getUserById,
  };

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>;
};

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (context === undefined) {
    throw new Error('useUsers must be used within a UsersProvider');
  }
  return context;
};