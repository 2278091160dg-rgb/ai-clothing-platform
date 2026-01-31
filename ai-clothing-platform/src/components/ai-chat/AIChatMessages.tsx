/**
 * AIChatMessages - AI对话消息列表组件
 */

'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message } from '@/lib/types/ai-conversation.types';

interface AIChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function AIChatMessages({ messages, isLoading, messagesEndRef }: AIChatMessagesProps) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-4 min-h-[400px] max-h-[600px] overflow-y-auto">
      {messages.length === 0 && (
        <div className="text-center text-white/40 py-12">
          <p>AI助手正在准备中...</p>
        </div>
      )}

      {messages.map(message => (
        <div
          key={message.id}
          className={cn('flex mb-4', message.role === 'user' ? 'justify-end' : 'justify-start')}
        >
          <div
            className={cn(
              'max-w-[80%] rounded-2xl px-4 py-2',
              message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900',
              message.role === 'system' && 'bg-yellow-50 text-yellow-800 text-sm'
            )}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-white/10 rounded-2xl px-4 py-2 flex items-center gap-2 text-white">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">AI正在思考...</span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
