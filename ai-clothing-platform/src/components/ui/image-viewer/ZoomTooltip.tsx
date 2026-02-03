/**
 * ZoomTooltip - 缩放提示组件
 */

interface ZoomTooltipProps {
  scale: number;
}

export function ZoomTooltip({ scale }: ZoomTooltipProps) {
  if (scale <= 1) return null;

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-blue-500/90 backdrop-blur-md rounded-full px-3 py-1.5 text-white text-xs font-medium border border-white/20 shadow-lg flex items-center gap-1.5">
        <span>🔍</span>
        <span>{Math.round(scale * 100)}%</span>
        <span className="text-white/50">|</span>
        <span>滚轮缩放</span>
      </div>
    </div>
  );
}
