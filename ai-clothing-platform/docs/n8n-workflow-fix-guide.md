# 🔧 N8N工作流故障诊断与修复指南

## 📊 问题诊断

### 当前状态

根据前端日志和N8N执行记录分析：

- ✅ 前端任务创建成功
- ✅ N8N Webhook触发成功
- ❌ N8N工作流在"判断尺寸比例"节点停止

### 根本原因

原工作流使用**4个并行IF节点**判断尺寸比例，存在以下问题：

1. IF节点要求**精确匹配**（"3:4" ≠ "3：4" ≠ "3:4 "）
2. 所有IF节点**同时失败**时，工作流停止
3. 没有**默认分支**处理不匹配的情况

---

## 🛠️ 解决方案

### 步骤1：导入v2工作流

1. 打开N8N工作流编辑器
2. 点击右上角"..."菜单 → "Import from File"
3. 选择 `docs/n8n-workflow-frontend-v2.json`
4. 确认导入成功

### 步骤2：配置DeerAPI凭证

**v2工作流需要DeerAPI凭证才能调用AI生成服务**

1. 在N8N中，点击"Credentials" → "Add Credential"
2. 选择"Header Auth"
3. 配置如下：
   - **Name**: `DeerAPI account`
   - **Name** (Header): `Authorization`
   - **Value**: `Bearer YOUR_DEERAPI_KEY`

4. 保存凭证
5. 在"AI图片生成"节点中，选择"DeerAPI account"凭证

### 步骤3：配置工作流路径

1. 确认Webhook路径为：`ai-clothing-generation`
2. 确认Webhook URL为：`https://n8n.denggui.top/webhook/ai-clothing-generation`
3. 激活工作流（Status: ACTIVE）

### 步骤4：验证环境变量

确认 `.env.local` 包含：

```bash
N8N_WEBHOOK_URL="https://n8n.denggui.top/webhook/ai-clothing-generation"
N8N_API_KEY="n8n-webhook-secret-key-2024"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**重要**：`N8N_API_KEY` 是必需的，用于：

- 初始化N8N服务
- 验证回调请求安全性

### 步骤5：重启开发服务器

```bash
# 停止当前服务器（Ctrl+C）
# 重新启动以加载新的环境变量
npm run dev
```

---

## 🔍 v2工作流改进

### Switch节点架构

**原设计（v1）**：

```
Webhook → 4个并行IF节点 → 尺寸设置节点
          (全失败时停止)
```

**新设计（v2）**：

```
Webhook → 标准化参数 → Switch节点 → 5个尺寸设置节点
                       (有默认分支)
```

### 关键改进

1. **标准化尺寸参数节点**

   ```javascript
   aspectRatioClean = aspectRatio.trim().replace(/：/g, ':').replace(/，/g, ',');
   ```

   - 自动去除空格
   - 统一中英文冒号

2. **Switch节点替代IF节点**
   - 单一节点，5个输出
   - 输出0-3: 匹配特定比例
   - 输出4: 默认分支（3:4尺寸）

3. **默认尺寸分支**
   - 当比例不匹配时，使用3:4
   - 确保工作流永不停止

---

## 🧪 测试步骤

### 测试1：无场景图（默认3:4）

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "productImageUrl": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800",
    "prompt": "时尚模特在繁华街头",
    "aiModel": "Gemini-3-Pro-Image",
    "aspectRatio": "3:4",
    "imageCount": 1
  }'
```

**预期结果**：

- ✅ 任务创建成功
- ✅ N8N工作流执行成功
- ✅ Switch节点→"3:4尺寸"→AI生成→回调
- ✅ 前端显示生成结果

### 测试2：1:1比例

修改请求中的 `aspectRatio: "1:1"`

**预期结果**：

- ✅ Switch节点→"1:1尺寸"
- ✅ 生成1024x1024图片

### 测试3：空比例（测试默认分支）

删除请求中的 `aspectRatio` 字段

**预期结果**：

- ✅ Switch节点→"默认尺寸(3:4)"
- ✅ 生成768x1024图片

---

## ⚠️ 常见错误

### 错误0: "n8n configuration not found"

**原因**：`N8N_API_KEY` 环境变量未设置或为空

**日志输出**：

```
[API] ⚠️  N8N 工作流触发失败: Error: n8n configuration not found
```

**解决**：

1. 在 `.env.local` 中设置 `N8N_API_KEY`（任意随机字符串）
2. 重启开发服务器加载新环境变量

### 错误1: "Credentials not found"

**原因**：DeerAPI凭证未配置

**解决**：

1. 检查凭证名称是否为 `DeerAPI account`
2. 确认"AI图片生成"节点已选择凭证

### 错误2: "Field not found"

**原因**：Switch节点配置错误

**解决**：

1. 检查Switch节点规则配置
2. 确认所有条件都引用 `$json.aspectRatioClean`

### 错误3: 回调失败 (Unauthorized)

**原因**：

- N8N回调未包含正确的API Key
- `.env.local` 中的 `N8N_API_KEY` 与N8N工作流发送的不匹配

**日志输出**：

```
[Webhook] Invalid API key
```

**解决**：

1. 确认 `.env.local` 中设置了 `N8N_API_KEY`
2. 确认v2工作流的"回调后端API"节点包含 `x-n8n-api-key` 头部
3. 重启开发服务器

### 错误4: Network请求显示红色

**浏览器Network面板中的红色错误**：

**可能原因**：

1. 401 Unauthorized - API Key验证失败
2. 500 Internal Server Error - 后端服务错误
3. 502 Bad Gateway - N8N服务不可达

**诊断步骤**：

1. 点击红色请求查看详细信息
2. 查看"Response"标签页获取错误消息
3. 查看"Headers"标签页确认请求头正确

**解决**：

- 401: 检查N8N_API_KEY配置
- 500: 查看后端终端日志
- 502: 检查N8N服务是否在线

### 错误5: Console面板中的红色文字

**浏览器Console面板中的错误**：

**常见错误**：

```
Error: Failed to fetch
TypeError: Network request failed
```

**原因**：

- CORS跨域问题
- 后端服务未启动
- 网络连接问题

**解决**：

1. 确认后端服务运行在 http://localhost:3000
2. 检查浏览器控制台的完整错误堆栈
3. 查看后端终端日志

---

## 📋 验证清单

- [ ] v2工作流已导入
- [ ] DeerAPI凭证已配置
- [ ] Webhook路径正确
- [ ] 工作流状态为ACTIVE
- [ ] 环境变量已配置
- [ ] 后端服务运行中
- [ ] 测试无场景图成功
- [ ] 测试1:1比例成功
- [ ] 测试默认分支成功

---

## 📞 调试日志位置

### 前端日志

```
终端输出: npm run dev
```

### N8N日志

```
N8N界面 → Executions → 选择执行记录
```

### 关键日志点

- `[API] 收到任务创建请求`
- `[API] N8N 工作流触发成功`
- `[Webhook] Received n8n callback`

---

## 🎯 成功标志

### N8N执行记录

- ✅ 所有节点绿色
- ✅ 执行路径连续
- ✅ "返回成功响应"节点执行

### 前端界面

- ✅ 任务状态：pending → processing → completed
- ✅ 显示生成图片
- ✅ 无红色错误信息

### 数据库

- ✅ 任务记录状态为"completed"
- ✅ resultImageUrls字段有值
