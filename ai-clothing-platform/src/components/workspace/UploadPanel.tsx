/**
 * UploadPanel - 图片上传面板
 */

import { Cloud, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

type GenerationMode = 'scene' | 'tryon' | 'wear' | 'combine';

// 根据模式获取第一个上传区的标签
function getFirstUploadLabel(mode: GenerationMode): { label: string; required: boolean } {
  const labels = {
    scene: { label: '白底图', required: true },
    tryon: { label: '服装图', required: true },
    wear: { label: '白底图', required: true },
    combine: { label: '素材1', required: true },
  };
  return labels[mode];
}

// 根据模式获取第二个上传区的标签
function getSecondUploadLabel(mode: GenerationMode): { label: string; required: boolean } | null {
  const labels = {
    scene: { label: '辅助图', required: false },
    tryon: { label: '参考图', required: false },
    wear: { label: '参考图', required: true },
    combine: { label: '素材2', required: true },
  };
  return labels[mode];
}

interface UploadPanelProps {
  mode: GenerationMode;
  productImage: File | null;
  productImagePreview: string;
  sceneImage: File | null;
  sceneImagePreview: string;
  onProductUpload: () => void;
  onSceneUpload: () => void;
}

export function UploadPanel({
  mode,
  productImage,
  productImagePreview,
  sceneImage,
  sceneImagePreview,
  onProductUpload,
  onSceneUpload,
}: UploadPanelProps) {
  // 根据模式获取标签
  const firstUpload = getFirstUploadLabel(mode);
  const secondUpload = getSecondUploadLabel(mode);
  return (
    <div className="theme-card rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="step-number">01</span>
        <h3 className="text-[14px] font-bold text-foreground">上传图片</h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* 白底图上传 */}
        <div
          onClick={onProductUpload}
          className={`w-full aspect-square rounded-xl overflow-hidden flex flex-col items-center justify-center transition-all cursor-pointer ${
            productImage ? 'upload-zone-filled relative bg-card' : 'upload-zone'
          }`}
        >
          {productImagePreview ? (
            <Image
              src={productImagePreview}
              alt="白底图预览"
              width={200}
              height={200}
              className="w-full h-full object-contain p-2"
              unoptimized
            />
          ) : (
            <div className="text-center">
              <Cloud size={32} className="mx-auto mb-1 opacity-40" />
              <div className="text-[11px] text-muted-foreground">
                <span className="text-primary font-semibold">{firstUpload.label}</span>
              </div>
              <div className="text-[9px] text-muted-foreground/50 mt-0.5">
                {firstUpload.required ? '必填' : '选填'}
              </div>
            </div>
          )}
        </div>

        {/* 辅助图上传 */}
        <div
          onClick={onSceneUpload}
          className={`w-full aspect-square rounded-xl overflow-hidden flex flex-col items-center justify-center transition-all cursor-pointer ${
            sceneImage ? 'upload-zone-filled relative bg-card' : 'upload-zone'
          }`}
        >
          {sceneImagePreview ? (
            <Image
              src={sceneImagePreview}
              alt="辅助图预览"
              width={200}
              height={200}
              className="w-full h-full object-contain p-2"
              unoptimized
            />
          ) : (
            <div className="text-center">
              <ImageIcon size={32} className="mx-auto mb-1 opacity-40" />
              <div className="text-[11px] text-muted-foreground">
                <span className="text-primary font-semibold">
                  {secondUpload?.label || '场景图'}
                </span>
              </div>
              <div className="text-[9px] text-muted-foreground/50 mt-0.5">
                {secondUpload?.required ? '必填' : '选填'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
