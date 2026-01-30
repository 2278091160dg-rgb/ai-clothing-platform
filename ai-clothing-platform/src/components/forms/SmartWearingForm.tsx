'use client';

import { useState } from 'react';
import Image from 'next/image';

interface SmartWearingFormProps {
  onSubmit: (data: SmartWearingFormData) => void;
  loading?: boolean;
}

export interface SmartWearingFormData {
  productImage: string;
  referenceImage: string;
  productDescription: string;
  productType: 'shoes' | 'bag' | 'watch' | 'jewelry' | 'hat' | 'scarf';
  referenceDescription?: string;
  viewType: 'single' | 'multi';
  aiModel: string;
  aspectRatio: '3:4' | '1:1' | '16:9';
}

export function SmartWearingForm({ onSubmit, loading = false }: SmartWearingFormProps) {
  const [formData, setFormData] = useState<SmartWearingFormData>({
    productImage: '',
    referenceImage: '',
    productDescription: '',
    productType: 'shoes',
    referenceDescription: '',
    viewType: 'single',
    aiModel: 'Gemini 3.0 Pro',
    aspectRatio: '3:4',
  });

  const handleSubmit = () => {
    if (!formData.productImage || !formData.referenceImage || !formData.productDescription) {
      alert('请上传商品图、参考图并填写商品描述');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="form-section">
      <h3 className="form-title">👟 智能穿戴 - 鞋包配饰穿戴</h3>

      {/* 第一步：上传商品图 */}
      <div className="form-step">
        <div className="step-number">1</div>
        <div className="step-content">
          <h4 className="step-title">上传商品图（必填）</h4>
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
                <span>点击上传商品图（鞋/包/表）</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 第二步：选择参考图 */}
      <div className="form-step">
        <div className="step-number">2</div>
        <div className="step-content">
          <h4 className="step-title">选择参考图（必填）</h4>
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
          <p className="form-hint">需要包含姿势和场景</p>
        </div>
      </div>

      {/* 商品类型 */}
      <div className="form-group">
        <label className="form-label required">商品类型</label>
        <select
          className="form-select"
          value={formData.productType}
          onChange={e =>
            setFormData({
              ...formData,
              productType: e.target.value as SmartWearingFormData['productType'],
            })
          }
        >
          <option value="shoes">👟 鞋类</option>
          <option value="bag">👜 包类</option>
          <option value="watch">⌚ 手表</option>
          <option value="jewelry">💍 首饰</option>
          <option value="hat">🧢 帽子</option>
          <option value="scarf">🧣 围巾</option>
        </select>
      </div>

      {/* 商品描述 */}
      <div className="form-group">
        <label className="form-label required">商品描述</label>
        <input
          type="text"
          className="form-input"
          placeholder="例如：白色运动鞋、黑色手提包"
          value={formData.productDescription}
          onChange={e => setFormData({ ...formData, productDescription: e.target.value })}
        />
      </div>

      {/* 参考图描述 */}
      <div className="form-group">
        <label className="form-label">参考图描述（可选）</label>
        <input
          type="text"
          className="form-input"
          placeholder="例如：模特站姿、全身照"
          value={formData.referenceDescription}
          onChange={e => setFormData({ ...formData, referenceDescription: e.target.value })}
        />
      </div>

      {/* 视角设置 */}
      <div className="form-group">
        <label className="form-label">视角</label>
        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              name="viewType"
              value="single"
              checked={formData.viewType === 'single'}
              onChange={() => setFormData({ ...formData, viewType: 'single' })}
            />
            单视角图
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="viewType"
              value="multi"
              checked={formData.viewType === 'multi'}
              onChange={() => setFormData({ ...formData, viewType: 'multi' })}
            />
            多视角图
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
                  aspectRatio: ratio.value as SmartWearingFormData['aspectRatio'],
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
        {loading ? '生成中...' : '🎨 开始穿戴'}
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

        .form-select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          background: white;
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

  function handleUpload(type: 'product' | 'reference') {
    alert(`上传${type === 'product' ? '商品' : '参考'}图功能待实现`);
  }
}
