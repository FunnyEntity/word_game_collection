# GitHub Pages 站点创建指南

## 第一步：推送代码到GitHub

### 1. 检查远程仓库设置
```bash
cd WordGame
git remote -v
```

应该显示：
```
origin  https://github.com/FunnyEntity/word_game_collection.git (fetch)
origin  https://github.com/FunnyEntity/word_game_collection.git (push)
```

### 2. 推送代码
```bash
git push -u origin main
```

如果遇到认证问题，可能需要：
- 使用个人访问令牌（Personal Access Token）
- 或者配置SSH密钥

## 第二步：在GitHub上启用Pages

### 1. 访问GitHub仓库
打开浏览器访问：
```
https://github.com/FunnyEntity/word_game_collection
```

### 2. 进入设置页面
- 点击仓库页面上方的 **"Settings"** 选项卡
- 在左侧菜单中找到并点击 **"Pages"**

### 3. 配置GitHub Pages
在 "Build and deployment" 部分：
- **Source**: 选择 **"Deploy from a branch"**
- **Branch**: 选择 **"main"** 分支
- **Folder**: 选择 **"/ (root)"**
- 点击 **"Save"** 按钮

### 4. 等待部署
GitHub Pages 需要几分钟时间来构建和部署您的网站。您会看到类似这样的消息：
```
Your site is published at https://funnyentity.github.io/word_game_collection/
```

## 第三步：验证站点

### 1. 访问您的网站
在浏览器中打开：
```
https://funnyentity.github.io/word_game_collection/
```

### 2. 测试所有功能
- 点击导航按钮测试页面切换
- 测试数独游戏功能
- 测试数织游戏功能  
- 测试数学挑战功能

## 故障排除

### 如果推送失败
```bash
# 强制推送（谨慎使用）
git push -f origin main

# 或者先拉取再推送
git pull origin main
git push origin main
```

### 如果Pages不工作
1. 检查 `.nojekyll` 文件是否存在
2. 确保 `index.html` 在根目录
3. 检查GitHub Actions是否有构建错误
4. 等待更长时间（首次部署可能需要10-15分钟）

### 如果需要更新网站
```bash
# 修改文件后
git add .
git commit -m "更新描述"
git push origin main
```

## 网站URL结构

您的网站页面：
- 主页: `https://funnyentity.github.io/word_game_collection/`
- 数独: `https://funnyentity.github.io/word_game_collection/sudoku.html`
- 数织: `https://funnyentity.github.io/word_game_collection/nonogram.html`
- 数学挑战: `https://funnyentity.github.io/word_game_collection/math.html`

## 注意事项

1. **自定义域名**：可以在Pages设置中添加自定义域名
2. **HTTPS**：GitHub Pages自动提供HTTPS
3. **缓存**：浏览器可能会缓存旧版本，可以强制刷新（Ctrl+F5）
4. **更新**：每次推送代码后，网站会自动更新

---

**您的数字游戏网站将在完成上述步骤后上线！** 🎮
