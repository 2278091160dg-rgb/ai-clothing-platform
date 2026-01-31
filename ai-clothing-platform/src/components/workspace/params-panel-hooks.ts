/**
 * useParamsPanel - 参数面板状态和逻辑 Hook
 */

import { useState, useCallback } from 'react';

interface UseParamsPanelOptions {
  onPromptChange: (value: string) => void;
  onAIConversationComplete?: (optimizedPrompt: string, optimizedNegativePrompt?: string) => void;
}

interface UseParamsPanelReturn {
  showAIConversation: boolean;
  conversationId: string | undefined;
  handleOpenAIConversation: () => void;
  handleCloseAIConversation: () => void;
  handleAIConversationComplete: (optimizedPrompt: string, optimizedNegativePrompt?: string) => void;
}

export function useParamsPanel({
  onPromptChange,
  onAIConversationComplete,
}: UseParamsPanelOptions): UseParamsPanelReturn {
  const [showAIConversation, setShowAIConversation] = useState(false);
  const [conversationId] = useState<string>();

  const handleOpenAIConversation = useCallback(() => {
    setShowAIConversation(true);
  }, []);

  const handleCloseAIConversation = useCallback(() => {
    setShowAIConversation(false);
  }, []);

  const handleAIConversationCompleteCallback = useCallback(
    (optimizedPrompt: string, optimizedNegativePrompt?: string) => {
      onPromptChange(optimizedPrompt);
      onAIConversationComplete?.(optimizedPrompt, optimizedNegativePrompt);
      setShowAIConversation(false);
    },
    [onPromptChange, onAIConversationComplete]
  );

  return {
    showAIConversation,
    conversationId,
    handleOpenAIConversation,
    handleCloseAIConversation,
    handleAIConversationComplete: handleAIConversationCompleteCallback,
  };
}
