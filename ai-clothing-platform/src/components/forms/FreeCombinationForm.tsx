'use client';

import { useState } from 'react';
import Image from 'next/image';

interface FreeCombinationFormProps {
  onSubmit: (data: FreeCombinationFormData) => void;
  loading?: boolean;
}

export interface FreeCombinationFormData {
  materials: string[];
  combinationCount: number;
  modelType?: 'any' | 'adult' | 'child' | 'male' | 'female';
  stylePreference?: 'casual' | 'formal' | 'sporty' | 'elegant' | 'minimalist';
  aiModel: string;
}

export function FreeCombinationForm({ onSubmit, loading = false }: FreeCombinationFormProps) {
  const [formData, setFormData] = useState<FreeCombinationFormData>({
    materials: [],
    combinationCount: 4,
    modelType: 'any',
    stylePreference: 'casual',
    aiModel: 'Gemini 3.0 Pro',
  });

  const handleSubmit = () => {
    if (formData.materials.length === 0) {
      alert('请上传至少1张素材图');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="form-section">
      <h3 className="form-title">🎨 自由搭配 - 多素材组合生图</h3>

      {/* 第一步：上传多个素材 */}
      <div className="form-step">
        <div className="step-number">1</div>
        <div className="step-content">
          <h4 className="step-title">上传素材（1-9张）</h4>
          <div className="multi-upload-grid">
            {Array.from({ length: 9 }, (_, i) => (
              <div key={i} className="multi-upload-item" onClick={() => handleUpload(i)}>
                {formData.materials[i] ? (
                  <Image
                    src={formData.materials[i]}
                    alt={`素材${i + 1}`}
                    width={100}
                    height={100}
                    className="preview-image small"
                    unoptimized
                  />
                ) : (
                  <div className="upload-placeholder small">
                    <span>+</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="form-hint">支持上传1-9张素材图（服装、背景等）</p>
        </div>
      </div>

      {/* 第二步：搭配设置 */}
      <div className="form-step">
        <div className="step-number">2</div>
        <div className="step-content">
          <h4 className="step-title">搭配设置</h4>

          <div className="form-row">
            <div className="form-col">
              <label className="form-label">搭配数量</label>
              <select
                className="form-select"
                value={formData.combinationCount}
                onChange={e =>
                  setFormData({ ...formData, combinationCount: parseInt(e.target.value) })
                }
              >
                <option value={2}>2种搭配</option>
                <option value={4}>4种搭配</option>
                <option value={6}>6种搭配</option>
                <option value={9}>9种搭配</option>
              </select>
            </div>

            <div className="form-col">
              <label className="form-label">模特类型</label>
              <select
                className="form-select"
                value={formData.modelType}
                onChange={e =>
                  setFormData({
                    ...formData,
                    modelType: e.target.value as FreeCombinationFormData['modelType'],
                  })
                }
              >
                <option value="any">不限</option>
                <option value="adult">成人</option>
                <option value="child">儿童</option>
                <option value="male">男性</option>
                <option value="female">女性</option>
              </select>
            </div>
          </div>

          <div className="form-col">
            <label className="form-label">风格偏好</label>
            <select
              className="form-select"
              value={formData.stylePreference}
              onChange={e =>
                setFormData({
                  ...formData,
                  stylePreference: e.target.value as FreeCombinationFormData['stylePreference'],
                })
              }
            >
              <option value="casual">休闲</option>
              <option value="formal">正式</option>
              <option value="sporty">运动</option>
              <option value="elegant">优雅</option>
              <option value="minimalist">极简</option>
            </select>
          </div>
        </div>
      </div>

      {/* 提示信息 */}
      <div className="info-tip">
        💡 AI将自动融合多种搭配，生成
        <strong>{formData.combinationCount}</strong>张模特图
      </div>

      {/* 生成按钮 */}
      <button
        className="btn-primary"
        onClick={handleSubmit}
        disabled={loading || formData.materials.length === 0}
      >
        {loading ? '生成中...' : '🎨 开始搭配生成'}
      </button>

      <style jsx>{`
        .form-section {
          padding: 1.5rem;
        }

        .form-title {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          color: #1f2937;
        }

        .form-step {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .step-number {
          flex-shrink: 0;
          width: 2rem;
          height: 2rem;
          border-radius: 9999px;
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }

        .step-content {
          flex: 1;
        }

        .step-title {
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #1f2937;
        }

        .multi-upload-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
        }

        .multi-upload-item {
          aspect-ratio: 1;
          border: 2px dashed #d1d5db;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .multi-upload-item:hover {
          border-color: #8b5cf6;
          background: #f5f3ff;
        }

        .preview-image.small {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .upload-placeholder.small {
          font-size: 2rem;
          color: #9ca3af;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .form-col {
          display: flex;
          flex-direction: column;
        }

        .form-label {
          display: block;
          font-weight: 500;
          margin-bottom: 0.5rem;
          color: #374151;
        }

        .form-select {
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          background: white;
        }

        .form-hint {
          font-size: 0.875rem;
          color: #9ca3af;
          margin-top: 0.5rem;
        }

        .info-tip {
          padding: 1rem;
          background: #f5f3ff;
          border-left: 4px solid #8b5cf6;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .btn-primary {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );

  function handleUpload(index: number) {
    alert(`上传素材${index + 1}功能待实现`);
  }
}
