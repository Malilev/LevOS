import { useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setState({ user, loading: false, error: null });
      },
      (error) => {
        setState({ user: null, loading: false, error: error.message });
      }
    );

    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Sign in failed'
      }));
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      await firebaseSignOut(auth);
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Sign out failed'
      }));
    }
  }, []);

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    signIn,
    signOut,
    isAuthenticated: !!state.user,
  };
}
