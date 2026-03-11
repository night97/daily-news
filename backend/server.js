/**
 * 本地开发服务器
 * 用于预览生成的日报页面
 */

const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 静态文件服务
app.use(express.static(path.join(__dirname, '../docs')));

// 路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../docs/index.html'));
});

app.get('/archive', (req, res) => {
  res.sendFile(path.join(__dirname, '../docs/archive/index.html'));
});

// API路由（可选扩展）
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '每日日报服务运行正常' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 本地开发服务器已启动`);
  console.log(`📱 访问地址: http://localhost:${PORT}`);
  console.log(`📚 存档页面: http://localhost:${PORT}/archive`);
  console.log(`\n按 Ctrl+C 停止服务器`);
});