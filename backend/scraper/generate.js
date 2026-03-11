/**
 * HTML 页面生成器
 * 生成全新设计的响应式日报页面
 */

const fs = require('fs');
const path = require('path');

// 优先加载.env-dev，如果不存在则加载.env
const envPath = fs.existsSync(path.join(__dirname, '../../.env-dev')) 
  ? path.join(__dirname, '../../.env-dev') 
  : path.join(__dirname, '../../.env');
require('dotenv').config({ path: envPath });

const { generateDailyNews, saveData, loadData } = require('./scraper');

// 路径配置
const PATHS = {
  data: path.join(__dirname, '../data/daily.json'),
  output: path.join(__dirname, '../../docs'),
  archive: path.join(__dirname, '../../docs/archive'),
  css: path.join(__dirname, '../../docs/css'),
  js: path.join(__dirname, '../../docs/js')
};

// HTML 模板 - 清新浅色风格
const TEMPLATE = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="每日日报 - 专注于你关注领域的最新资讯聚合平台">
  <meta name="theme-color" content="#165DFF">
  <title>{{title}}</title>
  <link rel="stylesheet" href="css/style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📰</text></svg>">
</head>
<body>
  <!-- 顶部进度条 -->
  <div id="progress-bar" class="progress-bar"></div>

  <!-- 导航栏 -->
  <header class="header">
    <div class="container">
      <nav class="nav">
        <div class="nav-brand">
          <div class="logo">📰</div>
          <span class="logo-text">每日日报</span>
        </div>
        
        <div class="nav-menu" id="navMenu">
          <a href="/" class="nav-link active">今日日报</a>
          <a href="/archive/" class="nav-link">历史存档</a>
          <button class="theme-toggle" id="themeToggle" aria-label="切换主题">
            <span class="theme-icon">🌙</span>
          </button>
        </div>
        
        <button class="menu-toggle" id="menuToggle" aria-label="菜单">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>
    </div>
  </header>

  <!-- 头部横幅 -->
  <section class="hero">
    <div class="container">
      <div class="hero-content">
        <div class="hero-badge">📅 今日更新</div>
        <h1 class="hero-title">{{dateDisplay}}</h1>
        <p class="hero-subtitle">汇聚 {{totalNews}} 条精选资讯，覆盖 {{categoryCount}} 大领域</p>
        <div class="hero-actions">
          <button class="btn btn-primary" onclick="showSummary()">
            <span>📋</span>
            查看今日汇总
          </button>
          <button class="btn btn-secondary" onclick="scrollToContent()">
            <span>👇</span>
            浏览全部资讯
          </button>
        </div>
      </div>
    </div>
  </section>

  <!-- 主内容区 -->
  <main class="main" id="mainContent">
    <div class="container">
      <!-- 数据统计 -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">{{totalNews}}</div>
          <div class="stat-label">今日资讯</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{categoryCount}}</div>
          <div class="stat-label">领域分类</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">24h</div>
          <div class="stat-label">实时更新</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">⭐</div>
          <div class="stat-label">精选内容</div>
        </div>
      </div>

      <!-- 分类标签页 -->
      <div class="tabs-container">
        <div class="tabs-scroll">
          <div class="tabs" id="categoryTabs">
            <button class="tab-btn active" data-category="all">
              <span>📰</span>
              全部
            </button>
            {{tabButtons}}
          </div>
        </div>
      </div>

      <!-- 资讯内容 -->
      <div class="content-container">
        {{content}}
      </div>
    </div>
  </main>

  <!-- 页脚 -->
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <div class="footer-brand">
            <div class="logo">📰</div>
            <span class="logo-text">每日日报</span>
          </div>
          <p class="footer-desc">
            自动化资讯聚合平台，每日为你收集各领域最新动态，让你轻松掌握行业趋势。
          </p>
        </div>
        
        <div class="footer-section">
          <h4>快速导航</h4>
          <ul class="footer-links">
            <li><a href="/">今日日报</a></li>
            <li><a href="/archive/">历史存档</a></li>
            <li><a href="#">关于我们</a></li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h4>关注领域</h4>
          <ul class="footer-links">
            {{footerCategories}}
          </ul>
        </div>
        
        <div class="footer-section">
          <h4>订阅更新</h4>
          <p class="footer-desc">每天第一时间获取最新资讯</p>
          <form class="subscribe-form">
            <input type="email" placeholder="输入邮箱地址" class="subscribe-input">
            <button type="submit" class="btn btn-primary">订阅</button>
          </form>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; 2026 每日日报. All rights reserved. 更新时间: {{updateTime}}</p>
        <div class="footer-links">
          <a href="#">隐私政策</a>
          <a href="#">使用条款</a>
        </div>
      </div>
    </div>
  </footer>

  <!-- 日报汇总弹窗 -->
  <div class="modal" id="summaryModal">
    <div class="modal-overlay" onclick="closeSummary()"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h2>📋 今日日报汇总</h2>
        <button class="modal-close" onclick="closeSummary()">✕</button>
      </div>
      <div class="modal-body" id="summaryContent">
        <!-- 汇总内容将通过JS动态加载 -->
        <div class="summary-loading">加载中...</div>
      </div>
    </div>
  </div>

  <script src="js/app.js"></script>
</body>
</html>`;

// 生成分类标签按钮
function generateTabButtons(data) {
  return data.categories.map(cat => 
    `<button class="tab-btn" data-category="${cat.id}">
      <span>${cat.icon}</span>
      ${cat.name}
    </button>`
  ).join('');
}

// 生成页脚分类链接
function generateFooterCategories(data) {
  return data.categories.map(cat => 
    `<li><a href="#${cat.id}">${cat.icon} ${cat.name}</a></li>`
  ).join('');
}

// 生成新闻内容HTML
function generateNewsContent(data) {
  const tagColors = {
    ai: 'tag-ai',
    tech: 'tag-tech',
    business: 'tag-business',
    web3: 'tag-web3',
    health: 'tag-health',
    green: 'tag-green'
  };
  
  return data.categories.map(cat => {
    const newsHTML = cat.items.map(item => `
      <article class="news-card" data-category="${cat.id}">
        <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="news-link">
          <div class="news-image">
            <img src="${item.image || `https://picsum.photos/seed/${item.title}/600/400`}" 
                 alt="${item.title}" 
                 loading="lazy">
            <div class="news-tag ${tagColors[cat.id]}">${item.tag}</div>
          </div>
          <div class="news-content">
            <h3 class="news-title">${item.title}</h3>
            <p class="news-summary">${item.summary}</p>
            <div class="news-meta">
              <span class="news-source">
                <span>📰</span>
                ${item.source}
              </span>
              <span class="news-time">
                <span>⏰</span>
                ${item.time}
              </span>
            </div>
          </div>
        </a>
      </article>
    `).join('');
    
    return `
      <section class="category-section" id="${cat.id}">
        <div class="category-header">
          <div class="category-title">
            <span class="category-icon">${cat.icon}</span>
            ${cat.name}
          </div>
          <span class="category-count">${cat.items.length} 条</span>
        </div>
        <div class="news-grid">
          ${newsHTML}
        </div>
      </section>
    `;
  }).join('');
}

// 生成完整HTML
function generateHTML(data) {
  const totalNews = data.categories.reduce((sum, cat) => sum + cat.items.length, 0);
  const categoryCount = data.categories.length;
  
  return TEMPLATE
    .replace('{{title}}', `每日日报 - ${data.date.date}`)
    .replace('{{dateDisplay}}', data.date.display)
    .replace(/{{totalNews}}/g, totalNews)
    .replace(/{{categoryCount}}/g, categoryCount)
    .replace('{{tabButtons}}', generateTabButtons(data))
    .replace('{{footerCategories}}', generateFooterCategories(data))
    .replace('{{content}}', generateNewsContent(data))
    .replace('{{updateTime}}', new Date(data.generatedAt).toLocaleString('zh-CN'));
}

// 保存历史存档
function saveArchive(data) {
  if (!fs.existsSync(PATHS.archive)) {
    fs.mkdirSync(PATHS.archive, { recursive: true });
  }
  
  const archiveFile = path.join(PATHS.archive, `${data.date.date}.html`);
  // 修正存档页面的资源路径和导航链接
  let html = generateHTML(data);
  html = html.replace('css/style.css', '../css/style.css');
  html = html.replace('js/app.js', '../js/app.js');
  html = html.replace('data/summary.json', '../data/summary.json');
  html = html.replace('href="/"', 'href="/"');
  html = html.replace('href="/archive/"', 'href="/archive/"');
  fs.writeFileSync(archiveFile, html, 'utf-8');
  console.log(`📁 已保存存档: ${archiveFile}`);
  
  // 更新存档索引
  updateArchiveIndex();
}

// 更新存档索引页面
function updateArchiveIndex() {
  if (!fs.existsSync(PATHS.archive)) return;
  
  const files = fs.readdirSync(PATHS.archive)
    .filter(f => f.endsWith('.html') && f !== 'index.html')
    .sort()
    .reverse();
  
  const listHTML = files.map(file => {
    const date = file.replace('.html', '');
    const displayDate = new Date(date).toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      weekday: 'long' 
    });
    
    return `
      <div class="archive-item">
        <div class="archive-date">
          <span class="archive-day">${new Date(date).getDate()}</span>
          <span class="archive-month">${new Date(date).toLocaleDateString('zh-CN', { month: 'short' })}</span>
        </div>
        <div class="archive-info">
          <h3 class="archive-title">${displayDate}</h3>
          <p class="archive-desc">当日日报内容</p>
        </div>
        <a href="${file}" class="archive-link">查看 →</a>
      </div>
    `;
  }).join('');
  
  const archiveIndexHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>历史存档 - 每日日报</title>
  <link rel="stylesheet" href="../css/style.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
  <div class="progress-bar"></div>

  <header class="header">
    <div class="container">
      <nav class="nav">
        <div class="nav-brand">
          <div class="logo">📰</div>
          <span class="logo-text">每日日报</span>
        </div>
        
        <div class="nav-menu">
          <a href="/" class="nav-link">今日日报</a>
          <a href="/archive/" class="nav-link active">历史存档</a>
          <button class="theme-toggle" id="themeToggle" aria-label="切换主题">
            <span class="theme-icon">🌙</span>
          </button>
        </div>
      </nav>
    </div>
  </header>

  <section class="hero">
    <div class="container">
      <div class="hero-content">
        <div class="hero-badge">📚 历史存档</div>
        <h1 class="hero-title">历史日报归档</h1>
        <p class="hero-subtitle">共 ${files.length} 期历史日报，随时查阅过往资讯</p>
      </div>
    </div>
  </section>

  <main class="main">
    <div class="container">
      <div class="archive-list">
        ${listHTML}
      </div>
      
      <div class="text-center mt-60">
        <a href="/" class="btn btn-primary">
          <span>←</span>
          返回今日日报
        </a>
      </div>
    </div>
  </main>

  <footer class="footer">
    <div class="container">
      <div class="footer-bottom">
        <p>&copy; 2026 每日日报. All rights reserved.</p>
      </div>
    </div>
  </footer>

  <script src="../js/app.js"></script>
</body>
</html>`;
  
  fs.writeFileSync(path.join(PATHS.archive, 'index.html'), archiveIndexHTML, 'utf-8');
  console.log('📝 已更新存档索引');
}

// 确保必要目录存在
function ensureDirectories() {
  const dirs = [PATHS.output, PATHS.archive, PATHS.css, PATHS.js];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📂 创建目录: ${dir}`);
    }
  });
}

// 生成简单的汇总数据
function generateSummary(data) {
  const summary = {
    date: data.date,
    overall: `今日日报共收录 ${data.categories.reduce((sum, cat) => sum + cat.items.length, 0)} 条资讯，覆盖 ${data.categories.length} 个领域，为你提供各行业最新动态。`,
    categories: data.categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      summary: `${cat.name}领域今日共有 ${cat.items.length} 条重要资讯，涵盖行业最新动态和技术突破。`,
      highlights: cat.items.slice(0, 3).map(item => item.title)
    }))
  };
  
  const summaryPath = path.join(PATHS.output, 'data', 'summary.json');
  const summaryDir = path.dirname(summaryPath);
  
  if (!fs.existsSync(summaryDir)) {
    fs.mkdirSync(summaryDir, { recursive: true });
  }
  
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf-8');
  console.log('📋 汇总数据已生成');
}

// 主函数
async function main() {
  console.log('🚀 每日日报生成器 v1.0\n');
  
  const useReal = process.argv.includes('--real') || process.argv.includes('-r');
  const archiveFlag = process.argv.includes('--archive') || process.argv.includes('-a');
  
  try {
    // 确保目录存在
    ensureDirectories();
    
    // 生成数据
    const data = await generateDailyNews(useReal);
    
    // 保存JSON数据
    saveData(data, PATHS.data);
    
    // 生成并保存HTML
    const html = generateHTML(data);
    fs.writeFileSync(path.join(PATHS.output, 'index.html'), html, 'utf-8');
    
    console.log(`\n✅ 日报已生成: ${path.join(PATHS.output, 'index.html')}`);
    
    // 生成汇总数据
    generateSummary(data);
    
    // 保存存档
    if (archiveFlag) {
      saveArchive(data);
    }
    
    console.log('\n🎉 生成完成！');
    
  } catch (error) {
    console.error('❌ 生成失败:', error.message);
    process.exit(1);
  }
}

// 导出函数
module.exports = {
  generateHTML,
  generateTabButtons,
  generateFooterCategories,
  generateNewsContent,
  saveArchive,
  updateArchiveIndex
};

// 直接运行
if (require.main === module) {
  main();
}
