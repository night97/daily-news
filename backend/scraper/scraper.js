/**
 * 数据抓取核心逻辑
 */

const fs = require('fs');
const path = require('path');
const TavilyAPI = require('../utils/tavily-api');

// 优先加载.env-dev，如果不存在则加载.env
const envPath = fs.existsSync(path.join(__dirname, '../../.env-dev')) 
  ? path.join(__dirname, '../../.env-dev') 
  : path.join(__dirname, '../../.env');
require('dotenv').config({ path: envPath });

// 默认分类配置
const DEFAULT_CATEGORIES = [
  { id: 'ai', name: '人工智能', icon: '🤖', keywords: ['人工智能 最新', 'AI 大模型', 'LLM', '生成式AI'] },
  { id: 'tech', name: '科技前沿', icon: '🔬', keywords: ['科技 创新', '前沿技术', '半导体', '量子计算'] },
  { id: 'business', name: '商业动态', icon: '💼', keywords: ['商业 资讯', '创业 融资', '市场动态', '行业趋势'] },
  { id: 'web3', name: 'Web3', icon: '⛓️', keywords: ['区块链', '加密货币', 'Web3', '元宇宙'] },
  { id: 'health', name: '医疗健康', icon: '🏥', keywords: ['医疗 科技', '生物科技', '健康 最新', '医药 创新'] },
  { id: 'green', name: '绿色能源', icon: '🌱', keywords: ['新能源', '碳中和', '环保 科技', '可持续发展'] }
];

class NewsScraper {
  constructor() {
    this.tavily = new TavilyAPI();
    this.limit = process.env.SEARCH_RESULTS_LIMIT ? parseInt(process.env.SEARCH_RESULTS_LIMIT) : 8;
    
    // 加载自定义分类
    if (process.env.CUSTOM_CATEGORIES) {
      try {
        this.categories = JSON.parse(process.env.CUSTOM_CATEGORIES);
      } catch (error) {
        console.warn('自定义分类解析失败，使用默认分类:', error.message);
        this.categories = DEFAULT_CATEGORIES;
      }
    } else {
      this.categories = DEFAULT_CATEGORIES;
    }
  }

  /**
   * 生成模拟数据（用于测试）
   * @returns {Object} 模拟的日报数据
   */
  generateMockData() {
    console.log('📊 生成模拟数据...');
    
    const categories = this.categories.map(category => {
      const items = Array.from({ length: this.limit }, (_, i) => ({
        title: `${category.name}领域最新动态${i + 1}：突破性技术发布，行业格局或将重构`,
        url: `https://example.com/news/${category.id}-${i + 1}`,
        summary: '这是一篇关于' + category.name + '领域的重要资讯，详细介绍了最新的技术突破和行业应用场景，对未来发展趋势具有重要参考价值。内容涵盖技术原理、市场前景、投资机会等多个维度，为行业从业者提供深度洞察。',
        source: ['科技日报', '36氪', '虎嗅', '极客公园', '创业邦'][Math.floor(Math.random() * 5)],
        image: `https://picsum.photos/seed/${category.id}-${i}/600/400`,
        time: `${Math.floor(Math.random() * 12) + 1}小时前`,
        tag: ['重要', '热点', '新品', '融资', '技术'][Math.floor(Math.random() * 5)]
      }));
      
      return {
        ...category,
        items
      };
    });

    const today = new Date();
    return {
      date: {
        date: today.toISOString().split('T')[0],
        display: today.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long'
        })
      },
      generatedAt: today.toISOString(),
      categories
    };
  }

  /**
   * 抓取真实的每日新闻
   * @returns {Promise<Object>} 日报数据
   */
  async fetchDailyNews() {
    console.log('🔍 开始抓取每日新闻...');
    
    const categories = [];
    
    for (const category of this.categories) {
      console.log(`\n📂 正在抓取 [${category.name}] 分类...`);
      
      try {
        // 使用分类的关键词进行搜索
        const query = `${category.keywords.join(' ')} 最新资讯 ${new Date().getFullYear()}年${new Date().getMonth() + 1}月`;
        const results = await this.tavily.search(query, this.limit);
        
        // 处理搜索结果
        const items = results.map((result, index) => ({
          ...result,
          tag: ['重要', '热点', '新品', '技术'][Math.floor(Math.random() * 4)]
        }));
        
        categories.push({
          ...category,
          items
        });
        
        console.log(`✅ [${category.name}] 抓取完成，共 ${items.length} 条资讯`);
      } catch (error) {
        console.error(`❌ [${category.name}] 抓取失败:`, error.message);
        // 抓取失败时使用模拟数据
        const mockItems = Array.from({ length: this.limit }, (_, i) => ({
          title: `${category.name}最新资讯${i + 1}`,
          url: `https://example.com/news/${category.id}-${i + 1}`,
          summary: `${category.name}领域的重要动态，详细内容请点击查看。`,
          source: '网络',
          image: `https://picsum.photos/seed/${category.id}-${i}/600/400`,
          time: '1小时前',
          tag: '资讯'
        }));
        
        categories.push({
          ...category,
          items: mockItems
        });
      }
      
      // 添加延迟，避免API限流
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const today = new Date();
    return {
      date: {
        date: today.toISOString().split('T')[0],
        display: today.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long'
        })
      },
      generatedAt: today.toISOString(),
      categories
    };
  }

  /**
   * 生成每日新闻数据
   * @param {boolean} useRealData - 是否使用真实数据
   * @returns {Promise<Object>} 日报数据
   */
  async generateDailyNews(useRealData = false) {
    if (useRealData && process.env.TAVILY_API_KEY) {
      return await this.fetchDailyNews();
    } else {
      return this.generateMockData();
    }
  }

  /**
   * 保存数据到文件
   * @param {Object} data - 日报数据
   * @param {string} filePath - 保存路径
   */
  saveData(data, filePath) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`💾 数据已保存到: ${filePath}`);
  }

  /**
   * 从文件加载数据
   * @param {string} filePath - 文件路径
   * @returns {Object} 日报数据
   */
  loadData(filePath) {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
    return null;
  }
}

module.exports = {
  NewsScraper,
  DEFAULT_CATEGORIES,
  generateDailyNews: (useRealData = false) => new NewsScraper().generateDailyNews(useRealData),
  saveData: (data, filePath) => new NewsScraper().saveData(data, filePath),
  loadData: (filePath) => new NewsScraper().loadData(filePath)
};