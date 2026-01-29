# AI 场景图生成器

一个基于 React + Vite + Tailwind CSS 的现代化 AI 图片生成工具，采用玻璃拟态设计风格。

## 功能特点

- ✨ 现代玻璃拟态 UI 设计
- 📤 拖拽式文件上传
- ⚙️ 灵活的参数配置
- 📊 实时生成状态显示
- 📜 历史记录管理
- 🔌 集成 n8n 工作流 API

## 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Tailwind CSS** - 样式系统
- **Zustand** - 状态管理
- **Framer Motion** - 动画库
- **React Dropzone** - 文件上传
- **Axios** - HTTP 客户端

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填写你的 n8n API 配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
VITE_N8N_API_URL=https://your-n8n-instance.com
VITE_N8N_API_KEY=your-api-key-here
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 4. 构建生产版本

```bash
npm run build
```

## 项目结构

```
ai-scene-generator/
├── src/
│   ├── components/       # React 组件
│   │   ├── Header.tsx
│   │   ├── UploadSection.tsx
│   │   ├── ConfigSection.tsx
│   │   ├── ResultSection.tsx
│   │   └── HistorySection.tsx
│   ├── hooks/           # 自定义 Hooks
│   │   └── useAppStore.ts
│   ├── services/        # API 服务
│   │   └── n8n.ts
│   ├── styles/          # 样式文件
│   │   └── index.css
│   ├── types/           # TypeScript 类型
│   │   └── index.ts
│   ├── App.tsx          # 主应用组件
│   └── main.tsx         # 入口文件
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## n8n 工作流集成

### Webhook 配置

1. 在你的 n8n 工作流中创建一个 Webhook 节点
2. 设置为 `POST` 方法
3. 复制 Webhook URL
4. 在本项目中配置环境变量

### API 调用流程

```
前端 → n8n Webhook
  ↓
飞书鉴权 → 获取数据 → 下载图片
  ↓
AI 生成 → 数据处理 → 上传素材
  ↓
返回结果 → 前端显示
```

## 自定义配置

### 修改配色

编辑 `tailwind.config.js` 中的颜色配置：

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // 自定义你的主色调
      },
    },
  },
}
```

### 调整样式

所有样式都在 `src/styles/index.css` 中，使用 Tailwind 的 `@layer` 功能组织。

## 开发建议

1. 使用 TypeScript 确保类型安全
2. 组件化开发，便于维护
3. 使用 Zustand 进行状态管理
4. 动画效果使用 Framer Motion

## 许可证

MIT
