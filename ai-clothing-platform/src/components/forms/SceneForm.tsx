'use client';

import { useState } from 'react';
import Image from 'next/image';

interface SceneFormProps {
  onSubmit: (data: SceneFormData) => void;
  loading?: boolean;
}

export interface SceneFormData {
  productImage: string;
  sceneImage?: string;
  prompt: string;
  aspectRatio: '3:4' | '1:1' | '16:9';
  aiModel: string;
}

export function SceneForm({ onSubmit, loading = false }: SceneFormProps) {
  const [formData, setFormData] = useState<SceneFormData>({
    productImage: '',
    sceneImage: '',
    prompt: '',
    aspectRatio: '3:4',
    aiModel: 'Gemini 3.0 Pro',
  });

  const handleSubmit = () => {
    if (!formData.productImage || !formData.prompt) {
      alert('请上传商品图片并填写提示词');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="form-section">
      <h3 className="form-title">🏞️ 场景生图 - 商品场景展示</h3>

      {/* 商品图上传 */}
      <div className="form-group">
        <label className="form-label required">商品图（必填）</label>
        <div className="upload-area" onClick={() => handleUpload('product')}>
          {formData.productImage ? (
            <Image
              src={formData.productImage}
              alt="商品"
              width={300}
              height={200}
              className="preview-image"
              unoptimized
            />
          ) : (
            <div className="upload-placeholder">
              <span className="upload-icon">📁</span>
              <span>点击上传商品图</span>
            </div>
          )}
        </div>
        <p className="form-hint">支持：JPG/PNG/HEIC/WebP, 20K-15M</p>
      </div>

      {/* 场景图上传 */}
      <div className="form-group">
        <label className="form-label">场景图（可选）</label>
        <div className="upload-area" onClick={() => handleUpload('scene')}>
          {formData.sceneImage ? (
            <Image
              src={formData.sceneImage}
              alt="场景"
              width={300}
              height={200}
              className="preview-image"
              unoptimized
            />
          ) : (
            <div className="upload-placeholder">
              <span className="upload-icon">🖼️</span>
              <span>点击上传场景图（可选）</span>
            </div>
          )}
        </div>
        <p className="form-hint">用于参考场景布局和风格</p>
      </div>

      {/* 提示词输入 */}
      <div className="form-group">
        <label className="form-label required">提示词</label>
        <textarea
          className="form-textarea"
          placeholder="描述您想要的场景效果，例如：温馨的卧室场景，柔和的自然光，极简风格..."
          value={formData.prompt}
          onChange={e => setFormData({ ...formData, prompt: e.target.value })}
          rows={4}
        />
        <button type="button" className="ai-optimize-btn" onClick={() => handleAIOptimize()}>
          💬 AI对话优化
        </button>
      </div>

      {/* 图片比例 */}
      <div className="form-group">
        <label className="form-label">图片比例</label>
        <div className="ratio-selector">
          {[
            { value: '3:4', label: '3:4 竖版' },
            { value: '1:1', label: '1:1 方版' },
            { value: '16:9', label: '16:9 横版' },
          ].map(ratio => (
            <button
              key={ratio.value}
              className={`ratio-btn ${formData.aspectRatio === ratio.value ? 'active' : ''}`}
              onClick={() =>
                setFormData({
                  ...formData,
                  aspectRatio: ratio.value as SceneFormData['aspectRatio'],
                })
              }
            >
              {ratio.label}
            </button>
          ))}
        </div>
      </div>

      {/* AI模型 */}
      <div className="form-group">
        <label className="form-label">AI模型</label>
        <select
          className="form-select"
          value={formData.aiModel}
          onChange={e => setFormData({ ...formData, aiModel: e.target.value })}
        >
          <option>Gemini 3.0 Pro</option>
          <option>Gemini 2.0 Flash</option>
        </select>
      </div>

      {/* 生成按钮 */}
      <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
        {loading ? '生成中...' : '🎨 开始生成场景图'}
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

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          font-weight: 500;
          margin-bottom: 0.5rem;
          color: #374151;
        }

        .form-label.required::after {
          content: ' *';
          color: #ef4444;
        }

        .upload-area {
          border: 2px dashed #d1d5db;
          border-radius: 0.5rem;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .upload-area:hover {
          border-color: #8b5cf6;
          background: #f5f3ff;
        }

        .preview-image {
          max-width: 100%;
          max-height: 200px;
          object-fit: contain;
        }

        .upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: #6b7280;
        }

        .upload-icon {
          font-size: 2rem;
        }

        .form-hint {
          font-size: 0.875rem;
          color: #9ca3af;
          margin-top: 0.5rem;
        }

        .form-textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-family: inherit;
          resize: vertical;
        }

        .ai-optimize-btn {
          margin-top: 0.5rem;
          padding: 0.5rem 1rem;
          background: #8b5cf6;
          color: white;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .ai-optimize-btn:hover {
          background: #7c3aed;
        }

        .ratio-selector {
          display: flex;
          gap: 0.5rem;
        }

        .ratio-btn {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          background: white;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .ratio-btn:hover {
          border-color: #8b5cf6;
        }

        .ratio-btn.active {
          background: #8b5cf6;
          color: white;
          border-color: #8b5cf6;
        }

        .form-select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          background: white;
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

  function handleUpload(type: 'product' | 'scene') {
    // TODO: 实现文件上传逻辑
    alert(`上传${type === 'product' ? '商品' : '场景'}图功能待实现`);
  }

  function handleAIOptimize() {
    // TODO: 打开AI对话优化弹窗
    alert('AI对话优化功能待实现');
  }
}
