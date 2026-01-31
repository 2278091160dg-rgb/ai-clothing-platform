/**
 * AIConversationSuggestedPrompt - AI优化提示词预览
 */

import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import type { SuggestedPrompts } from '@/lib/types/ai-conversation.types';

interface AIConversationSuggestedPromptProps {
  suggestedPrompts: SuggestedPrompts;
  isLoading: boolean;
  onApply: () => void;
  onReoptimize: () => void;
}

export function AIConversationSuggestedPrompt({
  suggestedPrompts,
  isLoading,
  onApply,
  onReoptimize,
}: AIConversationSuggestedPromptProps) {
  return (
    <div className="border-t p-4 bg-blue-50">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="font-medium text-sm">AI优化版本</span>
        </div>
      </div>
      <div className="bg-white rounded-lg p-3 text-sm mb-3 max-h-32 overflow-y-auto">
        {suggestedPrompts.prompt}
      </div>

      {/* 反向提示词建议 */}
      {suggestedPrompts.negativePrompt && (
        <>
          <div className="flex items-start justify-between mb-2 mt-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-sm">反向提示词</span>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 text-sm mb-3 max-h-24 overflow-y-auto">
            {suggestedPrompts.negativePrompt}
          </div>
        </>
      )}

      <div className="flex gap-2">
        <Button onClick={onApply} disabled={isLoading} size="sm" className="flex-1">
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
        <Button onClick={onReoptimize} variant="outline" size="sm">
          重新优化
        </Button>
      </div>
    </div>
  );
}
