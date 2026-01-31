/**
 * AI Conversation Sidebar
 * AI对话侧边栏组件 - 多轮对话优化提示词
 *
 * 拆分后的结构：
 * - hooks/use-ai-conversation.ts: 对话状态和逻辑
 * - AIConversationHeader.tsx: 头部组件
 * - AIConversationMessages.tsx: 消息列表组件
 * - AIConversationSuggestedPrompt.tsx: 优化提示词预览
 * - AIConversationInput.tsx: 输入框组件
 */

import { useAIConversation } from '@/hooks/use-ai-conversation';
import { AIConversationHeader } from './AIConversationHeader';
import { AIConversationMessages } from './AIConversationMessages';
import { AIConversationSuggestedPrompt } from './AIConversationSuggestedPrompt';
import { AIConversationInput } from './AIConversationInput';

interface TaskData {
  productImageUrl?: string;
  sceneImageUrl?: string;
  aiModel?: string;
  aspectRatio?: string;
  imageCount?: number;
  quality?: string;
}

interface AIConversationSidebarProps {
  open: boolean;
  onClose: () => void;
  originalPrompt?: string;
  originalNegativePrompt?: string;
  recordId?: string;
  taskData?: TaskData;
  onApply?: (finalPrompt: string, finalNegativePrompt?: string) => void;
}

export function AIConversationSidebar({
  open,
  onClose,
  originalPrompt,
  originalNegativePrompt,
  recordId,
  taskData,
  onApply,
}: AIConversationSidebarProps) {
  const {
    messages,
    suggestedPrompts,
    isLoading,
    inputValue,
    setInputValue,
    handleSend,
    handleApply,
    clearSuggestedPrompts,
    messagesEndRef,
  } = useAIConversation({
    open,
    recordId,
    originalPrompt,
    originalNegativePrompt,
    taskData,
    onApply,
  });

  if (!open) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-white shadow-2xl border-l flex flex-col z-50">
      {/* Header */}
      <AIConversationHeader onClose={onClose} />

      {/* Messages */}
      <AIConversationMessages
        messages={messages}
        isLoading={isLoading}
        messagesEndRef={messagesEndRef}
      />

      {/* Suggested Prompt Preview */}
      {suggestedPrompts && (
        <AIConversationSuggestedPrompt
          suggestedPrompts={suggestedPrompts}
          isLoading={isLoading}
          onApply={handleApply}
          onReoptimize={clearSuggestedPrompts}
        />
      )}

      {/* Input */}
      <AIConversationInput
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSend}
        isLoading={isLoading}
      />
    </div>
  );
}
