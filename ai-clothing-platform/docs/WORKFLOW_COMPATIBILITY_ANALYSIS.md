# 🎯 双向兼容工作流设计文档

## 问题分析

### 当前工作流的问题

✅ **支持**: 前端 → N8N → 后端 → 飞书
❌ **不支持**: 飞书 → N8N → 飞书

### 数据格式差异

#### 前端调用格式

```json
{
  "taskId": "uuid",
  "productImageUrl": "http://backend/uploads/abc.jpg",
  "prompt": "提示词",
  "aiModel": "flux-realism",
  "aspectRatio": "16:9",
  "imageCount": 4,
  "callbackUrl": "http://backend/api/webhooks/n8n/callback"
}
```

#### 飞书调用格式

```json
{
  "record_id": "rec12345",
  "fields": {
    "商品图片": ["img_token_abc"],
    "提示词": "提示词",
    "AI模型": "flux-realism",
    "图片比例": "16:9",
    "生成数量": 4
  },
  "source": "feishu"
}
```

---

## ✅ 解决方案已实现

我已经创建了一个**统一双源工作流**，完美支持两种数据来源！

### 核心文件

📄 **[n8n-workflow-dual-source.json](./n8n-workflow-dual-source.json)** - 完整的N8N工作流JSON
📖 **[N8N_DUAL_SOURCE_GUIDE.md](./N8N_DUAL_SOURCE_GUIDE.md)** - 详细配置指南

---

## 🚀 实现方案：统一工作流

### 架构设计

```
                    ┌─────────────────────┐
                    │   统一Webhook入口    │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │    识别数据源        │
                    │ source判断          │
                    └────┬───────────┬────┘
                         │           │
                  ┌──────▼─────┐  ┌─▼──────────┐
                  │前端路径     │  │飞书路径     │
                  │(frontend)  │  │(feishu)    │
                  └──────┬─────┘  └─┬──────────┘
                         │           │
              ┌──────────▼─────┐     │
              │ 解析前端参数    │     │ 解析飞书参数
              │ 扁平JSON结构   │     │ 嵌套fields
              └──────────┬─────┘     └──────┬─────┘
                         │                  │
              ┌──────────▼─────┐             │
              │ 4个比例IF节点   │             │
              │ 1:1/3:4/16:9/9:16│           │
              └──────────┬─────┘             │
                         │                  │
              ┌──────────▼─────┐             │
              │ 4个尺寸设置节点 │             │
              └──────────┬─────┘             │
                         │                  │
                         │    ┌─────────────▼──────────┐
                         │    │ 下载飞书图片             │
                         │    │ 从file_token下载        │
                         │    └─────────────┬──────────┘
                         │                  │
                         │    ┌─────────────▼──────────────┐
                         │    │ ⚠️二进制数据处理（关键节点）│
                         │    │ helpers.getBinaryDataBuffer│
                         │    └─────────────┬──────────────┘
                         │                  │
                         │    ┌─────────────▼──────────┐
                         │    │ 设置图片URL             │
                         │    └─────────────┬──────────┘
                         │                  │
                         └─────┬────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   AI图片生成 (合并)   │
                    │   DeerAPI调用        │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   格式化结果         │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  判断结果返回路径    │
                    └────┬───────────┬────┘
                         │           │
                  ┌──────▼─────┐  ┌─▼──────────┐
                  │前端路径     │  │飞书路径     │
                  │回调后端API  │  │更新飞书记录 │
                  └──────┬─────┘  └─┬──────────┘
                         │           │
                         └─────┬─────┘
                               │
                    ┌──────────▼──────────┐
                    │   返回成功响应       │
                    └─────────────────────┘
```

---

## 📝 关键改进点

### 1. 数据源识别节点

```javascript
{
  "dataSource": "{{ $json.source ? 'feishu' : 'frontend' }}",
  "taskId": "{{ $json.taskId || $json.record_id }}"
}
```

**作用**:

- 自动识别请求来源
- 统一ID字段格式

### 2. 双路径参数解析

#### 前端路径（节点4A）

```javascript
{
  "taskId": "{{ $json.rawData.taskId }}",
  "productImageUrl": "{{ $json.rawData.productImageUrl }}",
  "prompt": "{{ $json.rawData.prompt }}",
  // ... 扁平结构
}
```

#### 飞书路径（节点4B）

```javascript
{
  "recordId": "{{ $json.rawData.record_id }}",
  "prompt": "{{ $json.rawData.fields['提示词'] }}",
  "productImageToken": "{{ $json.rawData.fields['商品图片'][0] }}",
  // ... 嵌套结构
}
```

### 3. ⚠️ 二进制数据处理节点（关键！）

这是**最关键的节点**，必须保留！

**位置**: 节点6
**类型**: Code (JavaScript)
**代码**:

```javascript
// 获取所有输入数据
const items = $input.all();

// 循环处理每一条数据
for (let i = 0; i < items.length; i++) {
  const item = items[i];

  if (item.binary && item.binary.data) {
    // ⚠️【关键】使用 helper 方法强制从硬盘读取文件的二进制流
    // 这样无论它是内存还是硬盘模式，都能读到真正的文件
    const buffer = await this.helpers.getBinaryDataBuffer(i, 'data');

    // 现在算出来的 length 才是真实的字节数（比如 1354024）
    item.json.real_size = buffer.length;

    // 设置好文件名
    item.json.file_name = 'final_product.png';
  }
}

return items;
```

**为什么这个节点必不可少？**

1. ✅ **强制从磁盘读取**: 使用 `helpers.getBinaryDataBuffer()` 确保读取真实文件
2. ✅ **计算真实大小**: 获取准确的字节数，不是预估值
3. ✅ **设置文件名**: 为上传到飞书准备正确的文件名
4. ✅ **避免内存问题**: 处理大文件时避免内存溢出

⚠️ **如果删除这个节点，飞书上传会失败！**

### 4. 双路径结果处理

#### 前端路径（节点19A）

```javascript
POST $json.callbackUrl
{
  "taskId": "xxx",
  "status": "completed",
  "resultImageUrls": [...],
  "progress": 100
}
```

#### 飞书路径（节点19B-20）

```javascript
// 格式化为飞书字段格式
{
  "生成结果": [...],  // 飞书字段名
  "状态": "已完成"     // 飞书字段名
}

// 更新飞书记录
PUT https://open.feishu.cn/.../records/{{recordId}}
```

---

## 🎯 已实现的功能

### ✅ 前端触发路径

```
前端UI → 后端API → N8N工作流
                    ↓
            识别为 frontend
                    ↓
            解析扁平JSON参数
                    ↓
            根据aspectRatio设置尺寸
                    ↓
            调用DeerAPI生成图片
                    ↓
            回调后端API
                    ↓
            更新任务状态
                    ↓
            同步到飞书多维表格
```

### ✅ 飞书触发路径

```
飞书多维表格 → N8N工作流
                    ↓
            识别为 feishu
                    ↓
            解析嵌套fields参数
                    ↓
            从file_token下载图片
                    ↓
            ⚠️ 二进制数据处理（关键）
                    ↓
            转换为可用URL
                    ↓
            根据aspectRatio设置尺寸
                    ↓
            调用DeerAPI生成图片
                    ↓
            格式化为飞书字段格式
                    ↓
            直接更新飞书记录
```

---

## 📋 使用指南

### 第1步: 导入工作流

```bash
1. 打开N8N
2. 点击 "+" → "Import from File"
3. 选择 docs/n8n-workflow-dual-source.json
4. 点击 "Import"
```

### 第2步: 配置认证

#### DeerAPI认证

```bash
节点: "AI图片生成"
认证类型: Header Auth
Header Name: Authorization
Header Value: Bearer YOUR_DEERAPI_KEY
```

#### 飞书API认证

```bash
节点: "下载飞书图片"、"更新飞书记录"
认证类型: Header Auth
Header Name: Authorization
Header Value: Bearer YOUR_FEISHU_TOKEN
```

### 第3步: 设置环境变量

```bash
# 在N8N的 .env 文件中添加:
FEISHU_BITABLE_APP_TOKEN=app_xxxxxxxxx
FEISHU_BITABLE_TABLE_ID=tblxxxxxxxxxx
FEISHU_APP_ACCESS_TOKEN=your_app_access_token
```

### 第4步: 测试

#### 测试前端路径

```bash
curl -X POST https://your-n8n.com/webhook/ai-clothing-generation \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "test-001",
    "userId": "user-123",
    "productImageUrl": "https://example.com/product.jpg",
    "prompt": "时尚模特",
    "aiModel": "flux-realism",
    "aspectRatio": "16:9",
    "imageCount": 4,
    "callbackUrl": "https://your-backend.com/api/webhooks/n8n/callback"
  }'
```

#### 测试飞书路径

```bash
curl -X POST https://your-n8n.com/webhook/ai-clothing-generation \
  -H "Content-Type: application/json" \
  -d '{
    "record_id": "rec12345",
    "fields": {
      "商品图片": ["img_token_abc"],
      "提示词": "时尚模特",
      "AI模型": "flux-realism",
      "图片比例": "16:9",
      "生成数量": 4
    },
    "source": "feishu"
  }'
```

---

## ⚠️ 重要注意事项

### 1. 飞书API限流

飞书API有请求频率限制，建议：

- ✅ 实现请求队列
- ✅ 添加重试机制
- ✅ 使用缓存减少重复请求

### 2. 图片处理成本

- ✅ 飞书云空间有容量限制
- ✅ 上传和下载都需要时间
- ✅ 建议定期清理过期图片

### 3. 数据一致性

⚠️ 避免以下情况：

- ❌ 前端和飞书同时修改同一任务
- ❌ 结果数据格式不一致
- ❌ 回调时机混乱

**建议**:

- ✅ 使用taskId/recordId作为唯一标识
- ✅ 添加状态锁机制
- ✅ 实现幂等性操作

---

## 📊 对比分析

### 方案A: 统一工作流（已实现✅）

**优点**:

- ✅ 一个工作流维护
- ✅ 易于版本管理
- ✅ 共享AI生成节点
- ✅ 统一错误处理

**缺点**:

- ❌ 逻辑相对复杂
- ❌ 调试需要区分路径

### 方案B: 分离工作流（未实现）

**优点**:

- ✅ 职责清晰
- ✅ 易于独立调试

**缺点**:

- ❌ 需要维护两套工作流
- ❌ 代码重复
- ❌ 版本同步困难

---

## 🎉 总结

### ✅ 已完成

1. **创建统一双源工作流** - [n8n-workflow-dual-source.json](./n8n-workflow-dual-source.json)
2. **保留关键二进制处理节点** - 确保飞书上传成功
3. **完整文档** - [N8N_DUAL_SOURCE_GUIDE.md](./N8N_DUAL_SOURCE_GUIDE.md)
4. **支持全比例** - 1:1、3:4、16:9、9:16
5. **动态参数** - 所有参数从前端/飞书动态传入

### 🎯 现在你可以：

1. **在前端操作**
   - 用户在UI选择参数
   - 后端调用N8N工作流
   - 结果回调后端
   - 自动同步到飞书表格

2. **在飞书表格操作**
   - 用户直接在表格填写字段
   - 飞书机器人触发N8N工作流
   - 结果直接写回飞书表格
   - 无需经过后端

**两种路径完全打通！** 🎉

---

## 📖 相关文档

- [N8N_DUAL_SOURCE_GUIDE.md](./N8N_DUAL_SOURCE_GUIDE.md) - 详细配置指南
- [N8N_NODE_CONFIG.md](./N8N_NODE_CONFIG.md) - 节点配置详解
- [n8n-workflow-dual-source.json](./n8n-workflow-dual-source.json) - 工作流JSON文件
- [N8N_QUICK_START.md](./N8N_QUICK_START.md) - 快速开始指南
- [N8N_SETUP_GUIDE.md](./N8N_SETUP_GUIDE.md) - 完整教程
