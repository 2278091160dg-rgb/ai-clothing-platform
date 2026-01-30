'use client';

interface ModeSelectorProps {
  currentMode: 'scene' | 'tryon' | 'wear' | 'combine';
  onModeChange: (mode: 'scene' | 'tryon' | 'wear' | 'combine') => void;
  disabledModes?: ('scene' | 'tryon' | 'wear' | 'combine')[];
}

const MODES = [
  {
    id: 'scene' as const,
    name: '场景生图',
    icon: '🏞️',
    description: '商品+场景图生成',
    disabled: false,
  },
  {
    id: 'tryon' as const,
    name: '虚拟试衣',
    icon: '👔',
    description: '服装上身试穿',
    disabled: false,
  },
  {
    id: 'wear' as const,
    name: '智能穿戴',
    icon: '👟',
    description: '鞋包配饰穿戴',
    disabled: true, // 默认禁用
  },
  {
    id: 'combine' as const,
    name: '自由搭配',
    icon: '🎨',
    description: '多素材组合生图',
    disabled: true, // 默认禁用
  },
];

export function ModeSelector({
  currentMode,
  onModeChange,
  disabledModes = ['wear', 'combine'] as const,
}: ModeSelectorProps) {
  return (
    <div className="mode-selector">
      <h3 className="mode-selector-title">📷 选择生成模式</h3>
      <div className="mode-grid">
        {MODES.map(mode => {
          const isDisabled = disabledModes.includes(mode.id);
          const isActive = currentMode === mode.id;

          return (
            <button
              key={mode.id}
              className={`mode-card ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
              onClick={() => !isDisabled && onModeChange(mode.id)}
              disabled={isDisabled}
            >
              <span className="mode-icon">{mode.icon}</span>
              <div className="mode-name">{mode.name}</div>
              <div className="mode-desc">{mode.description}</div>
              {isDisabled && <div className="mode-badge">开发中</div>}
            </button>
          );
        })}
      </div>
      <style jsx>{`
        .mode-selector {
          margin-bottom: 2rem;
        }

        .mode-selector-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #1f2937;
        }

        .mode-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .mode-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          padding: 0.75rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 0.75rem;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          min-height: auto;
        }

        .mode-card:hover:not(.disabled) {
          border-color: #8b5cf6;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
          transform: translateY(-2px);
        }

        .mode-card.active {
          border-color: #8b5cf6;
          background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
        }

        .mode-card.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .mode-icon {
          font-size: 1.75rem;
          line-height: 1;
        }

        .mode-name {
          font-weight: 600;
          color: #1f2937;
          font-size: 0.9rem;
          line-height: 1.2;
        }

        .mode-desc {
          font-size: 0.75rem;
          color: #6b7280;
          line-height: 1.2;
        }

        .mode-badge {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: #f59e0b;
          color: white;
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
