import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, ApiError, getClientToken, setClientToken, type SiteConfig } from './client';

interface SiteContextValue {
  /** null until /api/config loads (or if the server can't be reached). */
  config: SiteConfig | null;
  refreshConfig: () => Promise<void>;
  /** Phone number of the signed-in client, if any. */
  sessionPhone: string | null;
  sessionToken: string | null;
  signIn: (token: string, phone: string) => void;
  signOut: () => void;
}

const SiteContext = createContext<SiteContextValue | null>(null);

const decodePhone = (token: string | null): string | null => {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[0].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.exp * 1000 > Date.now() ? payload.phone ?? null : null;
  } catch {
    return null;
  }
};

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    const t = getClientToken();
    return decodePhone(t) ? t : null;
  });

  const refreshConfig = useCallback(async () => {
    try {
      setConfig(await api.config());
    } catch (err) {
      if (!(err instanceof ApiError)) throw err;
    }
  }, []);

  useEffect(() => {
    void refreshConfig();
  }, [refreshConfig]);

  const value = useMemo<SiteContextValue>(
    () => ({
      config,
      refreshConfig,
      sessionToken: token,
      sessionPhone: decodePhone(token),
      signIn: (t) => {
        setClientToken(t);
        setToken(t);
      },
      signOut: () => {
        setClientToken(null);
        setToken(null);
      },
    }),
    [config, refreshConfig, token]
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
};

export function useSite(): SiteContextValue {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used inside <SiteProvider>');
  return ctx;
}
