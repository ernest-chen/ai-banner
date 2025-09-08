'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { X, Globe, Smartphone } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { signInWithGoogle, signInWithApple, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      onClose();
    } catch (error) {
      console.error('Google sign-in failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithApple();
      onClose();
    } catch (error) {
      console.error('Apple sign-in failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
      <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <Dialog.Title className="text-xl font-semibold text-gray-900">
            Sign In to AI Banner
          </Dialog.Title>
          <Dialog.Close asChild>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </Dialog.Close>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            Sign in to create, save, and download your AI-generated banners.
          </p>

          <div className="space-y-3">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading || loading}
              className="w-full flex items-center justify-center space-x-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Globe className="w-5 h-5" />
              <span className="font-medium">
                {isLoading ? 'Signing in...' : 'Continue with Google'}
              </span>
            </button>

            <button
              onClick={handleAppleSignIn}
              disabled={isLoading || loading}
              className="w-full flex items-center justify-center space-x-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Smartphone className="w-5 h-5" />
              <span className="font-medium">
                {isLoading ? 'Signing in...' : 'Continue with Apple'}
              </span>
            </button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  );
};
