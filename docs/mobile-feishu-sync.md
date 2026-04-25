# 手机端飞书同步说明

## 根因

电脑端能同步，是因为电脑浏览器访问 `127.0.0.1:8787` 时，访问的是这台电脑上正在运行的飞书同步网关。

手机端不能同步，是因为手机浏览器访问 `127.0.0.1:8787` 时，访问的是手机自己，不是电脑。因此 GitHub Pages 手机页面不能依赖本机 localhost 网关。

## 正确链路

手机端要同步飞书，前端必须使用一个手机能访问到的公网 HTTPS 地址：

```env
VITE_JIEYOU_WISH_SYNC_PUBLIC_ENDPOINT=https://your-public-gateway.example.com/wish/submit
VITE_JIEYOU_WISH_SYNC_TOKEN=your_shared_secret
```

本地电脑开发仍可继续使用：

```env
VITE_JIEYOU_WISH_SYNC_ENDPOINT=http://127.0.0.1:8787/wish/submit
VITE_JIEYOU_WISH_SYNC_TOKEN=your_shared_secret
```

## GitHub Pages 配置

在 GitHub 仓库中进入 `Settings -> Secrets and variables -> Actions -> Variables`，添加：

```text
VITE_JIEYOU_WISH_SYNC_PUBLIC_ENDPOINT=https://your-public-gateway.example.com/wish/submit
VITE_JIEYOU_WISH_SYNC_TOKEN=your_shared_secret
VITE_TCB_ENV_ID=jieyou-3gr01mvob9ad92de
```

添加后重新运行 GitHub Pages workflow，新的手机端页面才会带上公网同步地址。

## 网关选择

可以先用临时公网隧道验证链路，例如 Cloudflare Tunnel：

```bash
pnpm wish-sync:public
```

脚本会启动本地飞书网关和 Cloudflare Tunnel，并打印：

```text
VITE_JIEYOU_WISH_SYNC_PUBLIC_ENDPOINT=https://...trycloudflare.com/wish/submit
```

把这行里的地址填到 GitHub Actions Variables。

如果提示找不到 `cloudflared`，先安装 Cloudflare Tunnel 客户端，再重新运行 `pnpm wish-sync:public`。

长期使用时，建议换成稳定的公网 HTTPS 网关，例如固定 Cloudflare Tunnel、自有服务器、CloudBase HTTP 服务或其他云函数。

## 安全提醒

不要把 `FEISHU_BASE_TOKEN`、`FEISHU_BASE_TABLE_ID`、飞书应用密钥等服务端凭据放进 `VITE_` 变量。`VITE_` 变量会被打包进前端代码，所有访问者都能看到。
