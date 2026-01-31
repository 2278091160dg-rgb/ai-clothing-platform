/**
 * SmartWearingForm - 智能穿戴表单组件
 *
 * 拆分后的结构：
 * - hooks/use-smart-wearing-form.ts: 表单状态和逻辑
 * - VirtualTryOnForm.module.css: 样式文件（复用）
 */

'use client';

import Image from 'next/image';
import { useSmartWearingForm } from '@/hooks/use-smart-wearing-form';
import './VirtualTryOnForm.module.css';

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
  const { formData, setFormData, handleSubmit, handleUpload } = useSmartWearingForm({
    onSubmit,
  });

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
    </div>
  );
}
