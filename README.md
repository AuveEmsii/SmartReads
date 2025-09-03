# SmartReads - 小说拆书工具

<div align="center">

*一个基于React的现代化小说文本分析和章节拆分工具*

[![GitHub stars](https://img.shields.io/github/stars/Ggbond626/SmartReads?style=social)](https://github.com/Ggbond626/SmartReads)
[![GitHub forks](https://img.shields.io/github/forks/Ggbond626/SmartReads?style=social)](https://github.com/Ggbond626/SmartReads)
[![GitHub issues](https://img.shields.io/github/issues/Ggbond626/SmartReads)](https://github.com/Ggbond626/SmartReads/issues)
[![License](https://img.shields.io/github/license/Ggbond626/SmartReads)](LICENSE)

</div>

## 📸 应用截图

### 🌟 主界面 - 明亮主题
![主界面明亮主题](images/screenshot-light.png)

### 🌙 主界面 - 深色主题  
![主界面深色主题](images/screenshot-dark.png)

## ✨ 主要特性

### 📚 智能章节管理
- 🔄 支持多种文件格式（TXT、EPUB等）
- 📋 直观的章节选择和队列管理
- 📊 实时显示文件信息（字数、章节数等）
- 🗂️ 智能缓存机制，提升处理效率

### 🤖 AI驱动的深度分析
- 🧠 集成先进的AI模型进行内容分析
- ⚡ 支持批量处理，提高工作效率
- 📈 实时进度显示和状态反馈
- 🎯 精准提取情节、人物、情感等关键要素

### 🎨 现代化用户界面
- 🌈 紫色渐变玻璃态设计风格
- 🌓 明暗主题无缝切换
- 📱 完美的移动端响应式适配
- ✨ 流畅的动画和交互效果

### ⚙️ 灵活的配置管理
- 🔑 安全的API密钥管理
- 🎛️ 丰富的参数调整选项
- 🔧 多种AI模型支持
- 💾 本地设置持久化存储

### 📊 专业的结果展示
- 📋 结构化的分析结果展示
- 📄 支持Markdown格式导出
- 📋 一键复制功能
- 🔍 详细的调试信息查看

## 🚀 快速开始

### 环境要求
- Node.js 16+
- 现代浏览器（Chrome、Firefox、Safari、Edge）
- 稳定的网络连接

### 安装步骤

```bash
# 克隆项目
git clone https://github.com/Ggbond626/SmartReads.git
cd SmartReads

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### Docker 部署

```bash
# 使用 Docker Compose（推荐）
docker-compose up --build

# 或使用 Docker
docker build -t smartreads-web .
docker run -p 4173:4173 smartreads-web
```

访问 http://localhost:4173 开始使用

## 📖 使用指南

### 1. 配置API设置
1. 点击右上角设置按钮 ⚙️
2. 在"API设置"中配置：
   - API密钥
   - 基础URL
   - 模型选择
   - 参数调整
3. 测试连接确保配置正确

### 2. 上传小说文件
1. 在"预处理"面板选择文件
2. 支持拖拽上传或点击浏览
3. 自动解析章节信息
4. 选择需要分析的章节

### 3. 开始分析
1. 切换到"分析"面板
2. 添加章节到分析队列
3. 点击"开始分析"
4. 实时查看分析进度

### 4. 查看结果
1. 在"分析结果"面板查看详细分析
2. 支持复制或导出Markdown
3. 可展开调试信息查看详情

## 🛠️ 技术栈

- **前端框架**: React 18
- **样式方案**: CSS Modules + CSS Variables
- **图标库**: React Icons
- **状态管理**: React Context API
- **构建工具**: Vite
- **容器化**: Docker + Docker Compose

## 📁 项目结构

```
src/
├── components/          # 组件目录
│   ├── common/         # 通用组件
│   │   ├── Button/     # 按钮组件
│   │   ├── FileInput/  # 文件输入组件
│   │   └── ...
│   ├── Header/         # 顶部导航栏
│   ├── Sidebar/        # 左侧面板
│   │   ├── AnalysisPanel/      # 分析面板
│   │   └── PreprocessPanel/    # 预处理面板
│   ├── ContentPanel/   # 右侧内容区域
│   ├── SettingsModal/  # 设置模态框
│   └── StatusBar/      # 底部状态栏
├── contexts/           # React Context
├── hooks/              # 自定义Hooks
├── utils/              # 工具函数
└── index.css          # 全局样式和设计令牌
```

## 🎯 功能特色

- ✅ **智能文件处理**: 自动识别章节结构
- ✅ **实时反馈**: 进度条和状态提示
- ✅ **结果导出**: Markdown格式输出
- ✅ **主题切换**: 明暗主题支持
- ✅ **移动适配**: 响应式设计
- ✅ **缓存机制**: 提升处理效率
- ✅ **错误处理**: 友好的错误提示

## ⚠️ 注意事项

- 需要配置有效的AI API密钥
- 建议在安全环境中使用，保护API密钥
- 分析效果取决于AI模型和文本质量
- 大文件处理可能需要较长时间

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和用户！

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给个Star支持一下！**

Made with ❤️ by [Ggbond626](https://github.com/Ggbond626)

</div>