import { motion } from 'framer-motion';
import { useAppStore } from './hooks/useAppStore';
import { Header } from './components/Header';
import { UploadSection } from './components/UploadSection';
import { ConfigSection } from './components/ConfigSection';
import { ResultSection } from './components/ResultSection';
import { HistorySection } from './components/HistorySection';
import { SettingsPanel } from './components/SettingsPanel';
import { n8nService } from './services/n8n';
import { GenerationResult } from './types';
import './styles/index.css';

function App() {
  const { params, isGenerating, setIsGenerating, setCurrentResult, addHistory, settingsOpen } = useAppStore();

  const handleGenerate = async () => {
    // 验证
    if (!params.productImage || !params.sceneImage) {
      alert('请上传商品图和场景图');
      return;
    }
    if (!params.prompt.trim()) {
      alert('请输入提示词');
      return;
    }

    setIsGenerating(true);

    try {
      // 调用 n8n webhook 生成场景图
      console.log('🚀 调用 n8n webhook...');
      const response = await n8nService.generateSceneImage(params) as any;
      console.log('✅ n8n webhook 响应:', response);
      console.log('📦 响应类型:', typeof response);
      console.log('📦 响应详情:', JSON.stringify(response, null, 2));

      // 检查响应数据结构 - 添加更多可能的路径
      const imageUrl = response?.imageUrl ||
                      response?.data?.imageUrl ||
                      response?.image?.url ||
                      response?.url ||
                      response?.output?.imageUrl ||
                      response?.output?.image?.url ||
                      response?.result?.imageUrl ||
                      response?.[0]?.imageUrl;

      console.log('🔍 提取的 imageUrl:', imageUrl);
      console.log('🔍 response.imageUrl:', response?.imageUrl);
      console.log('🔍 response.data?.imageUrl:', response?.data?.imageUrl);

      // 验证 URL 格式
      if (imageUrl && typeof imageUrl === 'string') {
        console.log('🔗 URL 类型检查:', imageUrl.startsWith('http') ? 'HTTP/HTTPS URL' : '非标准 URL');
        console.log('🔗 URL 长度:', imageUrl.length);

        // 检查是否是 base64 图片
        if (imageUrl.startsWith('data:image')) {
          console.log('🖼️  检测到 Base64 图片数据');
        }
        // 检查是否是内网地址
        else if (imageUrl.includes('127.0.0.1') || imageUrl.includes('localhost') || imageUrl.includes('192.168') || imageUrl.includes('10.')) {
          console.warn('⚠️  警告: 图片URL是内网地址，可能无法在浏览器中直接访问');
        }
      }

      if (!imageUrl) {
        console.error('❌ 响应中未找到 imageUrl，完整响应:', response);
        console.error('❌ 响应的所有键:', response ? Object.keys(response) : 'response is null/undefined');

        // 尝试从 n8n 标准响应格式中提取
        if (response?.data && typeof response.data === 'object') {
          console.error('❌ response.data 的键:', Object.keys(response.data));
        }

        throw new Error('工作流未返回图片URL，请检查 n8n 工作流的 "Respond to Webhook" 节点配置');
      }

      const finalResult: GenerationResult = {
        id: response.executionId || response.id || Date.now().toString(),
        imageUrl: imageUrl,
        prompt: params.prompt,
        aspectRatio: params.aspectRatio,
        timestamp: new Date(),
      };

      setCurrentResult(finalResult);
      addHistory(finalResult);
    } catch (error: any) {
      console.error('生成失败:', error);
      alert(error.message || '生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full h-screen bg-main-gradient flex flex-col overflow-hidden">
      {/* 装饰光晕 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-primary-600/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-primary-400/25 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-gradient-radial from-purple-500/20 to-transparent rounded-full blur-3xl" />
      </div>

      {/* 主内容 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex flex-col h-full"
      >
        {/* 头部 */}
        <Header />

        {/* 工作区 */}
        <div className="flex-1 px-5 pb-5 overflow-hidden">
          <div className="h-full flex gap-4">
            {/* 左侧面板 */}
            <div className="w-[440px] flex flex-col gap-2 overflow-y-auto pr-2">
              <UploadSection />
              <ConfigSection />
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="primary-button h-9 flex items-center justify-center gap-2 px-5 text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    开始生成场景图
                  </>
                )}
              </button>
            </div>

            {/* 右侧面板 */}
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
              <ResultSection />
              <HistorySection />
            </div>
          </div>
        </div>
      </motion.div>

      {/* 设置面板 */}
      {settingsOpen && <SettingsPanel />}
    </div>
  );
}

export default App;
