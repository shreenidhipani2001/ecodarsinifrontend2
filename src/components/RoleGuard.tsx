'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/useAuthStore';
import { getCurrentUser } from '../../lib/auth';

type RoleGuardProps = {
  children: React.ReactNode;
  allowedRole: 'ADMIN' | 'USER';
};

export default function RoleGuard({ children, allowedRole }: RoleGuardProps) {
  const router = useRouter();
  const { user, setUser, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // If no user in store, try to fetch from server
        if (!user) {
          const currentUser = await getCurrentUser();
          if (currentUser?.user) {
            setUser(currentUser.user);

            // Check if role matches
            if (currentUser.user.role !== allowedRole) {
              // Redirect based on their actual role
              if (currentUser.user.role === 'ADMIN') {
                router.push('/admin');
              } else {
                router.push('/dashboard');
              }
            }
          } else {
            // Not authenticated, redirect to login
            router.push('/login');
          }
        } else {
          // User exists in store, check role
          if (user.role !== allowedRole) {
            // Redirect based on their actual role
            if (user.role === 'ADMIN') {
              router.push('/admin');
            } else {
              router.push('/dashboard');
            }
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [user, allowedRole, router, setUser]);

  // Only render children if user exists and has the correct role
  if (!user || user.role !== allowedRole) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mb-4 mx-auto"></div>
          <p className="text-green-400 text-lg">Verifying access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
