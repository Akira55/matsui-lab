#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""松井暉の研究活動を月ごとのニュースレターファイルに書き出すスクリプト。

入力:
    data/activities.yml         researchmap 由来(scripts/build-activities.mjs が生成)
    data/activities.manual.yml  手動補足(任意)。url 一致で上書き、無ければ追加

出力(月ごと。YYYY-MM 単位):
    newsletter/txt/<YYYY-MM>.txt
    newsletter/json/<YYYY-MM>.json
    newsletter/index.json       生成済みの月の一覧

出力内容は決定的(実行日時などを含めない)にしてある。これにより、ある月の
活動が変わったときだけその月のファイルが変化し、git では「変わった月だけ」が
コミットされる。

設定 config/newsletter.yml:
    start_month            これより前の月は生成しない (YYYY-MM)
    raw_base_url           raw 配信のベース URL
    category_order         カテゴリの表示順
    unknown_category_label 未知カテゴリの見出し

GitHub Actions 上での実行を想定し、警告は ``::warning::`` でログに出す。
"""

from __future__ import annotations

import datetime as dt
import json
import re
import sys
from pathlib import Path

try:
    import yaml
except ImportError:  # pragma: no cover
    sys.stderr.write(
        "::error::PyYAML が見つかりません。`pip install -r requirements.txt` を実行してください。\n"
    )
    sys.exit(1)


ROOT = Path(__file__).resolve().parent.parent
CONFIG_PATH = ROOT / "config" / "newsletter.yml"
AUTO_PATH = ROOT / "data" / "activities.yml"
MANUAL_PATH = ROOT / "data" / "activities.manual.yml"

OUTPUT_DIR = ROOT / "newsletter"
TXT_DIR = OUTPUT_DIR / "txt"
JSON_DIR = OUTPUT_DIR / "json"

SOURCE_LABEL = "researchmap (data/activities.yml) + data/activities.manual.yml"
DEFAULT_UNKNOWN_LABEL = "その他"

MONTH_RE = re.compile(r"^(\d{4})-(\d{2})")
YMD_RE = re.compile(r"^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?")


def log_warning(message: str, title: str = "newsletter") -> None:
    sys.stderr.write("::warning title={}::{}\n".format(title, message))


def fail(message: str) -> "NoReturn":  # type: ignore[name-defined]
    sys.stderr.write("::error::{}\n".format(message))
    sys.exit(1)


def load_yaml(path: Path, required: bool):
    if not path.exists():
        if required:
            fail("必要なファイルが見つかりません: {}".format(path))
        return {}
    try:
        with path.open("r", encoding="utf-8") as f:
            return yaml.safe_load(f) or {}
    except yaml.YAMLError as exc:
        fail("YAML の読み込みに失敗しました ({}): {}".format(path, exc))


def normalize_date(raw, title: str):
    """date を 'YYYY-MM-DD' / 'YYYY-MM' / 'YYYY' の文字列にする。不正なら None。"""
    if raw is None:
        return None
    if isinstance(raw, dt.datetime):
        return raw.date().isoformat()
    if isinstance(raw, dt.date):
        return raw.isoformat()
    if isinstance(raw, str):
        s = raw.strip()
        if YMD_RE.match(s):
            return s
        log_warning("date が不正なため除外しました: {!r} (date={!r})".format(title, raw))
        return None
    log_warning("date の型が不正なため除外しました: {!r} (date={!r})".format(title, raw))
    return None


def activity_key(item: dict) -> str:
    url = item.get("url")
    if url:
        return "url:{}".format(url)
    return "td:{}|{}".format(item.get("title", ""), item.get("date", ""))


def load_activities() -> list:
    """auto + manual を読み込み、manual を優先してマージする。"""
    auto = load_yaml(AUTO_PATH, required=True).get("activities") or []
    manual = load_yaml(MANUAL_PATH, required=False).get("activities") or []

    if not isinstance(auto, list):
        fail("data/activities.yml の activities: はリストである必要があります。")
    if not isinstance(manual, list):
        fail("data/activities.manual.yml の activities: はリストである必要があります。")

    merged = {}
    for item in auto:
        if isinstance(item, dict):
            merged[activity_key(item)] = item
    for item in manual:
        if not isinstance(item, dict):
            continue
        key = activity_key(item)
        if key in merged:
            # 既存の自動項目に手動フィールドを上書きマージ(指定したフィールドだけ直せる)
            combined = dict(merged[key])
            combined.update({k: v for k, v in item.items() if v is not None})
            merged[key] = combined
        else:
            merged[key] = item
    return list(merged.values())


def japanese_date(date_str: str) -> str:
    m = YMD_RE.match(date_str)
    year, month, day = m.group(1), m.group(2), m.group(3)
    out = "{}年".format(int(year))
    if month:
        out += "{}月".format(int(month))
    if day:
        out += "{}日".format(int(day))
    return out


def item_to_json(item: dict, date_str: str) -> dict:
    out = {
        "title": item.get("title", ""),
        "category": item.get("category", ""),
        "date": date_str,
    }
    for key in ("venue", "location", "details", "role", "url"):
        value = item.get(key)
        if value:
            out[key] = value
    return out


def render_item_text(item: dict) -> str:
    line = "「{}」".format(item.get("title", ""))
    venue = item.get("venue")
    if venue:
        line += " {}".format(venue)

    paren = japanese_date(item["date"])
    location = item.get("location")
    if location:
        paren += "、於：{}".format(location)
    line += "（{}）".format(paren)

    extras = [v for v in (item.get("details"), item.get("role")) if v]
    if extras:
        line += "／" + "／".join(extras)
    return "  ・" + line


def build_categories(items, category_order, unknown_label):
    categories = {name: [] for name in category_order}
    known = set(category_order)
    for item in items:
        cat = item.get("category") or unknown_label
        if cat not in known:
            categories.setdefault(unknown_label, [])
            categories[unknown_label].append(item)
        else:
            categories[cat].append(item)
    return categories


def render_text(month: str, categories: dict, count: int) -> str:
    year, mon = month.split("-")
    lines = []
    lines.append("松井暉 研究活動 {}年{}月".format(int(year), int(mon)))
    lines.append("=" * 40)
    lines.append("")
    lines.append("該当件数 : {}".format(count))
    lines.append("")
    if count == 0:
        lines.append("(この月に該当する活動はありません)")
    else:
        for category, entries in categories.items():
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


def clear_month_files(directory: Path, suffix: str) -> None:
    """既存の YYYY-MM.<suffix> を消す(月が空になった場合に残骸を残さない)。"""
    if not directory.exists():
        return
    for p in directory.glob("[0-9][0-9][0-9][0-9]-[0-9][0-9]{}".format(suffix)):
        p.unlink()


def main() -> None:
    config = load_yaml(CONFIG_PATH, required=True)
    category_order = config.get("category_order") or []
    unknown_label = config.get("unknown_category_label", DEFAULT_UNKNOWN_LABEL)
    raw_base = (config.get("raw_base_url") or "").rstrip("/")
    start_month = config.get("start_month")
    if isinstance(start_month, (dt.date, dt.datetime)):
        start_month = start_month.strftime("%Y-%m")
    start_month = str(start_month) if start_month else None

    activities = load_activities()

    # 月ごとにグループ化
    by_month = {}
    for item in activities:
        if not isinstance(item, dict):
            log_warning("項目が辞書ではないためスキップしました: {!r}".format(item))
            continue
        title = item.get("title", "(無題)")
        date_str = normalize_date(item.get("date"), title)
        if date_str is None:
            continue
        m = MONTH_RE.match(date_str)
        if not m:
            # 年のみ(YYYY)の項目は月次ニュースレターの対象外
            continue
        month = "{}-{}".format(m.group(1), m.group(2))
        if start_month and month < start_month:
            continue
        item = dict(item)
        item["date"] = date_str
        by_month.setdefault(month, []).append(item)

    # 既存の月ファイルを一旦クリアしてから書き直す
    clear_month_files(TXT_DIR, ".txt")
    clear_month_files(JSON_DIR, ".json")

    index_months = []
    for month in sorted(by_month.keys(), reverse=True):
        items = sorted(by_month[month], key=lambda it: (it["date"], it.get("title", "")))
        categories = build_categories(items, category_order, unknown_label)
        raw_text_url = "{}/txt/{}.txt".format(raw_base, month) if raw_base else ""
        raw_json_url = "{}/json/{}.json".format(raw_base, month) if raw_base else ""

        payload = {
            "month": month,
            "source": SOURCE_LABEL,
            "count": len(items),
            "categories": categories,
            "raw_text_url": raw_text_url,
            "raw_json_url": raw_json_url,
        }
        write_text(TXT_DIR / "{}.txt".format(month), render_text(month, categories, len(items)))
        write_json(JSON_DIR / "{}.json".format(month), payload)
        index_months.append({
            "month": month,
            "count": len(items),
            "txt_url": raw_text_url,
            "json_url": raw_json_url,
        })

    write_json(OUTPUT_DIR / "index.json", {
        "source": SOURCE_LABEL,
        "start_month": start_month,
        "months": index_months,
    })

    print("Generated {} monthly newsletter file(s): {}".format(
        len(index_months), ", ".join(mi["month"] for mi in index_months) or "(none)"
    ))


if __name__ == "__main__":
    main()
