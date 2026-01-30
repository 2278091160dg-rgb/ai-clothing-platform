# 🚀 N8N双轨工作流快速导入指南

## 📦 文件清单

| 文件名                        | 说明             | 状态      | 推荐使用 |
| ----------------------------- | ---------------- | --------- | -------- |
| `n8n-workflow-frontend.json`  | 前端触发工作流   | ✅ 已验证 | ✅ 是    |
| `n8n-workflow-feishu.json`    | 飞书触发工作流v1 | ⚠️ 有问题 | ❌ 否    |
| `n8n-workflow-feishu-v2.json` | 飞书触发工作流v2 | ✅ 已修复 | ✅ 是    |

---

## ⚡ 5分钟快速导入

### 步骤1：导入前端工作流（2分钟）

1. 打开N8N界面
2. 点击右上角 **"+"** 按钮
3. 选择 **"Import from File"**
4. 选择文件：`n8n-workflow-frontend.json`
5. 点击 **"Import"**
6. 检查凭证：DeerAPI account
7. 激活工作流

### 步骤2：导入飞书工作流v2（3分钟）

1. 点击右上角 **"+"** 按钮
2. 选择 **"Import from File"**
3. 选择文件：`n8n-workflow-feishu-v2.json` ⚠️ 注意：选择v2版本
4. 点击 **"Import"**
5. 替换以下3处的App Token和Table ID：
   - 节点：读取飞书记录
   - 节点：更新状态为处理中
   - 节点：更新飞书记录
6. 检查凭证：
   - DeerAPI account
   - Feishu Credentials account
7. 激活工作流

### 步骤3：配置飞书自动化（2分钟）

1. 打开飞书多维表格
2. 点击右上角 **"自动化"**
3. 点击 **"新建自动化"**
4. 配置触发器：
   - 条件：按钮被点击
   - 字段：点击按钮
5. 配置操作：
   - 类型：发送Webhook请求
   - URL：从N8N的Webhook触发器节点复制
   - 方法：POST
   - Body：
     ```json
     {
       "record_id": 触发记录ID
     }
     ```
6. 保存并启用自动化

---

## 🔧 需要配置的地方

### 前端工作流配置

**凭证配置**（1个）:

```
DeerAPI account
  - Header Name: Authorization
  - Header Value: Bearer YOUR_DEERAPI_KEY
```

**Webhook URL**:

```
生产环境: https://your-n8n-instance.com/webhook/ai-clothing-generation
测试环境: https://your-n8n-test-instance.com/webhook/ai-clothing-generation
```

### 飞书工作流v2配置

**凭证配置**（2个）:

```
1. DeerAPI account
   - Header Name: Authorization
   - Header Value: Bearer YOUR_DEERAPI_KEY

2. Feishu Credentials account
   - App ID: 你的飞书App ID
   - App Secret: 你的飞书App Secret
```

**节点配置**（3个节点需要修改App Token和Table ID）:

```
节点1: 读取飞书记录
  App Token: app_你的AppToken
  Table ID: tbl_你的TableID

节点2: 更新状态为处理中
  App Token: app_你的AppToken
  Table ID: tbl_你的TableID

节点3: 更新飞书记录
  App Token: app_你的AppToken
  Table ID: tbl_你的TableID
```

**Webhook URL**:

```
生产环境: https://your-n8n-instance.com/webhook/feishu-trigger
测试环境: https://your-n8n-test-instance.com/webhook/feishu-trigger
```

---

## 🧪 快速测试

### 测试1：前端路径

```bash
curl -X POST https://your-n8n-instance.com/webhook/ai-clothing-generation \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "test-001",
    "userId": "test-user",
    "productImageUrl": "https://example.com/product.jpg",
    "prompt": "时尚模特在繁华街头",
    "aiModel": "Gemini-3-Pro-Image",
    "aspectRatio": "3:4",
    "imageCount": 4,
    "callbackUrl": "https://your-backend.com/api/webhooks/n8n/callback"
  }'
```

**预期结果**:

- ✅ 返回：`{"success": true, "taskId": "test-001", "message": "图片生成成功"}`
- ✅ N8N日志：所有节点显示绿色（成功）
- ✅ 后端收到回调

### 测试2：飞书路径

1. 在飞书表格中新建记录
2. 填写字段：
   - 提示词：`时尚模特在繁华街头`
   - 商品图片：上传一张图片
3. 点击"点击按钮"
4. 观察N8N执行日志

**预期结果**:

- ✅ 状态变为"处理中"
- ✅ 状态变为"已完成"
- ✅ 生成结果字段有图片

### 测试3：场景图可选

**测试3a：有场景图**

- 上传商品图 + 场景图
- 点击按钮
- 检查生成结果 ✅

**测试3b：无场景图** ⚠️ 重要

- 只上传商品图
- 点击按钮
- 检查不报错 ✅（v2修复）
- 检查生成结果 ✅

---

## ❓ 常见问题快速排查

### Q1: 导入失败

**可能原因**:

- JSON文件损坏
- N8N版本过低
- 文件路径错误

**解决方案**:

1. 重新下载JSON文件
2. 更新N8N到最新版本
3. 使用完整文件路径

### Q2: 凭证未找到

**可能原因**:

- 凭证未创建
- 凭证名称不匹配

**解决方案**:

1. 创建凭证（名称必须完全一致）:
   - `DeerAPI account`
   - `Feishu Credentials account`
2. 在节点中重新选择凭证

### Q3: 飞书工作流不触发

**可能原因**:

- Webhook URL配置错误
- 飞书自动化未启用
- 飞书自动化配置错误

**解决方案**:

1. 复制正确的Webhook URL（从N8N的Webhook触发器节点）
2. 启用飞书自动化
3. 检查飞书自动化配置

### Q4: 场景图报错（v1版本）

**症状**: 无场景图时工作流报错

**解决方案**: 使用v2版本

### Q5: App Token和Table ID在哪里找？

**步骤**:

1. 打开飞书多维表格
2. 查看浏览器地址栏
3. URL格式：`https://example.feishu.cn/base/appABC123/tblXYZ789`
4. App Token: `appABC123`
5. Table ID: `tblXYZ789`

---

## 📋 配置检查清单

### 前端工作流

- [ ] 导入 `n8n-workflow-frontend.json`
- [ ] 创建DeerAPI凭证
- [ ] 激活工作流
- [ ] 测试前端路径
- [ ] 确认回调成功

### 飞书工作流v2

- [ ] 导入 `n8n-workflow-feishu-v2.json` ⚠️ 注意v2
- [ ] 创建DeerAPI凭证
- [ ] 创建Feishu凭证
- [ ] 替换App Token（3处）
- [ ] 替换Table ID（3处）
- [ ] 激活工作流
- [ ] 配置飞书自动化
- [ ] 测试飞书路径（有场景图）
- [ ] 测试飞书路径（无场景图）⚠️ 重要
- [ ] 确认结果写入成功

---

## 🎯 完成后你可以做什么

### 前端操作

1. 打开前端页面
2. 填写提示词
3. 上传商品图片（必填）
4. 上传场景图（可选）
5. 选择AI模型（默认：Gemini-3-Pro-Image）
6. 选择尺寸比例（默认：3:4）
7. 选择生成数量（默认：4）
8. 点击生成
9. 等待结果自动显示 ✅

### 飞书操作

1. 打开飞书多维表格
2. 新建记录
3. 填写提示词
4. 上传商品图片（必填）
5. 上传场景图（可选）
6. （可选）选择AI模型
7. （可选）选择尺寸比例
8. （可选）选择生成数量
9. 点击"点击按钮"
10. 等待结果自动写入 ✅

---

## 📞 需要帮助？

### 检查文档

- [N8N\_双轨工作流完整操作指南.md](./N8N_双轨工作流完整操作指南.md) - 详细操作指南
- [N8N工作流验证报告.md](./N8N工作流验证报告.md) - 验证报告和修复说明
- [代码匹配验证报告.md](./代码匹配验证报告.md) - 代码匹配验证
- [FEISHU_FIELD_CONFIG.md](./FEISHU_FIELD_CONFIG.md) - 飞书字段配置

### 检查日志

1. N8N执行日志（左侧菜单 → Executions）
2. 飞书自动化日志
3. 后端日志
4. 浏览器控制台

---

## ⚠️ 重要提示

### 使用v2版本！

**原因**:

- v1版本有逻辑问题（无场景图时会报错）
- v2版本已修复所有问题
- v2版本使用标准Webhook触发器，更可靠

**如何确认**:

1. 检查文件名：`n8n-workflow-feishu-v2.json`
2. 检查节点数：20个（v1是21个）
3. 检查触发器类型：Webhook（v1是Feishu Trigger）

### 不要混用版本！

**错误示例**:

- ❌ 前端用v1，飞书用v2
- ❌ 前端用新版本，飞书用v1

**正确示例**:

- ✅ 前端用 `n8n-workflow-frontend.json`
- ✅ 飞书用 `n8n-workflow-feishu-v2.json`

---

**版本**: v2.0
**更新时间**: 2025-01-27
**状态**: ✅ 已验证
