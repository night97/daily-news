# DailyReport - 自动化日报系统

🚀 每天8点自动收集你关注领域的最新信息，生成精美的响应式日报网站，并自动发布到GitHub Pages。

## ✨ 特性

- 🤖 **完全自动化**：每日8点自动生成，无需人工干预
- 📱 **响应式设计**：完美适配桌面端、平板和移动端
- 🎨 **现代化UI**：采用浅色清新设计，与参考项目风格完全不同
- 📚 **历史存档**：自动保存历史日报，支持随时查阅
- 🔍 **多领域支持**：可自定义关注的领域分类
- 🚀 **一键部署**：基于GitHub Pages，无需额外服务器

## 🏗️ 技术架构

### 后端架构
- **运行环境**：Node.js
- **数据收集**：Tavily Search API（实时搜索各领域最新资讯）
- **内容生成**：自定义HTML生成器，支持模板化输出
- **定时任务**：GitHub Actions（每日8点自动执行）
- **数据存储**：本地JSON文件 + 静态HTML页面

### 前端架构
- **技术栈**：原生HTML5 + CSS3 + JavaScript（无框架依赖）
- **样式系统**：CSS变量 + Flexbox/Grid布局，支持响应式
- **交互功能**：分类筛选、搜索、夜间模式、日报汇总弹窗
- **部署方式**：GitHub Pages，纯静态站点，访问速度快

### 项目结构
```
daily-report/
├── .github/workflows/    # GitHub Actions 自动部署配置
│   └── daily-generate.yml
├── backend/
│   ├── scraper/          # 数据抓取和页面生成
│   │   ├── scraper.js    # 核心抓取逻辑
│   │   └── generate.js   # HTML 生成器
│   ├── utils/            # 工具函数
│   │   └── tavily-api.js # Tavily API 封装
│   └── data/             # 生成的JSON数据
├── docs/                 # GitHub Pages 部署目录
│   ├── index.html        # 今日日报
│   ├── css/style.css     # 样式文件（全新设计）
│   ├── js/app.js         # 交互逻辑
│   └── archive/          # 历史存档页面
├── .env.example          # 环境变量示例
├── package.json          # 项目依赖配置
└── README.md             # 项目说明
```

## 🎨 设计特点（与参考项目的区别）

1. **主题风格**：采用浅色清爽主题，而非参考项目的深色模式
2. **布局设计**：极简卡片式布局，更大的留白和更舒适的阅读体验
3. **色彩系统**：蓝色系主色调，更符合新闻资讯类产品的专业感
4. **交互体验**：新增标签页式分类切换、平滑过渡动画、顶部进度条
5. **移动端优化**：专为小屏设备优化的阅读布局，手势友好
6. **功能增强**：支持夜间模式切换、字体大小调节、离线阅读

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
复制 `.env.example` 为 `.env` 并填写你的Tavily API Key：
```bash
cp .env.example .env
```

在 `.env` 文件中配置：
```env
TAVILY_API_KEY=your_tavily_api_key_here
```

### 3. 生成本地日报
使用模拟数据生成：
```bash
npm run generate
```

使用真实API数据生成：
```bash
npm run generate:real
```

生成并存档：
```bash
npm run generate:archive
```

### 4. 本地预览
```bash
npm run dev
```
然后访问 `http://localhost:3000` 查看效果。

## ⚙️ 自定义配置

### 修改关注领域
编辑 `backend/scraper/scraper.js` 中的 `CATEGORIES` 配置：
```javascript
const CATEGORIES = [
  { id: 'ai', name: '人工智能', icon: '🤖', keywords: ['AI', '人工智能', '大模型'] },
  { id: 'tech', name: '科技前沿', icon: '🔬', keywords: ['科技', '前沿技术', '创新'] },
  // 添加更多自定义分类
];
```

### 修改生成时间
编辑 `.github/workflows/daily-generate.yml` 中的cron表达式：
```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # 默认 UTC 0点 = 北京时间8点
```

## 📦 部署到GitHub Pages

### 1. 配置GitHub Secrets
在仓库 Settings → Secrets and variables → Actions 中添加：
- `TAVILY_API_KEY`: 你的Tavily API Key

### 2. 启用GitHub Pages
在仓库 Settings → Pages 中：
- Source 选择 "Deploy from a branch"
- Branch 选择 `gh-pages` 分支，根目录
- 点击 Save

### 3. 自动运行
配置完成后，GitHub Actions会在每天北京时间8点自动执行：
1. 抓取最新资讯
2. 生成日报页面
3. 部署到GitHub Pages
4. 更新历史存档

## 📄 License
MIT