/**
 * useAIConversation - AI对话状态和逻辑 Hook
 *
 * 拆分后的结构：
 * - ai-conversation-api.ts: API 服务
 * - ai-conversation.types.ts: 类型定义
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { AIConversationAPI } from '@/lib/services/ai-conversation-api';
import type { Message, SuggestedPrompts, TaskData } from '@/lib/types/ai-conversation.types';

interface UseAIConversationOptions {
  open: boolean;
  recordId?: string;
  originalPrompt?: string;
  originalNegativePrompt?: string;
  taskData?: TaskData;
  onApply?: (finalPrompt: string, finalNegativePrompt?: string) => void;
}

interface UseAIConversationReturn {
  // State
  messages: Message[];
  suggestedPrompts: SuggestedPrompts | null;
  isLoading: boolean;
  conversationId: string | null;
  inputValue: string;
  // Actions
  setInputValue: (value: string) => void;
  handleSend: () => void;
  handleApply: () => void;
  clearSuggestedPrompts: () => void;
  // Refs
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function useAIConversation({
  open,
  recordId,
  originalPrompt,
  originalNegativePrompt,
  taskData,
  onApply,
}: UseAIConversationOptions): UseAIConversationReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<SuggestedPrompts | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 创建对话
  useEffect(() => {
    if (open && !conversationId) {
      createConversation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, recordId, conversationId]);

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const createConversation = async () => {
    try {
      const id = await AIConversationAPI.createConversation({ recordId });
      setConversationId(id);

      // 发送初始消息
      if (originalPrompt) {
        await sendMessage(id, `请帮我优化这个提示词：${originalPrompt}`);
      }
    } catch (error) {
      console.error('[Frontend] Failed to create conversation:', error);
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      setMessages(prev => [
        ...prev,
        AIConversationAPI.createSystemErrorMessage(`无法创建对话：${errorMsg}`),
      ]);
    }
  };

  const sendMessage = useCallback(
    async (convId: string, content: string) => {
      if (!content.trim()) return;

      setIsLoading(true);
      setInputValue('');

      try {
        // 添加用户消息到UI
        const userMessage = AIConversationAPI.createUserMessage(content);
        setMessages(prev => [...prev, userMessage]);

        // 发送到API
        const data = await AIConversationAPI.sendMessage(convId, {
          content,
          originalPrompt,
          currentPrompt: suggestedPrompts?.prompt || originalPrompt,
        });

        // 添加AI回复到UI
        const aiMessage = AIConversationAPI.createAIMessage(data.message);
        setMessages(prev => [...prev, aiMessage]);

        // 更新建议的提示词
        if (data.suggestedPrompt) {
          setSuggestedPrompts({
            prompt: data.suggestedPrompt,
            negativePrompt: data.suggestedNegativePrompt,
          });
        }
      } catch (error) {
        console.error('[Frontend] Failed to send message:', error);
        const errorMsg = error instanceof Error ? error.message : '消息发送失败，请重试';
        setMessages(prev => [...prev, AIConversationAPI.createSystemErrorMessage(errorMsg)]);
      } finally {
        setIsLoading(false);
      }
    },
    [originalPrompt, suggestedPrompts]
  );

  const handleSend = useCallback(() => {
    if (conversationId && inputValue.trim()) {
      sendMessage(conversationId, inputValue);
    }
  }, [conversationId, inputValue, sendMessage]);

  const handleApply = async () => {
    if (!suggestedPrompts?.prompt || !conversationId) return;

    setIsLoading(true);

    try {
      const success = await AIConversationAPI.applyConversation(conversationId, {
        finalPrompt: suggestedPrompts.prompt,
        finalNegativePrompt: suggestedPrompts.negativePrompt,
        originalPrompt,
        originalNegativePrompt,
        taskData,
      });

      if (success) {
        onApply?.(suggestedPrompts.prompt, suggestedPrompts.negativePrompt);
      }
    } catch (error) {
      console.error('Failed to apply conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSuggestedPrompts = useCallback(() => {
    setSuggestedPrompts(null);
  }, []);

  return {
    messages,
    suggestedPrompts,
    isLoading,
    conversationId,
    inputValue,
    setInputValue,
    handleSend,
    handleApply,
    clearSuggestedPrompts,
    messagesEndRef,
  };
}
