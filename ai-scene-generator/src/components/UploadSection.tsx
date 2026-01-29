import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { useAppStore } from '../hooks/useAppStore';
import { ImageFile } from '../types';
import clsx from 'clsx';

export function UploadSection() {
  const { params, setProductImage, setSceneImage } = useAppStore();

  // 商品图上传
  const onDropProduct = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const imageFile: ImageFile = {
            file,
            preview: reader.result as string,
            id: Math.random().toString(36),
          };
          setProductImage(imageFile);
        };
        reader.readAsDataURL(file);
      }
    },
    [setProductImage]
  );

  const { getRootProps: getProductProps, getInputProps: getProductInputProps, isDragActive: isProductDragActive } =
    useDropzone({
      onDrop: onDropProduct,
      accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
      maxFiles: 1,
      multiple: false,
    });

  // 场景图上传
  const onDropScene = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const imageFile: ImageFile = {
            file,
            preview: reader.result as string,
            id: Math.random().toString(36),
          };
          setSceneImage(imageFile);
        };
        reader.readAsDataURL(file);
      }
    },
    [setSceneImage]
  );

  const { getRootProps: getSceneProps, getInputProps: getSceneInputProps, isDragActive: isSceneDragActive } =
    useDropzone({
      onDrop: onDropScene,
      accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
      maxFiles: 1,
      multiple: false,
    });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card p-4"
    >
      {/* 头部 */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-white">上传图片</h2>
        <div className="flex gap-1 px-2 py-0.5 bg-primary-600/25 border border-primary-500/50 rounded-full">
          <span className="text-[10px] font-bold text-primary-400">01</span>
        </div>
      </div>

      {/* 商品图上传 */}
      <div className="mb-2">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-6 h-6 bg-primary-600/20 rounded-lg flex items-center justify-center">
            <svg className="w-3 h-3 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-slate-200">商品图</span>
          <span className="text-[10px] text-red-400">必填</span>
        </div>

        <div
          {...getProductProps()}
          className={clsx(
            'upload-area relative p-3 flex flex-col items-center justify-center cursor-pointer',
            isProductDragActive && 'dragging'
          )}
        >
          <input {...getProductInputProps()} />
          {params.productImage ? (
            <div className="relative w-full">
              <img
                src={params.productImage.preview}
                alt="商品图预览"
                className="w-full h-16 object-cover rounded-lg"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setProductImage(null);
                }}
                className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors text-xs"
              >
                ×
              </button>
            </div>
          ) : (
            <>
              <div className="w-8 h-8 bg-primary-600/15 rounded-full flex items-center justify-center mb-1.5">
                <svg className="w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-semibold text-white">点击或拖拽上传商品图</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 场景图上传 */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-3 h-3 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-slate-200">场景图</span>
          <span className="text-[10px] text-red-400">必填</span>
        </div>

        <div
          {...getSceneProps()}
          className={clsx(
            'upload-area relative p-3 flex flex-col items-center justify-center cursor-pointer',
            isSceneDragActive && 'dragging'
          )}
        >
          <input {...getSceneInputProps()} />
          {params.sceneImage ? (
            <div className="relative w-full">
              <img
                src={params.sceneImage.preview}
                alt="场景图预览"
                className="w-full h-16 object-cover rounded-lg"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSceneImage(null);
                }}
                className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors text-xs"
              >
                ×
              </button>
            </div>
          ) : (
            <>
              <div className="w-8 h-8 bg-purple-500/15 rounded-full flex items-center justify-center mb-1.5">
                <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-semibold text-white">点击或拖拽上传场景图</p>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
