/**
 * 登录页面背景图片类型定义
 */

export interface BackgroundImage {
  id: string;
  name: string;
  description: string;
  url: string;
  thumbnail: string;
  category:
    | 'tech-ai'
    | 'neural-network'
    | 'data-flow'
    | 'future-commerce'
    | 'algorithm'
    | 'ecommerce';
}
