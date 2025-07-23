// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import { getMe } from '../api/auth';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // Set user offline when page is about to unload or becomes hidden
  useEffect(() => {
    if (!user) return;

    // Send heartbeat every 2 minutes to keep user online
    const heartbeatInterval = setInterval(
      () => {
        if (!document.hidden) {
          fetch('/api/auth/heartbeat', {
            method: 'POST',
            credentials: 'include',
          }).catch(console.error);
        }
      },
      2 * 60 * 1000
    ); // 2 minutes

    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable offline status update
      navigator.sendBeacon(
        'http://localhost:5000/api/auth/set-offline',
        JSON.stringify({ userId: user.id })
      );
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched tab or minimized - set offline after delay
        setTimeout(() => {
          if (document.hidden) {
            fetch('http://localhost:5000/api/auth/set-offline', {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.id }),
            }).catch(console.error);
          }
        }, 30000); // 30 seconds delay
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook để sử dụng AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth phải được dùng bên trong AuthProvider');
  }
  return context;
}
