'use client';

import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Hook to protect pages that require authentication
 * Redirects to login if user is not authenticated
 */
export function useAuthGuard() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading };
}

/**
 * Hook for pages that should redirect authenticated users away (like login/signup)
 * Redirects to dashboard if user is already authenticated
 */
export function useRedirectIfAuthenticated() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading };
}

/**
 * Higher-order component to protect routes
 */
export function withAuthGuard(Component) {
  return function ProtectedRoute(props) {
    const { isAuthenticated, isLoading } = useAuthGuard();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null; // Will redirect to login
    }

    return <Component {...props} />;
  };
}

/**
 * Higher-order component to redirect authenticated users away
 */
export function withRedirectIfAuthenticated(Component) {
  return function RedirectIfAuthenticatedRoute(props) {
    const { isAuthenticated, isLoading } = useRedirectIfAuthenticated();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      );
    }

    if (isAuthenticated) {
      return null; // Will redirect to dashboard
    }

    return <Component {...props} />;
  };
}
