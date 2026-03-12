#!/usr/bin/env python3
"""
Convert SOFA TextGrid alignment output to LRC.

Typical usage:
  python tools/sofa_textgrid_to_lrc.py \
    --textgrid ./sofa_out/song.TextGrid \
    --output ./sofa_out/song.lrc

Optional line-level mode (recommended):
  python tools/sofa_textgrid_to_lrc.py \
    --textgrid ./sofa_out/song.TextGrid \
    --lyrics ./lyrics/song-lines.txt \
    --output ./sofa_out/song-lines.lrc
"""

from __future__ import annotations

import argparse
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


@dataclass
class Interval:
    start: float
    end: float
    text: str


@dataclass
class Tier:
    name: str
    kind: str
    intervals: list[Interval]


def parse_textgrid(textgrid_path: Path) -> list[Tier]:
    content = textgrid_path.read_text(encoding="utf-8")
    item_pattern = re.compile(r"item \[\d+\]:\s*(.*?)(?=\n\s*item \[\d+\]:|\Z)", re.S)
    class_pattern = re.compile(r'class\s*=\s*"([^"]+)"')
    name_pattern = re.compile(r'name\s*=\s*"([^"]*)"')
    interval_pattern = re.compile(
        r'intervals \[\d+\]:\s*xmin\s*=\s*([0-9eE+.\-]+)\s*xmax\s*=\s*([0-9eE+.\-]+)\s*text\s*=\s*"(.*?)"',
        re.S,
    )

    tiers: list[Tier] = []
    for block in item_pattern.findall(content):
        class_match = class_pattern.search(block)
        if not class_match:
            continue

        kind = class_match.group(1)
        name_match = name_pattern.search(block)
        name = name_match.group(1) if name_match else ""

        intervals: list[Interval] = []
        if kind == "IntervalTier":
            for start, end, raw_text in interval_pattern.findall(block):
                text = raw_text.replace('""', '"').replace("\n", " ").strip()
                intervals.append(Interval(float(start), float(end), text))

        tiers.append(Tier(name=name, kind=kind, intervals=intervals))

    return tiers


def choose_tier(tiers: Iterable[Tier], tier_name: str | None, drop_re: re.Pattern[str]) -> Tier:
    interval_tiers = [tier for tier in tiers if tier.kind == "IntervalTier" and tier.intervals]
    if not interval_tiers:
        raise ValueError("No IntervalTier found in TextGrid.")

    if tier_name:
        for tier in interval_tiers:
            if tier.name == tier_name:
                return tier
        available = ", ".join(tier.name or "<unnamed>" for tier in interval_tiers)
        raise ValueError(f'Tier "{tier_name}" not found. Available tiers: {available}')

    def useful_count(tier: Tier) -> int:
        return sum(1 for interval in tier.intervals if interval.text and not drop_re.match(interval.text.lower()))

    return max(interval_tiers, key=useful_count)


def filter_intervals(intervals: Iterable[Interval], drop_re: re.Pattern[str], min_duration: float) -> list[Interval]:
    result: list[Interval] = []
    for interval in intervals:
        cleaned = re.sub(r"\s+", " ", interval.text).strip()
        duration = interval.end - interval.start
        if not cleaned:
            continue
        if duration < min_duration:
            continue
        if drop_re.match(cleaned.lower()):
            continue
        result.append(Interval(start=interval.start, end=interval.end, text=cleaned))
    return result


def read_lyrics_lines(path: Path) -> list[str]:
    lines = [line.strip() for line in path.read_text(encoding="utf-8").splitlines()]
    return [line for line in lines if line]


def build_line_level_from_chunks(intervals: list[Interval], lyrics_lines: list[str], pause_threshold: float) -> list[Interval]:
    if not lyrics_lines:
        return []
    if not intervals:
        return [Interval(start=0.0, end=0.0, text=line) for line in lyrics_lines]

    chunk_starts = [intervals[0].start]
    last_end = intervals[0].end
    for interval in intervals[1:]:
        if interval.start - last_end >= pause_threshold:
            chunk_starts.append(interval.start)
        last_end = interval.end

    if len(chunk_starts) >= len(lyrics_lines):
        times = chunk_starts[: len(lyrics_lines)]
    else:
        interval_count = len(intervals)
        denominator = max(len(lyrics_lines) - 1, 1)
        times = []
        for idx in range(len(lyrics_lines)):
            target = round(idx * (interval_count - 1) / denominator)
            times.append(intervals[target].start)

    result: list[Interval] = []
    for idx, line in enumerate(lyrics_lines):
        start = times[idx]
        if idx + 1 < len(times):
            end = times[idx + 1]
        elif intervals:
            end = max(start, intervals[-1].end)
        else:
            end = start
        result.append(Interval(start=start, end=end, text=line))
    return result


def to_lrc_timestamp(seconds: float) -> str:
    safe = max(0.0, seconds)
    minutes = int(safe // 60)
    remain = safe - minutes * 60
    sec = int(remain)
    centisecond = int(round((remain - sec) * 100))
    if centisecond >= 100:
        sec += 1
        centisecond -= 100
    if sec >= 60:
        minutes += 1
        sec -= 60
    return f"{minutes:02d}:{sec:02d}.{centisecond:02d}"


def write_lrc(intervals: list[Interval], output: Path) -> None:
    lines = [f"[{to_lrc_timestamp(interval.start)}]{interval.text}" for interval in intervals]
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text("\n".join(lines), encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Convert SOFA TextGrid alignment to LRC.")
    parser.add_argument("--textgrid", required=True, type=Path, help="Path to TextGrid generated by SOFA.")
    parser.add_argument("--output", required=True, type=Path, help="Output .lrc path.")
    parser.add_argument("--tier", default=None, help="Tier name in TextGrid. Auto-select if omitted.")
    parser.add_argument(
        "--drop-regex",
        default=r"^(sil|sp|spn|pau|<eps>)$",
        help="Regex for labels to ignore. Matched against lowercased interval text.",
    )
    parser.add_argument("--min-duration", type=float, default=0.03, help="Drop intervals shorter than this (seconds).")
    parser.add_argument(
        "--lyrics",
        type=Path,
        default=None,
        help="Optional plain text lyric file (one line per row) to export line-level LRC.",
    )
    parser.add_argument(
        "--pause-threshold",
        type=float,
        default=0.35,
        help="Pause threshold in seconds used when mapping intervals to lyric lines.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if not args.textgrid.exists():
        raise FileNotFoundError(f"TextGrid not found: {args.textgrid}")

    drop_re = re.compile(args.drop_regex, re.I)
    tiers = parse_textgrid(args.textgrid)
    tier = choose_tier(tiers, args.tier, drop_re)
    filtered = filter_intervals(tier.intervals, drop_re, args.min_duration)
    if not filtered:
        raise ValueError(f'No usable intervals found in tier "{tier.name or "<unnamed>"}".')

    if args.lyrics:
        if not args.lyrics.exists():
            raise FileNotFoundError(f"Lyrics file not found: {args.lyrics}")
        lyric_lines = read_lyrics_lines(args.lyrics)
        if not lyric_lines:
            raise ValueError("Lyrics file is empty.")
        lrc_intervals = build_line_level_from_chunks(filtered, lyric_lines, args.pause_threshold)
    else:
        lrc_intervals = filtered

    write_lrc(lrc_intervals, args.output)
    print(f"Tier: {tier.name or '<unnamed>'}")
    print(f"Input intervals: {len(filtered)}")
    print(f"Output LRC lines: {len(lrc_intervals)}")
    print(f"LRC saved to: {args.output}")
    if args.lyrics:
        print("Mode: line-level (with --lyrics)")
    else:
        print("Mode: token-level (without --lyrics)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
