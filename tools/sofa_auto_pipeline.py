#!/usr/bin/env python3
"""
One-command pipeline for:
audio + plain lyrics -> SOFA alignment -> TextGrid -> line-level LRC.

User only needs to provide:
1) audio file
2) lyrics text file (one line per lyric sentence)

Then import generated LRC in app and do manual fine-tuning if needed.
"""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path


def read_lines(path: Path) -> list[str]:
    lines = [line.strip() for line in path.read_text(encoding="utf-8").splitlines()]
    return [line for line in lines if line]


def ensure_file(path: Path, name: str) -> None:
    if not path.exists() or not path.is_file():
        raise FileNotFoundError(f"{name} not found: {path}")


def run_command(cmd: list[str], cwd: Path | None = None) -> None:
    printable = " ".join(cmd)
    print(f"\n$ {printable}")
    subprocess.run(cmd, cwd=str(cwd) if cwd else None, check=True)


def find_latest_textgrid(search_root: Path, start_ts: float) -> Path | None:
    candidates: list[Path] = []
    for path in search_root.rglob("*.TextGrid"):
        try:
            if path.stat().st_mtime >= start_ts:
                candidates.append(path)
        except OSError:
            continue
    if not candidates:
        return None
    return max(candidates, key=lambda p: p.stat().st_mtime)


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="SOFA one-command auto pipeline (audio + lyrics -> lrc).")
    parser.add_argument("--audio", required=True, type=Path, help="Path to vocal audio file.")
    parser.add_argument(
        "--lyrics",
        required=True,
        type=Path,
        help="Path to plain lyric text file (one line per row, no timestamp).",
    )
    parser.add_argument("--output", required=True, type=Path, help="Output LRC file path.")
    parser.add_argument(
        "--sofa-root",
        type=Path,
        default=Path(os.environ.get("SOFA_ROOT", "")) if os.environ.get("SOFA_ROOT") else None,
        help="SOFA repo root path (contains infer.py). Can also use env SOFA_ROOT.",
    )
    parser.add_argument(
        "--ckpt",
        type=Path,
        default=Path(os.environ.get("SOFA_CKPT", "")) if os.environ.get("SOFA_CKPT") else None,
        help="SOFA checkpoint path (.pth). Can also use env SOFA_CKPT.",
    )
    parser.add_argument("--gpu", default="0", help="GPU id for SOFA infer. Default: 0")
    parser.add_argument(
        "--tier",
        default=None,
        help="Optional TextGrid tier name passed to sofa_textgrid_to_lrc.py",
    )
    parser.add_argument(
        "--pause-threshold",
        default="0.35",
        help="Pause threshold (seconds) for line-level mapping. Default: 0.35",
    )
    parser.add_argument(
        "--workdir",
        type=Path,
        default=Path(".cache/sofa-auto"),
        help="Temporary workspace root. Default: .cache/sofa-auto",
    )
    parser.add_argument(
        "--keep-workdir",
        action="store_true",
        help="Keep temporary workspace after success.",
    )
    parser.add_argument(
        "--textgrid",
        type=Path,
        default=None,
        help="If provided, skip SOFA infer and convert this TextGrid directly.",
    )
    return parser.parse_args(argv)


def main() -> int:
    argv = sys.argv[1:]
    if argv and argv[0] == "--":
        argv = argv[1:]
    args = parse_args(argv)

    ensure_file(args.audio, "Audio file")
    ensure_file(args.lyrics, "Lyrics file")
    lyric_lines = read_lines(args.lyrics)
    if not lyric_lines:
        raise ValueError(f"Lyrics file is empty: {args.lyrics}")

    project_root = Path(__file__).resolve().parents[1]
    converter_path = project_root / "tools" / "sofa_textgrid_to_lrc.py"
    ensure_file(converter_path, "Converter script")

    args.output.parent.mkdir(parents=True, exist_ok=True)

    if args.textgrid:
        ensure_file(args.textgrid, "TextGrid file")
        textgrid_path = args.textgrid
        temp_dir = None
        lines_path = args.lyrics
    else:
        if not args.sofa_root:
            raise ValueError("Missing --sofa-root (or env SOFA_ROOT).")
        if not args.ckpt:
            raise ValueError("Missing --ckpt (or env SOFA_CKPT).")
        ensure_file(args.sofa_root / "infer.py", "SOFA infer.py")
        ensure_file(args.ckpt, "SOFA checkpoint")

        args.workdir.mkdir(parents=True, exist_ok=True)
        temp_dir = Path(tempfile.mkdtemp(prefix="run-", dir=str(args.workdir.resolve())))
        print(f"Workspace: {temp_dir}")

        audio_copy = temp_dir / args.audio.name
        shutil.copy2(args.audio, audio_copy)

        lines_path = temp_dir / "lyrics-lines.txt"
        lines_path.write_text("\n".join(lyric_lines), encoding="utf-8")

        trans_path = temp_dir / "trans.lab"
        trans_path.write_text(" ".join(lyric_lines), encoding="utf-8")

        start_ts = time.time()
        infer_cmd = [
            sys.executable,
            "infer.py",
            "--vocal_path",
            str(audio_copy.resolve()),
            "--trans_path",
            str(trans_path.resolve()),
            "--ckpt_path",
            str(args.ckpt.resolve()),
            "--gpu",
            str(args.gpu),
            "--out_formats",
            "textgrid",
        ]
        run_command(infer_cmd, cwd=args.sofa_root.resolve())

        textgrid_path = find_latest_textgrid(temp_dir, start_ts)
        if not textgrid_path:
            textgrid_path = find_latest_textgrid(args.sofa_root.resolve(), start_ts)

        if not textgrid_path:
            raise FileNotFoundError("SOFA finished but no new TextGrid found. Please check SOFA output settings.")

        print(f"Detected TextGrid: {textgrid_path}")

    convert_cmd = [
        sys.executable,
        str(converter_path.resolve()),
        "--textgrid",
        str(textgrid_path.resolve()),
        "--lyrics",
        str(lines_path.resolve()),
        "--output",
        str(args.output.resolve()),
        "--pause-threshold",
        str(args.pause_threshold),
    ]
    if args.tier:
        convert_cmd.extend(["--tier", args.tier])

    run_command(convert_cmd, cwd=project_root)

    print("\nDone.")
    print(f"LRC output: {args.output.resolve()}")
    print("Next step: Upload this LRC in /#/original-music-box/song-5 and do manual fine-tuning if needed.")

    if args.textgrid is None and temp_dir and not args.keep_workdir:
        shutil.rmtree(temp_dir, ignore_errors=True)
        print("Temporary workspace removed.")
    elif args.textgrid is None and temp_dir:
        print(f"Temporary workspace kept: {temp_dir}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())