/**
 * 深蓝色科技风主页 - AI电商商拍平台
 * Dark Mode + Future Tech + Bento Grid
 * 集成飞书 Bitable + N8N 工作流
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import {
  Eye,
  Maximize2,
  Download,
  X,
  Sparkles,
  Wand2,
  Cpu,
  Palette,
  Zap,
  Clock,
  Coins,
} from 'lucide-react';
import { LoginSettings } from '@/components/login/LoginSettings';
import { ConfigPanel } from '@/components/settings/config-panel';
import { ImagePreview } from '@/components/image-preview';
import { Toaster } from '@/components/ui/toaster';
import { ConfigManager } from '@/lib/config';
import { DEFAULT_LOGIN_CONFIG, type LoginConfig } from '@/config/login-defaults';
import type { TextModel, ImageModel } from '@/lib/types';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { UploadPanel } from '@/components/workspace/UploadPanel';
import { ParamsPanel } from '@/components/workspace/ParamsPanel';
import { ResultPanel } from '@/components/workspace/ResultPanel';
import { WelcomeShowcase } from '@/components/workspace/WelcomeShowcase';
import { TaskHistoryPanel } from '@/components/workspace/TaskHistoryPanel';
import { StatsPanel } from '@/components/workspace/StatsPanel';
import { ImageComparison } from '@/components/ImageComparison';
import { useBrandConfig } from '@/hooks/use-brand-config';
import { useImageUpload } from '@/hooks/use-image-upload';
import { useFeishuTaskManagement } from '@/hooks/use-feishu-task-management';

interface HistoryTask {
  id: string;
  recordId: string;
  productName: string;
  prompt: string;
  negativePrompt: string;
  config: {
    imageModel: ImageModel;
    aspectRatio: string;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  resultImages?: string[];
  productImagePreview?: string;
  sceneImagePreview?: string;
  createdAt: Date;
  source?: 'web' | 'feishu' | 'api'; // 🔧 添加任务来源字段
}

// 简化的历史记录项格式
interface HistoryRecord {
  id: string;
  original: string; // 原始商品图 URL
  sceneImage?: string; // 场景图/第二张输入图 URL
  generated: string; // AI 生成结果图 URL
  timestamp: number; // 时间戳
  prompt: string; // 提示词
}

interface FeishuRecord {
  record_id: string;
  prompt: string;
  status: string;
  productImageUrl?: string;
  sceneImageUrl?: string;
  resultImageUrl?: string;
  negativePrompt?: string;
  ratio?: string;
  model?: string;
  created_time: number;
}

export default function HomePage() {
  // UI 状态
  const [showConfig, setShowConfig] = useState(false);
  const [showLoginSettings, setShowLoginSettings] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loginConfig, setLoginConfig] = useState<LoginConfig>(DEFAULT_LOGIN_CONFIG);

  // 表单状态
  const [mode, setMode] = useState<'scene' | 'tryon' | 'wear' | 'combine'>('scene');
  const [productName, setProductName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [textModel, setTextModel] = useState<TextModel>('gemini-2.0-flash-exp');
  const [imageModel, setImageModel] = useState<ImageModel>('flux-1.1-pro');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '3:4' | '16:9' | '9:16'>('3:4');
  const [quality] = useState<'standard' | 'high'>('high');

  // 加载状态
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStatusIndex, setLoadingStatusIndex] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(15);
  const [elapsedTime, setElapsedTime] = useState(0); // 计时器（秒）
  const [tokenCount, setTokenCount] = useState(0); // Token 计数
  const pendingTaskIdRef = useRef<string | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Loading 状态文案
  const LOADING_STATUS_MESSAGES = [
    { text: '正在解析图像语义...', icon: Wand2 },
    { text: '正在计算光影结构...', icon: Cpu },
    { text: '正在生成超清细节...', icon: Palette },
    { text: '即将完成...', icon: Sparkles },
  ];

  // 定时切换 Loading 文案、进度、遥测数据
  useEffect(() => {
    if (!isGenerating) {
      setLoadingProgress(15);
      setElapsedTime(0);
      setTokenCount(0);
      return;
    }
    // 切换文案（每 2 秒）
    const statusInterval = setInterval(() => {
      setLoadingStatusIndex(prev => (prev + 1) % LOADING_STATUS_MESSAGES.length);
    }, 2000);
    // 模拟进度增长（每 500ms）
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 5 + 2;
      });
    }, 500);
    // 遥测数据更新（每 100ms）
    const telemetryInterval = setInterval(() => {
      setElapsedTime(prev => prev + 0.1);
      setTokenCount(prev => {
        if (prev >= 1500) return prev;
        return prev + Math.floor(Math.random() * 50) + 10;
      });
    }, 100);
    return () => {
      clearInterval(statusInterval);
      clearInterval(progressInterval);
      clearInterval(telemetryInterval);
    };
  }, [isGenerating]);

  // Debug: 追踪 isGenerating 状态变化
  useEffect(() => {
    console.log(
      '[HomePage] isGenerating changed:',
      isGenerating,
      'pendingTaskId:',
      pendingTaskIdRef.current
    );
  }, [isGenerating]);

  // 历史记录状态
  const [historyTasks, setHistoryTasks] = useState<HistoryTask[]>([]);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingRecords = useRef(false);
  const [isHistoryCleared, setIsHistoryCleared] = useState(false);
  const previousCompletedIds = useRef<Set<string>>(new Set());

  // 新增：简化的历史记录状态
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false); // 全屏预览状态
  const [imageZoom, setImageZoom] = useState(100); // 图片缩放百分比

  // 飞书任务管理 (保留兼容性)
  const { resetTask } = useFeishuTaskManagement();

  // 模式切换处理 - 清空提示词，保留其他通用参数
  const handleModeChange = useCallback((newMode: 'scene' | 'tryon' | 'wear' | 'combine') => {
    setMode(newMode);
    setPrompt(''); // 清空提示词，因为不同模式需要不同的提示词内容
  }, []);

  // 自定义 hooks
  const { brandConfig, loadBrandConfig } = useBrandConfig();
  const {
    productImage,
    productImagePreview,
    sceneImage,
    sceneImagePreview,
    handleProductUpload,
    handleSceneUpload,
    clearProductImage,
    clearSceneImage,
    setSceneImagePreviewOnly,
  } = useImageUpload();

  // 同步 productImagePreview 到 uploadedImage 状态
  useEffect(() => {
    if (productImagePreview) {
      setUploadedImage(productImagePreview);
    }
  }, [productImagePreview]);

  const isConfigured = ConfigManager.isConfigured();

  // 事件处理
  const handlePreviewImage = useCallback((src: string) => setPreviewImage(src), []);
  const handleClosePreview = useCallback(() => setPreviewImage(null), []);

  // 🔧 新增：点击历史任务加载到主视图
  const handleLoadToMainView = useCallback((task: any) => {
    console.log('🖱️ 加载任务到主视图:', task);
    // 设置原始商品图
    if (task.productImage && typeof task.productImage === 'string') {
      setUploadedImage(task.productImage);
    }
    // 设置场景图（如果有）
    if (task.sceneImage && typeof task.sceneImage === 'string') {
      setSceneImagePreviewOnly(task.sceneImage);
    } else {
      setSceneImagePreviewOnly('');
    }
    // 设置生成结果图
    if (task.resultImages && task.resultImages.length > 0) {
      setGeneratedImage(task.resultImages[0]);
    }
  }, []);

  // 下载生成结果图
  const handleDownloadResult = async () => {
    if (generatedImage) {
      try {
        const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(generatedImage)}`;
        const response = await fetch(proxyUrl);
        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `ai-generated-${Date.now()}.png`;
        link.click();
        URL.revokeObjectURL(link.href);
      } catch (error) {
        console.error('下载失败:', error);
        alert('下载失败，请重试');
      }
    }
  };

  const handleLogout = async () => {
    if (confirm('确定要退出登录吗？')) {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch (error) {
        console.error('登出失败:', error);
      }
      window.location.href = '/login';
    }
  };

  const saveLoginConfig = async (newConfig: LoginConfig) => {
    try {
      const res = await fetch('/api/login-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errorMsg = data.details || data.error || '保存失败，请重试';
        console.error('Save failed:', errorMsg);
        alert(`❌ 保存失败：${errorMsg}`);
        return;
      }

      setLoginConfig(data.data);
      alert(`✅ ${data.message || '登录页面配置已保存成功！'}`);
    } catch (error) {
      console.error('Save login config error:', error);
      alert(
        `❌ 保存配置失败：${error instanceof Error ? error.message : '未知错误'}\n\n请检查网络连接或稍后重试。`
      );
    }
  };

  // 状态映射：飞书状态 -> HistoryTask 状态
  const mapFeishuStatus = (
    feishuStatus: string
  ): 'pending' | 'processing' | 'completed' | 'failed' => {
    // 直接检查原始状态（不使用 toLowerCase，因为中文需要原样匹配）
    if (feishuStatus === '待处理' || feishuStatus === 'pending' || feishuStatus === 'Pending')
      return 'pending';
    if (feishuStatus === '处理中' || feishuStatus === 'processing' || feishuStatus === 'Processing')
      return 'processing';
    if (
      feishuStatus === '已完成' ||
      feishuStatus === '完成' ||
      feishuStatus === 'completed' ||
      feishuStatus === 'Completed'
    )
      return 'completed';
    if (feishuStatus === '失败' || feishuStatus === 'failed' || feishuStatus === 'Failed')
      return 'failed';
    return 'pending';
  };

  // 进度映射：状态 -> 进度百分比
  const mapStatusToProgress = (status: string): number => {
    if (status === '待处理' || status === 'pending' || status === 'Pending') return 0;
    if (status === '处理中' || status === 'processing' || status === 'Processing') return 50;
    if (
      status === '已完成' ||
      status === '完成' ||
      status === 'completed' ||
      status === 'Completed'
    )
      return 100;
    if (status === '失败' || status === 'failed' || status === 'Failed') return 0;
    return 0;
  };

  // 获取记录列表
  const fetchRecords = useCallback(async () => {
    if (isLoadingRecords.current || isHistoryCleared) {
      return;
    }

    isLoadingRecords.current = true;

    try {
      const response = await fetch('/api/records');
      const data = await response.json();

      // 🔍 调试：打印 API 原始返回数据
      console.log('===== API Raw Data =====');
      console.log('Response status:', response.status);
      console.log('Success:', data.success);
      console.log('Data length:', data.data?.length || 0);
      console.log('Full response:', data);
      console.log('========================');

      if (data.success && data.data) {
        const feishuRecords = data.data as FeishuRecord[];
        console.log('📋 处理前的记录数:', feishuRecords.length);

        // 🔧 创建现有任务的 source 映射，用于保留原有来源
        const existingSourceMap = new Map<string, 'web' | 'feishu' | 'api'>();
        historyTasks.forEach(task => {
          if (task.source) {
            existingSourceMap.set(task.recordId, task.source);
          }
        });

        // 转换为 HistoryTask 格式，并按创建时间倒序排列
        const tasks: HistoryTask[] = feishuRecords
          .map(record => {
            const taskStatus = mapFeishuStatus(record.status);
            const progress = mapStatusToProgress(record.status);
            const resultImages = record.resultImageUrl ? [record.resultImageUrl] : undefined;

            // 安全地创建日期对象，如果无效则使用当前时间
            const createdDate = record.created_time ? new Date(record.created_time) : new Date();

            // 验证日期是否有效
            const isValidDate = !isNaN(createdDate.getTime());

            // 生成任务标题：优先使用截断的提示词，否则使用时间
            const displayName = record.prompt
              ? record.prompt.length > 15
                ? record.prompt.slice(0, 15) + '...'
                : record.prompt
              : `场景生成 ${isValidDate ? createdDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '刚刚'}`;

            // 🔧 保留原有任务的 source，否则默认为 'feishu'
            const preservedSource = existingSourceMap.get(record.record_id);

            return {
              id: record.record_id,
              recordId: record.record_id,
              productName: displayName,
              prompt: record.prompt,
              negativePrompt: record.negativePrompt || '',
              config: {
                imageModel: (record.model || 'flux-1.1-pro') as ImageModel,
                aspectRatio: (record.ratio || '3:4') as string,
              },
              status: taskStatus,
              progress,
              resultImages,
              productImagePreview: record.productImageUrl,
              sceneImagePreview: record.sceneImageUrl, // 🔧 添加场景图预览
              createdAt: isValidDate ? createdDate : new Date(),
              source: preservedSource || 'feishu', // 🔧 保留原有来源，否则默认为表格端
            };
          })
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // 按创建时间倒序

        console.log('📋 处理后的任务数:', tasks.length);

        // 使用 Map 进行去重（基于 record_id）
        const tasksMap = new Map<string, HistoryTask>();
        tasks.forEach(task => {
          tasksMap.set(task.recordId, task);
        });
        const deduplicatedTasks = Array.from(tasksMap.values());

        console.log('📋 去重后的任务数:', deduplicatedTasks.length);
        console.log(
          '📋 任务列表:',
          deduplicatedTasks.map(t => ({
            id: t.id,
            status: t.status,
            prompt: t.prompt.slice(0, 20),
          }))
        );

        // 检测新完成的任务
        const newCompletedIds = new Set(
          deduplicatedTasks.filter(t => t.status === 'completed').map(t => t.id)
        );

        console.log('🔍 检测完成状态:');
        console.log('  - 已完成任务ID:', Array.from(newCompletedIds));
        console.log('  - 之前已完成ID:', Array.from(previousCompletedIds.current));
        console.log('  - pendingTaskIdRef.current:', pendingTaskIdRef.current);

        // 找出刚完成的任务（新完成但之前未完成的）
        const justCompleted = [...newCompletedIds].filter(
          id => !previousCompletedIds.current.has(id)
        );
        console.log('  - 新完成的任务:', justCompleted);

        if (justCompleted.length > 0) {
          console.log('🎉 检测到新完成的任务:', justCompleted);

          // 为每个刚完成的任务创建 HistoryRecord
          justCompleted.forEach(taskId => {
            const completedTask = deduplicatedTasks.find(t => t.id === taskId);
            console.log('🔍 完成的任务详情:', {
              id: completedTask?.id,
              hasResultImages: !!completedTask?.resultImages,
              resultImagesLength: completedTask?.resultImages?.length || 0,
              resultImages: completedTask?.resultImages,
              productImagePreview: completedTask?.productImagePreview,
            });

            if (
              completedTask &&
              completedTask.resultImages &&
              completedTask.resultImages.length > 0
            ) {
              const newRecord: HistoryRecord = {
                id: completedTask.id,
                original: completedTask.productImagePreview || '',
                sceneImage: completedTask.sceneImagePreview,
                generated: completedTask.resultImages[0],
                timestamp: Date.now(),
                prompt: completedTask.prompt,
              };

              console.log('✅ 创建 HistoryRecord:', newRecord);

              // 添加到历史记录
              setHistory(prev => {
                // 避免重复添加
                const exists = prev.some(h => h.id === newRecord.id);
                if (exists) {
                  console.log('⚠️ HistoryRecord 已存在，跳过');
                  return prev;
                }
                console.log('➕ 添加 HistoryRecord 到历史列表');
                return [newRecord, ...prev];
              });

              // 如果是当前正在等待的任务，设置主视图并清除 loading 状态
              if (pendingTaskIdRef.current === taskId) {
                console.log('✅ 设置主视图图片:', {
                  original: newRecord.original,
                  sceneImage: newRecord.sceneImage,
                  generated: newRecord.generated,
                });
                setUploadedImage(newRecord.original);
                // 设置场景图预览（如果历史记录中有场景图）
                if (newRecord.sceneImage) {
                  setSceneImagePreviewOnly(newRecord.sceneImage);
                } else {
                  // 如果没有场景图，清除之前的预览
                  setSceneImagePreviewOnly('');
                }
                setGeneratedImage(newRecord.generated);
                setIsGenerating(false);
                pendingTaskIdRef.current = null;
                // 清除超时定时器
                if (loadingTimeoutRef.current) {
                  clearTimeout(loadingTimeoutRef.current);
                  loadingTimeoutRef.current = null;
                }
              }
            } else {
              console.warn('⚠️ 无法创建 HistoryRecord:', {
                hasTask: !!completedTask,
                hasResultImages: !!completedTask?.resultImages,
                resultImagesLength: completedTask?.resultImages?.length || 0,
              });
            }
          });
        }

        // 更新已完成的任务集合
        previousCompletedIds.current = newCompletedIds;

        setHistoryTasks(deduplicatedTasks);
        console.log(`✅ 最终显示 ${deduplicatedTasks.length} 条记录`);
      } else {
        console.warn('⚠️ API 返回失败或无数据:', data);
      }
    } catch (error) {
      console.error('❌ 获取记录失败:', error);
    } finally {
      isLoadingRecords.current = false;
    }
  }, [isHistoryCleared, isGenerating]);

  // 组件挂载时获取记录并清空历史
  useEffect(() => {
    // 🔒 强制清理初始状态 - 防止 LocalStorage 或缓存导致的脏数据污染
    console.log('🔒 强制清理初始状态');
    setHistory([]);
    setHistoryTasks([]);
    setIsGenerating(false);
    setUploadedImage(null);
    setGeneratedImage(null);
    setSceneImagePreviewOnly('');

    // 清空所有可能导致状态污染的 ref
    pendingTaskIdRef.current = null;
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }

    console.log('🧹 初始化：已清空所有状态，准备获取记录');
    fetchRecords();

    // 初始化时记录当前已完成的任务ID，避免被当作新任务
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 只在挂载时执行一次

  // 全屏模式：ESC键关闭 + 滚轮缩放
  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
        setImageZoom(100);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setImageZoom(prev => {
        const delta = e.deltaY > 0 ? -10 : 10;
        return Math.min(300, Math.max(50, prev + delta));
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [isFullscreen]);

  // 轮询检查任务状态
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // 每 5 秒轮询一次
    pollingIntervalRef.current = setInterval(() => {
      // 如果用户已清空历史记录，则不再轮询
      if (!isHistoryCleared) {
        fetchRecords();
      }
    }, 5000);

    console.log('✅ 开始轮询记录状态 (5秒间隔)');
  }, [fetchRecords, isHistoryCleared]);

  // 停止轮询
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      console.log('⏸️ 停止轮询');
    }
  }, []);

  // 组件挂载时启动轮询
  useEffect(() => {
    startPolling();
    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling]);

  // 默认反向提示词
  const DEFAULT_NEGATIVE_PROMPT =
    'nsfw, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, multiple views';

  // 生成按钮点击处理 - 发送 FormData 到 /api/proxy
  const handleGenerateClick = useCallback(async () => {
    console.log('----- 前端点击生成按钮 -----');
    console.log('当前参数:', { mode, prompt, aspectRatio, imageModel });
    console.log('当前图片:', { productImage: productImage?.name, sceneImage: sceneImage?.name });

    if (!prompt) {
      alert('请输入提示词');
      return;
    }

    // 清除之前的超时定时器
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }

    // 1️⃣ 立即设置 loading 状态
    setIsGenerating(true);

    // 2️⃣ Optimistic UI: 立即在历史记录顶部添加一个占位任务
    const tempId = `temp-${Date.now()}`;
    const tempTask: HistoryTask = {
      id: tempId,
      recordId: tempId,
      productName: prompt.slice(0, 15) + (prompt.length > 15 ? '...' : ''),
      prompt,
      negativePrompt: DEFAULT_NEGATIVE_PROMPT,
      config: {
        imageModel,
        aspectRatio,
      },
      status: 'pending',
      progress: 0,
      resultImages: undefined,
      productImagePreview: productImagePreview || undefined,
      createdAt: new Date(),
      source: 'web' as const, // 🔧 标记为网页端创建的任务
    };

    // 将临时任务添加到列表顶部
    setHistoryTasks(prev => [tempTask, ...prev]);
    console.log('⚡ 已添加临时占位任务到历史记录:', tempTask);

    try {
      // 4️⃣ 构建 FormData
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('negative_prompt', DEFAULT_NEGATIVE_PROMPT);
      formData.append('ratio', aspectRatio);
      formData.append('model', imageModel);
      formData.append('mode', mode);

      // 添加图片文件（如果有）
      if (productImage) {
        formData.append('product_image', productImage);
        console.log('  - 添加商品图片:', productImage.name);
      }
      if (sceneImage) {
        formData.append('scene_image', sceneImage);
        console.log('  - 添加场景图片:', sceneImage.name);
      }

      console.log('2. 发送 FormData 请求到 /api/proxy');

      // 5️⃣ 发送 fetch 请求给 N8N (通过后端代理)
      const response = await fetch('/api/proxy', {
        method: 'POST',
        body: formData,
      });

      console.log('3. 收到响应状态:', response.status);

      const data = await response.json();
      console.log('4. 最终响应数据:', data);

      if (data.success) {
        const recordId = data.feishu_record_id;
        console.log('✅ 任务提交成功, record_id:', recordId);

        // 存储待处理的任务 ID（用于 fetchRecords 检测完成）
        pendingTaskIdRef.current = recordId;

        // 设置安全超时：如果2分钟后任务还没完成，自动解除 loading 状态
        loadingTimeoutRef.current = setTimeout(() => {
          console.warn('⚠️ Loading 状态超时，自动解除');
          setIsGenerating(false);
          pendingTaskIdRef.current = null;
        }, 120000); // 2 分钟超时

        // 如果历史记录已被清空，重新开始轮询
        if (isHistoryCleared) {
          setIsHistoryCleared(false);
        }

        // 立即刷新记录列表，获取最新状态
        await fetchRecords();

        // 注意：不在这里设置 setIsGenerating(false)
        // 等待 fetchRecords 检测到任务完成后再设置
      } else {
        // 失败时解除所有状态
        setIsGenerating(false);
        // 失败时移除临时任务
        setHistoryTasks(prev => prev.filter(t => t.id !== tempId));
        alert(`❌ 请求失败: ${data.details || data.error}`);
      }
    } catch (error) {
      console.error('❌ 请求失败:', error);
      // 失败时解除所有状态
      setIsGenerating(false);
      // 失败时移除临时任务
      setHistoryTasks(prev => prev.filter(t => t.id !== tempId));
      alert(`请求失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }, [
    prompt,
    aspectRatio,
    imageModel,
    mode,
    productImage,
    sceneImage,
    productImagePreview,
    fetchRecords,
    isHistoryCleared,
  ]);

  // 转换历史任务为 ResultPanel 兼容格式
  const displayTasks = historyTasks.map(task => ({
    id: task.id,
    productName: task.productName,
    prompt: task.prompt,
    productImage: task.productImagePreview,
    sceneImage: task.sceneImagePreview, // 🔧 添加场景图字段
    config: {
      textModel,
      imageModel: task.config.imageModel,
      aspectRatio: task.config.aspectRatio as '1:1' | '3:4' | '16:9' | '9:16',
      imageCount: 1,
      quality,
    },
    status: task.status as 'pending' | 'generating' | 'processing' | 'completed' | 'failed',
    progress: task.progress,
    resultImages: task.resultImages,
    createdAt: task.createdAt,
    source: task.source || 'feishu', // 🔧 使用任务自己的 source 字段，默认为 'feishu'
  }));

  // 🔧 简化的渲染逻辑 - 基于用户是否"选中"了图片
  // 核心原则：只要没有选中图片，无论有多少历史记录，都显示欢迎屏
  const renderMainContent = () => {
    // 调试日志
    console.log('[renderMainContent] 渲染判断:', {
      isGenerating,
      hasGeneratedImage: !!generatedImage,
      generatedImageValid: generatedImage && generatedImage.trim().length > 0,
      historyTasksCount: historyTasks.length,
      displayTasksCount: displayTasks.length,
    });

    // 优先级 1: 正在生成中 (显示 Loading 动画)
    if (isGenerating) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center h-full relative overflow-hidden bg-slate-950">
          {/* 动态深空网格背景 */}
          <div
            className="absolute inset-0 bg-grid-pattern opacity-5"
            style={{
              backgroundImage:
                'radial-gradient(circle at center, rgba(99, 102, 241, 0.03) 0%, transparent 70%)',
              backgroundSize: '40px 40px',
            }}
          />
          {/* 流动光斑 - indigo 到 purple 脉冲 */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-fuchsia-500/20 blur-[120px] animate-pulse"
            style={{ animationDuration: '4s' }}
          />
          {/* 第二层光斑 */}
          <div
            className="absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full bg-cyan-500/10 blur-[80px] animate-pulse"
            style={{ animationDuration: '3s', animationDelay: '1s' }}
          />

          {/* Loading 内容容器 */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-2xl px-4">
            {/* 全息轨道加载器 */}
            <div className="relative mb-10">
              {/* 背景光晕 */}
              <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-2xl animate-pulse" />

              {/* 轨道 1 - 外圈 (顺时针慢速) */}
              <div
                className="absolute inset-[-24px] rounded-full border border-cyan-500/20 animate-spin"
                style={{ animationDuration: '8s' }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
              </div>

              {/* 轨道 2 - 中圈 (逆时针中速) */}
              <div
                className="absolute inset-[-12px] rounded-full border-2 border-fuchsia-500/30 animate-spin"
                style={{ animationDuration: '4s', animationDirection: 'reverse' }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-fuchsia-400 rounded-full shadow-[0_0_8px_rgba(232,121,249,0.8)]" />
              </div>

              {/* 轨道 3 - 内圈 (顺时针快速) */}
              <div
                className="absolute inset-[-4px] rounded-full border border-transparent border-t-cyan-400/50 border-r-fuchsia-400/50 animate-spin"
                style={{ animationDuration: '2s' }}
              />

              {/* 核心发光体 */}
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-500 shadow-[0_0_40px_rgba(34,211,238,0.6)] flex items-center justify-center">
                {/* 内部高光 */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-300 to-fuchsia-400 shadow-inner" />
                {/* 脉冲波纹 */}
                <div
                  className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping"
                  style={{ animationDuration: '2s' }}
                />
              </div>
            </div>

            {/* 模拟终端日志 */}
            <div className="mb-8 w-full max-w-md">
              <div className="bg-black/40 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-3 font-mono text-xs">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-cyan-400/60">SYSTEM LOG</span>
                </div>
                <div className="text-green-400/80 space-y-1">
                  {(() => {
                    const terminalLogs = [
                      { text: '> Initializing neural weights...', delay: 0 },
                      { text: '> Allocating GPU tensors...', delay: 1000 },
                      { text: '> Context window: 4096 tokens...', delay: 2000 },
                      { text: '> Decoding latent space...', delay: 3000 },
                    ];
                    // 根据 elapsedTime 显示不同的日志
                    const logIndex = Math.min(Math.floor(elapsedTime / 1.5), 3);
                    return terminalLogs.slice(0, logIndex + 1).map((log, i) => (
                      <div key={i} className="opacity-90">
                        {log.text}
                      </div>
                    ));
                  })()}
                  {/* 游标闪烁 */}
                  <span className="inline-block w-2 h-4 bg-green-400 animate-pulse ml-1" />
                </div>
              </div>
            </div>

            {/* 主标题 - 赛博朋克渐变 */}
            <h2 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-400 tracking-wider">
              AI NEURAL PROCESSING
            </h2>

            {/* 进度条 - 更细 + 光泽动画 */}
            <div className="w-full max-w-md mb-8">
              <div className="h-[6px] bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm relative">
                {/* 进度条填充 */}
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-purple-500 rounded-full transition-all duration-300 relative overflow-hidden"
                  style={{ width: `${Math.min(loadingProgress, 95)}%` }}
                >
                  {/* 光泽动画 */}
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"
                    style={{ animationDuration: '1.5s' }}
                  />
                </div>
                {/* 进度条光晕 */}
                <div
                  className="absolute top-0 left-0 h-full rounded-full bg-cyan-400/20"
                  style={{ width: `${Math.min(loadingProgress, 95)}%`, filter: 'blur(4px)' }}
                />
              </div>
              {/* 百分比 */}
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-cyan-400/60 font-mono">PROCESSING</span>
                <span className="text-sm font-mono text-cyan-400">
                  {Math.floor(loadingProgress)}%
                </span>
              </div>
            </div>

            {/* 动态状态文案 */}
            <div className="flex items-center gap-2 text-cyan-300/80 text-sm mb-10">
              {(() => {
                const StatusIcon = LOADING_STATUS_MESSAGES[loadingStatusIndex].icon;
                return <StatusIcon size={16} className="animate-pulse text-cyan-400" />;
              })()}
              <span className="font-mono">
                {LOADING_STATUS_MESSAGES[loadingStatusIndex].text}
              </span>
            </div>

            {/* 悬浮玻璃态 HUD */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-full px-8 py-4 shadow-2xl">
              <div className="flex items-center gap-6">
                {/* Model */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Zap size={14} className="text-yellow-400" />
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                      Model
                    </span>
                  </div>
                  <span className="text-sm font-mono text-cyan-300">
                    {imageModel === 'flux-1.1-pro' ? 'Flux 1.1 Pro' : 'Gemini 3.0 Pro'}
                  </span>
                </div>

                {/* 分隔线 */}
                <div className="w-px h-8 bg-white/20" />

                {/* Elapsed Time */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock size={14} className="text-blue-400" />
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                      Elapsed
                    </span>
                  </div>
                  <span className="text-lg font-mono text-white">
                    {elapsedTime.toFixed(1)}s
                  </span>
                </div>

                {/* 分隔线 */}
                <div className="w-px h-8 bg-white/20" />

                {/* Tokens - 带跳动感 */}
                <div className="flex flex-col items-center min-w-[60px]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Coins size={14} className="text-green-400" />
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                      Tokens
                    </span>
                  </div>
                  <span
                    className="text-lg font-mono text-green-400"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {tokenCount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 优先级 2: 有生成结果图片 (显示结果视图)
    // 🔍 严格校验：检查 generatedImage 是否真的有内容（不仅仅是非 null）
    const hasValidGeneratedImage =
      generatedImage &&
      (typeof generatedImage === 'string'
        ? generatedImage.trim().length > 0 // 字符串类型：必须非空
        : Object.keys(generatedImage).length > 0); // 对象类型：必须有属性

    if (hasValidGeneratedImage) {
      return (
        // 显示生成结果 - 新布局：左侧输入图 + 右侧主舞台
        <div className="flex-1 flex gap-4 h-full">
          {/* 左侧栏 - 输入图列 (固定宽度 250px) */}
          <div className="w-64 flex-shrink-0 flex flex-col gap-3">
            {/* BEFORE - 输入图1 */}
            {uploadedImage && (
              <div className="theme-card rounded-xl p-3 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full">
                    BEFORE
                  </span>
                </div>
                <div className="aspect-[3/4] bg-gray-900/50 rounded-lg overflow-hidden relative">
                  <img
                    src={`/api/image-proxy?url=${encodeURIComponent(uploadedImage)}`}
                    alt="BEFORE"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}

            {/* BEFORE - 输入图2 (素材B) */}
            {/* 严格检查：只有当 sceneImagePreview 存在且非空字符串时才渲染 */}
            {sceneImagePreview && sceneImagePreview.trim() !== '' ? (
              <div className="theme-card rounded-xl p-3 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full">
                    BEFORE
                  </span>
                </div>
                <div className="aspect-[3/4] bg-gray-900/50 rounded-lg overflow-hidden relative">
                  <img
                    src={`/api/image-proxy?url=${encodeURIComponent(sceneImagePreview)}`}
                    alt="BEFORE"
                    className="w-full h-full object-contain"
                    onError={e => {
                      console.error('素材B图片加载失败:', sceneImagePreview);
                      // 如果图片加载失败，隐藏整个容器
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
            ) : null}

            {/* 空状态提示 */}
            {!uploadedImage && !sceneImagePreview && (
              <div className="theme-card rounded-xl p-4 text-center">
                <p className="text-xs text-muted-foreground">上传图片后在此显示</p>
              </div>
            )}
          </div>

          {/* 右侧栏 - 主舞台 (自适应剩余空间) */}
          <div className="flex-1 theme-card rounded-2xl p-4 flex flex-col relative overflow-hidden">
            {/* 深色渐变背景 - 影棚效果 */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black" />
            <div className="absolute inset-0 bg-grid-pattern opacity-20" />

            {/* 主舞台 - 图片对比显示区域 */}
            <div className="flex-1 relative z-10 flex items-center justify-center">
              <div className="relative w-full h-full min-h-[400px]">
                {/* 如果有原图，使用 ImageComparison 对比组件 */}
                {uploadedImage ? (
                  <ImageComparison
                    before={uploadedImage}
                    after={generatedImage}
                    onDownload={handleDownloadResult}
                  />
                ) : (
                  // 没有原图，只显示生成结果
                  <>
                    <img
                      src={`/api/image-proxy?url=${encodeURIComponent(generatedImage)}`}
                      alt="AI生成结果"
                      className="max-h-full max-w-full object-contain shadow-2xl rounded-lg"
                      onError={e => {
                        console.error('图片加载失败:', {
                          src: (e.target as HTMLImageElement).src,
                        });
                      }}
                    />

                    {/* AFTER 标注 */}
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-green-500/90 to-emerald-500/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg">
                      <p className="text-xs font-bold text-white tracking-wider">AFTER</p>
                    </div>

                    {/* 操作工具栏 */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-4 py-2.5 flex items-center gap-3 text-white hover:bg-black/60 transition-all shadow-2xl">
                      {/* 全屏查看 */}
                      <button
                        onClick={() => {
                          setIsFullscreen(true);
                          setImageZoom(100);
                        }}
                        className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                        title="全屏查看 (滚轮缩放)"
                      >
                        <Maximize2 size={18} />
                      </button>

                      {/* 下载生成图 */}
                      <button
                        onClick={handleDownloadResult}
                        className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                        title="下载生成图"
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 底部信息卡片 */}
            <div className="theme-card-light rounded-xl p-3 mt-3 relative z-10">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">生成时间:</span>
                  <span className="font-semibold text-foreground">
                    {new Date().toLocaleTimeString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">模型:</span>
                  <span className="font-semibold text-primary">{imageModel}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 优先级 3: 其他所有情况 → 强制显示欢迎屏
    // 🔑 核心逻辑：只要用户没有选中图片（generatedImage 为空），无论有多少历史记录，都显示欢迎屏
    console.log('[renderMainContent] 无选中图片，显示欢迎屏 (历史记录:', displayTasks.length, '条)');
    return <WelcomeShowcase />;
  };

  return (
    <div className="min-h-screen bg-grid-pattern">
      <Toaster />
      {/* 顶部导航栏 */}
      <WorkspaceHeader
        brandConfig={brandConfig}
        onLoginSettings={() => setShowLoginSettings(true)}
        onConfig={() => setShowConfig(true)}
        onLogout={handleLogout}
        userInitial="D"
      />

      {/* 主内容区 - Bento Grid 布局 */}
      <main className="p-6 overflow-hidden h-[calc(100vh-64px)] relative">
        <div className="flex gap-5 h-full">
          {/* 左侧栏 - 可滚动的参数区域 + 固定生成按钮 */}
          <div className="w-[360px] flex-shrink-0 flex flex-col">
            {/* 可滚动区域 */}
            <div className="flex-1 overflow-y-auto space-y-3 pb-3">
              <UploadPanel
                mode={mode}
                productImage={productImage}
                productImagePreview={productImagePreview}
                sceneImage={sceneImage}
                sceneImagePreview={sceneImagePreview}
                onProductUpload={handleProductUpload}
                onSceneUpload={handleSceneUpload}
                onProductClear={clearProductImage}
                onSceneClear={clearSceneImage}
              />
              <ParamsPanel
                mode={mode}
                onModeChange={handleModeChange}
                prompt={prompt}
                productName={productName}
                textModel={textModel}
                imageModel={imageModel}
                aspectRatio={aspectRatio}
                quality={quality}
                onPromptChange={setPrompt}
                onProductNameChange={setProductName}
                onTextModelChange={setTextModel}
                onImageModelChange={setImageModel}
                onAspectRatioChange={setAspectRatio}
                onGenerate={handleGenerateClick}
                isConfigured={isConfigured}
                isGenerating={isGenerating}
              />
            </div>
          </div>

          {/* 中间栏 - 结果展示 (使用显式渲染函数模式) */}
          <div className="flex-1 flex flex-col">{renderMainContent()}</div>

          {/* 右侧栏 - 历史记录 */}
          <div className="w-[300px] flex flex-col gap-4">
            <StatsPanel tasks={displayTasks} />
            <TaskHistoryPanel
              tasks={displayTasks}
              onPreview={handlePreviewImage}
              onLoadToMainView={handleLoadToMainView}
              onClearHistory={() => {
                if (confirm('确定要清空历史记录吗？')) {
                  setHistoryTasks([]);
                  setHistory([]);
                  setIsHistoryCleared(true);
                }
              }}
            />
            {/* 新增：简化历史记录列表 */}
            {history.length > 0 && (
              <div className="theme-card rounded-xl p-4">
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <span>📸</span>
                  <span>生成历史</span>
                  <span className="text-xs text-muted-foreground">({history.length})</span>
                </h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {history.map(item => (
                    <div
                      key={item.id}
                      onClick={() => {
                        console.log('🖱️ 点击历史记录:', {
                          id: item.id,
                          original: item.original,
                          sceneImage: item.sceneImage,
                          generated: item.generated,
                          prompt: item.prompt,
                        });
                        setUploadedImage(item.original);
                        // 设置场景图预览（如果历史记录中有场景图）
                        if (item.sceneImage) {
                          setSceneImagePreviewOnly(item.sceneImage);
                        } else {
                          // 如果没有场景图，清除之前的预览
                          setSceneImagePreviewOnly('');
                        }
                        setGeneratedImage(item.generated);
                      }}
                      className="flex gap-2 p-2 rounded-lg bg-card/40 hover:bg-card/60 border border-border/20 hover:border-border/40 cursor-pointer transition-all"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 relative">
                        {item.generated ? (
                          <img
                            src={`/api/image-proxy?url=${encodeURIComponent(item.generated)}`}
                            alt="生成结果"
                            className="w-full h-full object-cover"
                            onError={e => {
                              console.error('图片加载失败:', item.generated);
                              e.currentTarget.src =
                                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Crect fill="%23ccc" width="48" height="48"/%3E%3C/svg%3E';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-card/60 flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">无图</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground truncate">
                          {item.prompt.slice(0, 20) + (item.prompt.length > 20 ? '...' : '')}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {new Date(item.timestamp).toLocaleTimeString('zh-CN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 配置面板 */}
      {showConfig && <ConfigPanel onClose={() => setShowConfig(false)} onSave={loadBrandConfig} />}

      {/* 登录页面设置模态框 */}
      <LoginSettings
        isOpen={showLoginSettings}
        onClose={() => setShowLoginSettings(false)}
        onSave={saveLoginConfig}
        currentConfig={loginConfig}
      />

      {/* 图片预览模态框 */}
      {previewImage && <ImagePreview src={previewImage} onClose={handleClosePreview} />}

      {/* 全屏预览模态框 */}
      {isFullscreen && generatedImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center">
          {/* 关闭按钮 */}
          <button
            onClick={() => {
              setIsFullscreen(false);
              setImageZoom(100);
            }}
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all hover:scale-110 z-10"
            title="关闭 (ESC)"
          >
            <X size={24} />
          </button>

          {/* 缩放提示 */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
            缩放: {imageZoom}% | 滚轮缩放 | ESC 关闭
          </div>

          {/* 图片容器 */}
          <div className="relative w-full h-full flex items-center justify-center p-12">
            <img
              src={`/api/image-proxy?url=${encodeURIComponent(generatedImage)}`}
              alt="全屏预览"
              style={{
                transform: `scale(${imageZoom / 100})`,
                transition: 'transform 0.1s ease-out',
              }}
              className="max-h-full max-w-full object-contain shadow-2xl rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
