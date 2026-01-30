'use client';

import { useState } from 'react';
import Image from 'next/image';

interface VirtualTryOnFormProps {
  onSubmit: (data: VirtualTryOnFormData) => void;
  loading?: boolean;
}

export interface VirtualTryOnFormData {
  clothingImage: string;
  referenceImage?: string;
  modelImage?: string;
  clothingDescription: string;
  modelDescription?: string;
  sceneDescription?: string;
  tryonMode: 'single' | 'multi';
  aiModel: string;
  aspectRatio: '3:4' | '1:1' | '16:9';
}

export function VirtualTryOnForm({ onSubmit, loading = false }: VirtualTryOnFormProps) {
  const [formData, setFormData] = useState<VirtualTryOnFormData>({
    clothingImage: '',
    referenceImage: '',
    modelImage: '',
    clothingDescription: '',
    modelDescription: '',
    sceneDescription: '',
    tryonMode: 'single',
    aiModel: 'Gemini 3.0 Pro',
    aspectRatio: '3:4',
  });

  const handleSubmit = () => {
    if (!formData.clothingImage || !formData.clothingDescription) {
      alert('请上传服装图并填写服装描述');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="form-section">
      <h3 className="form-title">👔 虚拟试衣 - 服装上身试穿</h3>

      {/* 第一步：上传服装图 */}
      <div className="form-step">
        <div className="step-number">1</div>
        <div className="step-content">
          <h4 className="step-title">上传服装图（必填）</h4>
          <div className="upload-area" onClick={() => handleUpload('clothing')}>
            {formData.clothingImage ? (
              <Image
                src={formData.clothingImage}
                alt="服装"
                width={300}
                height={200}
                className="preview-image"
                unoptimized
              />
            ) : (
              <div className="upload-placeholder">
                <span className="upload-icon">📁</span>
                <span>点击上传服装白底图</span>
              </div>
            )}
          </div>
          <p className="form-hint">支持：JPG/PNG/HEIC/WebP, 20K-15M</p>
        </div>
      </div>

      {/* 第二步：选择参考图 */}
      <div className="form-step">
        <div className="step-number">2</div>
        <div className="step-content">
          <h4 className="step-title">选择参考图（可选，推荐）</h4>
          <div className="upload-area" onClick={() => handleUpload('reference')}>
            {formData.referenceImage ? (
              <Image
                src={formData.referenceImage}
                alt="参考"
                width={300}
                height={200}
                className="preview-image"
                unoptimized
              />
            ) : (
              <div className="upload-placeholder">
                <span className="upload-icon">🖼️</span>
                <span>点击选择姿势参考图</span>
              </div>
            )}
          </div>
          <p className="form-hint">用于指定试穿姿势（推荐上传）</p>
        </div>
      </div>

      {/* 第三步：选择模特 */}
      <div className="form-step">
        <div className="step-number">3</div>
        <div className="step-content">
          <h4 className="step-title">选择模特（可选）</h4>
          <div className="upload-area" onClick={() => handleUpload('model')}>
            {formData.modelImage ? (
              <Image
                src={formData.modelImage}
                alt="模特"
                width={300}
                height={200}
                className="preview-image"
                unoptimized
              />
            ) : (
              <div className="upload-placeholder">
                <span className="upload-icon">👤</span>
                <span>点击选择模特形象</span>
              </div>
            )}
          </div>
          <p className="form-hint">指定试穿模特（会增加1分钟生成时间）</p>
        </div>
      </div>

      {/* 服装描述 */}
      <div className="form-group">
        <label className="form-label required">服装描述</label>
        <input
          type="text"
          className="form-input"
          placeholder="例如：红色连衣裙、蓝色西装、白色衬衫"
          value={formData.clothingDescription}
          onChange={e => setFormData({ ...formData, clothingDescription: e.target.value })}
        />
      </div>

      {/* 模特描述 */}
      <div className="form-group">
        <label className="form-label">模特描述（可选）</label>
        <input
          type="text"
          className="form-input"
          placeholder="例如：年轻亚洲女性模特"
          value={formData.modelDescription}
          onChange={e => setFormData({ ...formData, modelDescription: e.target.value })}
        />
      </div>

      {/* 场景描述 */}
      <div className="form-group">
        <label className="form-label">场景描述（可选）</label>
        <input
          type="text"
          className="form-input"
          placeholder="例如：温馨卧室、现代办公室、自然户外"
          value={formData.sceneDescription}
          onChange={e => setFormData({ ...formData, sceneDescription: e.target.value })}
        />
      </div>

      {/* 试穿模式 */}
      <div className="form-group">
        <label className="form-label">试穿模式</label>
        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              name="tryonMode"
              value="single"
              checked={formData.tryonMode === 'single'}
              onChange={() => setFormData({ ...formData, tryonMode: 'single' })}
            />
            单件试穿
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="tryonMode"
              value="multi"
              checked={formData.tryonMode === 'multi'}
              onChange={() => setFormData({ ...formData, tryonMode: 'multi' })}
            />
            多件试穿
          </label>
        </div>
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
                  aspectRatio: ratio.value as VirtualTryOnFormData['aspectRatio'],
                })
              }
            >
              {ratio.label}
            </button>
          ))}
        </div>
      </div>

      {/* 生成按钮 */}
      <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
        {loading ? '生成中...' : '🎨 开始试穿'}
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

        .form-input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
        }

        .radio-group {
          display: flex;
          gap: 1.5rem;
        }

        .radio-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
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

  function handleUpload(type: 'clothing' | 'reference' | 'model') {
    // TODO: 实现文件上传逻辑
    alert(
      `上传${type === 'clothing' ? '服装' : type === 'reference' ? '参考' : '模特'}图功能待实现`
    );
  }
}
