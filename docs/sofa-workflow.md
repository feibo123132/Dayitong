# SOFA 对齐落地流程（music-hub）

你现在可以把流程压缩成两件人工操作：

1. 提供 `音频 + 歌词文本`。
2. 在页面里做最终人工校正（如果需要）。

其余步骤（SOFA 推理、TextGrid 转 LRC）都可由一条命令自动完成。

## 自动化能力（已完成）

1. 页面支持上传 `.lrc/.txt` 并按时间戳滚动高亮。
2. 页面支持导出当前歌词为标准 `.lrc`。
3. 新增 `tools/sofa_auto_pipeline.py`：一键执行
   音频 + 歌词文本 -> SOFA 推理 -> TextGrid -> 行级 LRC。
4. 保留 `tools/sofa_textgrid_to_lrc.py`，可单独做 TextGrid 转 LRC。

## 你只需要做什么

1. 准备音频文件（与页面播放版本一致）。
2. 准备歌词文本文件（每行一句，不带时间戳）。
3. 运行一条自动化命令（下文给出）。
4. 在页面上传生成的 LRC，人工微调后导出最终版。

## 一键自动化命令

先配置 SOFA 路径（一次即可）：

```bash
# Windows PowerShell
$env:SOFA_ROOT="D:\\path\\to\\SOFA"
$env:SOFA_CKPT="D:\\path\\to\\checkpoints\\sofa.pth"
```

然后执行：

```bash
pnpm run lyrics:auto -- \
  --audio D:\\path\\to\\song.wav \
  --lyrics D:\\path\\to\\song-lines.txt \
  --output D:\\path\\to\\song.auto.lrc
```

脚本会自动：

1. 生成 SOFA 所需 `trans.lab`。
2. 调用 `infer.py` 产出 TextGrid。
3. 把 TextGrid 转成行级 LRC。

## 上传与人工校正

1. 打开 `/#/original-music-box/song-5`。
2. 点击右上角“上传”，导入生成的 `.lrc`。
3. 播放核对对齐效果。
4. 需要微调时，重复自动化命令（可换歌词切分）。
5. 确认后点击“导出”保存最终 LRC。

## 进阶参数（可选）

```bash
pnpm run lyrics:auto -- \
  --audio <audio> \
  --lyrics <lyrics-txt> \
  --output <output-lrc> \
  --gpu 0 \
  --pause-threshold 0.35 \
  --tier words \
  --keep-workdir
```

- `--pause-threshold`：行切分敏感度（大=更少切分，小=更敏感）。
- `--tier`：手动指定 TextGrid tier。
- `--keep-workdir`：保留中间文件，便于排查。

## 仅转换已有 TextGrid（无需再跑 SOFA）

```bash
pnpm run lyrics:auto -- \
  --audio D:\\path\\to\\song.wav \
  --lyrics D:\\path\\to\\song-lines.txt \
  --output D:\\path\\to\\song.from-textgrid.lrc \
  --textgrid D:\\path\\to\\song.TextGrid
```

## 常见问题

1. 整体慢半拍/快半拍：
必须保证对齐音频与页面播放音频是同一文件。

2. 某段明显不准：
把歌词拆成更短行再跑一次自动化流程。

3. 没找到 TextGrid：
检查 `SOFA_ROOT`、`SOFA_CKPT` 是否正确，且 SOFA 推理是否成功。