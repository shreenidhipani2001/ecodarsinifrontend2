'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';
import EcatalogueBookFlip from '../../components/EcatalogueBookFlip';
import AuthPromptModal from '../../components/AuthPromptModal';
import LoginModal from '../../components/LoginModal';
import RegisterModal from '../../components/RegisterModal';

type ModalType = 'none' | 'authPrompt' | 'login' | 'register';

interface PendingAction {
  type: 'cart' | 'wishlist';
  productId: string;
}

export default function EcataloguePage() {
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<ModalType>('none');
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  // Handle auth required from book flip
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAuthRequired = (actionType: 'cart' | 'wishlist', product: any) => {
    setPendingAction({ type: actionType, productId: product.id });
    setActiveModal('authPrompt');
  };

  // Modal handlers
  const handleAuthPromptLogin = () => {
    setActiveModal('login');
  };

  const handleAuthPromptSignUp = () => {
    setActiveModal('register');
  };

  const handleBackToPrompt = () => {
    setActiveModal('authPrompt');
  };

  const handleSwitchToRegister = () => {
    setActiveModal('register');
  };

  const handleSwitchToLogin = () => {
    setActiveModal('login');
  };

  const closeAllModals = () => {
    setActiveModal('none');
    setPendingAction(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm font-medium hidden sm:inline">Back to Home</span>
            </Link>

            <h1 className="text-lg font-bold text-green-600">EcoDarshini</h1>

            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
            >
              <Home className="h-5 w-5" />
              <span className="text-sm font-medium hidden sm:inline">Home</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Book Flip Component */}
      <EcatalogueBookFlip onAuthRequired={handleAuthRequired} />

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={activeModal === 'authPrompt'}
        onClose={closeAllModals}
        onLoginClick={handleAuthPromptLogin}
        onSignUpClick={handleAuthPromptSignUp}
        actionType={pendingAction?.type}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={activeModal === 'login'}
        onClose={closeAllModals}
        onBackToPrompt={pendingAction ? handleBackToPrompt : undefined}
        onSwitchToRegister={handleSwitchToRegister}
      />

      {/* Register Modal */}
      <RegisterModal
        isOpen={activeModal === 'register'}
        onClose={closeAllModals}
        onBackToPrompt={pendingAction ? handleBackToPrompt : undefined}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </div>
  );
}
