/**
 * useImageUpload - 图片上传管理 Hook
 */

import { useState, useCallback } from 'react';

interface UseImageUploadReturn {
  productImage: File | null;
  productImagePreview: string;
  sceneImage: File | null;
  sceneImagePreview: string;
  handleProductUpload: () => void;
  handleSceneUpload: () => void;
  resetImages: () => void;
  clearProductImage: () => void;
  clearSceneImage: () => void;
}

export function useImageUpload(): UseImageUploadReturn {
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productImagePreview, setProductImagePreview] = useState<string>('');
  const [sceneImage, setSceneImage] = useState<File | null>(null);
  const [sceneImagePreview, setSceneImagePreview] = useState<string>('');

  const handleProductUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setProductImage(file);
        setProductImagePreview(URL.createObjectURL(file));
      }
    };
    input.click();
  }, []);

  const handleSceneUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setSceneImage(file);
        setSceneImagePreview(URL.createObjectURL(file));
      }
    };
    input.click();
  }, []);

  const resetImages = useCallback(() => {
    setProductImage(null);
    setProductImagePreview('');
    setSceneImage(null);
    setSceneImagePreview('');
  }, []);

  // 单独清空商品图
  const clearProductImage = useCallback(() => {
    setProductImage(null);
    setProductImagePreview('');
  }, []);

  // 单独清空场景图
  const clearSceneImage = useCallback(() => {
    setSceneImage(null);
    setSceneImagePreview('');
  }, []);

  return {
    productImage,
    productImagePreview,
    sceneImage,
    sceneImagePreview,
    handleProductUpload,
    handleSceneUpload,
    resetImages,
    clearProductImage,
    clearSceneImage,
  };
}
