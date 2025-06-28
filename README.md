# Gemini API 代理服务

这是一个基于 Deno Deploy 的 Google Gemini API 代理服务，提供简单的 HTTP 接口来调用 Gemini 模型。

## 项目架构

```
├── main.ts              # 主入口文件，负责服务器启动和路由分发
├── routes/
│   └── chat.route.ts    # 聊天路由处理逻辑
├── services/
│   └── ai.service.ts    # AI服务核心逻辑
└── README.md           # 项目文档
```

## 功能特性

- 指定 gemini-2.5-flash-preview-05-20 模型
- 可自定义系统指令
- 支持结构化输出和意图识别
- 内置 CORS 支持
- 错误处理和参数验证
- 模块化架构，便于功能扩展

## API 接口

### POST /

**请求参数：**

```json
{
  "input": "你的问题或内容",
  "apikey": "你的 Gemini API Key",
  "systemInstruction": "可选的系统指令",
  "temperature": 1
}
```

或者使用 messageList 参数（适用于 Coze 等平台）：

```json
{
  "messageList": [{"role": "user", "content": "你的问题"}],
  "apikey": "你的 Gemini API Key",
  "systemInstruction": "可选的系统指令",
  "temperature": 1
}
```

**参数说明：**

- `input` (二选一): 要发送给 AI 的内容，支持两种格式：
  - 字符串：直接的问题或内容
  - 数组：带有历史记录的对话，格式为 `[{"role": "user", "content": "消息内容"}, ...]`
- `messageList` (二选一): 专门用于对话数组格式，与 `input` 功能相同但参数名不同，便于兼容不同平台
- `apikey` (必需): 你的 Google Gemini API Key
- `systemInstruction` (可选): 自定义系统指令，默认为中文助理设定
- `temperature` (可选): 控制回复的随机性，取值范围 0-2，默认为 1
- `intention_setting` (可选): 意图识别设置，包含以下字段：
  - `intention_1` 到 `intention_5`: 最多5个意图名称
  - `intention_else`: 默认意图名称，默认为 "else"

**注意：** `input` 和 `messageList` 只需要提供其中一个，如果同时提供，系统会优先使用 `input` 参数。

**响应格式：**

普通模式响应：
```json
{
  "success": true,
  "response": "AI 的回复内容"
}
```

意图识别模式响应：
```json
{
  "success": true,
  "response": "完整的JSON响应",
  "intention_1_result": {
    "intention_name": "意图1名称",
    "condition": true,
    "content": "关于该意图的详细内容总结"
  },
  "intention_2_result": {
    "intention_name": "意图2名称",
    "condition": false,
    "content": "关于该意图的详细内容总结"
  },
  // 更多意图结果...
  "intention_else_result": {
    "intention_name": "else",
    "condition": false,
    "content": "不属于其他意图的内容总结"
  }
}

## 部署到 Deno Deploy

1. 将代码推送到 GitHub 仓库
2. 在 [Deno Deploy](https://dash.deno.com/) 创建新项目
3. 连接你的 GitHub 仓库
4. 设置入口文件为 `main.ts`
5. 部署完成

## 本地开发

```bash
# 启动开发服务器
deno task dev

# 或直接运行
deno run --allow-net --allow-env main.ts
```

## 测试示例

部署完成后，你可以使用以下 curl 命令测试：

### 1. 基础字符串输入测试

```bash
curl -X POST https://your-deploy-url.deno.dev \
  -H "Content-Type: application/json" \
  -d '{
    "input": "你好，请介绍一下自己",
    "apikey": "YOUR_GEMINI_API_KEY"
  }'
```

### 2. 带自定义系统指令和温度参数的测试

```bash
curl -X POST https://your-deploy-url.deno.dev \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Hello, introduce yourself",
    "apikey": "YOUR_GEMINI_API_KEY",
    "systemInstruction": "You are a helpful assistant that responds in English",
    "temperature": 0.7
  }'
```

### 3. 历史对话数组输入测试（使用 input 参数）

```bash
curl -X POST https://your-deploy-url.deno.dev \
  -H "Content-Type: application/json" \
  -d '{
    "input": [
      {"role": "user", "content": "我叫小明"},
      {"role": "assistant", "content": "你好小明！很高兴认识你。"},
      {"role": "user", "content": "你还记得我的名字吗？"}
    ],
    "apikey": "YOUR_GEMINI_API_KEY",
    "temperature": 1.2
  }'
```

### 4. 使用 messageList 参数测试（适用于 Coze 平台）

```bash
curl -X POST https://your-deploy-url.deno.dev \
  -H "Content-Type: application/json" \
  -d '{
    "messageList": [
      {"role": "user", "content": "请帮我写一首关于春天的诗"},
      {"role": "assistant", "content": "春风轻拂柳絮飞，花开满园蝶舞归。"},
      {"role": "user", "content": "能再写一句吗？"}
    ],
    "apikey": "YOUR_GEMINI_API_KEY",
    "temperature": 0.9
  }'
```

### 5. 使用意图识别功能测试

```bash
curl -X POST https://your-deploy-url.deno.dev \
  -H "Content-Type: application/json" \
  -d '{
    "input": "我想了解一下如何制作巧克力曲奇饼干",
    "apikey": "YOUR_GEMINI_API_KEY",
    "intention_setting": {
      "intention_1": "食谱查询",
      "intention_2": "烘焙技巧",
      "intention_3": "食材购买",
      "intention_else": "其他问题"
    }
  }'
```

响应示例：

```json
{
  "success": true,
  "response": "...",
  "intention_1_result": {
    "intention_name": "食谱查询",
    "condition": true,
    "content": "用户想要了解巧克力曲奇饼干的制作方法，这是一个食谱查询请求。"
  },
  "intention_2_result": {
    "intention_name": "烘焙技巧",
    "condition": false,
    "content": "用户没有明确询问烘焙技巧，而是在寻找具体的食谱。"
  },
  "intention_3_result": {
    "intention_name": "食材购买",
    "condition": false,
    "content": "用户没有询问在哪里购买食材或食材的价格等信息。"
  },
  "intention_else_result": {
    "intention_name": "其他问题",
    "condition": false,
    "content": "用户的问题明确是关于食谱查询，不属于其他类别。"
  }
}
```

## 注意事项

- 请妥善保管你的 API Key，不要在客户端代码中暴露
- 建议在生产环境中添加速率限制和身份验证
- 确保你的 Gemini API Key 有足够的配额