/**
 * AIChatSuggestion - AI优化后的建议提示词组件
 */

'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';

interface AIChatSuggestionProps {
  suggestedPrompt: string;
  isLoading: boolean;
  onApply: () => void;
  onRetry: () => void;
}

export function AIChatSuggestion({
  suggestedPrompt,
  isLoading,
  onApply,
  onRetry,
}: AIChatSuggestionProps) {
  return (
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
          onClick={onApply}
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
          onClick={onRetry}
          variant="outline"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          重新优化
        </Button>
      </div>
    </div>
  );
}
