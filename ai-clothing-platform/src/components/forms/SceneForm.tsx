/**
 * SceneForm - 场景生图表单组件
 *
 * 拆分后的结构：
 * - hooks/use-scene-form.ts: 表单状态和逻辑
 * - SceneForm.module.css: 样式文件
 */

'use client';

import Image from 'next/image';
import { useSceneForm } from '@/hooks/use-scene-form';
import styles from './SceneForm.module.css';

interface SceneFormProps {
  onSubmit: (data: SceneFormData) => void;
  loading?: boolean;
  onAIOptimize?: () => void;
}

export interface SceneFormData {
  productImage: string;
  sceneImage?: string;
  prompt: string;
  aspectRatio: '3:4' | '1:1' | '16:9';
  aiModel: string;
}

export function SceneForm({ onSubmit, loading = false, onAIOptimize }: SceneFormProps) {
  const {
    formData,
    setFormData,
    handleSubmit,
    handleUpload,
    handleAIOptimize: handleOptimize,
  } = useSceneForm({
    onSubmit,
    onAIOptimize,
  });

  return (
    <div className={styles.formSection}>
      <h3 className={styles.formTitle}>🏞️ 场景生图 - 商品场景展示</h3>

      {/* 商品图上传 */}
      <div className={styles.formGroup}>
        <label className={`${styles.formLabel} ${styles.formLabelRequired}`}>商品图（必填）</label>
        <div className={styles.uploadArea} onClick={() => handleUpload('product')}>
          {formData.productImage ? (
            <Image
              src={formData.productImage}
              alt="商品"
              width={300}
              height={200}
              className={styles.previewImage}
              unoptimized
            />
          ) : (
            <div className={styles.uploadPlaceholder}>
              <span className={styles.uploadIcon}>📁</span>
              <span>点击上传商品图</span>
            </div>
          )}
        </div>
        <p className={styles.formHint}>支持：JPG/PNG/HEIC/WebP, 20K-15M</p>
      </div>

      {/* 场景图上传 */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>场景图（可选）</label>
        <div className={styles.uploadArea} onClick={() => handleUpload('scene')}>
          {formData.sceneImage ? (
            <Image
              src={formData.sceneImage}
              alt="场景"
              width={300}
              height={200}
              className={styles.previewImage}
              unoptimized
            />
          ) : (
            <div className={styles.uploadPlaceholder}>
              <span className={styles.uploadIcon}>🖼️</span>
              <span>点击上传场景图（可选）</span>
            </div>
          )}
        </div>
        <p className={styles.formHint}>用于参考场景布局和风格</p>
      </div>

      {/* 提示词输入 */}
      <div className={styles.formGroup}>
        <label className={`${styles.formLabel} ${styles.formLabelRequired}`}>提示词</label>
        <textarea
          className={styles.formTextarea}
          placeholder="描述您想要的场景效果，例如：温馨的卧室场景，柔和的自然光，极简风格..."
          value={formData.prompt}
          onChange={e => setFormData({ ...formData, prompt: e.target.value })}
          rows={4}
        />
        <button type="button" className={styles.aiOptimizeBtn} onClick={handleOptimize}>
          💬 AI对话优化
        </button>
      </div>

      {/* 图片比例 */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>图片比例</label>
        <div className={styles.ratioSelector}>
          {[
            { value: '3:4', label: '3:4 竖版' },
            { value: '1:1', label: '1:1 方版' },
            { value: '16:9', label: '16:9 横版' },
          ].map(ratio => (
            <button
              key={ratio.value}
              className={`${styles.ratioBtn} ${
                formData.aspectRatio === ratio.value ? styles.ratioBtnActive : ''
              }`}
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
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>AI模型</label>
        <select
          className={styles.formSelect}
          value={formData.aiModel}
          onChange={e => setFormData({ ...formData, aiModel: e.target.value })}
        >
          <option>Gemini 3.0 Pro</option>
          <option>Gemini 2.0 Flash</option>
        </select>
      </div>

      {/* 生成按钮 */}
      <button className={styles.btnPrimary} onClick={handleSubmit} disabled={loading}>
        {loading ? '生成中...' : '🎨 开始生成场景图'}
      </button>
    </div>
  );
}
