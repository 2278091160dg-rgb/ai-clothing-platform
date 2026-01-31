/**
 * AIChatInput - AI对话输入框组件
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';

interface AIChatInputProps {
  isLoading: boolean;
  onSend: (content: string) => void;
}

export function AIChatInput({ isLoading, onSend }: AIChatInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (inputValue.trim()) {
      onSend(inputValue);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
      <div className="flex gap-2">
        <Textarea
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="输入你的想法，或让AI帮你优化提示词..."
          rows={2}
          className="flex-1 resize-none bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-blue-500/50"
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <Button
          onClick={handleSend}
          disabled={!inputValue.trim() || isLoading}
          size="icon"
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send size={18} className="text-white" />
          )}
        </Button>
      </div>
      <p className="text-xs text-white/40 mt-2">Enter 发送，Shift+Enter 换行</p>
    </div>
  );
}
