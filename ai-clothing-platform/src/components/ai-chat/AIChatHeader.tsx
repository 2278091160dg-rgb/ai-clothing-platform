/**
 * AIChatHeader - AI对话页面头部组件
 */

'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AIChatHeaderProps {
  onBackToFeishu?: () => void;
}

export function AIChatHeader({ onBackToFeishu }: AIChatHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBackToFeishu) {
      onBackToFeishu();
    } else {
      router.push('/');
    }
  };

  return (
    <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
            className="text-white/70 hover:text-white"
          >
            <Home size={18} />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-white">AI对话助手</h1>
            <p className="text-xs text-white/60">优化您的AI绘画提示词</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="text-white/70 hover:text-white"
        >
          <ArrowLeft size={18} className="mr-2" />
          返回飞书
        </Button>
      </div>
    </div>
  );
}
