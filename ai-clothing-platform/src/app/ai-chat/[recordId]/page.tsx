/**
 * AI对话页面 - 飞书用户跳转专用页面
 * 路径: /ai-chat/[recordId]
 *
 * 拆分后的结构：
 * - hooks/use-ai-chat.ts: 对话逻辑 Hook
 * - components/ai-chat/AIChatHeader.tsx: 页面头部
 * - components/ai-chat/AIChatMessages.tsx: 消息列表
 * - components/ai-chat/AIChatSuggestion.tsx: 建议提示词
 * - components/ai-chat/AIChatInput.tsx: 输入框
 */

'use client';

import { useParams } from 'next/navigation';
import { useAIChat } from '@/hooks/use-ai-chat';
import { AIChatHeader } from '@/components/ai-chat/AIChatHeader';
import { AIChatMessages } from '@/components/ai-chat/AIChatMessages';
import { AIChatSuggestion } from '@/components/ai-chat/AIChatSuggestion';
import { AIChatInput } from '@/components/ai-chat/AIChatInput';

export default function AIChatPage() {
  const params = useParams();
  const recordId = params.recordId as string;

  const {
    messages,
    isLoading,
    suggestedPrompt,
    originalPrompt,
    sendMessage,
    applySuggestedPrompt,
    clearSuggestion,
    messagesEndRef,
  } = useAIChat({ recordId });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <AIChatHeader />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 原始提示词显示 */}
          {originalPrompt && (
            <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="text-xs text-white/60 mb-2">原始提示词</div>
              <p className="text-sm text-white">{originalPrompt}</p>
            </div>
          )}

          {/* 对话区域 */}
          <AIChatMessages
            messages={messages}
            isLoading={isLoading}
            messagesEndRef={messagesEndRef}
          />

          {/* Suggested Prompt Preview */}
          {suggestedPrompt && (
            <AIChatSuggestion
              suggestedPrompt={suggestedPrompt}
              isLoading={isLoading}
              onApply={applySuggestedPrompt}
              onRetry={clearSuggestion}
            />
          )}

          {/* Input */}
          <AIChatInput isLoading={isLoading} onSend={sendMessage} />
        </div>
      </div>
    </div>
  );
}
