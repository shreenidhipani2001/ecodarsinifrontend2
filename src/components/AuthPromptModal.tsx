'use client';

import { X, LogIn, UserPlus, Leaf } from 'lucide-react';

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
  onSignUpClick: () => void;
  actionType?: 'cart' | 'wishlist' | 'buy';
}

export default function AuthPromptModal({
  isOpen,
  onClose,
  onLoginClick,
  onSignUpClick,
  actionType = 'cart',
}: AuthPromptModalProps) {
  if (!isOpen) return null;

  const actionMessages = {
    cart: 'add items to your cart',
    wishlist: 'save items to your wishlist',
    buy: 'proceed with your purchase',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-br from-green-600 to-green-700 px-6 py-8 text-center">
          <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Leaf className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Join EcoDarshini
          </h2>
          <p className="text-green-100 text-sm">
            Sign in or create an account to {actionMessages[actionType]}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Login Button */}
          <button
            onClick={onLoginClick}
            className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-medium transition-colors"
          >
            <LogIn className="h-5 w-5" />
            Sign In to Your Account
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or</span>
            </div>
          </div>

          {/* Sign Up Button */}
          <button
            onClick={onSignUpClick}
            className="w-full flex items-center justify-center gap-3 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3.5 rounded-xl font-medium transition-colors"
          >
            <UserPlus className="h-5 w-5" />
            Create New Account
          </button>

          {/* Benefits */}
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center mb-3">
              Benefits of creating an account:
            </p>
            <ul className="text-xs text-gray-600 space-y-2">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                Track your orders in real-time
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                Save items to your wishlist
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                Faster checkout experience
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                Exclusive offers and discounts
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
