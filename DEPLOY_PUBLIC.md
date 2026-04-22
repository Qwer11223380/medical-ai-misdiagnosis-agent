# 公网部署指南（H5 静态站）

## 目标
将当前项目发布为公网可访问链接，用于比赛演示。

## 方案 A：Cloudflare Pages（推荐）

1. 新建 GitHub 仓库并上传当前目录全部文件
2. 打开 Cloudflare Dashboard -> Pages -> Create project
3. 连接 GitHub 仓库
4. 构建配置：
- Framework preset: None
- Build command: 留空
- Build output directory: /
5. 点击 Deploy
6. 获取 `https://<project>.pages.dev` 公网链接

## 方案 B：Netlify

1. 将项目推送到 GitHub
2. 打开 Netlify -> Add new site -> Import from Git
3. 构建配置：
- Build command: 留空
- Publish directory: /
4. 点击 Deploy
5. 获取 `https://<project>.netlify.app` 公网链接

## 上线前检查

1. 资料文件是否已脱敏（PDF/DOCX/图片会被公开访问）
2. 页面是否可以正常“加载目录资料”
3. 免费模型是否可调用（已内置重试与本地兜底）
4. 是否能导出训练记录 JSON/CSV

## 演示建议

1. 先完成第一幕到第四幕一次完整闭环
2. 导出 JSON/CSV 展示训练过程证据
3. 强调“仅教学用途，不构成医疗建议”
