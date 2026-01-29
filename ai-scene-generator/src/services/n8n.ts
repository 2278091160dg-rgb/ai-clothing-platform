import axios from 'axios';
import { GenerationParams } from '../types';

/**
 * 获取 n8n Webhook URL（通过独立代理服务器）
 */
function getWebhookUrl() {
  // 使用独立的 Express 代理服务器，已解决 CORS 问题
  return import.meta.env.VITE_N8N_PROXY_URL + import.meta.env.VITE_N8N_WEBHOOK_PATH;
}

export const n8nService = {
  /**
   * 触发场景图生成 - 通过代理调用 n8n Webhook
   */
  async generateSceneImage(params: GenerationParams): Promise<{ executionId?: string; imageUrl: string }> {
    const webhookUrl = getWebhookUrl();
    const formData = new FormData();

    if (params.productImage) {
      formData.append('productImage', params.productImage.file);
    }
    if (params.sceneImage) {
      formData.append('sceneImage', params.sceneImage.file);
    }
    formData.append('prompt', params.prompt);
    formData.append('aspectRatio', params.aspectRatio);

    try {
      console.log('📤 发送到 n8n webhook (通过代理服务器):', webhookUrl, {
        productImage: !!params.productImage,
        sceneImage: !!params.sceneImage,
        prompt: params.prompt,
        aspectRatio: params.aspectRatio,
      });

      const response = await axios.post(webhookUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // 设置 10 分钟超时以匹配代理服务器配置
        timeout: 10 * 60 * 1000,
      });

      console.log('✅ n8n webhook 响应状态:', response.status);
      console.log('✅ n8n webhook 响应数据:', response.data);
      console.log('📦 响应详情 (JSON):', JSON.stringify(response.data, null, 2));

      // 检查是否是异步响应（工作流已启动但没有返回结果）
      if (response.data?.message === 'Workflow was started' && !response.data?.imageUrl) {
        throw new Error('n8n 工作流配置为异步模式，请在工作流末尾添加"Respond to Webhook"节点以返回结果');
      }

      // 验证响应数据中是否包含图片信息
      const hasImage = response.data?.imageUrl ||
                       response.data?.data?.imageUrl ||
                       response.data?.image?.url ||
                       response.data?.url;

      if (!hasImage) {
        console.warn('⚠️  响应中未找到预期的图片URL字段，请检查 n8n 工作流返回格式');
        console.warn('⚠️  响应的键:', Object.keys(response.data));
      }

      return response.data;
    } catch (error: any) {
      console.error('❌ n8n 调用失败:', error);
      console.error('❌ 错误类型:', error.code);
      console.error('❌ 错误详情:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      // 特定处理超时错误
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error('n8n 工作流执行超时（超过10分钟），请检查 n8n 服务器状态或优化工作流');
      }

      // 处理代理服务器返回的超时错误
      if (error.response?.status === 504) {
        throw new Error(error.response.data?.message || 'n8n 工作流执行超时，请稍后重试');
      }

      // 提取错误信息
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.response?.data?.details ||
                          error.message ||
                          'n8n 工作流调用失败';

      throw new Error(errorMessage);
    }
  },

  /**
   * 检查执行状态（暂时不用，webhook 直接返回结果）
   */
  async checkExecutionStatus(executionId: string) {
    // Webhook 模式下，执行状态检查不适用
    // 可以在 n8n 工作流中直接返回结果
    return { finished: true, data: null };
  },
};
