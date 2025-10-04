# pipeline_csv.py
import os, csv, re, hashlib
import feedparser
from dateutil import parser as dtparser
from datetime import timezone
from extractor import extract_full_article, sha256
from settings import (
    FEEDS, SOURCE_ID, CSV_PATH, MIN_CONTENT_CHARS,
    PER_FEED_LIMIT, USE_LOCAL, LOCAL_MODEL, MAX_SUMMARY_CHARS
)

# === 날짜 파싱 ===
def parse_pubdate(e):
    for k in ("published", "updated", "created"):
        v = getattr(e, k, None)
        if v:
            d = dtparser.parse(v)
            return d if d.tzinfo else d.replace(tzinfo=timezone.utc)
    return None

# === 저자 추정(휴리스틱) ===
def extract_author(title: str, content: str) -> str:
    txt = f"{title or ''} {content or ''}"
    if not txt.strip():
        return ""
    pats = [
        r'([가-힣]{2,4})\s?(선임|수석|경제|사회|정치|문화|IT|과학|산업|디지털)?\s?(인턴)?\s?(특파원|기자)',
        r'By\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)'
    ]
    for p in pats:
        m = re.search(p, txt)
        if m:
            return m.group(1).strip()
    return ""

# === 추출 요약(폴백) ===
def summarize_extractive(title: str, content: str, max_chars=300) -> str:
    base = (content or "").strip() or (title or "").strip()
    if not base:
        return ""
    parts = re.split(r'[.!?]|다\s|요\s', base)
    parts = [s.strip() for s in parts if s.strip()]
    s = " ".join(parts[:3])
    return (s[:max_chars] + "…") if len(s) > max_chars else s

# === 로컬(KoBART) 요약 ===
def summarize(title: str, content: str) -> str:
    if USE_LOCAL:
        try:
            from summarize_local import summarize_local
            out = summarize_local(title, content, LOCAL_MODEL, MAX_SUMMARY_CHARS)
            if out:
                return out
        except Exception:
            pass
    return summarize_extractive(title, content, MAX_SUMMARY_CHARS)

# === 저장 전용 중복 제거(원본문은 건드리지 않음) ===
from difflib import SequenceMatcher
from collections import Counter

def _norm_line(s: str) -> str:
    s = re.sub(r"\s+", " ", s).strip()
    return s.replace("“", '"').replace("”", '"').replace("’", "'").replace("‘", "'")

def _split_sents_safe(text: str):
    tmp = re.sub(r'([.!?][\"\')]|[.!?]|다\.)\s+', r'\1\n', text)
    return [s.strip() for s in tmp.split("\n") if s.strip()]

def dedupe_for_storage(text: str, sim_th: float = 0.90) -> str:
    if not text:
        return ""
    # 1) 문단(줄) 중복 제거 + 인접 유사 제거
    lines = [l for l in re.split(r"\r?\n|<br\s*/?>", text) if l and l.strip()]
    uniq, seen = [], set()
    for ln in lines:
        n = _norm_line(ln)
        if len(n) < 3:
            continue
        key = hashlib.sha1(n.encode("utf-8")).hexdigest()
        if key in seen:
            continue
        if uniq and SequenceMatcher(None, uniq[-1], n).ratio() >= sim_th:
            continue
        seen.add(key)
        uniq.append(n)
    # 2) 문장 중복 제거(완전 동일 문장 1회만)
    sents = _split_sents_safe("\n".join(uniq))
    cnt = Counter(sents)
    out, seen_sent = [], set()
    for s in sents:
        if cnt[s] > 1:
            if s in seen_sent:
                continue
            seen_sent.add(s)
        out.append(s)
    return "\n".join(out)

def run_once():
    rows = []
    for feed_url, category in FEEDS.items():
        d = feedparser.parse(feed_url)
        count = 0
        for e in d.entries:
            if count >= PER_FEED_LIMIT:
                break  # 카테고리별 제한

            url = getattr(e, "link", "") or ""
            if not url:
                continue

            art = extract_full_article(url)
            title = art["title"] or (getattr(e, "title", "") or "").strip()

            # 원본문(요약용)은 그대로 보존
            raw_content = art["content"] or ""

            # 저장용 본문 후보(너무 짧으면 RSS summary로 보강)
            rss_sum = (getattr(e, "summary", "") or getattr(e, "description", "") or "").strip()
            chosen_for_storage = rss_sum if (len(raw_content) < MIN_CONTENT_CHARS and len(rss_sum) > len(raw_content)) else raw_content

            # 요약은 원본문(길이 유지) 기준
            summary = summarize(title, raw_content if raw_content.strip() else chosen_for_storage)

            # 저장 직전에만 중복 제거
            content_clean = dedupe_for_storage(chosen_for_storage)

            author = extract_author(title, content_clean)

            rows.append({
                "url": art["url"],
                "source": SOURCE_ID,
                "url_hash": sha256(art["url"]),
                "category": category,
                "published_at": art.get("published_at") or "",
                "rss_published_at": parse_pubdate(e).isoformat() if parse_pubdate(e) else "",
                "title": title,
                "content": content_clean,   # 저장은 깔끔본
                "author": author,
                "summary": summary,         # 요약은 원본문 기반
                "image_main": art.get("image_main") or "",
                "image_urls": ";".join(art.get("image_urls") or []),
            })
            count += 1
    return rows

def export_csv(rows):
    os.makedirs(os.path.dirname(CSV_PATH), exist_ok=True)
    with open(CSV_PATH, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow([
            "url","source","url_hash","category",
            "published_at","rss_published_at",
            "title","content","author","summary",
            "image_main","image_urls"
        ])
        for r in rows:
            w.writerow([
                r["url"], r["source"], r["url_hash"], r["category"],
                r["published_at"], r["rss_published_at"],
                r["title"].replace("\n"," ").strip(),
                r["content"].replace("\n"," ").strip(),
                r["author"], r["summary"],
                r["image_main"], r["image_urls"]
            ])
    print(f"saved: {CSV_PATH} ({len(rows)} rows)")

if __name__ == "__main__":
    rows = run_once()
    export_csv(rows)
