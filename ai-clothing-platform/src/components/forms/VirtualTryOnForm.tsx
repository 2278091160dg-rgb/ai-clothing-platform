/**
 * VirtualTryOnForm - 虚拟试穿表单组件
 *
 * 拆分后的结构：
 * - hooks/use-virtual-tryon-form.ts: 表单状态和逻辑
 * - VirtualTryOnForm.module.css: 样式文件
 */

'use client';

import Image from 'next/image';
import { useVirtualTryOnForm } from '@/hooks/use-virtual-tryon-form';
import './VirtualTryOnForm.module.css';

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

interface VirtualTryOnFormProps {
  onSubmit: (data: VirtualTryOnFormData) => void;
  loading?: boolean;
}

export function VirtualTryOnForm({ onSubmit, loading = false }: VirtualTryOnFormProps) {
  const { formData, setFormData, handleSubmit, handleUpload } = useVirtualTryOnForm({
    onSubmit,
  });

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
    </div>
  );
}
