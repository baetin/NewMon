# extractor.py
import os, re, time, json, hashlib
from html import unescape
from urllib.parse import urlsplit, urlunsplit, urljoin

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


# ----------------- 유틸 -----------------
def normalize_url(u: str) -> str:
    p = urlsplit((u or "").strip())
    qs = "&".join([kv for kv in p.query.split("&") if kv and not kv.lower().startswith(("utm_","fbclid","gclid"))])
    return urlunsplit((p.scheme, p.netloc, p.path, qs, ""))

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
                # 인코딩 강제 필요시: r.encoding = "utf-8"
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


# ----------------- 본문 추출기 -----------------
def extract_with_trafilatura(html: str, url: str) -> dict | None:
    """trafilatura JSON → dict 안전 처리 + 텍스트 폴백"""
    # JSON 출력 (버전에 따라 str/dict)
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
        # output_format 인자 미지원 버전
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
                # 정말 짧은 UI 문구면 통째로 제거
                if len(ln) <= 20:
                    skip = True
                    break
                # 문장 내에 끼어있으면 해당 텍스트만 제거
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
    - 로고/스피너/아이콘/광고 등 제외
    - jpg/webp/png 우선, svg/ico는 제외
    - 경로 힌트(/photo/, /news/, /article/, img.hankyung.com/photo/)에 가중치
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
        # 높은 점수가 상위
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
        if (w and w < 80) or (h and h < 80):  # 너무 작은 아이콘 컷
            continue
        cands.append({"url": u, "w": w, "h": h})

    # 정제: 중복/나쁜 확장자/패턴 제거
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
        if BAD_URL_PATTERNS.search(u0):
            continue
        uniq.append({"url": u0, "w": c.get("w"), "h": c.get("h")})

    # 후보가 전무하면(희박) 최소 1장 확보 위해 완화
    if not uniq:
        for c in cands:
            u0 = c["url"].split("?")[0]
            if u0 in seen:
                continue
            ext = _ext(u0)
            if ext in BAD_EXTS:
                continue
            uniq.append({"url": u0, "w": c.get("w"), "h": c.get("h")})

    if not uniq:
        return None, []

    ranked = sorted(uniq, key=lambda c: _score(c["url"], c.get("w"), c.get("h")), reverse=True)
    main_url = ranked[0]["url"]
    all_urls = [c["url"] for c in ranked[:10]]  # 본문 이미지 상위 10개 제한

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
def extract_full_article(url: str) -> dict:
    u = normalize_url(url)
    html = fetch_html(u)
    if not html:
        time.sleep(REQUEST_DELAY)
        return {
            "url": u, "url_hash": sha256(u),
            "title": "", "content": "", "published_at": None,
            "image_main": None, "image_urls": []
        }

    # 1차: 일반 페이지
    data = extract_with_trafilatura(html, u) or extract_with_readability(html)

    # AMP 폴백(짧거나 실패 시)
    if (not data) or len(data.get("content", "")) < 400:
        amp = find_amp_url(html, u)
        if amp:
            amp_html = fetch_html(amp)
            if amp_html:
                data_amp = extract_with_trafilatura(amp_html, amp) or extract_with_readability(amp_html)
                if data_amp and len(data_amp.get("content", "")) > len((data or {}).get("content", "")):
                    data, html = data_amp, amp_html

    if not data:
        data = {"title": "", "content": "", "published_at": None}

    # 본문 정리
    title   = clean_text(data.get("title") or "")
    content = strip_boilerplate(data.get("content") or "")
    date    = data.get("published_at")

    # 이미지 수집/다운로드
    img_main, img_list = extract_images_from_html(html, u)
    img_saved = download_image(img_main) if img_main else None

    time.sleep(REQUEST_DELAY)  # rate limit
    return {
        "url": u,
        "url_hash": sha256(u),
        "title": title,
        "content": content,
        "published_at": date,
        "image_main": img_saved or img_main,  # 다운로드 성공 시 로컬 경로, 아니면 원본 URL
        "image_urls": img_list,
    }