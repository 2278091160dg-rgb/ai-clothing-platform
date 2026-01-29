/**
 * UploadPanel - 图片上传面板
 */

import { Cloud, Image as ImageIcon } from 'lucide-react';

interface UploadPanelProps {
  productImage: File | null;
  productImagePreview: string;
  sceneImage: File | null;
  sceneImagePreview: string;
  onProductUpload: () => void;
  onSceneUpload: () => void;
}

export function UploadPanel({
  productImage,
  productImagePreview,
  sceneImage,
  sceneImagePreview,
  onProductUpload,
  onSceneUpload,
}: UploadPanelProps) {
  return (
    <div className="theme-card rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="step-number">01</span>
        <h3 className="text-[14px] font-bold text-foreground">上传图片</h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* 商品图上传 */}
        <div
          onClick={onProductUpload}
          className={`w-full aspect-square rounded-xl overflow-hidden flex flex-col items-center justify-center transition-all cursor-pointer ${
            productImage ? 'upload-zone-filled relative bg-card' : 'upload-zone'
          }`}
        >
          {productImagePreview ? (
            <img
              src={productImagePreview}
              alt="商品预览"
              className="w-full h-full object-contain p-2"
            />
          ) : (
            <div className="text-center">
              <Cloud size={32} className="mx-auto mb-1 opacity-40" />
              <div className="text-[11px] text-muted-foreground">
                <span className="text-primary font-semibold">商品图</span>
              </div>
              <div className="text-[9px] text-muted-foreground/50 mt-0.5">必填</div>
            </div>
          )}
        </div>

        {/* 场景图上传 */}
        <div
          onClick={onSceneUpload}
          className={`w-full aspect-square rounded-xl overflow-hidden flex flex-col items-center justify-center transition-all cursor-pointer ${
            sceneImage ? 'upload-zone-filled relative bg-card' : 'upload-zone'
          }`}
        >
          {sceneImagePreview ? (
            <img
              src={sceneImagePreview}
              alt="场景预览"
              className="w-full h-full object-contain p-2"
            />
          ) : (
            <div className="text-center">
              <ImageIcon size={32} className="mx-auto mb-1 opacity-40" />
              <div className="text-[11px] text-muted-foreground">
                <span className="text-primary font-semibold">场景图</span>
              </div>
              <div className="text-[9px] text-muted-foreground/50 mt-0.5">选填</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
