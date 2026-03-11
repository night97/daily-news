/**
 * Tavily Search API 封装
 */

const axios = require('axios');

class TavilyAPI {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.TAVILY_API_KEY;
    this.baseUrl = 'https://api.tavily.com';
  }

  /**
   * 搜索最新资讯
   * @param {string} query - 搜索关键词
   * @param {number} limit - 返回结果数量
   * @param {string} searchDepth - 搜索深度 ('basic' 或 'advanced')
   * @returns {Promise<Array>} 搜索结果
   */
  async search(query, limit = 10, searchDepth = 'basic') {
    if (!this.apiKey) {
      throw new Error('TAVILY_API_KEY 未配置，请在环境变量中设置');
    }

    try {
      const response = await axios.post(`${this.baseUrl}/search`, {
        api_key: this.apiKey,
        query: query,
        search_depth: searchDepth,
        max_results: limit,
        include_answer: false,
        include_raw_content: false,
        include_images: true,
        time_range: 'day' // 只搜索最近一天的内容
      });

      return response.data.results.map(result => ({
        title: result.title,
        url: result.url,
        summary: result.content,
        source: this.extractSource(result.url),
        image: result.images && result.images.length > 0 ? result.images[0] : null,
        time: this.formatTime(result.published_date || new Date())
      }));
    } catch (error) {
      console.error('Tavily API 搜索失败:', error.message);
      if (error.response) {
        console.error('API 响应:', error.response.data);
      }
      throw error;
    }
  }

  /**
   * 从URL提取来源名称
   * @param {string} url - 网页URL
   * @returns {string} 来源名称
   */
  extractSource(url) {
    try {
      const domain = new URL(url).hostname;
      const parts = domain.replace('www.', '').split('.');
      if (parts.length >= 2) {
        return parts[parts.length - 2];
      }
      return domain;
    } catch {
      return '未知来源';
    }
  }

  /**
   * 格式化时间
   * @param {Date|string} date - 日期对象或字符串
   * @returns {string} 格式化后的时间字符串
   */
  formatTime(date) {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `${diffMins}分钟前`;
    } else if (diffHours < 24) {
      return `${diffHours}小时前`;
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return d.toLocaleDateString('zh-CN');
    }
  }
}

module.exports = TavilyAPI;