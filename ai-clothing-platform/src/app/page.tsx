/**
 * 深蓝色科技风主页 - AI电商商拍平台
 * Dark Mode + Future Tech + Bento Grid
 * 集成飞书 Bitable + N8N 工作流
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
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
  } = useImageUpload();

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
    const status = feishuStatus?.toLowerCase() || '';
    if (status === '待处理' || status === 'pending') return 'pending';
    if (status === '处理中' || status === 'processing') return 'processing';
    if (status === '已完成' || status === 'completed') return 'completed';
    if (status === '失败' || status === 'failed') return 'failed';
    return 'pending';
  };

  // 进度映射：状态 -> 进度百分比
  const mapStatusToProgress = (status: string): number => {
    const s = status?.toLowerCase() || '';
    if (s === '待处理' || s === 'pending') return 0;
    if (s === '处理中' || s === 'processing') return 50;
    if (s === '已完成' || s === 'completed') return 100;
    if (s === '失败' || s === 'failed') return 0;
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

        // 检测待处理的任务是否已出现在历史记录中
        // 如果是，则清除 isGenerating 状态
        if (pendingTaskIdRef.current && isGenerating) {
          const pendingTaskExists = deduplicatedTasks.some(t => t.id === pendingTaskIdRef.current);
          if (pendingTaskExists) {
            console.log('✅ 待处理任务已出现在历史记录中，解除 loading 状态');
            setIsGenerating(false);
            pendingTaskIdRef.current = null;
            // 清除超时定时器
            if (loadingTimeoutRef.current) {
              clearTimeout(loadingTimeoutRef.current);
              loadingTimeoutRef.current = null;
            }
          }
        }

        // 检测新完成的任务
        const newCompletedIds = new Set(
          deduplicatedTasks.filter(t => t.status === 'completed').map(t => t.id)
        );

        // 找出刚完成的任务（新完成但之前未完成的）
        const justCompleted = [...newCompletedIds].filter(id => !previousCompletedIds.current.has(id));

        if (justCompleted.length > 0) {
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

  // 组件挂载时获取记录
  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

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

    // ⚡ 立即设置 loading 状态
    setIsGenerating(true);

    // ⚡ Optimistic UI: 立即在历史记录顶部添加一个占位任务
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
      // 构建 FormData
      const formData = new FormData();
      formData.append('prompt', prompt);
      // 使用默认反向提示词（不再让用户手动修改）
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

        // 存储待处理的任务 ID，用于检测何时任务出现在历史记录中
        pendingTaskIdRef.current = recordId;

        // 设置安全超时：如果2分钟后任务还没出现在历史记录中，自动解除 loading 状态
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

        // 显示 Toast 提示
        toast.success('任务已提交', {
          description: 'AI 正在努力绘图中，请稍候...',
        });

        // 显示提交成功提示（不清空输入内容，方便用户重试）
        setShowSubmitMessage(true);
        setTimeout(() => setShowSubmitMessage(false), 3000);

        // 注意：不在这里设置 setIsGenerating(false)
        // loading 状态会在 fetchRecords 中检测到任务出现后自动解除
      } else {
        setIsGenerating(false);
        // 失败时移除临时任务
        setHistoryTasks(prev => prev.filter(t => t.id !== tempId));
        alert(`❌ 请求失败: ${data.details || data.error}`);
      }
    } catch (error) {
      console.error('❌ 请求失败:', error);
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
      <main className={`p-6 overflow-hidden ${showSubmitMessage ? 'h-[calc(100vh-64px-64px)]' : 'h-[calc(100vh-64px)]'}`}>
        {/* 提交成功提示 */}
        {showSubmitMessage && (
          <div className="mb-4 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 flex items-center gap-3 animate-in slide-in-from-top fade-in duration-300">
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
            <ResultPanel
              tasks={displayTasks}
              imageModel={imageModel}
              isPolling={!!pollingIntervalRef.current}
              isGenerating={isGenerating}
              onReset={resetTask}
            />
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
                  setIsHistoryCleared(true);
                }
              }}
            />
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
