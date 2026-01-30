/**
 * 深蓝色科技风主页 - AI电商商拍平台
 * Dark Mode + Future Tech + Bento Grid
 * 集成飞书 Bitable + N8N 工作流
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
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
import { TaskHistoryPanel } from '@/components/workspace/TaskHistoryPanel';
import { StatsPanel } from '@/components/workspace/StatsPanel';
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
  createdAt: Date;
}

// 简化的历史记录项格式
interface HistoryRecord {
  id: string;
  original: string;      // 原始商品图 URL
  generated: string;     // AI 生成结果图 URL
  timestamp: number;     // 时间戳
  prompt: string;        // 提示词
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
  const pendingTaskIdRef = useRef<string | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debug: 追踪 isGenerating 状态变化
  useEffect(() => {
    console.log('[HomePage] isGenerating changed:', isGenerating, 'pendingTaskId:', pendingTaskIdRef.current);
  }, [isGenerating]);

  // 历史记录状态
  const [historyTasks, setHistoryTasks] = useState<HistoryTask[]>([]);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingRecords = useRef(false);
  const [isHistoryCleared, setIsHistoryCleared] = useState(false);
  const [showSubmitMessage, setShowSubmitMessage] = useState(false);
  const previousCompletedIds = useRef<Set<string>>(new Set());

  // 新增：简化的历史记录状态
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

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
  const mapFeishuStatus = (feishuStatus: string): 'pending' | 'processing' | 'completed' | 'failed' => {
    // 直接检查原始状态（不使用 toLowerCase，因为中文需要原样匹配）
    if (feishuStatus === '待处理' || feishuStatus === 'pending' || feishuStatus === 'Pending') return 'pending';
    if (feishuStatus === '处理中' || feishuStatus === 'processing' || feishuStatus === 'Processing') return 'processing';
    if (feishuStatus === '已完成' || feishuStatus === '完成' || feishuStatus === 'completed' || feishuStatus === 'Completed') return 'completed';
    if (feishuStatus === '失败' || feishuStatus === 'failed' || feishuStatus === 'Failed') return 'failed';
    return 'pending';
  };

  // 进度映射：状态 -> 进度百分比
  const mapStatusToProgress = (status: string): number => {
    if (status === '待处理' || status === 'pending' || status === 'Pending') return 0;
    if (status === '处理中' || status === 'processing' || status === 'Processing') return 50;
    if (status === '已完成' || status === '完成' || status === 'completed' || status === 'Completed') return 100;
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

        // 转换为 HistoryTask 格式，并按创建时间倒序排列
        const tasks: HistoryTask[] = feishuRecords
          .map(record => {
            const taskStatus = mapFeishuStatus(record.status);
            const progress = mapStatusToProgress(record.status);
            const resultImages = record.resultImageUrl ? [record.resultImageUrl] : undefined;

            // 安全地创建日期对象，如果无效则使用当前时间
            const createdDate = record.created_time
              ? new Date(record.created_time)
              : new Date();

            // 验证日期是否有效
            const isValidDate = !isNaN(createdDate.getTime());

            // 生成任务标题：优先使用截断的提示词，否则使用时间
            const displayName = record.prompt
              ? (record.prompt.length > 15 ? record.prompt.slice(0, 15) + '...' : record.prompt)
              : `场景生成 ${isValidDate ? createdDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '刚刚'}`;

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
              createdAt: isValidDate ? createdDate : new Date(),
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
        console.log('📋 任务列表:', deduplicatedTasks.map(t => ({ id: t.id, status: t.status, prompt: t.prompt.slice(0, 20) })));

        // 检测新完成的任务
        const newCompletedIds = new Set(
          deduplicatedTasks.filter(t => t.status === 'completed').map(t => t.id)
        );

        console.log('🔍 检测完成状态:');
        console.log('  - 已完成任务ID:', Array.from(newCompletedIds));
        console.log('  - 之前已完成ID:', Array.from(previousCompletedIds.current));
        console.log('  - pendingTaskIdRef.current:', pendingTaskIdRef.current);

        // 找出刚完成的任务（新完成但之前未完成的）
        const justCompleted = [...newCompletedIds].filter(id => !previousCompletedIds.current.has(id));
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

            if (completedTask && completedTask.resultImages && completedTask.resultImages.length > 0) {
              const newRecord: HistoryRecord = {
                id: completedTask.id,
                original: completedTask.productImagePreview || '',
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
                  generated: newRecord.generated
                });
                setUploadedImage(newRecord.original);
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

          toast.success('生成完成！', {
            description: `${justCompleted.length} 张图片已准备就绪`,
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
    // 清空历史记录
    setHistory([]);
    setHistoryTasks([]);
    console.log('🧹 初始化：已清空历史记录');
    fetchRecords();
    // 初始化时记录当前已完成的任务ID，避免被当作新任务
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 只在挂载时执行一次

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
  const DEFAULT_NEGATIVE_PROMPT = 'nsfw, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, multiple views';

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

    // 2️⃣ 立即显示 Toast 提示
    toast.success('任务已提交，AI 正在绘图...');

    // 3️⃣ Optimistic UI: 立即在历史记录顶部添加一个占位任务
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
          toast.warning('任务状态更新超时', {
            description: '任务已提交，但状态更新较慢，请稍后查看历史记录',
          });
        }, 120000); // 2 分钟超时

        // 如果历史记录已被清空，重新开始轮询
        if (isHistoryCleared) {
          setIsHistoryCleared(false);
        }

        // 立即刷新记录列表，获取最新状态
        await fetchRecords();

        // 显示提交成功提示（不清空输入内容，方便用户重试）
        setShowSubmitMessage(true);
        setTimeout(() => setShowSubmitMessage(false), 3000);

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
  }, [prompt, aspectRatio, imageModel, mode, productImage, sceneImage, productImagePreview, fetchRecords, isHistoryCleared]);

  // 转换历史任务为 ResultPanel 兼容格式
  const displayTasks = historyTasks.map(task => ({
    id: task.id,
    productName: task.productName,
    prompt: task.prompt,
    productImage: task.productImagePreview,
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
  }));

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
        {/* 提交成功提示 - 固定定位，不影响布局 */}
        {showSubmitMessage && (
          <div className="fixed top-20 left-0 right-0 z-50 flex justify-center px-6 animate-in slide-in-from-top fade-in duration-300">
            <div className="bg-green-500/10 border border-green-500/30 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-green-400 text-sm">✓</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-400">任务已提交至后台</p>
                <p className="text-xs text-muted-foreground mt-0.5">任务在后台运行中，您可以关闭页面稍后查看</p>
              </div>
              <button
                onClick={() => setShowSubmitMessage(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        )}

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

          {/* 中间栏 - 结果展示 */}
          <div className="flex-1 flex flex-col gap-4">
            {isGenerating ? (
              // Loading 状态
              <ResultPanel
                tasks={displayTasks}
                imageModel={imageModel}
                isPolling={!!pollingIntervalRef.current}
                isGenerating={true}
                onReset={resetTask}
              />
            ) : generatedImage ? (
              // 显示生成结果（有原图显示对比，无原图只显示结果）
              <div className="flex-1 theme-card rounded-2xl p-4 flex flex-col relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-50" />
                <div className="flex-1 relative z-10 flex items-center justify-center">
                  {uploadedImage ? (
                    // 有原图：显示对比滑块
                    <ReactCompareSlider
                      itemOne={
                        <ReactCompareSliderImage
                          src={`/api/image-proxy?url=${encodeURIComponent(uploadedImage)}`}
                          alt="原始图"
                          className="w-full h-full object-contain"
                        />
                      }
                      itemTwo={
                        <ReactCompareSliderImage
                          src={`/api/image-proxy?url=${encodeURIComponent(generatedImage)}`}
                          alt="AI生成"
                          className="w-full h-full object-contain"
                        />
                      }
                      portrait
                      className="rounded-xl overflow-hidden shadow-2xl h-full w-full"
                    >
                      <button
                        onClick={() => {
                          // 使用代理下载
                          const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(generatedImage)}`;
                          fetch(proxyUrl)
                            .then(res => res.blob())
                            .then(blob => {
                              const link = document.createElement('a');
                              link.href = URL.createObjectURL(blob);
                              link.download = `ai-generated-${Date.now()}.png`;
                              link.click();
                              URL.revokeObjectURL(link.href);
                            });
                        }}
                        className="absolute top-4 right-4 btn-primary px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm z-20"
                      >
                        下载图片
                      </button>
                    </ReactCompareSlider>
                  ) : (
                    // 无原图：只显示生成结果
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={`/api/image-proxy?url=${encodeURIComponent(generatedImage)}`}
                        alt="AI生成结果"
                        className="max-w-full max-h-[500px] rounded-xl shadow-2xl"
                        onError={(e) => {
                          console.error('生成图片加载失败:', generatedImage);
                        }}
                      />
                      <button
                        onClick={() => {
                          // 使用代理下载
                          const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(generatedImage)}`;
                          fetch(proxyUrl)
                            .then(res => res.blob())
                            .then(blob => {
                              const link = document.createElement('a');
                              link.href = URL.createObjectURL(blob);
                              link.download = `ai-generated-${Date.now()}.png`;
                              link.click();
                              URL.revokeObjectURL(link.href);
                            });
                        }}
                        className="absolute top-4 right-4 btn-primary px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm"
                      >
                        下载图片
                      </button>
                    </div>
                  )}
                </div>
                {/* 底部信息卡片 */}
                <div className="theme-card-light rounded-xl p-4 mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">生成时间:</span>
                      <span className="font-semibold text-foreground">
                        {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">模型:</span>
                      <span className="font-semibold text-primary">{imageModel}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // 空状态或展示第一个任务
              <ResultPanel
                tasks={displayTasks}
                imageModel={imageModel}
                isPolling={!!pollingIntervalRef.current}
                isGenerating={false}
                onReset={resetTask}
              />
            )}
          </div>

          {/* 右侧栏 - 历史记录 */}
          <div className="w-[300px] flex flex-col gap-4">
            <StatsPanel tasks={displayTasks} />
            <TaskHistoryPanel
              tasks={displayTasks}
              onPreview={handlePreviewImage}
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
                  {history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        console.log('🖱️ 点击历史记录:', {
                          id: item.id,
                          original: item.original,
                          generated: item.generated,
                          prompt: item.prompt,
                        });
                        setUploadedImage(item.original);
                        setGeneratedImage(item.generated);
                        toast.info('已加载历史记录', {
                          description: item.prompt.slice(0, 30) + (item.prompt.length > 30 ? '...' : ''),
                        });
                      }}
                      className="flex gap-2 p-2 rounded-lg bg-card/40 hover:bg-card/60 border border-border/20 hover:border-border/40 cursor-pointer transition-all"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 relative">
                        {item.generated ? (
                          <img
                            src={`/api/image-proxy?url=${encodeURIComponent(item.generated)}`}
                            alt="生成结果"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('图片加载失败:', item.generated);
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Crect fill="%23ccc" width="48" height="48"/%3E%3C/svg%3E';
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
                          {new Date(item.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
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
    </div>
  );
}
