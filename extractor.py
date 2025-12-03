# extractor.py
import os, re, time, json, hashlib
from html import unescape
from urllib.parse import urlsplit, urlunsplit, urljoin, parse_qsl, urlencode

import httpx, trafilatura
from readability import Document

# ----- settings 전체 임포트 후 기본값 보강 -----
import settings

USER_AGENT       = getattr(settings, "USER_AGENT", "NewsCrawler/1.0 (+contact: you@example.com)")
REQUEST_TIMEOUT  = getattr(settings, "REQUEST_TIMEOUT", 20.0)
REQUEST_RETRIES  = getattr(settings, "REQUEST_RETRIES", 2)
REQUEST_DELAY    = getattr(settings, "REQUEST_DELAY", 1.0)

# 이미지 옵션(선택)
COLLECT_IMAGES      = getattr(settings, "COLLECT_IMAGES", True)
DOWNLOAD_IMAGES     = getattr(settings, "DOWNLOAD_IMAGES", False)
IMAGES_DIR          = getattr(settings, "IMAGES_DIR", "exports/images")
MAX_IMAGE_BYTES     = getattr(settings, "MAX_IMAGE_BYTES", 8 * 1024 * 1024)
ALLOWED_IMAGE_MIMES = getattr(settings, "ALLOWED_IMAGE_MIMES", {"image/jpeg","image/png","image/webp","image/gif"})

# bs4는 선택(없으면 이미지/일부 보정 스킵해도 동작)
try:
    from bs4 import BeautifulSoup
except Exception:
    BeautifulSoup = None

# 날짜 파싱용
from datetime import datetime, timezone
from dateutil import parser as dtparser


# ----------------- 유틸 -----------------
TRACK_PARAMS = {"utm_source","utm_medium","utm_campaign","utm_term","utm_content","gclid","fbclid"}

def canonicalize_url(u: str) -> str:
    """추적 파라미터/fragment 제거, 쿼리는 의미있는 키만 유지"""
    p = urlsplit((u or "").strip())
    # 쿼리 정리
    q = [(k, v) for k, v in parse_qsl(p.query, keep_blank_values=True) if k.lower() not in TRACK_PARAMS]
    p2 = p._replace(query=urlencode(q, doseq=True), fragment="")
    return urlunsplit(p2)

def normalize_url(u: str) -> str:
    # 기존 normalize도 유지(하위호환). 내부적으로 canonicalize 사용.
    return canonicalize_url(u)

def sha256(s: str) -> str:
    return hashlib.sha256((s or "").encode("utf-8")).hexdigest()

def fetch_html(url: str) -> str | None:
    headers = {"User-Agent": USER_AGENT, "Accept-Language": "ko, en;q=0.8"}
    last = None
    for _ in range(REQUEST_RETRIES + 1):
        try:
            with httpx.Client(headers=headers, follow_redirects=True, timeout=REQUEST_TIMEOUT) as c:
                r = c.get(url)
                r.raise_for_status()
                return r.text
        except Exception as e:
            last = e
            time.sleep(0.8)
    print(f"[fetch_html] fail: {url} -> {last}")
    return None

def clean_text(t: str) -> str:
    if not t:
        return ""
    t = unescape(t)
    t = re.sub(r"\s+", " ", t).strip()
    # 불필요한 저작권 꼬리문구 제거(필요시 주석)
    t = re.sub(r"ⓒ.*?무단전재.*?$", "", t)
    return t.strip()

def parse_datetime(s: str | None) -> datetime | None:
    """날짜 문자열을 UTC datetime으로 파싱 (공개 함수)"""
    if not s:
        return None
    try:
        d = dtparser.parse(s)
        return d if d.tzinfo else d.replace(tzinfo=timezone.utc)
    except Exception:
        return None

# 하위 호환성을 위한 alias
_parse_dt = parse_datetime

def fetch_html_with_headers(url: str) -> tuple[str | None, dict]:
    """본문 HTML과 응답 헤더를 함께 반환(Last-Modified, ETag 등 활용용)"""
    headers = {"User-Agent": USER_AGENT, "Accept-Language": "ko, en;q=0.8"}
    last = None
    for _ in range(REQUEST_RETRIES + 1):
        try:
            with httpx.Client(headers=headers, follow_redirects=True, timeout=REQUEST_TIMEOUT) as c:
                r = c.get(url)
                r.raise_for_status()
                return r.text, dict(r.headers)
        except Exception as e:
            last = e
            time.sleep(0.8)
    print(f"[fetch_html_with_headers] fail: {url} -> {last}")
    return None, {}

def _dates_from_html(html: str) -> tuple[datetime | None, datetime | None]:
    """
    HTML 메타/JSON-LD에서 게시/수정 시각 추출
    반환: (published_at, modified_at) — 둘 다 datetime 또는 None
    """
    pub, mod = None, None
    if not html or not BeautifulSoup:
        return pub, mod

    soup = BeautifulSoup(html, "html.parser")

    # 1) Open Graph / Article 메타
    for prop, kind in {
        "article:published_time": "pub",
        "og:published_time": "pub",
        "article:modified_time": "mod",
        "og:updated_time": "mod",
    }.items():
        for tag in soup.find_all("meta", attrs={"property": prop}):
            d = _parse_dt(tag.get("content"))
            if d and kind == "pub" and not pub: pub = d
            if d and kind == "mod" and not mod: mod = d

    # 2) 일반 name 메타
    for name, kind in {
        "datePublished": "pub",
        "uploadDate": "pub",
        "date": "pub",
        "dateModified": "mod",
        "lastmod": "mod",
        "updated": "mod",
        "last-modified": "mod",
    }.items():
        for tag in soup.find_all("meta", attrs={"name": re.compile(f"^{re.escape(name)}$", re.I)}):
            d = _parse_dt(tag.get("content") or tag.get("value"))
            if d and kind == "pub" and not pub: pub = d
            if d and kind == "mod" and not mod: mod = d

    # 3) JSON-LD (schema.org Article/NewsArticle/BlogPosting)
    for s in soup.find_all("script", attrs={"type": "application/ld+json"}):
        try:
            data = json.loads(s.string or "")
            items = data if isinstance(data, list) else [data]
            for it in items:
                if not isinstance(it, dict):
                    continue
                dp = _parse_dt(it.get("datePublished") or it.get("uploadDate"))
                dm = _parse_dt(it.get("dateModified") or it.get("dateUpdated"))
                if dp and not pub: pub = dp
                if dm and not mod: mod = dm
        except Exception:
            pass

    return pub, mod

def _canonical_from_html(html: str, base_url: str) -> str | None:
    """rel=canonical, og:url, JSON-LD mainEntityOfPage.@id/URL → canonical 추출"""
    if not html or not BeautifulSoup:
        return None
    soup = BeautifulSoup(html, "html.parser")

    # rel=canonical
    link = soup.find("link", rel=lambda x: x and "canonical" in x.lower())
    if link and link.get("href"):
        return canonicalize_url(urljoin(base_url, link["href"].strip()))

    # og:url
    og = soup.find("meta", attrs={"property": "og:url"})
    if og and og.get("content"):
        return canonicalize_url(urljoin(base_url, og["content"].strip()))

    # JSON-LD
    for tag in soup.find_all("script", attrs={"type": "application/ld+json"}):
        try:
            data = json.loads(tag.string or "")
            items = data if isinstance(data, list) else [data]
            for it in items:
                if not isinstance(it, dict):
                    continue
                # mainEntityOfPage → @id
                me = it.get("mainEntityOfPage")
                if isinstance(me, dict) and me.get("@id"):
                    return canonicalize_url(urljoin(base_url, me["@id"].strip()))
                # @type Article/NewsArticle 의 url 필드
                if it.get("@type") in ("Article", "NewsArticle", "BlogPosting"):
                    if it.get("url"):
                        return canonicalize_url(urljoin(base_url, it["url"].strip()))
        except Exception:
            pass
    return None


# ----------------- 본문 추출기 -----------------
def extract_with_trafilatura(html: str, url: str) -> dict | None:
    """trafilatura JSON → dict 안전 처리 + 텍스트 폴백"""
    try:
        data = trafilatura.extract(
            html, url=url, include_tables=False, include_comments=False, output_format="json"
        )
        if isinstance(data, str):
            try:
                data = json.loads(data)
            except Exception:
                data = None
        if isinstance(data, dict):
            title = clean_text(data.get("title") or "")
            text  = clean_text(data.get("text")  or "")
            date  = data.get("date")
            if text:
                return {"title": title, "content": text, "published_at": date}
    except TypeError:
        pass
    except Exception:
        pass

    # 텍스트 폴백
    try:
        txt = trafilatura.extract(html, url=url, include_tables=False, include_comments=False)
        if isinstance(txt, str) and txt.strip():
            return {"title": "", "content": clean_text(txt), "published_at": None}
    except Exception:
        pass

    # metadata 폴백
    try:
        meta_txt = trafilatura.extract(
            html, url=url, include_tables=False, include_comments=False, with_metadata=True
        )
        if isinstance(meta_txt, str) and meta_txt.strip():
            return {"title": "", "content": clean_text(meta_txt), "published_at": None}
    except Exception:
        pass

    return None

def extract_with_readability(html: str) -> dict | None:
    try:
        doc = Document(html)
        title = doc.short_title() or ""
        summary_html = doc.summary(html_partial=True)
        text = re.sub(r"<[^>]+>", " ", summary_html)
        return {"title": clean_text(title), "content": clean_text(text), "published_at": None}
    except Exception:
        return None


# ----------------- AMP 폴백 -----------------
AMP_LINK_RE = re.compile(r'<link[^>]+rel=["\']amphtml["\'][^>]+href=["\']([^"\']+)["\']', re.I)

def find_amp_url(html: str, base_url: str) -> str | None:
    m = AMP_LINK_RE.search(html or "")
    if not m:
        return None
    return urljoin(base_url, m.group(1).strip())


# ----------------- 보일러 제거 -----------------
BOILER_PATTERNS = [
    r"기사\s*스크랩", r"공유", r"댓글", r"클린뷰", r"본문\s*듣기", r"음성\s*으로\s*듣기",
    r"이미지\s*크게보기", r"원문보기", r"이전\s*다음", r"프린트", r"메일", r"SNS",
    r"저작권자\s*ⓒ", r"무단전재\s*및\s*재배포\s*금지",
]

def strip_boilerplate(text: str) -> str:
    if not text:
        return ""
    # 줄 단위로 걸러내기
    lines = [l.strip() for l in re.split(r"\r?\n|<br\s*/?>", text)]
    cleaned = []
    for ln in lines:
        if len(ln) <= 2:
            continue
        skip = False
        for pat in BOILER_PATTERNS:
            if re.search(pat, ln, flags=re.I):
                if len(ln) <= 20:
                    skip = True
                    break
                ln = re.sub(pat, "", ln, flags=re.I).strip()
        if not skip and ln:
            cleaned.append(ln)
    out = " ".join(cleaned)
    out = re.sub(r"\s{2,}", " ", out).strip()
    return out


# ----------------- 이미지 수집/다운로드 -----------------
def extract_images_from_html(html: str, base_url: str) -> tuple[str | None, list[str]]:
    """
    대표 이미지와 본문 이미지 URL들을 수집한다.
    """
    if not COLLECT_IMAGES or not html or not BeautifulSoup:
        return None, []

    soup = BeautifulSoup(html, "html.parser")
    cands = []

    BAD_URL_PATTERNS = re.compile(
        r"(logo|spinner|placeholder|thumb_default|default_thumb|favicon|sprite|icon|ads?)([\-_./]|$)",
        re.I
    )
    ALLOWED_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
    BAD_EXTS = {".svg", ".ico"}
    GOOD_PATH_HINT = re.compile(r"(/photo/|/news/|/article/|img\.hankyung\.com/photo/)", re.I)

    def _ext(u: str) -> str:
        u = u.split("?")[0]
        m = re.search(r"\.([a-z0-9]{2,4})$", u, re.I)
        return f".{m.group(1).lower()}" if m else ""

    def _score(u: str, w: int | None, h: int | None) -> tuple:
        ext = _ext(u)
        area = (w or 0) * (h or 0)
        ext_bonus = {".jpg": 3, ".jpeg": 3, ".webp": 3, ".png": 2, ".gif": 1}.get(ext, 0)
        hint_bonus = 2 if GOOD_PATH_HINT.search(u) else 0
        bad_penalty = -10 if BAD_URL_PATTERNS.search(u) else 0
        q_bonus = 0
        if re.search(r"[?&](w|width)=(\d{3,4})", u, re.I): q_bonus += 1
        if re.search(r"[?&](h|height)=(\d{3,4})", u, re.I): q_bonus += 1
        return (area, ext_bonus + hint_bonus + q_bonus + bad_penalty)

    # 메타(og/twitter)
    for prop in ("og:image", "og:image:url", "twitter:image", "twitter:image:src"):
        for tag in soup.find_all("meta", attrs={"property": prop}):
            u = tag.get("content")
            if u:
                cands.append({"url": urljoin(base_url, u), "w": None, "h": None})
        for tag in soup.find_all("meta", attrs={"name": prop}):
            u = tag.get("content")
            if u:
                cands.append({"url": urljoin(base_url, u), "w": None, "h": None})

    # IMG / AMP-IMG
    for img in soup.find_all(["img", "amp-img"]):
        u = img.get("src") or img.get("data-src") or img.get("data-original")
        if not u:
            continue
        u = urljoin(base_url, u)
        try:
            w = int(img.get("width") or 0)
        except Exception:
            w = None
        try:
            h = int(img.get("height") or 0)
        except Exception:
            h = None
        if (w and w < 80) or (h and h < 80):
            continue
        cands.append({"url": u, "w": w, "h": h})

    # 정제
    seen = set()
    uniq = []
    for c in cands:
        u0 = c["url"].split("?")[0]
        if u0 in seen:
            continue
        seen.add(u0)
        ext = _ext(u0)
        if ext in BAD_EXTS:
            continue
        if re.search(r"(logo|spinner|placeholder|favicon|sprite|icon|ads?)", u0, re.I):
            continue
        uniq.append({"url": u0, "w": c.get("w"), "h": c.get("h")})

    if not uniq:
        return None, []

    ranked = sorted(uniq, key=lambda c: _score(c["url"], c.get("w"), c.get("h")), reverse=True)
    main_url = ranked[0]["url"]
    all_urls = [c["url"] for c in ranked[:10]]
    return main_url, all_urls

def download_image(url: str) -> str | None:
    if not DOWNLOAD_IMAGES or not url:
        return None
    os.makedirs(IMAGES_DIR, exist_ok=True)
    headers = {"User-Agent": USER_AGENT}
    try:
        with httpx.Client(headers=headers, follow_redirects=True, timeout=REQUEST_TIMEOUT) as c:
            with c.stream("GET", url) as r:
                r.raise_for_status()
                ct = r.headers.get("Content-Type", "").split(";")[0].strip().lower()
                if ct not in ALLOWED_IMAGE_MIMES:
                    return None
                length = int(r.headers.get("Content-Length") or 0)
                if length and length > MAX_IMAGE_BYTES:
                    return None
                ext = {"image/jpeg":"jpg","image/png":"png","image/webp":"webp","image/gif":"gif"}.get(ct, "bin")
                name = sha256(url) + "." + ext
                path = os.path.join(IMAGES_DIR, name)
                with open(path, "wb") as f:
                    for chunk in r.iter_bytes():
                        f.write(chunk)
                        if f.tell() > MAX_IMAGE_BYTES:
                            try:
                                f.close()
                                os.remove(path)
                            except Exception:
                                pass
                            return None
        return path
    except Exception:
        return None


# ----------------- 메인 엔트리 -----------------
# ----------------- 인기 기사/탑 토픽 수집 -----------------
def fetch_trending_topics(source: str = "hankyung", limit: int = 5) -> list[str]:
    """
    언론사별 인기/많이 본 뉴스 탑 N개 제목 수집

    Args:
        source: 언론사 ID (현재 "hankyung"만 지원)
        limit: 수집할 기사 개수 (기본 5개)

    Returns:
        인기 기사 제목 리스트 (최대 limit개)
    """
    if source == "hankyung":
        return _fetch_hankyung_trending(limit)
    # 향후 다른 언론사 추가 가능
    return []

def _fetch_hankyung_trending(limit: int = 5) -> list[str]:
    """한경 API 또는 메인 페이지에서 '많이 본 뉴스' 탑 N개 수집"""
    # 방법 1: API 직접 호출 (추천)
    api_url = "https://www.hankyung.com/action/mainMajorNews"
    try:
        headers = {"User-Agent": USER_AGENT, "Accept": "application/json"}
        with httpx.Client(headers=headers, follow_redirects=True, timeout=REQUEST_TIMEOUT) as c:
            r = c.get(api_url)
            r.raise_for_status()

            # JSON 응답 파싱
            try:
                data = r.json()
                titles = []
                # API 응답 구조에 따라 조정 필요
                if isinstance(data, list):
                    for item in data[:limit]:
                        if isinstance(item, dict):
                            title = item.get("title") or item.get("newsTitle") or item.get("subject")
                            if title:
                                titles.append(clean_text(title))
                elif isinstance(data, dict):
                    items = data.get("data") or data.get("list") or data.get("items") or []
                    for item in items[:limit]:
                        if isinstance(item, dict):
                            title = item.get("title") or item.get("newsTitle") or item.get("subject")
                            if title:
                                titles.append(clean_text(title))

                if titles:
                    return titles[:limit]
            except (json.JSONDecodeError, ValueError):
                # JSON 파싱 실패 시 HTML 파싱으로 폴백
                pass
    except Exception as e:
        print(f"[fetch_trending] API failed: {e}")

    # 방법 2: 메인 페이지 HTML 파싱 (폴백)
    url = "https://www.hankyung.com"
    try:
        html = fetch_html(url)
        if not html or not BeautifulSoup:
            return []

        soup = BeautifulSoup(html, "html.parser")
        titles = []

        # 다양한 클래스명 시도
        for class_name in ["major-module", "popular", "most-view", "ranking", "best-news"]:
            container = soup.find("div", class_=re.compile(class_name, re.I))
            if container:
                # 제목 태그 찾기
                for tag in ["h2", "h3", "h4", "strong", "span"]:
                    items = container.find_all(tag, limit=limit*2)
                    for item in items:
                        link = item.find("a")
                        if link:
                            title = clean_text(link.get_text())
                        else:
                            title = clean_text(item.get_text())

                        if title and len(title) > 10 and len(title) < 150:  # 적절한 길이
                            titles.append(title)
                            if len(titles) >= limit:
                                return titles[:limit]

        return titles[:limit] if titles else []

    except Exception as e:
        print(f"[fetch_trending] HTML parsing failed: {e}")
        return []


# ----------------- 메인 엔트리 -----------------
def extract_full_article(url: str) -> dict:
    u = normalize_url(url)

    # HTML + 헤더 동시 획득 (Last-Modified/ETag 파싱용)
    html, resp_headers = fetch_html_with_headers(u)
    if not html:
        time.sleep(REQUEST_DELAY)
        return {
            "url": u, "url_hash": sha256(u),
            "title": "", "content": "",
            "published_at": "", "modified_at": "",
            "canonical_url": canonicalize_url(u),
            "etag": "",  # 실패 시 빈값
            "image_main": None, "image_urls": []
        }

    # canonical URL 추출 (rel=canonical / og:url / JSON-LD)
    canonical_url = _canonical_from_html(html, u) or canonicalize_url(u)

    # 1차: 일반 페이지
    data = extract_with_trafilatura(html, u) or extract_with_readability(html)

    # AMP 폴백(짧거나 실패 시)
    if (not data) or len(data.get("content", "")) < 400:
        amp = find_amp_url(html, u)
        if amp:
            amp_html, _ = fetch_html_with_headers(amp)
            if amp_html:
                data_amp = extract_with_trafilatura(amp_html, amp) or extract_with_readability(amp_html)
                if data_amp and len(data_amp.get("content", "")) > len((data or {}).get("content", "")):
                    data, html = data_amp, amp_html
                    # AMP에서도 canonical 검증(있으면 덮어씀)
                    c2 = _canonical_from_html(amp_html, amp)
                    if c2:
                        canonical_url = canonicalize_url(c2)

    if not data:
        data = {"title": "", "content": "", "published_at": None}

    # 본문 정리
    title   = clean_text(data.get("title") or "")
    content = strip_boilerplate(data.get("content") or "")

    # 날짜 통합: trafilatura가 준 published_at + HTML 메타 + HTTP Last-Modified
    pub_meta, mod_meta = _dates_from_html(html)
    pub_api = _parse_dt(data.get("published_at")) if data.get("published_at") else None
    pub = pub_api or pub_meta
    mod = mod_meta or _parse_dt(resp_headers.get("Last-Modified"))

    # 이미지 수집/다운로드
    img_main, img_list = extract_images_from_html(html, u)
    img_saved = download_image(img_main) if img_main else None

    etag = (resp_headers.get("ETag") or "").strip('"').strip() if isinstance(resp_headers, dict) else ""

    time.sleep(REQUEST_DELAY)  # rate limit
    return {
        "url": u,
        "url_hash": sha256(u),
        "title": title,
        "content": content,
        "published_at": pub.isoformat() if pub else "",
        "modified_at":  mod.isoformat() if mod else "",
        "canonical_url": canonical_url,  # ★ 추가: pipeline에서 article_id 생성에 사용
        "etag": etag,                    # 선택: 나중에 조건부 요청시 활용
        "image_main": img_saved or img_main,  # 로컬 파일 경로 또는 웹 URL
        "image_original_url": img_main,       # 원본 웹 URL (대표 이미지)
        "image_urls": img_list,
    }
