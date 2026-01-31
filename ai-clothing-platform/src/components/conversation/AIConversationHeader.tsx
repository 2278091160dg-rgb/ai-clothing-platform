/**
 * AIConversationHeader - AI对话侧边栏头部
 */

interface AIConversationHeaderProps {
  onClose: () => void;
}

export function AIConversationHeader({ onClose }: AIConversationHeaderProps) {
  return (
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
  );
}
