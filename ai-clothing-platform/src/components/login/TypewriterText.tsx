/**
 * AI 文字动画组件
 * 打字机效果展示 AI 相关文案
 */

'use client';

import { useEffect, useState } from 'react';

interface TypewriterTextProps {
  texts: string[];
  speed?: number;
  deleteSpeed?: number;
  pauseDuration?: number;
  className?: string;
}

export function TypewriterText({
  texts,
  speed = 100,
  deleteSpeed = 50,
  pauseDuration = 2000,
  className = '',
}: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const currentText = texts[textIndex];

    const timeout = setTimeout(() => {
      if (isPaused) {
        // 暂停结束，开始删除
        setIsPaused(false);
        setIsDeleting(true);
        return;
      }

      if (!isDeleting) {
        // 打字中
        if (displayText.length < currentText.length) {
          setDisplayText(currentText.slice(0, displayText.length + 1));
        } else {
          // 完成，暂停
          setIsPaused(true);
        }
      } else {
        // 删除中
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1));
        } else {
          // 删除完成，切换到下一句
          setIsDeleting(false);
          setTextIndex((prev) => (prev + 1) % texts.length);
        }
      }
    }, isDeleting ? deleteSpeed : speed);

    return () => clearTimeout(timeout);
  }, [
    displayText,
    textIndex,
    isDeleting,
    isPaused,
    texts,
    speed,
    deleteSpeed,
  ]);

  return (
    <span className={`typing-text ${className}`}>
      {displayText}
      <span className="cursor">|</span>
    </span>
  );
}

// AI 相关文案
export const AI_TEXTS = [
  'AI 驱动的创意生成',
  '智能图像合成技术',
  '电商视觉革命',
  '一键生成专业素材',
  '释放无限创造力',
  '未来已来，AI 触手可及',
];
