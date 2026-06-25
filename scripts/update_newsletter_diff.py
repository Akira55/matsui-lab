#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""松井暉の研究活動から、ニュースレター掲載候補の差分を生成するスクリプト。

正本 ``data/activities.yml`` を読み込み、基準日(base_date)から終了日(end_date)
までに該当する活動を抽出して、以下のファイルを UTF-8 で出力する。

    newsletter/latest.txt
    newsletter/latest.json
    newsletter/history/<end_date>.txt
    newsletter/history/<end_date>.json

基準日は次の優先順位で決定する:
    1. --base-date 引数
    2. config/newsletter.yml の base_date
    3. --cycle-anchor-day 引数(end_date 以前で最も近い該当日)
    4. config/newsletter.yml の cycle_anchor_day(同上)

GitHub Actions 上での実行を想定し、警告/エラーはワークフローコマンド
(``::warning::`` / ``::error::``)でログに出す。
"""

from __future__ import annotations

import argparse
import calendar
import datetime as dt
import json
import sys
from pathlib import Path

try:
    import yaml
except ImportError:  # pragma: no cover
    sys.stderr.write(
        "::error::PyYAML が見つかりません。`pip install -r requirements.txt` を実行してください。\n"
    )
    sys.exit(1)

try:
    from zoneinfo import ZoneInfo  # Python 3.9+
except ImportError:  # pragma: no cover
    sys.stderr.write("::error::zoneinfo が利用できません。Python 3.9 以上が必要です。\n")
    sys.exit(1)


# リポジトリルート(このファイルは scripts/ 直下にある想定)
ROOT = Path(__file__).resolve().parent.parent
ACTIVITIES_PATH = ROOT / "data" / "activities.yml"
CONFIG_PATH = ROOT / "config" / "newsletter.yml"
OUTPUT_DIR = ROOT / "newsletter"
HISTORY_DIR = OUTPUT_DIR / "history"

# data/activities.yml 内のソースパス表記(JSON の "source" に入れる)
SOURCE_LABEL = "data/activities.yml"

DEFAULT_TIMEZONE = "Asia/Tokyo"
DEFAULT_ANCHOR_DAY = 25
DEFAULT_UNKNOWN_LABEL = "その他"


def log_warning(message: str, title: str = "newsletter") -> None:
    """GitHub Actions のログに警告を出す。"""
    sys.stderr.write("::warning title={}::{}\n".format(title, message))


def fail(message: str) -> "NoReturn":  # type: ignore[name-defined]
    """致命的エラーを GitHub Actions のログに出して終了する。"""
    sys.stderr.write("::error::{}\n".format(message))
    sys.exit(1)


def parse_date_str(value: str, field_label: str) -> dt.date:
    """``YYYY-MM-DD`` 形式の文字列を date に変換する。失敗時は致命的エラー。"""
    try:
        return dt.datetime.strptime(value.strip(), "%Y-%m-%d").date()
    except (ValueError, AttributeError):
        fail("{} の日付が不正です(YYYY-MM-DD 形式): {!r}".format(field_label, value))


def coerce_item_date(raw, title: str):
    """活動項目の date を date に変換する。

    PyYAML はクオートの有無で str / datetime.date のどちらでも返しうるため
    両方を受け付ける。不正な場合は警告して None を返す(その項目はスキップ)。
    """
    if raw is None:
        log_warning("date が未設定のため除外しました: {!r}".format(title))
        return None
    if isinstance(raw, dt.datetime):
        return raw.date()
    if isinstance(raw, dt.date):
        return raw
    if isinstance(raw, str):
        try:
            return dt.datetime.strptime(raw.strip(), "%Y-%m-%d").date()
        except ValueError:
            log_warning(
                "date が不正(YYYY-MM-DD 形式ではない)のため除外しました: "
                "{!r} (date={!r})".format(title, raw)
            )
            return None
    log_warning(
        "date の型が不正のため除外しました: {!r} (date={!r})".format(title, raw)
    )
    return None


def load_yaml(path: Path):
    if not path.exists():
        fail("必要なファイルが見つかりません: {}".format(path))
    try:
        with path.open("r", encoding="utf-8") as f:
            return yaml.safe_load(f)
    except yaml.YAMLError as exc:
        fail("YAML の読み込みに失敗しました ({}): {}".format(path, exc))


def clamp_day_to_month(year: int, month: int, day: int) -> int:
    """指定月に存在しない日(31 と 2月 など)を末日へ丸める。"""
    last = calendar.monthrange(year, month)[1]
    return min(day, last)


def cycle_base_date(end_date: dt.date, anchor_day: int) -> dt.date:
    """end_date 以前で最も近い「毎月 anchor_day 日」を返す。"""
    if not 1 <= anchor_day <= 31:
        fail("cycle_anchor_day は 1〜31 で指定してください: {!r}".format(anchor_day))

    year, month = end_date.year, end_date.month
    day = clamp_day_to_month(year, month, anchor_day)
    candidate = dt.date(year, month, day)
    if candidate <= end_date:
        return candidate

    # 当月の基準日が end_date より後 → 前月の基準日
    if month == 1:
        year, month = year - 1, 12
    else:
        month -= 1
    day = clamp_day_to_month(year, month, anchor_day)
    return dt.date(year, month, day)


def resolve_base_date(args, config, end_date):
    """基準日とその決定方法(source)を返す。"""
    # 1. --base-date
    if args.base_date:
        return parse_date_str(args.base_date, "--base-date"), "argument"

    # 2. config の base_date
    cfg_base = config.get("base_date")
    if cfg_base:
        if isinstance(cfg_base, (dt.date, dt.datetime)):
            base = cfg_base.date() if isinstance(cfg_base, dt.datetime) else cfg_base
        else:
            base = parse_date_str(str(cfg_base), "config/newsletter.yml: base_date")
        return base, "config"

    # 3/4. cycle_anchor_day(引数 > config)
    anchor = args.cycle_anchor_day
    if anchor is None:
        anchor = config.get("cycle_anchor_day", DEFAULT_ANCHOR_DAY)
    try:
        anchor = int(anchor)
    except (TypeError, ValueError):
        fail("cycle_anchor_day は整数で指定してください: {!r}".format(anchor))
    return cycle_base_date(end_date, anchor), "cycle_anchor_day"


def japanese_date(d: dt.date) -> str:
    return "{}年{}月{}日".format(d.year, d.month, d.day)


def item_to_json(item: dict, item_date: dt.date) -> dict:
    """出力用の項目辞書を作る(存在するフィールドのみ含める)。"""
    out = {
        "title": item.get("title", ""),
        "category": item.get("category", ""),
        "date": item_date.isoformat(),
    }
    for key in ("venue", "location", "details", "role", "url"):
        value = item.get(key)
        if value:
            out[key] = value
    return out


def render_item_text(item: dict) -> str:
    """1 項目を 1 行のテキストにする。"""
    title = item.get("title", "")
    line = "「{}」".format(title)

    venue = item.get("venue")
    if venue:
        line += " {}".format(venue)

    # （YYYY年M月D日、於：location）
    paren = japanese_date(dt.date.fromisoformat(item["date"]))
    location = item.get("location")
    if location:
        paren += "、於：{}".format(location)
    line += "（{}）".format(paren)

    extras = [v for v in (item.get("details"), item.get("role")) if v]
    if extras:
        line += "／" + "／".join(extras)

    return "  ・" + line


def build_categories(items, category_order, unknown_label):
    """category_order の順に空配列を用意し、項目を振り分ける。

    未知カテゴリの項目があれば末尾に unknown_label を追加する。
    """
    categories = {name: [] for name in category_order}
    known = set(category_order)
    for item in items:
        cat = item.get("category") or unknown_label
        if cat not in known:
            if unknown_label not in categories:
                categories[unknown_label] = []
            categories[unknown_label].append(item)
        else:
            categories[cat].append(item)
    return categories


def render_text(payload: dict, base_source: str, anchor_day) -> str:
    lines = []
    lines.append("松井暉 研究活動 差分")
    lines.append("=" * 40)
    lines.append("")
    lines.append("対象期間 : {} 〜 {}".format(payload["base_date"], payload["end_date"]))

    if base_source == "cycle_anchor_day":
        method = "cycle_anchor_day={}".format(anchor_day)
    elif base_source == "config":
        method = "config の base_date"
    else:
        method = "--base-date 引数"
    lines.append("基準日   : {}（決定方法: {}）".format(payload["base_date"], method))
    lines.append("生成日時 : {} (JST)".format(payload["generated_at"]))
    lines.append("該当件数 : {}".format(payload["count"]))
    lines.append("")

    if payload["count"] == 0:
        lines.append("(対象期間に該当する活動はありません)")
        lines.append("")
    else:
        for category, entries in payload["categories"].items():
            if not entries:
                continue
            lines.append("【{}】".format(category))
            for entry in entries:
                lines.append(render_item_text(entry))
            lines.append("")

    return "\n".join(lines).rstrip("\n") + "\n"


def write_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        f.write(content)


def write_json(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="ニュースレター掲載候補の差分を生成する。"
    )
    parser.add_argument("--base-date", help="対象期間の開始日 (YYYY-MM-DD)。")
    parser.add_argument("--end-date", help="対象期間の終了日 (YYYY-MM-DD)。未指定なら JST 本日。")
    parser.add_argument(
        "--cycle-anchor-day",
        type=int,
        help="月次サイクルの基準日 (1-31)。base_date 未指定時のみ使用。",
    )
    args = parser.parse_args()

    config = load_yaml(CONFIG_PATH) or {}
    raw_data = load_yaml(ACTIVITIES_PATH) or {}

    tz_name = config.get("timezone", DEFAULT_TIMEZONE)
    try:
        tz = ZoneInfo(tz_name)
    except Exception as exc:  # noqa: BLE001
        fail("timezone が不正です: {!r} ({})".format(tz_name, exc))

    today = dt.datetime.now(tz).date()

    # 終了日
    if args.end_date:
        end_date = parse_date_str(args.end_date, "--end-date")
    else:
        end_date = today

    # 基準日
    base_date, base_source = resolve_base_date(args, config, end_date)

    if base_date > end_date:
        fail(
            "基準日が終了日より後です: base_date={} > end_date={}".format(
                base_date, end_date
            )
        )

    # 有効な anchor 値(JSON 出力用)
    anchor_day = args.cycle_anchor_day
    if anchor_day is None:
        anchor_day = config.get("cycle_anchor_day", DEFAULT_ANCHOR_DAY)

    activities = raw_data.get("activities")
    if activities is None:
        log_warning("data/activities.yml に activities: が見つかりません。空として扱います。")
        activities = []
    if not isinstance(activities, list):
        fail("data/activities.yml の activities: はリストである必要があります。")

    # 期間内の項目を抽出
    selected = []
    for item in activities:
        if not isinstance(item, dict):
            log_warning("項目が辞書ではないためスキップしました: {!r}".format(item))
            continue
        title = item.get("title", "(無題)")
        item_date = coerce_item_date(item.get("date"), title)
        if item_date is None:
            continue
        if base_date <= item_date <= end_date:
            selected.append(item_to_json(item, item_date))

    # 日付昇順(古い→新しい)に並べ替え
    selected.sort(key=lambda it: it["date"])

    category_order = config.get("category_order") or []
    unknown_label = config.get("unknown_category_label", DEFAULT_UNKNOWN_LABEL)
    categories = build_categories(selected, category_order, unknown_label)

    payload = {
        "generated_at": today.isoformat(),
        "base_date": base_date.isoformat(),
        "end_date": end_date.isoformat(),
        "base_date_source": base_source,
        "cycle_anchor_day": int(anchor_day),
        "source": SOURCE_LABEL,
        "count": len(selected),
        "categories": categories,
        "raw_text_url": config.get("raw_text_url", ""),
        "raw_json_url": config.get("raw_json_url", ""),
    }

    text = render_text(payload, base_source, anchor_day)

    # 出力(latest と当日スナップショット)
    write_text(OUTPUT_DIR / "latest.txt", text)
    write_json(OUTPUT_DIR / "latest.json", payload)
    write_text(HISTORY_DIR / "{}.txt".format(end_date.isoformat()), text)
    write_json(HISTORY_DIR / "{}.json".format(end_date.isoformat()), payload)

    print(
        "Generated newsletter diff: {} 件 "
        "(対象期間 {} 〜 {}, base_date_source={})".format(
            len(selected), base_date, end_date, base_source
        )
    )


if __name__ == "__main__":
    main()
