import axios from 'axios';
import { AppState } from 'react-native';
import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import { api } from '@/shared/api';
import { errorMessage } from '@/shared/api/errors';
import { currentUserRequest, loginRequest } from '../services/auth-service';
import { AuthSession } from '../services/auth-session';
import { sessionStorage } from '../services/session-storage';
import { reminderNotifications } from '@/features/reminders/services/reminder-notifications';

const AuthContext = createContext<AuthSession | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session] = useState(() => new AuthSession({
    storage: {
      ...sessionStorage,
      clear: async () => {
        await Promise.all([sessionStorage.clear(), reminderNotifications.clearSession()]);
      },
    },
    login: loginRequest,
    currentUser: currentUserRequest,
    isUnauthorized: (error) => axios.isAxiosError(error) && error.response?.status === 401,
    message: errorMessage,
    setToken: (token) => {
      if (!token) reminderNotifications.setOwner(null);
      if (token) api.defaults.headers.common.Authorization = 'Bearer ' + token;
      else delete api.defaults.headers.common.Authorization;
    },
  }));

  useEffect(() => {
    const unsubscribe = session.subscribe(() => {
      reminderNotifications.setOwner(session.getSnapshot().user?.id ?? null);
    });
    const interceptor = api.interceptors.response.use((response) => response, (error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const header = error.config?.headers.Authorization;
        if (typeof header === 'string' && header.startsWith('Bearer ')) {
          session.invalidate(header.slice(7));
        }
      }
      return Promise.reject(error);
    });
    void session.restore();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && session.hasSession()) void session.restore();
    });
    return () => {
      unsubscribe();
      api.interceptors.response.eject(interceptor);
      subscription.remove();
      session.cancelPending();
    };
  }, [session]);

  return <AuthContext.Provider value={session}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const session = useContext(AuthContext);
  if (!session) throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  const state = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
  return { user: state.user, loading: state.loading, sessionError: state.error,
    signIn: session.signIn, signOut: session.signOut, retrySession: session.restore,
    setProfileComplete: session.setProfileComplete };
}
