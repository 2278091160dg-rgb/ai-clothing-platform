/**
 * AI Conversation Sidebar
 * AI对话侧边栏组件 - 多轮对话优化提示词
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Send, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface AIConversationSidebarProps {
  open: boolean;
  onClose: () => void;
  conversationId?: string;
  originalPrompt?: string;
  originalNegativePrompt?: string;
  recordId?: string;
  taskData?: {
    productImageUrl?: string;
    sceneImageUrl?: string;
    aiModel?: string;
    aspectRatio?: string;
    imageCount?: number;
    quality?: string;
  };
  onApply?: (finalPrompt: string, finalNegativePrompt?: string) => void;
}

export function AIConversationSidebar({
  open,
  onClose,
  conversationId: _conversationId,
  originalPrompt,
  originalNegativePrompt,
  recordId,
  taskData,
  onApply,
}: AIConversationSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedPrompt, setSuggestedPrompt] = useState<string | null>(null);
  const [suggestedNegativePrompt, setSuggestedNegativePrompt] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 创建对话
  useEffect(() => {
    if (open && !currentConversationId) {
      // 无论是否有recordId，都创建真实对话
      createConversation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, recordId, currentConversationId]);

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const createConversation = async () => {
    try {
      console.log('[Frontend] Creating conversation:', { recordId, originalPrompt });

      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordId,
          source: 'web',
        }),
      });

      const data = await response.json();

      console.log('[Frontend] Create conversation response:', {
        success: data.success,
        hasData: !!data.data,
        id: data.data?.id,
      });

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create conversation');
      }

      setCurrentConversationId(data.data.id);
      // 发送初始消息
      if (originalPrompt) {
        await sendMessage(data.data.id, `请帮我优化这个提示词：${originalPrompt}`);
      }
    } catch (error) {
      console.error('[Frontend] Failed to create conversation:', error);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'system',
          content: `❌ 无法创建对话：${error instanceof Error ? error.message : '未知错误'}`,
          timestamp: new Date(),
        },
      ]);
    }
  };

  const sendMessage = async (convId: string, content: string) => {
    if (!content.trim()) return;

    console.log('[Frontend] Sending message:', {
      convId,
      content,
      originalPrompt,
      suggestedPrompt,
    });

    setIsLoading(true);
    setInputValue('');

    try {
      // 添加用户消息到UI
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);

      // 发送到API
      const response = await fetch(`/api/conversations/${convId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          role: 'user',
          originalPrompt,
          currentPrompt: suggestedPrompt || originalPrompt,
        }),
      });

      console.log('[Frontend] API response status:', response.status);

      const data = await response.json();

      console.log('[Frontend] API response data:', {
        success: data.success,
        hasData: !!data.data,
        hasMessage: !!data.data?.message,
        hasSuggestedPrompt: !!data.data?.suggestedPrompt,
      });

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to send message');
      }

      // 添加AI回复到UI
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.data.message,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);

      // 如果有建议的提示词，显示出来
      if (data.data.suggestedPrompt) {
        console.log('[Frontend] Setting suggested prompt:', data.data.suggestedPrompt);
        setSuggestedPrompt(data.data.suggestedPrompt);
      }

      // 如果有建议的反向提示词，显示出来
      if (data.data.suggestedNegativePrompt) {
        console.log(
          '[Frontend] Setting suggested negative prompt:',
          data.data.suggestedNegativePrompt
        );
        setSuggestedNegativePrompt(data.data.suggestedNegativePrompt);
      }
    } catch (error) {
      console.error('[Frontend] Failed to send message:', error);
      const errorMessage = error instanceof Error ? error.message : '消息发送失败，请重试';
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'system',
          content: `❌ ${errorMessage}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (currentConversationId && inputValue.trim()) {
      sendMessage(currentConversationId, inputValue);
    }
  };

  const handleApply = async () => {
    if (!suggestedPrompt || !currentConversationId) return;

    setIsLoading(true);

    try {
      // 应用最终提示词并创建任务
      const response = await fetch(`/api/conversations/${currentConversationId}/apply`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          finalPrompt: suggestedPrompt,
          finalNegativePrompt: suggestedNegativePrompt,
          originalPrompt,
          originalNegativePrompt,
          taskData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // 通知父组件
        onApply?.(suggestedPrompt, suggestedNegativePrompt || undefined);
        onClose();
      }
    } catch (error) {
      console.error('Failed to apply conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-white shadow-2xl border-l flex flex-col z-50">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <span className="text-white text-sm">🤖</span>
          </div>
          <div>
            <h3 className="font-semibold">AI对话助手</h3>
            <p className="text-xs text-gray-500">多轮优化提示词</p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          ✕
        </button>
      </div>

      {/* Messages */}
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

      {/* Suggested Prompt Preview */}
      {suggestedPrompt && (
        <div className="border-t p-4 bg-blue-50">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-sm">AI优化版本</span>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 text-sm mb-3 max-h-32 overflow-y-auto">
            {suggestedPrompt}
          </div>

          {/* 反向提示词建议 */}
          {suggestedNegativePrompt && (
            <>
              <div className="flex items-start justify-between mb-2 mt-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600" />
                  <span className="font-medium text-sm">反向提示词</span>
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 text-sm mb-3 max-h-24 overflow-y-auto">
                {suggestedNegativePrompt}
              </div>
            </>
          )}

          <div className="flex gap-2">
            <Button onClick={handleApply} disabled={isLoading} size="sm" className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  处理中...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  确认并生图
                </>
              )}
            </Button>
            <Button
              onClick={() => {
                setSuggestedPrompt(null);
                setSuggestedNegativePrompt(null);
              }}
              variant="outline"
              size="sm"
            >
              重新优化
            </Button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="输入你的想法..."
            rows={2}
            className="resize-none"
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            size="icon"
            className="self-end"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-2">Enter 发送，Shift+Enter 换行</p>
      </div>
    </div>
  );
}
