# 愿望池 × 飞书 CLI 汇总接入

本项目已实现前端“发给JIEYOU”后的同步钩子：

- 前端本地落库：`Dayitong_song_requests`
- 可选飞书同步：POST 到 `VITE_JIEYOU_WISH_SYNC_ENDPOINT`
- 后端网关脚本：`tools/feishu-wish-sync-server.mjs`

## 1. 已完成的代码能力

1. 前端会在点击“发给JIEYOU”后构造结构化 payload（分类、内容、时间、用户信息）。
2. 若配置了同步端点，会自动请求同步；未配置则仅本地保存，不影响现有流程。
3. 页面会反馈同步状态：
  - 已提交并同步到飞书汇总
  - 已提交到愿望池，飞书汇总未配置
  - 已提交到愿望池，飞书汇总失败
4. 提供了可直接运行的 CLI 网关服务：
  - 写入飞书多维表格：`lark-cli base +record-upsert`
  - 可选群提醒：`lark-cli im +messages-send --as bot`

## 2. 你需要参与配置的最小步骤

1. 安装并登录飞书 CLI（在网关服务所在机器）：

```bash
lark-cli config init
lark-cli auth login --recommend
```

2. 准备一个“愿望池汇总”多维表格，拿到：
  - `BASE_TOKEN`
  - `TABLE_ID`

3. 在运行网关的机器设置环境变量（示例）：

```bash
set FEISHU_BASE_TOKEN=app_token_xxx
set FEISHU_BASE_TABLE_ID=tbl_xxx
set JIEYOU_SYNC_TOKEN=your_shared_secret
set FEISHU_NOTIFY_CHAT_ID=oc_xxx
set PORT=8787
```

4. 启动网关：

```bash
pnpm wish-sync:server
```

5. 在前端 `.env.local` 补充：

```bash
VITE_JIEYOU_WISH_SYNC_ENDPOINT=http://127.0.0.1:8787/wish/submit
VITE_JIEYOU_WISH_SYNC_TOKEN=your_shared_secret
```

## 3. 建议的飞书汇总方式（最适合你的场景）

1. **主工具：多维表格（Base）**
  - 每条愿望落一行记录（分类、内容、提交时间、用户、状态）。
2. **汇总展示：Base 仪表盘**
  - 分类占比、每日提交趋势、待处理清单。
3. **自动播报：Base 自动化/定时任务**
  - 每天推送“新增愿望摘要”到群。

## 4. CLI 命令参考

- `base +record-upsert` 参考：  
  [lark-base-record-upsert](https://raw.githubusercontent.com/larksuite/cli/main/skills/lark-base/references/lark-base-record-upsert.md)
- `im +messages-send` 参考：  
  [lark-im-messages-send](https://raw.githubusercontent.com/larksuite/cli/main/skills/lark-im/references/lark-im-messages-send.md)
- 数据汇总查询（可做日报）参考：  
  [lark-base-data-query](https://raw.githubusercontent.com/larksuite/cli/main/skills/lark-base/references/lark-base-data-query.md)
