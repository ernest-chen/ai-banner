'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, LogOut, User } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { AuthModal } from './AuthModal';

export const AuthButton: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  // Reset image error when user changes
  React.useEffect(() => {
    setImageError(false);
  }, [user?.photoURL]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          {user.photoURL && !imageError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="w-8 h-8 rounded-full object-cover"
              onError={() => setImageError(true)}
              onLoad={() => setImageError(false)}
            />
          ) : (
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          )}
          <span className="text-sm font-medium text-gray-700">
            {user.displayName}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowAuthModal(true)}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <LogIn className="w-4 h-4" />
        <span>Sign In</span>
      </button>

      <Dialog.Root open={showAuthModal} onOpenChange={setShowAuthModal}>
        <AuthModal onClose={() => setShowAuthModal(false)} />
      </Dialog.Root>
    </>
  );
};
