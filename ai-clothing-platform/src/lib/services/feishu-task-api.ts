/**
 * FeishuTaskAPI - 飞书任务 API 服务
 */

export interface FeishuTaskData {
  productToken: string;
  sceneToken?: string;
  prompt: string;
  negativePrompt?: string;
  ratio: string;
  model: string;
}

export class FeishuTaskAPI {
  /**
   * 上传单个文件
   */
  static async uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok || data.code !== 0) {
      throw new Error(data.msg || '上传失败');
    }

    return data.data.file_token;
  }

  /**
   * 创建任务
   */
  static async createTask(taskData: FeishuTaskData): Promise<string> {
    const response = await fetch('/api/create-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_token: taskData.productToken,
        scene_token: taskData.sceneToken,
        prompt: taskData.prompt,
        negative_prompt: taskData.negativePrompt,
        ratio: taskData.ratio,
        model: taskData.model,
      }),
    });

    const data = await response.json();
    if (!response.ok || data.code !== 0) {
      throw new Error(data.msg || '创建任务失败');
    }

    return data.data.record_id;
  }

  /**
   * 查询任务状态
   */
  static async checkTaskStatus(
    recordId: string
  ): Promise<{ status: string; resultUrl: string | null }> {
    const response = await fetch(`/api/check-status?record_id=${recordId}`);
    const data = await response.json();

    if (!response.ok || data.code !== 0) {
      throw new Error(data.msg || '查询状态失败');
    }

    return {
      status: data.data.status,
      resultUrl: data.data.result_url,
    };
  }

  /**
   * 执行完整流程：上传 -> 创建任务
   */
  static async executeUploadAndCreate(
    productImage: File,
    sceneImage: File | null,
    prompt: string,
    negativePrompt: string,
    ratio: string,
    model: string
  ): Promise<{ productToken: string; sceneToken?: string; recordId: string }> {
    // 并行上传图片
    const [productToken, sceneToken] = await Promise.all([
      this.uploadFile(productImage),
      sceneImage ? this.uploadFile(sceneImage) : Promise.resolve(undefined),
    ]);

    // 创建任务
    const recordId = await this.createTask({
      productToken,
      sceneToken,
      prompt,
      negativePrompt,
      ratio,
      model,
    });

    return { productToken, sceneToken, recordId };
  }
}
