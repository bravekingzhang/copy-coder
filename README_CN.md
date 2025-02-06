# Super Copy Coder

基于 AI 的提示生成工具，可以从 UI 设计和模型中生成详细的开发提示。完美适配 Cursor、Bolt 和 v0.dev 等现代 AI 编程工具。


[![使用 Vercel 部署](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fbravekingzhang%2Fcopy-coder&env=VISION_API_KEY,CHAT_API_KEY&envDescription=API%20keys%20required%20for%20OpenRouter%20and%20DeepSeek%20API%20access&envLink=https%3A%2F%2Fopenrouter.ai%2Fdocs&demo-title=Super%20Copy%20Coder&demo-description=AI-powered%20prompt%20generator%20for%20developers&demo-url=https%3A%2F%2Fsuper-copy-coder.vercel.app)

[English](./README.md) | [中文](./README_CN.md)

## 预览

![Super Copy Coder 预览](./artificial/screen.jpg)

![Super Copy Coder 预览](./artificial/screen-2.png)

### 核心功能：

1. **上传与分析**
   - 拖拽或点击上传 UI 设计
   - 支持多种图片格式
   - 实时视觉反馈

2. **智能生成**
   - 结构化提示生成
   - 可调节的创造力参数
   - 实时流式输出，支持 Markdown 格式

3. **快速集成**
   - 直接访问 Bolt、v0.dev 和 Cursor
   - 一键复制功能
   - 无缝工作流集成

## 特性

- **图片分析**：上传 UI 设计、模型或应用截图
- **智能提示生成**：生成针对 AI 编程工具优化的详细结构化提示
- **多应用类型支持**：支持 Web、移动端和桌面应用分析
- **可调节的 AI 参数**：通过温度控制调节创造力水平
- **实时流式输出**：实时查看提示生成过程
- **Markdown 支持**：生成的提示采用 Markdown 格式以提高可读性
- **快速访问工具**：与流行的 AI 开发工具直接集成
  - Bolt (https://bolt.new)
  - v0.dev
  - Cursor

## 技术栈

- Next.js 15
- TypeScript
- Tailwind CSS
- OpenRouter (Gemini Vision) / DeepSeek API 集成
- React Markdown 支持 GFM
- Lucide Icons
- Xterm.js 终端模拟
- Zustand 状态管理
- CodeMirror 代码编辑器
- Radix UI 组件
- Framer Motion 动画

## 快速开始

1. 克隆仓库：
```bash
git clone https://github.com/yourusername/super-copy-coder.git
cd super-copy-coder
```

2. 安装依赖：
```bash
npm install
```

3. 设置环境变量：
在根目录创建 `.env` 文件：
```env
# Vision 模型配置
VISION_BASE_URL=https://openrouter.ai/api/v1
VISION_API_KEY=your_openrouter_api_key
VISION_MODEL=google/gemini-2.0-flash-exp:free

# Vision 模型使用开关
USE_VISION_MODEL_CODE=false

# Chat 模型配置
CHAT_BASE_URL=https://api.deepseek.com/v1
CHAT_API_KEY=your_deepseek_api_key
CHAT_MODEL=deepseek-chat

# 代理, 如果需要代理，请配置代理地址，否则不需要配置
HTTPS_PROXY=http://127.0.0.1:7890
```

4. 运行开发服务器：
```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 使用方法

1. 上传 UI 设计图片（拖拽或点击上传）
2. 选择应用类型（web/移动端/桌面端）
3. 根据需要调整温度参数
4. 点击"生成提示"
5. 复制生成的提示
6. 使用快速访问按钮打开你偏好的 AI 编程工具

## 贡献

欢迎提交 Pull Request 来贡献代码！

## 作者

老码小张
- 微信公众号：老码小张
- 分享 AI 编程、全栈开发、效率工具等精彩内容

## 许可证

MIT 许可证 - 可以自由使用此项目用于个人用途。

## 支持

如果这个工具对你有帮助，欢迎支持项目的维护和改进。

## 部署

### 使用 Docker 部署（推荐）

1. 克隆仓库并进入项目目录：
```bash
git clone https://github.com/bravekingzhang/copy-coder.git
cd copy-coder
```

2. 从示例文件创建 `.env` 文件：
```bash
cp .env.example .env
```

3. 编辑 `.env` 文件，添加你的 API 密钥：
```env
VISION_API_KEY=your_openrouter_api_key
CHAT_API_KEY=your_deepseek_api_key
```

4. 使用 Docker Compose 构建并启动应用：
```bash
docker compose up -d
```

应用将在 http://localhost:3000 上运行

停止应用：
```bash
docker compose down
```

### 使用 Vercel 部署（备选方案）

部署你自己的 Super Copy Coder 副本最简单的方法是使用上方的 Vercel 部署按钮。这将会：

1. 克隆此仓库到你的 GitHub 账号
2. 在 Vercel 上设置新项目
3. 提示你添加所需的环境变量
4. 自动部署应用

部署后，你需要：
1. 在 Vercel 项目设置中配置 `VISION_API_KEY` 和 `CHAT_API_KEY` 以及其他环境变量
2. 根据需要配置其他环境变量

### 手动部署

你也可以手动将应用部署到任何支持 Next.js 应用的平台。确保：
1. 设置所需的环境变量
2. 根据平台配置构建设置
3. 设置必要的 serverless 函数支持

## 关注我的微信公众号

获取最新的 AI 开发技巧和工具资讯：

<div align="center">
  <img src="./public/wechat-qr.jpg" alt="微信公众号二维码" width="200"/>
  <p><strong>微信公众号：老码小张</strong></p>
  <p>扫描二维码关注，获取以下最新资讯：</p>
  <ul align="left">
    <li>🤖 AI 编程技巧与实践</li>
    <li>💻 全栈开发心得分享</li>
    <li>🛠️ 效率工具与工作流</li>
    <li>🚀 最新技术趋势点评</li>
  </ul>
</div>