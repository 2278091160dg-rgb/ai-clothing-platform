/**
 * AI对话页面 - 飞书用户跳转专用页面
 * 路径: /ai-chat/[recordId]
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, Loader2, CheckCircle, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export default function AIChatPage() {
  const params = useParams();
  const router = useRouter();
  const recordId = params.recordId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedPrompt, setSuggestedPrompt] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [originalPrompt, setOriginalPrompt] = useState<string>('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // 初始化：创建对话并获取原始提示词
  useEffect(() => {
    if (recordId) {
      initializeConversation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordId]);

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeConversation = async () => {
    try {
      // 1. 创建对话
      const convResponse = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordId,
          source: 'feishu',
        }),
      });

      const convData = await convResponse.json();
      if (convData.success) {
        setConversationId(convData.data.id);
      }

      // 2. 获取飞书记录的原始提示词
      // 这里应该调用飞书API获取记录信息
      // 暂时使用URL参数或显示输入框让用户输入
      const urlParams = new URLSearchParams(window.location.search);
      const promptParam = urlParams.get('prompt');
      if (promptParam) {
        setOriginalPrompt(promptParam);
        // 发送初始优化请求
        await sendMessage(convData.data.id, `请帮我优化这个提示词：${promptParam}`);
      }
    } catch (error) {
      console.error('Failed to initialize conversation:', error);
    }
  };

  const sendMessage = async (convId: string, content: string) => {
    if (!content.trim()) return;

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

      const data = await response.json();

      if (data.success) {
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
          setSuggestedPrompt(data.data.suggestedPrompt);
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'system',
          content: '消息发送失败，请重试',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (conversationId && inputValue.trim()) {
      sendMessage(conversationId, inputValue);
    }
  };

  const handleApply = async () => {
    if (!suggestedPrompt || !conversationId) return;

    setIsLoading(true);

    try {
      // 应用最终提示词并创建任务
      const response = await fetch(`/api/conversations/${conversationId}/apply`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          finalPrompt: suggestedPrompt,
          originalPrompt,
          taskData: {
            // 这里可以从URL参数获取，或者使用默认值
            userId: 'default-user',
            aiModel: 'FLUX.1',
            aspectRatio: '3:4',
            imageCount: 4,
            quality: 'high',
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        // 显示成功消息
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'system',
            content: `✅ 任务已创建！任务ID: ${data.data.taskId}`,
            timestamp: new Date(),
          },
        ]);

        // 延迟后返回飞书或显示返回按钮
        setTimeout(() => {
          setSuggestedPrompt(null);
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to apply conversation:', error);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'system',
          content: '应用失败，请重试',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToFeishu = () => {
    // 返回飞书表格
    // 这里需要根据实际的飞书AppToken和TableId构建URL
    // 暂时返回首页
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
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
            onClick={handleBackToFeishu}
            className="text-white/70 hover:text-white"
          >
            <ArrowLeft size={18} className="mr-2" />
            返回飞书
          </Button>
        </div>
      </div>

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
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-4 min-h-[400px] max-h-[600px] overflow-y-auto">
            {messages.length === 0 && (
              <div className="text-center text-white/40 py-12">
                <p>AI助手正在准备中...</p>
              </div>
            )}

            {messages.map(message => (
              <div
                key={message.id}
                className={cn(
                  'flex mb-4',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-2',
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900',
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

          {/* Suggested Prompt Preview */}
          {suggestedPrompt && (
            <div className="bg-green-500/10 backdrop-blur-sm rounded-2xl border border-green-500/30 p-4 mb-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="font-medium text-white">AI优化版本</span>
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 text-sm mb-3 max-h-32 overflow-y-auto">
                {suggestedPrompt}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleApply}
                  disabled={isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
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
                  onClick={() => setSuggestedPrompt(null)}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  重新优化
                </Button>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
            <div className="flex gap-2">
              <Textarea
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="输入你的想法，或让AI帮你优化提示词..."
                rows={2}
                className="flex-1 resize-none bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-blue-500/50"
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
        </div>
      </div>
    </div>
  );
}
