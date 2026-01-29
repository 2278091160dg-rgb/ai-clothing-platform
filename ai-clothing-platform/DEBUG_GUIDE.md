# 错误诊断和调试指南

## 📋 当前错误分析

### 前端错误（浏览器控制台）

```
✅ 图片上传成功（降级到本地上传）
   - 商品图片上传成功：/uploads/temp/1769489383989-l7znrxuugm.png
   - 场景图片上传成功

❌ CORS 错误（已自动降级）
   - Access to fetch at 'https://api.deerapi.com/upload/'
   - 被 CORS 策略阻止
   - 系统自动回退到本地上传 ✅

❌ 500 内部服务器错误（主要问题）
   - POST http://localhost:3000/api/tasks
   - 状态码：500
   - 响应不是 JSON，而是 HTML（<!DOCTYPE...）
```

### 问题根因

**后端 API 调用失败**，可能原因：

1. 数据库未初始化或连接失败
2. 环境变量配置不完整
3. 依赖服务（N8N、飞书）未配置
4. 代码运行时错误

---

## 🔍 如何查看后端日志

### 方法 1：查看终端窗口（最直接）

运行开发服务器的地方会输出所有日志：

```bash
cd ai-clothing-platform
npm run dev
```

**在同一个终端窗口中**，你会看到：

```
✓ Ready in 3.2s
○ Compiling / ...
○ Generating static pages (5/5)
[DEV MODE] Skipping authentication, using userId: dev-user-123
[API] Failed to create task: Error: ...
```

### 方法 2：实时监控日志

如果日志太多，可以筛选：

```bash
# 只看错误日志
npm run dev 2>&1 | grep -i error

# 只看 API 相关日志
npm run dev 2>&1 | grep -i api

# 保存日志到文件
npm run dev 2>&1 | tee server.log
```

### 方法 3：使用调试工具

在代码中添加 `console.log` 或 `debugger`：

```typescript
// src/app/api/tasks/route.ts
export async function POST(req: NextRequest) {
  try {
    console.log('=== 收到任务创建请求 ===');
    console.log('请求体:', await req.clone().json());

    // ... 你的代码
  } catch (error) {
    console.error('=== 任务创建失败 ===');
    console.error('错误详情:', error);
    console.error('错误堆栈:', error.stack);
  }
}
```

---

## 🛠️ 问题排查步骤

### 步骤 1：检查环境变量

查看 `.env` 文件是否配置完整：

```bash
cat .env
```

**必需的配置：**

```bash
# 数据库（如果使用 Prisma）
DATABASE_URL="postgresql://postgres:password@localhost:5432/ai_clothing_platform"

# NextAuth（暂时可以不配置，开发模式会跳过）
NEXTAUTH_SECRET="any-secret-string-for-dev"

# 应用配置
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 步骤 2：检查数据库连接

如果使用 PostgreSQL：

```bash
# 检查数据库是否运行
brew services list | grep postgresql
# 或
docker ps | grep postgres

# 测试连接
psql postgres://postgres:password@localhost:5432/ai_clothing_platform
```

### 步骤 3：查看详细错误日志

在终端中，找到具体的错误信息：

```bash
# 常见的错误信息模式：
- "database is closed" → 数据库未连接
- "getTaskRepository is not a function" → 导入错误
- "Cannot read property 'create' of undefined" → 仓储未初始化
- "ECONNREFUSED" → 数据库或外部服务连接失败
```

### 步骤 4：添加调试日志

在 `src/app/api/tasks/route.ts` 中添加详细日志：

```typescript
export async function POST(req: NextRequest) {
  try {
    console.log('=== [DEBUG] API 入口 ===');
    console.log('1. 环境变量检查:');
    console.log('   - NODE_ENV:', process.env.NODE_ENV);
    console.log('   - DATABASE_URL:', process.env.DATABASE_URL ? '已配置' : '未配置');

    // ... 认证逻辑

    console.log('2. 解析请求体...');
    const body = await req.json();
    console.log('   请求体:', body);

    // ... 验证逻辑

    console.log('3. 创建任务...');
    const taskRepo = getTaskRepository();
    console.log('   TaskRepository 获取成功');

    const task = await taskRepo.create({
      userId,
      productImageUrl,
      sceneImageUrl,
      prompt,
      aiModel,
      aspectRatio,
      imageCount,
      quality,
      batchId,
    });
    console.log('   任务创建成功:', task);

    // ... 后续逻辑
  } catch (error) {
    console.error('=== [DEBUG] 错误详情 ===');
    console.error('错误类型:', error.constructor.name);
    console.error('错误消息:', error.message);
    console.error('错误堆栈:', error.stack);

    // 返回更详细的错误信息
    return NextResponse.json(
      {
        error: error.message,
        type: error.constructor.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
```

---

## 🚨 快速修复常见问题

### 问题 1：数据库未启动

**错误信息：**

```
ECONNREFUSED: connect ECONNREFUSED 127.0.0.1:5432
```

**解决方案：**

```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Docker
docker start postgres-container
```

### 问题 2：Prisma 未生成客户端

**错误信息：**

```
TypeError: Cannot read property 'task' of undefined
```

**解决方案：**

```bash
npx prisma generate
npx prisma db push
```

### 问题 3：环境变量未生效

**错误信息：**

```
DATABASE_URL is not defined
```

**解决方案：**

```bash
# 重启开发服务器
# 先停止（Ctrl+C）
# 再启动
npm run dev
```

### 问题 4：导入路径错误

**错误信息：**

```
Module not found: Can't resolve '@/lib/repositories/task.repository'
```

**解决方案：**

```bash
# 检查文件是否存在
ls -la src/lib/repositories/task.repository.ts

# 检查 tsconfig.json 路径配置
cat tsconfig.json | grep baseUrl
cat tsconfig.json | grep paths
```

---

## 📊 实时调试技巧

### 使用 VS Code 调试器

1. 在 VS Code 中打开项目
2. 按 `Cmd+Shift+P` (Mac) 或 `Ctrl+Shift+P` (Windows/Linux)
3. 输入 "Debug: Toggle JavaScript Debugging"
4. 在代码中添加 `debugger;` 断点
5. 点击"开始生成"按钮
6. VS Code 会在断点处暂停

### 使用 Chrome DevTools

1. 打开 http://localhost:3000
2. 按 `F12` 打开 DevTools
3. 切换到 "Network" 标签
4. 点击"开始生成"
5. 查看 `/api/tasks` 请求
6. 点击请求 → 查看 "Response" 和 "Headers"

---

## 💡 下一步行动

**请执行以下操作并告诉我结果：**

1. **查看终端日志**

   ```bash
   cd ai-clothing-platform
   npm run dev
   ```

   然后点击"开始生成"，把终端中的**完整错误信息**发给我

2. **检查环境变量**

   ```bash
   cat .env
   ```

   确认哪些配置已填写

3. **检查数据库状态**
   ```bash
   # 检查 PostgreSQL 是否运行
   brew services list | grep postgres
   # 或
   docker ps | grep postgres
   ```

把这些信息发给我，我会帮你快速定位并解决问题！
