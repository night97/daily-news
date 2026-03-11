/**
 * 每日日报 - 前端交互逻辑
 */

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initProgressBar();
  initMobileMenu();
  initCategoryTabs();
  initSmoothScroll();
  initSummaryModal();
  
  // 添加页面载入动画
  document.body.classList.add('loaded');
});

/**
 * 主题切换功能
 */
function initThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = themeToggle?.querySelector('.theme-icon');
  
  // 初始化主题
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  if (themeIcon) {
    themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
  }
  
  // 切换主题
  themeToggle?.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (themeIcon) {
      themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    }
    
    // 添加切换动画
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    setTimeout(() => {
      document.body.style.transition = '';
    }, 300);
  });
}

/**
 * 顶部进度条
 */
function initProgressBar() {
  const progressBar = document.getElementById('progress-bar');
  
  if (!progressBar) return;
  
  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    progressBar.style.width = scrollPercent + '%';
  });
}

/**
 * 移动端菜单
 */
function initMobileMenu() {
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  
  if (!menuToggle || !navMenu) return;
  
  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
  });
  
  // 点击导航链接后关闭菜单
  const navLinks = navMenu.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });
  
  // 点击页面其他区域关闭菜单
  document.addEventListener('click', (e) => {
    if (!menuToggle.contains(e.target) && !navMenu.contains(e.target)) {
      menuToggle.classList.remove('active');
      navMenu.classList.remove('active');
    }
  });
}

/**
 * 分类标签页切换
 */
function initCategoryTabs() {
  const tabs = document.getElementById('categoryTabs');
  
  if (!tabs) return;
  
  const tabButtons = tabs.querySelectorAll('.tab-btn');
  const newsCards = document.querySelectorAll('.news-card');
  
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // 移除所有按钮的active状态
      tabButtons.forEach(b => b.classList.remove('active'));
      // 添加当前按钮的active状态
      btn.classList.add('active');
      
      const category = btn.dataset.category;
      
      // 过滤显示对应的新闻卡片
      newsCards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
          card.style.display = 'block';
          // 添加渐入动画
          card.style.animation = 'fadeIn 0.3s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
      
      // 滚动到内容区域
      const mainContent = document.getElementById('mainContent');
      if (mainContent) {
        mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/**
 * 平滑滚动
 */
function initSmoothScroll() {
  // 处理锚点链接
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

/**
 * 日报汇总弹窗
 */
function initSummaryModal() {
  const modal = document.getElementById('summaryModal');
  const summaryContent = document.getElementById('summaryContent');
  
  if (!modal) return;
  
  // 关闭弹窗
  window.closeSummary = function() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };
  
  // 打开弹窗并加载汇总数据
  window.showSummary = async function() {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    if (!summaryContent) return;
    
    try {
      // 尝试加载汇总数据
      const response = await fetch('data/summary.json');
      if (response.ok) {
        const summary = await response.json();
        renderSummary(summary, summaryContent);
      } else {
        // 如果没有汇总数据，显示提示
        summaryContent.innerHTML = `
          <div style="text-align: center; padding: 40px;">
            <p style="color: var(--text-secondary);">暂无汇总数据，请稍后再试。</p>
          </div>
        `;
      }
    } catch (error) {
      console.error('加载汇总数据失败:', error);
      summaryContent.innerHTML = `
        <div style="text-align: center; padding: 40px;">
          <p style="color: var(--text-secondary);">加载汇总数据失败，请刷新页面重试。</p>
        </div>
      `;
    }
  };
  
  // ESC键关闭弹窗
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeSummary();
    }
  });
}

/**
 * 渲染汇总内容
 */
function renderSummary(summary, container) {
  let html = `
    <div class="summary-overall">
      <p><strong>📅 ${summary.date.display}</strong></p>
      <p>${summary.overall}</p>
    </div>
  `;
  
  summary.categories.forEach(cat => {
    html += `
      <div class="summary-category">
        <h3>
          <span>${cat.icon}</span>
          ${cat.name}
        </h3>
        <p style="color: var(--text-secondary); margin-bottom: 16px;">${cat.summary}</p>
        <ul>
          ${cat.highlights.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

/**
 * 滚动到内容区域
 */
window.scrollToContent = function() {
  const mainContent = document.getElementById('mainContent');
  if (mainContent) {
    mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

/**
 * 图片懒加载（如果需要）
 */
function initLazyLoading() {
  const images = document.querySelectorAll('img[loading="lazy"]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.style.opacity = '0';
          img.onload = () => {
            img.style.transition = 'opacity 0.3s ease';
            img.style.opacity = '1';
          };
          observer.unobserve(img);
        }
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
  }
}

/**
 * 搜索功能（可选扩展）
 */
function initSearch() {
  const searchInput = document.querySelector('.search-input');
  
  if (!searchInput) return;
  
  searchInput.addEventListener('input', (e) => {
    const keyword = e.target.value.toLowerCase();
    const newsCards = document.querySelectorAll('.news-card');
    
    newsCards.forEach(card => {
      const title = card.querySelector('.news-title').textContent.toLowerCase();
      const summary = card.querySelector('.news-summary').textContent.toLowerCase();
      
      if (title.includes(keyword) || summary.includes(keyword)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  });
}

// 导出函数供模板使用
window.DailyReport = {
  showSummary,
  closeSummary,
  scrollToContent
};
