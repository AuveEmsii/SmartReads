# Docker 部署指南

## 快速开始

### 1. 构建并运行容器

```bash
# 构建镜像
docker build -t smartreads-web .

# 运行容器
docker run -p 4173:4173 smartreads-web
```

### 2. 使用 Docker Compose（推荐）

```bash
# 构建并启动
docker-compose up --build

# 后台运行
docker-compose up -d --build
```

### 3. 访问应用

打开浏览器访问：http://localhost:4173

## 常用命令

```bash
# 停止容器
docker-compose down

# 查看日志
docker-compose logs -f

# 重新构建
docker-compose build --no-cache
```

## 注意事项

- 确保端口4173未被占用
- 首次构建可能需要几分钟时间
- 生产环境建议配置反向代理（如Nginx）