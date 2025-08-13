# Toolbox - 前端工具盒子

这是一个完全由前端实现的工具盒子，为开发、测试、产品、UI 同学提供便利。

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 8.0.0 或 yarn >= 1.22.0

### 安装依赖

```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install

# 或使用 pnpm
pnpm install
```

### 启动开发服务器

```bash
# 启动开发服务器
npm run dev

# 或
yarn dev

# 或
pnpm dev
```

访问 http://localhost:3000 查看应用。

### 构建生产版本

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 📦 包含的工具

### 一、编码/加密/解密类（8个）

- ✅ **Base64 编码/解码** - 支持文本和文件的Base64编码解码
- ✅ **URL 编码/解码** - URL编码解码工具
- **HTML 实体编码/解码** - HTML实体字符转换
- **Unicode ↔ UTF-8 转换** - Unicode码点与字符互转
- **MD5 哈希** - 计算文本或文件的MD5哈希值
- **SHA 系列哈希** - 支持SHA1/SHA256/SHA512
- **JWT 解析器** - JWT Token解析和验证
- **AES/DES 加密解密** - 对称加密解密工具

### 二、JSON & 数据处理类（10个）

- ✅ **JSON 格式化/压缩** - JSON格式化、压缩、验证和统计
- **JSON 转 CSV** - JSON数据转换为CSV格式
- **CSV 转 JSON** - CSV数据转换为JSON格式
- **JSON ↔ YAML 互转** - JSON与YAML格式互转
- **JSON ↔ XML 互转** - JSON与XML格式互转
- **JSON Schema 验证** - JSON Schema验证和生成
- **JSON Diff** - 两个JSON对象对比
- **字符串大小写转换** - 各种大小写格式转换
- **正则表达式测试器** - 正则匹配测试和高亮
- **UUID 生成器** - UUID生成和验证

### 三、文本处理类（7个）

- **文本对比** - 文本差异对比和高亮
- **文本去重** - 行去重和单词去重
- **文本排序** - 按字母、数字或长度排序
- **单词统计/字数统计** - 文本统计信息
- **文本查找替换** - 支持正则的查找替换
- **文本清理** - 去空格、特殊符号等
- **随机字符串/密码生成器** - 生成安全的随机密码

### 四、UI/设计辅助类（8个）

- **颜色转换** - HEX ↔ RGB ↔ HSL转换
- **颜色取色器** - 从图片中取色
- **渐变色生成器** - CSS渐变色生成
- **图片转 Base64** - 图片转Base64编码
- **图片压缩** - 图片质量和尺寸压缩
- **SVG 转 PNG** - SVG格式转PNG
- **图标提取** - 从SVG/PNG提取图标
- **响应式布局计算器** - px↔rem/vw单位转换

### 五、产品/文档类（1个）

- **Markdown ↔ HTML 转换** - Markdown与HTML互转

### 六、开发调试类（9个）

- **HTTP 请求模拟器** - HTTP请求测试工具
- **WebSocket 测试工具** - WebSocket连接测试
- **Cron 表达式解析器** - Cron表达式解析和生成
- **时间戳转换** - 时间戳与日期互转
- **时区时间查询** - 世界时区时间查询
- **Diff 工具** - 文件和字符串对比
- **HTML/JS/CSS 压缩格式化** - 前端代码格式化压缩
- **XML 格式化/压缩** - XML格式化和压缩
- **SQL 格式化/美化** - SQL语句格式化

## 🛠 技术栈

- **前端框架**: Vue 3.4+ (Composition API)
- **开发语言**: TypeScript 5.0+
- **构建工具**: Vite 5.0+
- **状态管理**: Pinia 2.0+
- **路由管理**: Vue Router 4.0+
- **UI组件库**: Element Plus 2.4+
- **工具库**: VueUse 10.0+

## 📁 项目结构

```
toolbox/
├── public/                 # 静态资源
├── src/                   # 源代码
│   ├── components/        # 通用组件
│   │   ├── base/         # 基础组件
│   │   └── layout/       # 布局组件
│   ├── views/            # 页面视图
│   │   ├── tools/        # 工具页面
│   │   └── Home.vue      # 首页
│   ├── stores/           # Pinia状态管理
│   ├── utils/            # 工具函数
│   │   ├── crypto/       # 加密相关
│   │   └── format/       # 格式化
│   ├── config/           # 配置文件
│   ├── types/            # TypeScript类型定义
│   ├── router/           # 路由配置
│   └── styles/           # 样式文件
├── plan/                 # 项目规划文档
├── package.json          # 依赖配置
├── vite.config.ts        # Vite配置
└── tsconfig.json         # TypeScript配置
```

## ✨ 特性

- 🔒 **隐私安全** - 所有数据处理都在客户端完成，不上传服务器
- 📱 **响应式设计** - 完美适配桌面端和移动端
- 🌙 **暗黑模式** - 支持亮色/暗色主题切换
- 💾 **历史记录** - 自动保存工具使用历史
- ⭐ **收藏功能** - 收藏常用工具
- 🔍 **快速搜索** - 全局工具搜索
- ⚡ **性能优化** - 代码分割、懒加载、缓存策略
- 🎨 **美观界面** - 现代化的UI设计

## 🚧 开发进度

- [x] 项目基础架构搭建
- [x] 基础组件开发
- [x] 布局和导航
- [x] Base64 编码/解码工具
- [x] URL 编码/解码工具
- [x] JSON 格式化/压缩工具
- [ ] 其他编码/加密工具
- [ ] 文本处理工具
- [ ] UI/设计辅助工具
- [ ] 开发调试工具
- [ ] 性能优化
- [ ] 测试覆盖

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 开发规范

### 代码规范

- 使用 ESLint + Prettier 统一代码风格
- TypeScript 严格模式
- 组件采用 Composition API
- 遵循 Vue 3 最佳实践

### 提交规范

```
feat: 新功能
fix: 修复Bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建/工具链相关
```

### 组件开发规范

1. 每个工具独立成组件
2. 使用 TypeScript 进行类型定义
3. 响应式设计，适配移动端
4. 完善的错误处理
5. 用户友好的交互提示

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

---

如果这个工具对你有帮助，请给个 ⭐ Star 支持一下！