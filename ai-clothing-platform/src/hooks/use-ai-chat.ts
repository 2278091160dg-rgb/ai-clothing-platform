/**
 * useAIChat - AI对话 Hook (Feishu集成版本)
 *
 * 处理AI对话逻辑：
 * - 初始化对话
 * - 发送消息
 * - 应用优化后的提示词
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { AIConversationAPI } from '@/lib/services/ai-conversation-api';
import { extractPromptFromURL, FEISHU_DEFAULT_TASK_DATA } from '@/lib/utils/ai-chat-utils';
import type { Message } from '@/lib/types/ai-conversation.types';

interface UseAIChatOptions {
  recordId: string;
}

interface UseAIChatReturn {
  // 状态
  messages: Message[];
  isLoading: boolean;
  suggestedPrompt: string | null;
  originalPrompt: string;
  conversationId: string | null;
  // 操作
  sendMessage: (content: string) => Promise<void>;
  applySuggestedPrompt: () => Promise<void>;
  clearSuggestion: () => void;
  // Ref
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function useAIChat({ recordId }: UseAIChatOptions): UseAIChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedPrompt, setSuggestedPrompt] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [originalPrompt, setOriginalPrompt] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 初始化对话
  useEffect(() => {
    if (!recordId) return;

    const initializeConversation = async () => {
      try {
        const id = await AIConversationAPI.createConversation({ recordId });
        setConversationId(id);

        const promptParam = extractPromptFromURL();
        if (promptParam) {
          setOriginalPrompt(promptParam);
          // Send initial message to optimize prompt
          setMessages(prev => [
            ...prev,
            AIConversationAPI.createUserMessage(`请帮我优化这个提示词：${promptParam}`),
          ]);

          const data = await AIConversationAPI.sendMessage(id, {
            content: `请帮我优化这个提示词：${promptParam}`,
            originalPrompt: promptParam,
            currentPrompt: promptParam,
          });

          setMessages(prev => [...prev, AIConversationAPI.createAIMessage(data.message)]);

          if (data.suggestedPrompt) {
            setSuggestedPrompt(data.suggestedPrompt);
          }
        }
      } catch (error) {
        console.error('Failed to initialize conversation:', error);
        setMessages(prev => [...prev, AIConversationAPI.createSystemErrorMessage('无法创建对话')]);
      }
    };

    initializeConversation();
  }, [recordId]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !conversationId) return;

      setIsLoading(true);
      try {
        setMessages(prev => [...prev, AIConversationAPI.createUserMessage(content)]);

        const data = await AIConversationAPI.sendMessage(conversationId, {
          content,
          originalPrompt,
          currentPrompt: suggestedPrompt || originalPrompt,
        });

        setMessages(prev => [...prev, AIConversationAPI.createAIMessage(data.message)]);

        if (data.suggestedPrompt) {
          setSuggestedPrompt(data.suggestedPrompt);
        }
      } catch (error) {
        console.error('Failed to send message:', error);
        setMessages(prev => [
          ...prev,
          AIConversationAPI.createSystemErrorMessage('消息发送失败，请重试'),
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId, originalPrompt, suggestedPrompt]
  );

  const applySuggestedPrompt = useCallback(async () => {
    if (!suggestedPrompt || !conversationId) return;

    setIsLoading(true);

    try {
      const success = await AIConversationAPI.applyConversation(conversationId, {
        finalPrompt: suggestedPrompt,
        originalPrompt,
        taskData: FEISHU_DEFAULT_TASK_DATA,
      });

      if (success) {
        setMessages(prev => [...prev, AIConversationAPI.createSystemMessage('✅ 任务已创建！')]);

        setTimeout(() => setSuggestedPrompt(null), 2000);
      }
    } catch (error) {
      console.error('Failed to apply conversation:', error);
      setMessages(prev => [
        ...prev,
        AIConversationAPI.createSystemErrorMessage('应用失败，请重试'),
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, originalPrompt, suggestedPrompt]);

  const clearSuggestion = useCallback(() => {
    setSuggestedPrompt(null);
  }, []);

  return {
    messages,
    isLoading,
    suggestedPrompt,
    originalPrompt,
    conversationId,
    sendMessage,
    applySuggestedPrompt,
    clearSuggestion,
    messagesEndRef,
  };
}
