/**
 * useLoginForm - 登录表单逻辑 Hook
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSoundEffects } from '@/lib/utils/sound-effects';

interface UseLoginFormReturn {
  password: string;
  setPassword: (value: string) => void;
  error: string;
  setError: (value: string) => void;
  loading: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export function useLoginForm(): UseLoginFormReturn {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const soundEffects = getSoundEffects();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      // 播放点击音效
      soundEffects.playClick();

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          soundEffects.playSuccess();
          // 登录成功，重定向到首页
          router.push('/');
          router.refresh();
        } else {
          soundEffects.playError();
          setError(data.error || '密码错误，请重试');
        }
      } catch (err) {
        soundEffects.playError();
        setError('网络错误，请稍后重试');
        console.error('Login error:', err);
      } finally {
        setLoading(false);
      }
    },
    [password, soundEffects, router]
  );

  return {
    password,
    setPassword,
    error,
    setError,
    loading,
    handleSubmit,
  };
}
