# Portfolio — 知行旅人 · 作品集

个人作品集展示页，纯静态，通过 `config.json` 配置。

## 使用方法

1. 编辑 `config.json` 添加作品
2. 将图片放入 `assets/` 目录
3. 推送到 GitHub，Pages 自动部署

## config.json 结构

```json
{
  "profile": {
    "name": "你的名字",
    "title": "你的头衔",
    "avatar": "assets/avatar.jpg",
    "bio": "一句话介绍",
    "links": {
      "github": "https://github.com/xxx",
      "blog": "https://xxx.com"
    }
  },
  "categories": [
    { "id": "miniapp", "name": "小程序", "icon": "📱" }
  ],
  "works": [
    {
      "id": "unique-id",
      "title": "作品名",
      "description": "简短描述",
      "category": "miniapp",
      "tags": ["标签1"],
      "image": "assets/screenshot.png",
      "qrcode": "assets/qrcode.png",
      "link": "https://project-url.com",
      "featured": true
    }
  ],
  "theme": {
    "primaryColor": "#00d4ff",
    "accentColor": "#7c3aed",
    "bgColor": "#0a0a1a"
  }
}
```

## 本地预览

```bash
python -m http.server 8080
# 打开 http://localhost:8080
```

## 特性

- 🎨 玻璃拟态 + 粒子背景 + 暗色/亮色切换
- 📱 支持作品二维码弹窗展示
- 🏷️ 分类筛选 + 标签
- ⭐ 精选置顶
- 📱 响应式设计
- ⚡ 零依赖，纯静态
