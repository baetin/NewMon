# pipeline_csv.py

import os, csv, re
import feedparser
from dateutil import parser as dtparser
from datetime import timezone
from typing import List
import numpy as np

from extractor import extract_full_article, sha256
from settings import (
    FEEDS, SOURCE_ID, CSV_PATH, MIN_CONTENT_CHARS,
    PER_FEED_LIMIT, USE_LOCAL, LOCAL_MODEL, MAX_SUMMARY_CHARS,
    # 의미기반 요약 설정
    USE_SEMANTIC_SUMMARY, SEM_MODEL_NAME, SEM_MAX_SENTENCES, SEM_MIN_SENT_LEN
)

# sentence-transformers / sklearn은 선택 설치
try:
    from sentence_transformers import SentenceTransformer
    from sklearn.metrics.pairwise import cosine_similarity
    _SEM_MODEL = None  # lazy init
except Exception:
    _SEM_MODEL = None  # 미설치 시 False로 대체해 폴백하게 함

# NEW: 가벼운 맞춤법/띄어쓰기 교정기(Hanspell) — 미설치면 자동 무시
try:
    from hanspell import spell_checker  # pip install py-hanspell
    _HAS_HANSPELL = True
except Exception:
    spell_checker = None
    _HAS_HANSPELL = False

# NEW: 요약 후 문장 폴리시(교정) 함수
def _polish_summary(text: str) -> str:
    if not text:
        return text
    out = text.strip()
    # 1) Hanspell 교정(가능할 때만)
    if _HAS_HANSPELL:
        try:
            out = spell_checker.check(out).checked
        except Exception:
            pass
    # 2) 공백 정리
    out = re.sub(r"\s+", " ", out).strip()
    # 3) 끝맺음 기호 보정(문장 마지막이 기호로 끝나지 않으면 마침표 추가)
    if out and not re.search(r"[\.!?…]$", out):
        out += "."
    return out

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

# ===== 의미기반(벡터) 요약 유틸 =====
_SENT_SPLIT = re.compile(r'(?<=[.!?])\s+|(?<=다)\s+|(?<=요)\s+|(?<=입니다)\s+')

def _split_sents_kor(text: str) -> List[str]:
    text = (text or "").strip()
    if not text:
        return []
    sents = [s.strip() for s in _SENT_SPLIT.split(text) if s and len(s.strip()) > 0]
    sents = [re.sub(r'\s+', ' ', s).strip() for s in sents if len(s.strip()) >= SEM_MIN_SENT_LEN]
    # 앞 40자로 간단 중복 제거
    seen, uniq = set(), []
    for s in sents:
        k = s[:40]
        if k not in seen:
            seen.add(k)
            uniq.append(s)
    return uniq

def _ensure_sem_model():
    global _SEM_MODEL
    if _SEM_MODEL is None:
        try:
            _SEM_MODEL = SentenceTransformer(SEM_MODEL_NAME)
        except Exception:
            _SEM_MODEL = False
    return _SEM_MODEL

# Maximal Marginal Relevance: 질의와 유사하면서 상호중복 적은 문장 k개 선택
def _mmr_select(query_vec: np.ndarray, cand_vecs: np.ndarray, k=2, lambda_div=0.7):
    if cand_vecs.shape[0] == 0:
        return []
    from sklearn.metrics.pairwise import cosine_similarity  # ensure available here
    sim_to_query = cosine_similarity(cand_vecs, query_vec.reshape(1, -1)).ravel()
    selected = [int(np.argmax(sim_to_query))]
    candidates = set(range(cand_vecs.shape[0])) - set(selected)
    while len(selected) < min(k, cand_vecs.shape[0]):
        max_score, max_idx = -1e9, None
        for idx in candidates:
            sim1 = sim_to_query[idx]
            sim2 = 0.0
            if selected:
                sim2 = float(np.max(cosine_similarity(cand_vecs[idx:idx+1], cand_vecs[selected]).ravel()))
            score = lambda_div * sim1 - (1.0 - lambda_div) * sim2
            if score > max_score:
                max_score, max_idx = score, idx
        selected.append(max_idx)
        candidates.remove(max_idx)
    return selected

def summarize_semantic(title: str, content: str, rss_sum: str, max_chars: int) -> str:
    model = _ensure_sem_model()
    if not model:
        return ""  # 모델 불가 시 상위에서 폴백

    # 문장 후보: 본문 → 없으면 RSS → 없으면 제목
    sents = _split_sents_kor(content) or _split_sents_kor(rss_sum) or _split_sents_kor(title)
    if not sents:
        base = (rss_sum or title or "").strip()
        return (base[:max_chars] + "…") if len(base) > max_chars else base

    # 질의: 제목 + RSS요약 결합
    query = f"{(title or '').strip()} {(rss_sum or '').strip()}".strip() or sents[0]

    # 임베딩
    cand_vecs = model.encode(sents, convert_to_numpy=True, normalize_embeddings=True)
    query_vec = model.encode([query], convert_to_numpy=True, normalize_embeddings=True)[0]

    # 상위 문장 선택
    top_idx = _mmr_select(query_vec, cand_vecs, k=SEM_MAX_SENTENCES, lambda_div=0.7)
    picked = [sents[i] for i in top_idx]

    out = " ".join(picked)
    out = re.sub(r'\s+', ' ', out).strip()
    return (out[:max_chars] + "…") if len(out) > max_chars else out

# === 요약 본체 ===
def summarize(title: str, content: str, rss_sum: str = "") -> str:
    # 1) 의미기반(벡터) 요약 먼저 시도
    if USE_SEMANTIC_SUMMARY:
        try:
            out = summarize_semantic(title, content, rss_sum, MAX_SUMMARY_CHARS)
            if out:
                return out
        except Exception:
            pass

    # 2) 로컬(KoBART) 요약 폴백
    if USE_LOCAL:
        try:
            from summarize_local import summarize_local
            out = summarize_local(title, content, LOCAL_MODEL, MAX_SUMMARY_CHARS)
            if out:
                return out
        except Exception:
            pass

    # 3) 추출식 폴백
    base = content or rss_sum or title
    return summarize_extractive(title, base, MAX_SUMMARY_CHARS)

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
            content = art["content"] or ""

            # 너무 짧으면 RSS summary로 보강(옵션)
            rss_sum = (getattr(e, "summary", "") or getattr(e, "description", "") or "").strip()
            if len(content) < MIN_CONTENT_CHARS and len(rss_sum) > len(content):
                content = rss_sum

            author = extract_author(title, content)

            # 의미기반 요약 → KoBART → 추출식
            summary = summarize(title, content, rss_sum=rss_sum)

            # NEW: 요약 후 문장 폴리시(맞춤법/띄어쓰기/끝맺음)
            summary = _polish_summary(summary)

            rows.append({
                "url": art["url"],
                "source": SOURCE_ID,
                "url_hash": sha256(art["url"]),
                "category": category,
                "published_at": art.get("published_at") or "",
                "rss_published_at": parse_pubdate(e).isoformat() if parse_pubdate(e) else "",
                "title": title,
                "content": content,
                "author": author,
                "summary": summary,
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
