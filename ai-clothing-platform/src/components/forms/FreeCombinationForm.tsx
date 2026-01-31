/**
 * FreeCombinationForm - 自由搭配表单组件
 *
 * 拆分后的结构：
 * - hooks/use-free-combination-form.ts: 表单状态和逻辑
 * - FreeCombinationForm.module.css: 样式文件
 */

'use client';

import Image from 'next/image';
import { useFreeCombinationForm } from '@/hooks/use-free-combination-form';
import styles from './FreeCombinationForm.module.css';

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
  const { formData, setFormData, handleSubmit, handleUpload } = useFreeCombinationForm({
    onSubmit,
  });

  return (
    <div className={styles.formSection}>
      <h3 className={styles.formTitle}>🎨 自由搭配 - 多素材组合生图</h3>

      {/* 第一步：上传多个素材 */}
      <div className={styles.formStep}>
        <div className={styles.stepNumber}>1</div>
        <div className={styles.stepContent}>
          <h4 className={styles.stepTitle}>上传素材（1-9张）</h4>
          <div className={styles.multiUploadGrid}>
            {Array.from({ length: 9 }, (_, i) => (
              <div key={i} className={styles.multiUploadItem} onClick={() => handleUpload(i)}>
                {formData.materials[i] ? (
                  <Image
                    src={formData.materials[i]}
                    alt={`素材${i + 1}`}
                    width={100}
                    height={100}
                    className={styles.previewImageSmall}
                    unoptimized
                  />
                ) : (
                  <div className={styles.uploadPlaceholderSmall}>
                    <span>+</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className={styles.formHint}>支持上传1-9张素材图（服装、背景等）</p>
        </div>
      </div>

      {/* 第二步：搭配设置 */}
      <div className={styles.formStep}>
        <div className={styles.stepNumber}>2</div>
        <div className={styles.stepContent}>
          <h4 className={styles.stepTitle}>搭配设置</h4>

          <div className={styles.formRow}>
            <div className={styles.formCol}>
              <label className={styles.formLabel}>搭配数量</label>
              <select
                className={styles.formSelect}
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

            <div className={styles.formCol}>
              <label className={styles.formLabel}>模特类型</label>
              <select
                className={styles.formSelect}
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

          <div className={styles.formCol}>
            <label className={styles.formLabel}>风格偏好</label>
            <select
              className={styles.formSelect}
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
      <div className={styles.infoTip}>
        💡 AI将自动融合多种搭配，生成
        <strong>{formData.combinationCount}</strong>张模特图
      </div>

      {/* 生成按钮 */}
      <button
        className={styles.btnPrimary}
        onClick={handleSubmit}
        disabled={loading || formData.materials.length === 0}
      >
        {loading ? '生成中...' : '🎨 开始搭配生成'}
      </button>
    </div>
  );
}
