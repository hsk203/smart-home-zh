# 华人智能家居指南 (smart-home-zh)

海外华人智能家居跨区指南：Home Assistant、Aqara / 米家、智能开关与桌面改造。

- zh-CN: https://smarthome.aitech8.com
- zh-Hant: https://smarthome-hant.aitech8.com

基于 [astro-koharu](https://github.com/cosZone/astro-koharu) 主题（v7.7.5），
从 Kanade 模板迁移而来。文章 URL 保持 `/posts/<slug>/` 不变。

## 开发

```bash
pnpm install --frozen-lockfile
pnpm dev
```

## 构建（双语）

```bash
bash scripts/build-all.sh   # 生成 dist-zh-cn/ 与 dist-zh-hant/
```

## 部署

```bash
python3 ~/workspace/goals/goal/hidden_files/run_wrangler.py . deploy
python3 ~/workspace/goals/goal/hidden_files/run_wrangler.py . deploy -c wrangler.zh-hant.toml
```
