import axios from 'axios';
import { GenerationParams } from '../types';
import { useAppStore } from '../hooks/useAppStore';

/**
 * 创建 API 客户端（动态获取配置）
 */
function createApiClient() {
  const settings = useAppStore.getState().settings;
  const apiUrl = settings.apiUrl || 'https://api.deerapi.com';
  const apiKey = settings.apiKey || import.meta.env.VITE_DEERAPI_KEY || '';

  return axios.create({
    baseURL: apiUrl,
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }),
    },
  });
}

/**
 * 将图片文件转换为 Base64
 */
async function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // 移除 data:image/xxx;base64, 前缀
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * DEERAPI Gemini 图片生成服务
 */
export const geminiService = {
  /**
   * 使用 Gemini 模型生成场景图
   */
  async generateSceneImage(params: GenerationParams): Promise<{
    imageUrl: string;
    executionId: string;
  }> {
    const api = createApiClient();
    const settings = useAppStore.getState().settings;
    const imageModel = settings.imageModel || 'gemini-3-pro-image-preview';

    try {
      // 转换图片为 Base64
      const [productImageBase64, sceneImageBase64] = await Promise.all([
        params.productImage ? imageToBase64(params.productImage.file) : Promise.resolve(''),
        params.sceneImage ? imageToBase64(params.sceneImage.file) : Promise.resolve(''),
      ]);

      // 构建请求体
      const requestData = {
        model: imageModel,
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `你是一个专业的商品场景图合成AI。请根据以下要求生成一张商品场景图：

用户需求：${params.prompt}

要求：
1. 将商品自然地融合到场景中
2. 保持商品的主体地位和清晰度
3. 光线和阴影要与场景协调
4. 图片比例：${params.aspectRatio}

请生成高质量的合成图片。`,
              },
              ...(productImageBase64 ? [
                {
                  inline_data: {
                    mime_type: params.productImage!.file.type,
                    data: productImageBase64,
                  },
                },
              ] : []),
              ...(sceneImageBase64 ? [
                {
                  inline_data: {
                    mime_type: params.sceneImage!.file.type,
                    data: sceneImageBase64,
                  },
                },
              ] : []),
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 0.95,
          maxOutputTokens: 4096,
        },
      };

      // 调用 DEERAPI
      console.log('📤 发送请求到 DEERAPI:', {
        url: `/v1/models/${imageModel}:generateContent`,
        model: imageModel,
        hasProductImage: !!productImageBase64,
        hasSceneImage: !!sceneImageBase64,
      });
      const response = await api.post(`/v1/models/${imageModel}:generateContent`, requestData);

      // 打印完整响应用于调试
      console.log('📥 收到 API 响应:', JSON.stringify(response.data, null, 2));

      // 提取生成的图片
      const candidates = response.data.candidates || [];
      console.log('📊 Candidates 数量:', candidates.length);

      if (candidates.length === 0) {
        throw new Error('未生成任何图片');
      }

      const content = candidates[0].content;
      console.log('📦 Content:', JSON.stringify(content, null, 2));

      const parts = content.parts || [];
      console.log('🔧 Parts 数量:', parts.length);
      console.log('🔧 Parts 详情:', JSON.stringify(parts, null, 2));

      // 检查每个 part 的类型
      parts.forEach((part: any, index: number) => {
        console.log(`📝 Part ${index} 的字段:`, Object.keys(part));
        if (part.text) {
          console.log(`📄 Part ${index} 文本内容:`, part.text.substring(0, 200));
        }
        if (part.inline_data) {
          console.log(`🖼️ Part ${index} 有 inline_data`);
        }
      });

      const imagePart = parts.find((part: any) => part.inline_data);
      console.log('🖼️ ImagePart:', imagePart ? '找到' : '未找到');

      if (!imagePart || !imagePart.inline_data) {
        console.error('❌ 没有找到图片数据，parts 结构:', parts);

        // 如果返回了文本，可能是模型不支持图片生成
        const textParts = parts.filter((p: any) => p.text);
        if (textParts.length > 0) {
          console.warn('⚠️ 模型返回了文本而不是图片，可能当前模型不支持图片生成功能');
          console.warn('⚠️ 请尝试使用其他生图模型，如 gemini-2.0-flash-exp-image-generation');
        }

        throw new Error('生成的结果中没有图片，请尝试使用其他生图模型');
      }

      // 返回图片 Base64 数据
      const imageData = imagePart.inline_data.data;
      const imageUrl = `data:image/png;base64,${imageData}`;
      console.log('✅ 图片生成成功，长度:', imageData.length);

      return {
        imageUrl,
        executionId: Date.now().toString(),
      };
    } catch (error: any) {
      console.error('❌ Gemini 生成失败:', error);
      console.error('❌ 错误详情:', error.response?.data);

      // 提取错误信息
      const errorMessage = error.response?.data?.error?.message ||
                          error.response?.data?.message ||
                          error.message ||
                          '生成图片失败，请重试';

      throw new Error(errorMessage);
    }
  },

  /**
   * 测试 API 连接
   */
  async testConnection(): Promise<boolean> {
    try {
      const api = createApiClient();
      await api.get('/v1/models');
      return true;
    } catch (error) {
      console.error('DEERAPI 连接测试失败:', error);
      return false;
    }
  },

  /**
   * 获取可用模型列表
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const api = createApiClient();
      const response = await api.get('/v1/models');
      const models = response.data.models || [];
      return models.map((model: any) => model.name);
    } catch (error) {
      console.error('获取模型列表失败:', error);
      return [];
    }
  },
};
