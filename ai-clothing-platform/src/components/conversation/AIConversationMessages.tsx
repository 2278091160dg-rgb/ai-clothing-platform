/**
 * AIConversationMessages - AI对话消息列表
 */

import { AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message } from '@/lib/types/ai-conversation.types';

interface AIConversationMessagesProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function AIConversationMessages({
  messages,
  isLoading,
  messagesEndRef,
}: AIConversationMessagesProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>开始对话，AI将帮助你优化提示词</p>
        </div>
      )}

      {messages.map(message => (
        <div
          key={message.id}
          className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
        >
          <div
            className={cn(
              'max-w-[80%] rounded-2xl px-4 py-2',
              message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900',
              message.role === 'system' && 'bg-yellow-50 text-yellow-800 text-sm'
            )}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
            <p className="text-xs opacity-70 mt-1">
              {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-gray-100 rounded-2xl px-4 py-2 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm text-gray-600">AI正在思考...</span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
