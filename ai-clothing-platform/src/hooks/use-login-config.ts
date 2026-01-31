/**
 * useLoginConfig - 登录配置管理 Hook
 */

import { useState, useEffect } from 'react';
import type { LoginConfig } from '@/config/login-defaults';
import { DEFAULT_LOGIN_CONFIG } from '@/config/login-defaults';

interface UseLoginConfigReturn {
  config: LoginConfig;
  setConfig: (config: LoginConfig) => void;
  isAdmin: boolean;
  loadConfig: () => Promise<void>;
  saveConfig: (newConfig: LoginConfig) => Promise<LoginConfig>;
}

export function useLoginConfig(): UseLoginConfigReturn {
  const [config, setConfig] = useState<LoginConfig>(DEFAULT_LOGIN_CONFIG);
  const [isAdmin, setIsAdmin] = useState(false);

  // Load configuration on mount
  useEffect(() => {
    loadConfig();
    checkAdminStatus();
  }, []);

  const loadConfig = async () => {
    try {
      const res = await fetch('/api/login-config');
      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (data.success && data.data) {
            setConfig(data.data);
            console.log('Loaded config from database:', data.data);
          }
        } catch {
          console.warn('API returned non-JSON, using defaults');
          setConfig(DEFAULT_LOGIN_CONFIG);
        }
      } else {
        console.warn('API returned error, using defaults');
        setConfig(DEFAULT_LOGIN_CONFIG);
      }
    } catch (error) {
      console.warn('Failed to load config, using defaults:', error);
      setConfig(DEFAULT_LOGIN_CONFIG);
    }
  };

  const checkAdminStatus = () => {
    const cookies = document.cookie.split('; ').reduce(
      (acc, cookie) => {
        const [name, value] = cookie.split('=');
        if (name && value) acc[name] = value;
        return acc;
      },
      {} as Record<string, string>
    );

    const hasSession = cookies['access_session'];
    if (hasSession) {
      setIsAdmin(true);
    }
  };

  const saveConfig = async (newConfig: LoginConfig): Promise<LoginConfig> => {
    try {
      const res = await fetch('/api/login-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });

      if (!res.ok) {
        throw new Error('Failed to save config');
      }

      const data = await res.json();
      if (data.success) {
        setConfig(data.data);
        return data.data;
      }

      throw new Error('Save failed');
    } catch (error) {
      console.error('Save config error:', error);
      throw error;
    }
  };

  return {
    config,
    setConfig,
    isAdmin,
    loadConfig,
    saveConfig,
  };
}
