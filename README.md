# Gist uTools 插件

一个用于管理 GitHub Gist 的 uTools 插件，让你可以快速创建、查看、编辑和删除 Gist。

## 功能特性

- 📝 创建和编辑 Gist
- 🗑️ 删除 Gist
- 🔍 搜索 Gist
- 👀 查看 Gist 内容，支持代码高亮
- 🌐 快速打开 Gist 网页版
- 🎨 支持多种编程语言

## 技术栈

- Vue 3
- TypeScript
- Arco Design Vue
- Vite
- Highlight.js
- Axios

## 使用方法

1. 在 uTools 中安装本插件
2. 首次使用需要设置 GitHub Token：
   - 访问 [GitHub Token 设置页面](https://github.com/settings/tokens)
   - 点击 "Generate new token (classic)"
   - 为 token 添加描述
   - 选择 "gist" 权限
   - 点击 "Generate token" 生成
   - 将生成的 token 复制到插件中保存

3. 使用关键字 "gist" 呼出插件
4. 功能说明：
   - 点击右下角 "+" 按钮创建新的 Gist
   - 使用顶部搜索框搜索 Gist
   - 点击 Gist 卡片展开查看内容
   - 使用卡片右上角按钮进行编辑或删除操作

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build
```


## 许可证

[MIT License](LICENSE)
