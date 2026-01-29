# N8N 小白配置指南（超级详细版）

## 📋 准备工作清单

在开始之前，请准备好以下信息：

### ✅ 必需的参数

#### 1. DeerAPI 相关

- [ ] DeerAPI的API Key（类似：`sk_xxxxxxxxxxxxxx`）
- [ ] 确认API地址：`https://api.deerapi.com/v1/ai/generate`

#### 2. 飞书相关

- [ ] 飞书应用的 App ID
- [ ] 飞书应用的 App Secret
- [ ] 飞书多维表格的 App Token（类似：`app_xxxxxxxxx`）
- [ ] 飞书多维表格的 Table ID（类似：`tblxxxxxxxxx`）
- [ ] 飞书字段名称：
  - 商品图片字段名（默认：`商品图片`）
  - 提示词字段名（默认：`提示词`）
  - AI模型字段名（默认：`AI模型`）
  - 图片比例字段名（默认：`图片比例`）
  - 生成数量字段名（默认：`生成数量`）
  - 生成结果字段名（默认：`生成结果`）
  - 状态字段名（默认：`状态`）

#### 3. 后端相关

- [ ] 后端API的回调地址（类似：`http://localhost:3000/api/webhooks/n8n/callback`）
- [ ] N8N Webhook的外网访问地址（类似：`https://your-n8n.com/webhook/ai-clothing-generation`）

---

## 🚀 第一步：导入工作流

### 1.1 打开N8N

```bash
# 在浏览器中打开你的N8N地址
https://your-n8n-instance.com
```

### 1.2 导入JSON文件

1. 点击右上角的 **"+"** 按钮
2. 在弹出的菜单中选择 **"Import from File"**
3. 选择文件：`docs/n8n-workflow-dual-source.json`
4. 点击 **"Import"** 按钮

### ⚠️ 注意事项

- ✅ 确保 JSON 文件完整（不要用记事本编辑过，保持原格式）
- ✅ 导入后会看到一个包含21个节点的工作流
- ✅ 如果导入失败，检查 JSON 格式是否正确

---

## 🔐 第二步：配置 DeerAPI 认证

### 2.1 找到需要配置的节点

在工作流画布中，找到名为 **"AI图片生成"** 的节点（第16个节点）

### 2.2 创建认证

1. 点击 **"AI图片生成"** 节点
2. 在右侧配置面板中，找到 **"Credentials"** 部分
3. 点击 **"Create New"** 按钮

### 2.3 填写认证信息

在弹出的认证配置窗口中：

```
认证类型：Header Auth
配置名称：DeerAPI认证（或者自定义名称）

Header Name: Authorization
Header Value: Bearer YOUR_DEERAPI_KEY
```

**具体示例**：

```
Header Name: Authorization
Header Value: Bearer sk_abc123def456ghi789jkl012mno345pqr
```

### ⚠️ 注意事项

- ⚠️ **必须**包含 `Bearer ` 前缀（注意 Bearer 后面有一个空格）
- ⚠️ **不要**泄露你的 API Key
- ✅ 替换 `YOUR_DEERAPI_KEY` 为你真实的 API Key
- ✅ 点击 **"Save"** 保存认证

---

## 🔑 第三步：配置飞书API认证

### 3.1 获取飞书 Access Token

飞书API需要使用 App Access Token，你需要通过 App ID 和 App Secret 获取。

**方法1：使用飞书官方工具**

```bash
# 访问飞书开发者工具
https://open.feishu.cn/open-apis/explorer/server

# 选择接口：获取 app_access_token
# 填入你的 app_id 和 app_secret
# 点击"调用"获得 access_token
```

**方法2：使用curl命令**

```bash
curl -X POST "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal" \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "your_app_id",
    "app_secret": "your_app_secret"
  }'
```

**返回结果**：

```json
{
  "code": 0,
  "tenant_access_token": "t-xxxxxxxxxxxxxxxxxxxx",
  "expire": 7200
}
```

### 3.2 创建飞书API认证

1. 在N8N工作流中，找到 **"下载飞书图片"** 节点（第6个节点）
2. 点击该节点
3. 在右侧配置面板的 **"Credentials"** 部分，点击 **"Create New"**

### 3.3 填写飞书认证信息

```
认证类型：Header Auth
配置名称：飞书API认证

Header Name: Authorization
Header Value: Bearer YOUR_FEISHU_ACCESS_TOKEN
```

**具体示例**：

```
Header Name: Authorization
Header Value: Bearer t-abc123def456ghi789jkl012mno345pqr678
```

### ⚠️ 注意事项

- ⚠️ **重要**：飞书的 Access Token 有效期是 2 小时（7200秒）
- ⚠️ **推荐**：实现自动刷新 Token 的机制
- ⚠️ **临时方案**：每2小时手动更新一次 Token
- ✅ 替换 `YOUR_FEISHU_ACCESS_TOKEN` 为你真实的 Token
- ✅ 同样的认证配置会应用到 **"更新飞书记录"** 节点

---

## 🌍 第四步：设置环境变量

### 4.1 找到 N8N 的配置文件

**方法1：Docker 部署**

```bash
# 编辑 docker-compose.yml
vim docker-compose.yml
```

**方法2：直接安装**

```bash
# 编辑 N8N 的 .env 文件
vim ~/.n8n/.env
# 或者
vim /root/.n8n/.env
```

### 4.2 添加环境变量

在 `.env` 文件中添加以下内容：

```bash
# 飞书多维表格配置
FEISHU_BITABLE_APP_TOKEN=app_xxxxxxxxxxxxx
FEISHU_BITABLE_TABLE_ID=tblxxxxxxxxxxxx

# 可选：如果使用固定的 Access Token（不推荐，因为会过期）
# FEISHU_APP_ACCESS_TOKEN=t-xxxxxxxxxxxxxxxxxxxx
```

### 4.3 获取参数值

**获取 App Token**：

1. 打开你的飞书多维表格
2. 在浏览器地址栏中找到 URL，类似：
   ```
   https://example.feishu.cn/base/appXXXXXXXXXXXX/basenXXXXXXX?table=tblXXXXXXXXXXXX
   ```
3. `appXXXXXXXXXXXX` 就是 **App Token**
4. `tblXXXXXXXXXXXX` 就是 **Table ID**

**示例**：

```
URL: https://example.feishu.cn/base/appabc123def456/basenop789qrt012?table=tbl345uvw678xyz

App Token: appabc123def456
Table ID: tbl345uvw678xyz
```

### 4.4 重启 N8N 服务

**Docker 部署**：

```bash
docker-compose down
docker-compose up -d
```

**直接安装**：

```bash
# 重启 N8N 服务
systemctl restart n8n
# 或者
pm2 restart n8n
```

### ⚠️ 注意事项

- ✅ 确保没有多余的空格或引号
- ✅ 等号 `=` 两边不要有空格
- ⚠️ 如果修改了环境变量，**必须**重启 N8N 才能生效
- ✅ 可以在 N8N 的日志中查看是否加载成功

---

## 🔧 第五步：配置 Webhook 地址

### 5.1 激活 Webhook

1. 在工作流画布中，点击第一个节点 **"统一Webhook入口"**
2. 在右侧配置面板中，找到 **"Webhook URL"**
3. 点击 **"Listen for Test Event"** 或 **"Activate"**

### 5.2 复制 Webhook URL

你会看到两个 URL：

```
Test URL: https://your-n8n.com/webhook/ai-clothing-generation
Production URL: https://your-n8n.com/webhook/ai-clothing-generation
```

**重要**：

- **Test URL**：仅用于测试，点击 "Listen for Test Event" 时使用
- **Production URL**：生产环境使用，需要激活工作流后才能使用

### 5.3 配置后端

打开你的后端项目，编辑 `.env` 文件：

```bash
# N8N Webhook 配置
N8N_WEBHOOK_URL=https://your-n8n.com/webhook/ai-clothing-generation
N8N_API_KEY=your_api_key_here  # 可选，如果需要API Key认证
```

### ⚠️ 注意事项

- ✅ 生产环境使用 **Production URL**
- ✅ 确保 N8N 可以从外网访问
- ⚠️ 如果使用 `localhost`，只能本地测试
- ⚠️ 如果是内网环境，需要配置内网穿透或使用 VPN

---

## 📝 第六步：验证飞书字段名称

### 6.1 检查你的飞书多维表格

打开你的飞书多维表格，确认字段名称是否与工作流中一致：

| 工作流中的字段名 | 你的表格字段名 | 说明                           |
| ---------------- | -------------- | ------------------------------ |
| `商品图片`       | ?              | 附件类型，存储商品图片         |
| `提示词`         | ?              | 文本类型，存储AI提示词         |
| `AI模型`         | ?              | 文本类型，存储AI模型名称       |
| `图片比例`       | ?              | 单选类型，1:1、3:4、16:9、9:16 |
| `生成数量`       | ?              | 数字类型，生成图片的数量       |
| `生成结果`       | ?              | 附件类型，存储生成的图片       |
| `状态`           | ?              | 单选类型，任务状态             |

### 6.2 修改字段名（如果不同）

如果你的字段名不同，需要修改工作流中的 **"解析飞书参数"** 节点（第5个节点）：

1. 点击 **"解析飞书参数"** 节点
2. 在右侧配置面板的 **"Assignments"** 部分
3. 修改字段名，例如：

```javascript
// 原来的配置（字段名是"提示词"）
"prompt": "={{ $json.rawData.fields['提示词'] }}"

// 如果你的字段名是"Prompt"，改为：
"prompt": "={{ $json.rawData.fields['Prompt'] }}"
```

**需要修改的所有字段**：

```javascript
// 在"解析飞书参数"节点中
{
  "recordId": "={{ $json.rawData.record_id }}",
  "prompt": "={{ $json.rawData.fields['你的提示词字段名'] }}",
  "aiModel": "={{ $json.rawData.fields['你的AI模型字段名'] }}",
  "aspectRatio": "={{ $json.rawData.fields['你的图片比例字段名'] }}",
  "imageCount": "={{ $json.rawData.fields['你的生成数量字段名'] }}",
  "productImageToken": "={{ $json.rawData.fields['你的商品图片字段名'][0] }}"
}
```

同样需要修改 **"格式化飞书结果"** 节点（第19个节点）：

```javascript
{
  "你的生成结果字段名": "={{ $json.resultImageUrls }}",
  "你的状态字段名": "已完成"
}
```

### ⚠️ 注意事项

- ✅ 字段名**必须**完全一致（区分大小写）
- ✅ 中文字段名用单引号包裹
- ⚠️ 如果字段名包含特殊字符，确保转义正确
- ✅ 修改后点击 **"Save"** 保存节点

---

## 🧪 第七步：测试工作流

### 7.1 激活工作流

1. 点击工作流右上角的 **"Active"** 开关
2. 确保工作流状态变为 **"Active"**（绿色）

### 7.2 测试前端路径

使用 curl 发送测试请求：

```bash
curl -X POST https://your-n8n.com/webhook/ai-clothing-generation \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "test-frontend-001",
    "userId": "test-user-123",
    "productImageUrl": "https://picsum.photos/1024/1024",
    "sceneImageUrl": "",
    "prompt": "一个时尚的模特在繁华的都市街头",
    "aiModel": "flux-realism",
    "aspectRatio": "16:9",
    "imageCount": 4,
    "quality": "high",
    "callbackUrl": "http://your-backend.com/api/webhooks/n8n/callback"
  }'
```

**预期结果**：

```json
{
  "success": true,
  "taskId": "test-frontend-001",
  "message": "图片生成成功"
}
```

### 7.3 测试飞书路径

```bash
curl -X POST https://your-n8n.com/webhook/ai-clothing-generation \
  -H "Content-Type: application/json" \
  -d '{
    "record_id": "rec123456789",
    "fields": {
      "商品图片": ["img_token_abc123"],
      "提示词": "一个时尚的模特在繁华的都市街头",
      "AI模型": "flux-realism",
      "图片比例": "16:9",
      "生成数量": 4
    },
    "source": "feishu"
  }'
```

**预期结果**：

```json
{
  "success": true,
  "taskId": "rec123456789",
  "message": "图片生成成功"
}
```

### ⚠️ 常见错误

**错误1：认证失败**

```
错误信息：401 Unauthorized
解决：检查 API Key 或 Token 是否正确
```

**错误2：字段名错误**

```
错误信息：Cannot read property '提示词' of undefined
解决：检查飞书字段名是否与表格一致
```

**错误3：环境变量未生效**

```
错误信息：FEISHU_BITABLE_APP_TOKEN is not defined
解决：检查环境变量是否正确配置，并重启 N8N
```

**错误4：Webhook 未激活**

```
错误信息：404 Not Found
解决：激活工作流，确保 Webhook 处于监听状态
```

---

## 📊 第八步：查看执行日志

### 8.1 在 N8N 中查看日志

1. 点击左侧菜单的 **"Executions"**
2. 可以看到每次工作流的执行记录
3. 点击某次执行，可以看到每个节点的输入输出

### 8.2 查看特定节点的数据

1. 在执行详情页面，点击任意节点
2. 右侧会显示该节点的：
   - **Input**：输入数据
   - **Output**：输出数据
   - **Time**：执行时间
   - **Status**：执行状态（成功/失败）

### 8.3 调试技巧

**技巧1：在关键节点添加日志**

```javascript
// 在"Code"节点中添加
console.log('当前数据:', JSON.stringify($json, null, 2));
return items;
```

**技巧2：使用"Set"节点查看中间数据**

- 在怀疑出问题的位置后面添加一个"Set"节点
- 设置一个字段保存当前数据
- 查看该节点的输出

**技巧3：分步测试**

- 先测试前端路径，成功后再测试飞书路径
- 先测试简单的比例（1:1），再测试其他比例

---

## ✅ 第九步：配置飞书机器人触发（可选）

如果你想直接从飞书多维表格触发工作流，需要配置飞书机器人。

### 9.1 创建飞书应用

1. 访问 [飞书开放平台](https://open.feishu.cn/)
2. 创建一个企业自建应用
3. 获取 `app_id` 和 `app_secret`

### 9.2 配置权限

在飞书开放平台中，为应用添加以下权限：

```
• 获取多维表格信息
• 读取和修改多维表格
• 读取文件
• 上传文件
```

### 9.3 配置事件订阅

1. 在飞书开放平台，选择 **"事件订阅"**
2. 添加订阅地址：`https://your-n8n.com/webhook/feishu-table-trigger`
3. 订阅事件：`bitable_record_changed`（记录变更事件）

### 9.4 在N8N中创建新的Webhook

1. 创建一个新的Webhook节点
2. Path设置为：`feishu-table-trigger`
3. 解析飞书发送的事件数据
4. 转换为工作流需要的格式，发送到主工作流

### ⚠️ 注意事项

- ⚠️ 飞书机器人配置比较复杂，建议先测试手动触发
- ✅ 可以使用飞书提供的 **"简易流程"** 功能，更简单
- ✅ 详细配置参考：[飞书开放平台文档](https://open.feishu.cn/document/)

---

## 🎯 完整配置清单

使用这个清单确保所有配置都已完成：

### DeerAPI 配置

- [ ] 创建了 DeerAPI 认证
- [ ] 填写了正确的 API Key
- [ ] 认证名称为 "DeerAPI认证"

### 飞书API 配置

- [ ] 获取了飞书 Access Token
- [ ] 创建了飞书API认证
- [ ] 填写了正确的 Token
- [ ] 认证名称为 "飞书API认证"

### 环境变量配置

- [ ] 配置了 FEISHU_BITABLE_APP_TOKEN
- [ ] 配置了 FEISHU_BITABLE_TABLE_ID
- [ ] （可选）配置了 FEISHU_APP_ACCESS_TOKEN
- [ ] 重启了 N8N 服务

### 字段名称检查

- [ ] 确认了飞书表格的字段名
- [ ] 字段名与工作流一致，或已修改工作流

### Webhook 配置

- [ ] 激活了工作流
- [ ] 获取了 Production URL
- [ ] 配置了后端的 N8N_WEBHOOK_URL

### 测试验证

- [ ] 测试前端路径成功
- [ ] 测试飞书路径成功
- [ ] 检查了执行日志

---

## 🆘 常见问题 FAQ

### Q1: DeerAPI 的 API Key 在哪里获取？

**A**: 登录 DeerAPI 控制台，在 "API Keys" 页面创建新的 API Key。

### Q2: 飞书 Access Token 过期了怎么办？

**A**: 有两种方案：

1. **临时方案**：每2小时手动更新一次 Token，重新创建认证
2. **推荐方案**：实现自动刷新 Token 的机制，在工作流中添加一个节点自动获取新 Token

### Q3: 为什么导入 JSON 后节点位置乱了？

**A**: 不影响功能，只是显示问题。可以手动拖拽节点调整位置。

### Q4: 如何测试工作流是否正常？

**A**: 使用上面提供的 curl 命令测试，或者在 N8N 界面中点击 "Listen for Test Event"。

### Q5: 飞书字段名中有空格怎么办？

**A**: 在字段名两端加单引号，例如：`{{ $json.rawData.fields['商品 图片'] }}`

### Q6: 我的 N8N 在本地，如何让外网访问？

**A**: 使用内网穿透工具，如：

- ngrok: `ngrok http 5678`
- frp
- 花生壳

### Q7: 工作流执行很慢怎么办？

**A**:

1. 检查网络连接
2. 优化 AI 生成参数（减少图片数量）
3. 检查 API 响应时间
4. 考虑使用更快的 API 服务

### Q8: 如何查看详细的错误信息？

**A**:

1. 在 N8N 中点击 "Executions" 查看执行记录
2. 点击失败的节点，查看错误信息
3. 检查浏览器控制台和 N8N 服务器日志

### Q9: 可以同时处理多个请求吗？

**A**: 可以。N8N 默认支持并发执行，但需要注意：

- DeerAPI 的速率限制
- 飞书API的速率限制
- 服务器资源

### Q10: 如何备份工作流？

**A**:

1. 在 N8N 中点击工作流右上角的 "..."
2. 选择 "Download"
3. 保存 JSON 文件到本地

---

## 📞 需要帮助？

如果遇到问题，请按以下顺序排查：

1. **查看日志**：N8N 的 "Executions" 页面
2. **检查配置**：按照上面的清单逐一检查
3. **测试连通性**：确认所有 API 地址可访问
4. **简化测试**：先测试最简单的流程
5. **查阅文档**：查看其他相关文档

---

## 🎉 配置完成！

恭喜你完成了所有配置！现在你的工作流应该可以正常工作了。

**接下来你可以**：

1. 在前端UI中创建任务，测试完整流程
2. 在飞书多维表格中直接操作，测试飞书触发
3. 根据实际需求优化工作流
4. 添加更多的错误处理和日志记录

**记住**：

- ✅ 定期检查和更新 API Key 和 Token
- ✅ 监控工作流执行情况
- ✅ 备份重要的配置和工作流
- ✅ 保持文档更新

祝使用愉快！🎊
