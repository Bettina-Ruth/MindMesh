import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSession, clearSession, type StoredUser } from '@/lib/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  userId: string | null;
  userName: string | null;
  logout: () => void;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userId: null,
  userName: null,
  logout: () => {},
  refresh: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState(getSession());

  const refresh = () => setSessionState(getSession());

  const logout = () => {
    clearSession();
    setSessionState(null);
  };

  useEffect(() => {
    // Sync across tabs
    const handler = () => refresh();
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!session,
        userId: session?.userId ?? null,
        userName: session?.name ?? null,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
