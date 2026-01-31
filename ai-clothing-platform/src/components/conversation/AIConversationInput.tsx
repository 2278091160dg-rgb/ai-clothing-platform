/**
 * AIConversationInput - AI对话输入框
 */

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';

interface AIConversationInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
}

export function AIConversationInput({
  value,
  onChange,
  onSend,
  isLoading,
}: AIConversationInputProps) {
  return (
    <div className="border-t p-4">
      <div className="flex gap-2">
        <Textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="输入你的想法..."
          rows={2}
          className="resize-none"
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          disabled={isLoading}
        />
        <Button
          onClick={onSend}
          disabled={!value.trim() || isLoading}
          size="icon"
          className="self-end"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
      <p className="text-xs text-gray-400 mt-2">Enter 发送，Shift+Enter 换行</p>
    </div>
  );
}
