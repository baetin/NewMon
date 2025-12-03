# pipeline_csv.py

import os, csv, re, json, difflib
import feedparser
from dateutil import parser as dtparser
from datetime import timezone, datetime, timedelta
from typing import List
import numpy as np

from extractor import extract_full_article, sha256, parse_datetime, fetch_trending_topics
from settings import (
    FEEDS, SOURCE_ID, CSV_PATH, MIN_CONTENT_CHARS,
    PER_FEED_LIMIT, USE_LOCAL, LOCAL_MODEL, MAX_SUMMARY_CHARS,
    # 기사 누적 설정
    ACCUMULATE_ARTICLES, ACCUMULATE_MAX_ARTICLES, ACCUMULATE_MAX_DAYS,
    # 의미기반 요약 설정
    USE_SEMANTIC_SUMMARY, SEM_MODEL_NAME, SEM_MAX_SENTENCES, SEM_MIN_SENT_LEN,
    # 인기 기사/트렌딩 설정
    COLLECT_TRENDING_TOPICS, TRENDING_LIMIT,
    # 재크롤링 설정
    RECRAWL_EXISTING_ARTICLES, RECRAWL_HOURS_LIMIT, RECRAWL_MAX_ARTICLES,
    # 카테고리 매핑
    CATEGORY_MAP
)

# sentence-transformers / sklearn은 선택 설치
try:
    from sentence_transformers import SentenceTransformer
    from sklearn.metrics.pairwise import cosine_similarity
    _SEM_MODEL = None  # lazy init
except Exception:
    SentenceTransformer = None
    cosine_similarity = None
    _SEM_MODEL = None  # 미설치 시 False로 폴백

# NEW: 가벼운 맞춤법/띄어쓰기 교정기(Hanspell) — 미설치면 자동 무시
try:
    from hanspell import spell_checker  # pip install py-hanspell
    _HAS_HANSPELL = True
except Exception:
    spell_checker = None
    _HAS_HANSPELL = False

# === 상태 저장(JSON) 경로 ===
STATE_PATH = "exports/state_hash.json"

# === 상수 정의 ===
MODIFICATION_THRESHOLD_SECONDS = 120  # 수정 판단 기준 (2분)

def _load_state() -> dict:
    try:
        with open(STATE_PATH, "r", encoding="utf-8") as f:
            return json.load(f)  # {article_id: {...}}
    except Exception:
        return {}

def _save_state(state: dict):
    os.makedirs(os.path.dirname(STATE_PATH), exist_ok=True)
    with open(STATE_PATH, "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False, indent=2)

# === 시간/Diff 유틸 ===
def _now_utc() -> datetime:
    return datetime.now(timezone.utc)

def _minutes_between(a: datetime | None, b: datetime | None) -> int | None:
    if not a or not b:
        return None
    return max(0, int((b - a).total_seconds() // 60))

def _tokenize_words(s: str) -> list[str]:
    s = (s or "").strip()
    if not s:
        return []
    # 한/영/숫자 단순 토큰화
    return re.findall(r"[가-힣A-Za-z0-9]+|[^\s가-힣A-Za-z0-9]", s)

def make_diff_summary(prev_text: str, curr_text: str, max_chars: int = 240) -> str:
    a = _tokenize_words(prev_text)[:2000]
    b = _tokenize_words(curr_text)[:2000]
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=True)
    adds, dels = [], []
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag in ("replace", "insert"):
            frag = " ".join(b[j1:j2]).strip()
            if frag:
                adds.append(f"+{frag}")
        if tag in ("replace", "delete"):
            frag = " ".join(a[i1:i2]).strip()
            if frag:
                dels.append(f"-{frag}")
        if len(" ".join(adds + dels)) > max_chars * 2:
            break
    out = " ".join(adds + dels)
    out = re.sub(r"\s+", " ", out).strip()
    return out[:max_chars] + ("…" if len(out) > max_chars else "")

def rough_similarity(a: str, b: str) -> float:
    a = (a or "").strip()
    b = (b or "").strip()
    if not a and not b: return 1.0
    if not a or not b:  return 0.0
    return difflib.SequenceMatcher(a=a, b=b, autojunk=True).ratio()

# === 유틸: 제목 정규화 키 ===
def normalize_title(t: str) -> str:
    t = (t or "").strip().lower()
    # 괄호/대괄호 내부 부가 표기 삭제
    t = re.sub(r"[\[\(（].*?[\]\)）]", "", t)
    t = re.sub(r"\s+", " ", t)
    return t

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
    # 3) 끝맺음 기호 보정
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
    # 앞 40자 기준 중복 제거
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

# Maximal Marginal Relevance
def _mmr_select(query_vec: np.ndarray, cand_vecs: np.ndarray, k=2, lambda_div=0.7):
    if cand_vecs.shape[0] == 0:
        return []
    # cosine_similarity는 모듈 레벨에서 이미 임포트됨
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

    sents = _split_sents_kor(content) or _split_sents_kor(rss_sum) or _split_sents_kor(title)
    if not sents:
        base = (rss_sum or title or "").strip()
        return (base[:max_chars] + "…") if len(base) > max_chars else base

    query = f"{(title or '').strip()} {(rss_sum or '').strip()}".strip() or sents[0]

    cand_vecs = model.encode(sents, convert_to_numpy=True, normalize_embeddings=True)
    query_vec = model.encode([query], convert_to_numpy=True, normalize_embeddings=True)[0]

    top_idx = _mmr_select(query_vec, cand_vecs, k=SEM_MAX_SENTENCES, lambda_div=0.7)
    picked = [sents[i] for i in top_idx]

    out = " ".join(picked)
    out = re.sub(r'\s+', ' ', out).strip()
    return (out[:max_chars] + "…") if len(out) > max_chars else out

# === 요약 본체 (3단계 폴백 시스템) ===
def summarize(title: str, content: str, rss_sum: str = "") -> str:
    # 1) 의미기반(벡터) 요약
    if USE_SEMANTIC_SUMMARY:
        try:
            out = summarize_semantic(title, content, rss_sum, MAX_SUMMARY_CHARS)
            if out:
                return _polish_summary(out)
        except Exception:
            pass

    # 2) 로컬(KoBART) 요약 폴백
    if USE_LOCAL:
        try:
            from summarize_local import summarize_local
            out = summarize_local(title, content, LOCAL_MODEL, MAX_SUMMARY_CHARS)
            if out:
                return _polish_summary(out)
        except Exception:
            pass

    # 4) 추출식 폴백 (최종)
    base = content or rss_sum or title
    out = summarize_extractive(title, base, MAX_SUMMARY_CHARS)
    return _polish_summary(out)

# ====== 편집(수정) 여부 판정 유틸 ======
# 날짜 파싱은 extractor.parse_datetime 사용
_pd = parse_datetime  # alias for backward compatibility

def _classify_update(published_at: str, modified_at: str, rss_published_at: str) -> str:
    """
    시간 정보만으로 1차 판정:
    - modified_at 있고 published_at 보다 120초 이상 늦으면 'updated_meta'
    - 둘 다 없으면 'unknown'
    """
    pub = _pd(published_at) or _pd(rss_published_at)
    mod = _pd(modified_at)
    if not pub and not mod:
        return "unknown"
    if mod and pub:
        return "updated_meta" if (mod - pub).total_seconds() > MODIFICATION_THRESHOLD_SECONDS else "not_updated"
    if mod and not pub:
        return "updated_meta"
    return "not_updated"

def _edited_flag(status: str) -> int:
    # 본문/메타/최초-이전수정 모두 편집으로 간주
    return 1 if status in ("updated_meta", "updated_content", "updated_before_seen") else 0

def _content_hash(title: str, content: str) -> str:
    """
    제목 변화에 둔감하게 본문 중심 해시.
    공백/제로폭/광고 꼬리문구 정규화로 불필요한 변경 감지 감소.
    """
    t = (content or "").replace("\u200b", "").replace("\xa0", " ")
    t = re.sub(r"\s+", " ", t).strip()
    t = t.replace("ADVERTISEMENT", "").replace("무단 전재 및 재배포 금지", "")
    return sha256(t)

# === 누적 모드: 이전 CSV 로드 ===
def _load_previous_articles() -> dict:
    """
    이전 CSV를 로드하여 article_id → row dict 반환.
    ACCUMULATE_ARTICLES=True일 때만 사용.
    """
    if not ACCUMULATE_ARTICLES:
        return {}

    if not os.path.exists(CSV_PATH):
        return {}

    try:
        existing = {}
        with open(CSV_PATH, "r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                # 새 컬럼명 → 기존 내부 이름으로 매핑
                if "published_date" in row:
                    row["published_at"] = row["published_date"]
                if "crawled_at" in row:
                    row["rss_published_at"] = row["crawled_at"]
                if "focus_area" in row:
                    row["title_key"] = row["focus_area"]
                if "full_text" in row:
                    row["content"] = row["full_text"]
                if "summary_text" in row:
                    row["summary"] = row["summary_text"]
                if "image_url" in row:
                    row["image_main"] = row["image_url"]
                if "image_original_url" in row:
                    row["image_original_url"] = row["image_original_url"]

                article_id = row.get("article_id")
                if article_id:
                    existing[article_id] = row
        return existing
    except Exception as e:
        print(f"[_load_previous_articles] Failed to load {CSV_PATH}: {e}")
        return {}

# === 누적 모드: 오래된 기사 정리 ===
def _prune_old_articles(articles: dict) -> dict:
    """
    ACCUMULATE_MAX_ARTICLES, ACCUMULATE_MAX_DAYS 설정에 따라 오래된 기사 제거.
    """
    if not ACCUMULATE_ARTICLES:
        return articles

    now = _now_utc()
    pruned = {}

    # 날짜순 정렬 (first_seen_ts 기준)
    sorted_articles = sorted(
        articles.items(),
        key=lambda x: x[1].get("published_at") or x[1].get("rss_published_at") or "",
        reverse=True  # 최신 순
    )

    for article_id, row in sorted_articles:
        # 개수 제한
        if ACCUMULATE_MAX_ARTICLES > 0 and len(pruned) >= ACCUMULATE_MAX_ARTICLES:
            break

        # 날짜 제한
        if ACCUMULATE_MAX_DAYS > 0:
            pub_date = _pd(row.get("published_at")) or _pd(row.get("rss_published_at"))
            if pub_date:
                days_old = (now - pub_date).total_seconds() / 86400
                if days_old > ACCUMULATE_MAX_DAYS:
                    continue  # 너무 오래됨

        pruned[article_id] = row

    removed = len(articles) - len(pruned)
    if removed > 0:
        print(f"[prune] Removed {removed} old articles (total: {len(articles)} → {len(pruned)})")

    return pruned

def _recrawl_existing_articles(existing_articles: dict, state: dict, snapshot_ts: datetime, trending_json: str) -> int:
    """
    기존 기사 중 최근 N시간 이내 기사만 URL 재크롤링하여 변경 감지
    Returns: 재크롤링한 기사 수
    """
    if not RECRAWL_EXISTING_ARTICLES:
        return 0

    # RSS에서 가져온 기사는 제외 (이미 최신 상태)
    rss_article_ids = set()
    for feed_url in FEEDS.keys():
        d = feedparser.parse(feed_url)
        for e in d.entries:
            url = getattr(e, "link", "")
            if url:
                article_id = sha256(url)
                rss_article_ids.add(article_id)

    # 재크롤링 대상 선별
    candidates = []
    now = datetime.now(timezone.utc)

    for article_id, row in existing_articles.items():
        # RSS에 있는 기사는 제외
        if article_id in rss_article_ids:
            continue

        # 시간 제한 체크 (RECRAWL_HOURS_LIMIT)
        if RECRAWL_HOURS_LIMIT > 0:
            published_at = row.get("published_at") or row.get("rss_published_at")
            if published_at:
                pub_ts = parse_datetime(published_at)
                if pub_ts:
                    hours_diff = (now - pub_ts).total_seconds() / 3600
                    if hours_diff > RECRAWL_HOURS_LIMIT:
                        continue  # 너무 오래된 기사

        candidates.append((article_id, row))

    # 최대 개수 제한
    if RECRAWL_MAX_ARTICLES > 0:
        candidates = candidates[:RECRAWL_MAX_ARTICLES]

    if not candidates:
        return 0

    print(f"[recrawl] Checking {len(candidates)} existing articles for updates...")

    recrawled_count = 0
    for article_id, row in candidates:
        url = row.get("url")
        if not url:
            continue

        try:
            # URL 직접 재크롤링
            art = extract_full_article(url)
            new_content = art.get("content") or ""
            new_title = art.get("title") or row.get("title")

            # 내용 해시 비교
            new_hash = _content_hash(new_title, new_content)
            old_hash = row.get("content_hash")

            if old_hash and new_hash != old_hash:
                # 변경 감지!
                print(f"[recrawl] Update detected: {article_id[:20]}... - {new_title[:40]}")

                # 기존 row 업데이트
                row["content"] = new_content
                row["title"] = new_title
                row["content_hash"] = new_hash
                row["edited"] = 1
                row["update_status"] = "updated_content"
                row["change_kind"] = "updated_content"

                # change_summary 업데이트
                changed_fields = []
                if row.get("title") != new_title:
                    changed_fields.append("title")
                changed_fields.append("content")

                change_summary = []
                if "title" in changed_fields:
                    change_summary.append("제목 변경")
                if "content" in changed_fields:
                    change_summary.append("본문 변경")
                row["change_summary"] = ", ".join(change_summary)
                row["changed_fields"] = ",".join(changed_fields)

                # modified_at 업데이트
                if art.get("modified_at"):
                    row["modified_at"] = art["modified_at"]

                # state 업데이트
                state[article_id] = {
                    "first_seen_ts": state.get(article_id, {}).get("first_seen_ts") or snapshot_ts.isoformat(),
                    "first_published_at": state.get(article_id, {}).get("first_published_at") or row.get("published_at", ""),
                    "last_seen_ts": snapshot_ts.isoformat(),
                    "last_modified_at": row.get("modified_at") or "",
                    "last_content_hash": new_hash,
                    "last_title": new_title,
                    "last_content_sample": new_content[:1200],
                }

                recrawled_count += 1

        except Exception as e:
            print(f"[recrawl] Error re-crawling {url}: {e}")
            continue

    return recrawled_count

def run_once():
    # ===== 누적 모드: 이전 기사 로드 =====
    existing_articles = _load_previous_articles()  # {article_id: row_dict}
    if ACCUMULATE_ARTICLES and existing_articles:
        print(f"[accumulate] Loaded {len(existing_articles)} existing articles")

    rows = []
    state = _load_state()          # 이전 실행 기준선
    snapshot_ts = _now_utc()       # 이번 실행의 기준 시각

    # ===== 인기 기사/트렌딩 토픽 수집 (1회만) =====
    trending_topics = []
    if COLLECT_TRENDING_TOPICS:
        try:
            trending_topics = fetch_trending_topics(source=SOURCE_ID, limit=TRENDING_LIMIT)
            if trending_topics:
                print(f"[trending] Collected {len(trending_topics)} trending topics: {trending_topics[:2]}...")
        except Exception as e:
            print(f"[trending] Error: {e}")
            trending_topics = []
    trending_json = json.dumps(trending_topics, ensure_ascii=False) if trending_topics else ""

    # ===== 누적 모드: State-CSV 동기화 =====
    if ACCUMULATE_ARTICLES and existing_articles:
        # CSV에만 있고 state에 없는 기사를 state에 추가 (동기화)
        synced_count = 0
        for article_id, row in existing_articles.items():
            if article_id not in state:
                state[article_id] = {
                    "first_seen_ts": row.get("rss_published_at") or row.get("published_at") or "",
                    "first_published_at": row.get("published_at") or "",
                    "last_seen_ts": row.get("rss_published_at") or "",
                    "last_modified_at": row.get("modified_at") or "",
                    "last_content_hash": row.get("content_hash") or "",
                    "last_title": row.get("title") or "",
                    "last_content_sample": (row.get("content") or "")[:1200],
                }
                synced_count += 1
        if synced_count > 0:
            print(f"[accumulate] Synced {synced_count} articles from CSV to state")

    for feed_url, category in FEEDS.items():
        d = feedparser.parse(feed_url)
        count = 0
        for e in d.entries:
            if count >= PER_FEED_LIMIT:
                break  # 카테고리별 제한

            url = getattr(e, "link", "") or ""
            if not url:
                continue

            # 전체 페이지 크롤링/추출 (가능하면 extractor가 canonical_url도 채워주도록)
            art = extract_full_article(url)
            title = art.get("title") or (getattr(e, "title", "") or "").strip()
            content = art.get("content") or ""

            # 너무 짧으면 RSS summary로 보강(옵션)
            rss_sum = (getattr(e, "summary", "") or getattr(e, "description", "") or "").strip()
            if len(content) < MIN_CONTENT_CHARS and len(rss_sum) > len(content):
                content = rss_sum

            author = extract_author(title, content)

            # 4단계 폴백 요약 (내부에서 polish 포함)
            summary = summarize(title, content, rss_sum=rss_sum)

            # ===== 시간/메타 =====
            rss_dt = parse_pubdate(e)                    # feed의 대표 시각
            rss_pub_iso  = rss_dt.isoformat() if rss_dt else ""

            published_at = art.get("published_at") or ""  # extractor가 가능하면 채움
            modified_at  = art.get("modified_at") or ""   # extractor가 가능하면 채움

            # ===== 식별자(제목/URL 변경에도 끊기지 않게) =====
            guid = getattr(e, "id", "") or getattr(e, "guid", "")
            canonical_url = art.get("canonical_url") or art.get("url") or url
            title_key = normalize_title(title)

            # 기존 url_hash 유지 (대시보드 호환), 하지만 state는 article_id(권장)로 관리
            url_hash = sha256(art.get("url") or url)
            article_key_src = canonical_url or url or guid or (art.get("url") or url)
            article_id = sha256(article_key_src)

            # ===== 편집(수정) 여부 계산 =====
            # 1) 시간 기반 1차
            update_status = _classify_update(published_at, modified_at, rss_pub_iso)

            # 2) 내용 기반(상태 파일과 비교)
            chash = _content_hash(title, content)
            # 과거 기록은 article_id 우선, 없으면 url_hash 키로도 조회(이전 호환)
            prev_state = state.get(article_id) or state.get(url_hash)
            if prev_state and prev_state.get("last_content_hash") and prev_state["last_content_hash"] != chash:
                update_status = "updated_content"  # 실제 본문 변경

            edited = _edited_flag(update_status)

            # ===== 델타/변경 요약 생성 =====
            # 과거 상태(가능하면 article_id, 없으면 url_hash 호환)
            prev_state = prev_state or {}

            # 과거 타임스탬프/값들
            first_seen_ts  = _pd(prev_state.get("first_seen_ts")) if prev_state else None
            first_pub_ts   = _pd(prev_state.get("first_published_at")) if prev_state else None
            last_seen_ts   = _pd(prev_state.get("last_seen_ts")) if prev_state else None
            last_mod_ts    = _pd(prev_state.get("last_modified_at")) if prev_state else None
            last_hash      = prev_state.get("last_content_hash")
            last_title     = prev_state.get("last_title", "")
            last_sample    = prev_state.get("last_content_sample", "")  # 이전 본문 샘플

            # 현재 시각들
            pub_ts = _pd(published_at) or _pd(rss_pub_iso) or snapshot_ts
            mod_ts = _pd(modified_at)

            # 최초 기준 보정
            first_seen_ts = first_seen_ts or snapshot_ts
            first_pub_ts  = first_pub_ts or pub_ts

            # 몇 분 후 계산
            minutes_since_first = _minutes_between(first_pub_ts, mod_ts) \
                                  if mod_ts else _minutes_between(first_seen_ts, snapshot_ts)
            minutes_since_prev  = _minutes_between(last_seen_ts, mod_ts) \
                                  if (last_seen_ts and mod_ts) else _minutes_between(last_seen_ts, snapshot_ts)

            # 필드별 변화 감지
            changed_fields = []
            if last_hash and last_hash != chash:
                changed_fields.append("content")
            if last_title and last_title != title:
                changed_fields.append("title")
            if last_mod_ts and mod_ts and last_mod_ts != mod_ts:
                changed_fields.append("modified_at")
            if first_pub_ts and pub_ts and pub_ts != first_pub_ts:
                changed_fields.append("published_at")

            # change_kind(최종)
            change_kind = update_status
            if "content" in changed_fields:
                change_kind = "updated_content"
            elif "modified_at" in changed_fields and change_kind == "not_updated":
                change_kind = "updated_meta"

            # 최초 수집 이전에 이미 수정된 기사
            if not prev_state and mod_ts and pub_ts and (mod_ts - pub_ts).total_seconds() > MODIFICATION_THRESHOLD_SECONDS:
                if change_kind == "not_updated":
                    change_kind = "updated_before_seen"

            # 간단 diff 요약
            diff_text = ""
            if "content" in changed_fields and last_sample:
                diff_text = make_diff_summary(last_sample, content, max_chars=240)
            elif not prev_state and mod_ts and pub_ts and (mod_ts - pub_ts).total_seconds() > MODIFICATION_THRESHOLD_SECONDS:
                sim = rough_similarity(rss_sum, content)
                diff_text = "최초 수집 전 이미 수정됨(본문이 RSS 요약과 상이)" if sim < 0.8 else "최초 수집 전 이미 수정됨(메타 변경 추정)"

            # 짧은 한국어 요약
            change_summary = []
            if "title" in changed_fields: change_summary.append("제목 변경")
            if "content" in changed_fields: change_summary.append("본문 변경")
            if "modified_at" in changed_fields and "content" not in changed_fields: change_summary.append("메타 변경")
            # 최초 수집 시 이미 수정된 경우
            # 조건: change_summary가 비어있고, 발행/수정 시간 차이가 120초 이상인 경우
            if not change_summary and mod_ts and pub_ts and (mod_ts - pub_ts).total_seconds() > MODIFICATION_THRESHOLD_SECONDS:
                change_summary.append("최초 수집 전 수정됨")
            change_summary = ", ".join(change_summary)

            row = {
                "url": art.get("url") or url,
                "canonical_url": canonical_url,
                "guid": guid,
                "article_id": article_id,
                "source": SOURCE_ID,
                "url_hash": url_hash,
                "category": CATEGORY_MAP.get(category, 0),
                "published_date": published_at,          # 변경: published_at → published_date
                "crawled_at": rss_pub_iso,               # 변경: rss_published_at → crawled_at
                "modified_at": modified_at,
                "title": title,
                "focus_area": title_key,                 # 변경: title_key → focus_area
                "full_text": content,                    # 변경: content → full_text
                "author": author,
                "summary_text": summary,                 # 변경: summary → summary_text
                "image_url": art.get("image_main") or "", # 변경: image_main → image_url (로컬 경로 우선)
                "image_original_url": art.get("image_original_url") or "",  # 원본 웹 URL
                "update_status": update_status,
                "edited": edited,
                "content_hash": chash,
                "change_kind": change_kind,
                "changed_fields": ",".join(changed_fields) or "",
                "minutes_since_first": minutes_since_first if minutes_since_first is not None else "",
                "minutes_since_prev": minutes_since_prev if minutes_since_prev is not None else "",
                "change_summary": change_summary,
                "diff_text": diff_text,
                "trending_topics": trending_json,
            }
            rows.append(row)

            # ===== 상태 갱신(UPSERT) — 샘플/타임라인 포함 =====
            sample = (content or "")[:1200]  # 다음 실행 diff용
            state[article_id] = {
                "first_seen_ts": (prev_state.get("first_seen_ts") or first_seen_ts.isoformat()),
                "first_published_at": (prev_state.get("first_published_at") or (pub_ts.isoformat() if pub_ts else "")),
                "last_seen_ts": snapshot_ts.isoformat(),
                "last_modified_at": (mod_ts.isoformat() if mod_ts else (prev_state.get("last_modified_at") or "")),
                "last_content_hash": chash,
                "last_title": title,
                "last_content_sample": sample,
            }

            count += 1

    # State 저장 (실패해도 계속 진행)
    try:
        _save_state(state)
    except Exception as e:
        print(f"[ERROR] Failed to save state: {e}")
        print("[WARNING] Continuing without state save - change detection may be affected next run")

    # ===== 하이브리드 모드: 기존 기사 재크롤링 =====
    if RECRAWL_EXISTING_ARTICLES and existing_articles:
        recrawled_count = _recrawl_existing_articles(
            existing_articles, state, snapshot_ts, trending_json
        )
        if recrawled_count > 0:
            print(f"[recrawl] Re-crawled {recrawled_count} existing articles for updates")

    # ===== 누적 모드: 기존 기사와 병합 =====
    if ACCUMULATE_ARTICLES:
        # RSS에서 가져온 새 기사를 existing_articles에 UPSERT
        for row in rows:
            article_id = row.get("article_id")
            if article_id:
                existing_articles[article_id] = row

        # 오래된 기사 정리
        existing_articles = _prune_old_articles(existing_articles)

        # 병합된 결과 반환
        merged_rows = list(existing_articles.values())
        print(f"[accumulate] Final: {len(merged_rows)} articles (RSS: {len(rows)}, existing: {len(existing_articles) - len(rows)})")
        return merged_rows
    else:
        # 누적 모드 OFF: RSS 결과만 반환
        return rows

def export_csv(rows):
    # 디렉터리 경로가 비어있을 수 있으므로 안전 처리
    dirpath = os.path.dirname(CSV_PATH)
    if dirpath:
        os.makedirs(dirpath, exist_ok=True)
    with open(CSV_PATH, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow([
            "url","canonical_url","guid","article_id",
            "source","url_hash","category",
            "published_date","crawled_at","modified_at",
            "title","focus_area","full_text","author","summary_text",
            "image_url","image_original_url",
            "update_status","edited","content_hash",
            "change_kind","changed_fields","minutes_since_first","minutes_since_prev","change_summary","diff_text",
            "trending_topics"
        ])
        for r in rows:
            w.writerow([
                r["url"], r["canonical_url"], r["guid"], r["article_id"],
                r["source"], r["url_hash"], r["category"],
                r["published_date"], r["crawled_at"], r["modified_at"],
                (r["title"] or "").replace("\n"," ").strip(),
                r.get("focus_area",""),
                (r["full_text"] or "").replace("\n"," ").strip(),
                r["author"], r["summary_text"],
                r["image_url"], r.get("image_original_url",""),
                r["update_status"], r["edited"], r["content_hash"],
                r.get("change_kind",""), r.get("changed_fields",""),
                r.get("minutes_since_first",""), r.get("minutes_since_prev",""),
                r.get("change_summary",""), r.get("diff_text",""),
                r.get("trending_topics",""),
            ])
    print(f"saved: {CSV_PATH} ({len(rows)} rows)")

if __name__ == "__main__":
    rows = run_once()
    export_csv(rows)
