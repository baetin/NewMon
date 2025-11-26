# news_dashboard/server.py
from __future__ import annotations
import os, importlib.util, sys
from pathlib import Path
import pandas as pd
from flask import Flask, render_template, request, url_for, abort
import subprocess, difflib
import threading, time
from datetime import datetime

HERE = Path(__file__).resolve().parent
PROJECT_ROOT = HERE.parent  # → C:\Users\비월\Desktop\test

# settings.py를 탐색할 후보 경로
CANDIDATES = [PROJECT_ROOT, Path.cwd()]

def _load_settings_csv_path() -> Path:
    """settings.CSV_PATH(상대경로)를 PROJECT_ROOT 기준 절대경로로 변환."""
    for d in CANDIDATES:
        p = d / "settings.py"
        if p.exists():
            spec = importlib.util.spec_from_file_location("settings_for_dashboard", str(p))
            mod = importlib.util.module_from_spec(spec)
            sys.modules["settings_for_dashboard"] = mod
            assert spec and spec.loader
            spec.loader.exec_module(mod)
            csv_rel = getattr(mod, "CSV_PATH", "exports/articles.csv")
            return (PROJECT_ROOT / csv_rel).resolve()
    # settings.py가 없어도 동작하도록 기본값
    return (PROJECT_ROOT / "exports" / "articles.csv").resolve()

CSV_PATH = _load_settings_csv_path()
CANON_PATH = Path(CSV_PATH)  # 기본 테이블에서 보여줄 CSV
HISTORY_DIR = PROJECT_ROOT / "exports" / "history"

app = Flask(__name__)

# --------- 유틸: 스냅샷 목록/CSV 로드/키 결정/셀 정리 ----------

def list_snapshots() -> list[Path]:
    HISTORY_DIR.mkdir(parents=True, exist_ok=True)
    return sorted(HISTORY_DIR.glob("articles_*.csv"))

def load_csv(path: Path) -> pd.DataFrame:
    """CSV를 안전하게 로드. 컬럼 누락/타입 섞임 대비."""
    if not path.exists():
        return pd.DataFrame()
    try:
        df = pd.read_csv(path, dtype=str, encoding="utf-8-sig", on_bad_lines="skip")
    except Exception:
        # 인코딩 폴백
        df = pd.read_csv(path, dtype=str, encoding="utf-8", on_bad_lines="skip")
    return df.fillna("")

def pick_key_column(df: pd.DataFrame) -> str:
    """비교/상세 키: article_id가 있으면 우선, 없으면 url_hash."""
    if not df.empty:
        if "article_id" in df.columns:
            return "article_id"
        if "url_hash" in df.columns:
            return "url_hash"
    # 마지막 안전장치
    return "url_hash"

def sanitize_for_view(s: str | None) -> str:
    if s is None:
        return ""
    if not isinstance(s, str):
        s = str(s)
    s = s.replace("\r", " ").replace("\n", " ").replace("\t", " ")
    while "  " in s:
        s = s.replace("  ", " ")
    return s.strip()

# -------------------- 라우트 --------------------

@app.route("/health")
def health():
    return "ok", 200

@app.route("/")
def index():
    snaps = list_snapshots()
    latest = snaps[-1].name if snaps else ""
    return render_template("index.html", snapshots=[p.name for p in snaps], latest=latest)

@app.route("/table")
def table():
    """현재 CSV 또는 선택한 스냅샷을 테이블로 출력."""
    snap = request.args.get("snapshot", "")
    path = (HISTORY_DIR / snap) if snap else CANON_PATH
    df = load_csv(path)

    # 보여줄 후보 컬럼들(없으면 걸러짐)
    cols = [
        "article_id", "url_hash", "title", "category",
        "published_at", "modified_at", "update_status", "edited",
        "change_summary", "changed_fields", "change_kind", "source"
    ]
    if not df.empty:
        exist_cols = [c for c in cols if c in df.columns]
        if exist_cols:
            df = df[exist_cols].copy()

        # 가독을 위해 길이 제한 (선택)
        if "title" in df.columns:
            df["title"] = df["title"].apply(lambda v: sanitize_for_view(v)[:200])
    rows = df.to_dict(orient="records") if not df.empty else []

    return render_template(
        "table.html",
        snapshot=path.name if path.exists() else "(none)",
        rows=rows,
    )

@app.route("/compare")
def compare():
    """
    스냅샷 A vs B 비교 목록.
    - 키는 article_id 우선, 없으면 url_hash.
    - 상태 변화만 확인하는 요약 목록을 보여주고, 상세는 /article/<key>로 이동.
    """
    snaps = list_snapshots()
    if len(snaps) < 2:
        return render_template("compare.html", snapshots=[p.name for p in snaps], a="", b="", rows=[])

    a = request.args.get("a", snaps[-2].name)
    b = request.args.get("b", snaps[-1].name)

    df_a = load_csv(HISTORY_DIR / a)
    df_b = load_csv(HISTORY_DIR / b)

    if df_a.empty and df_b.empty:
        rows = []
    else:
        key_a = pick_key_column(df_a) if not df_a.empty else "url_hash"
        key_b = pick_key_column(df_b) if not df_b.empty else "url_hash"

        a_map = df_a.set_index(key_a).to_dict(orient="index") if not df_a.empty else {}
        b_map = df_b.set_index(key_b).to_dict(orient="index") if not df_b.empty else {}

        common_keys = sorted(set(a_map.keys()) | set(b_map.keys()))
        rows = []
        for k in common_keys:
            va = a_map.get(k, {})
            vb = b_map.get(k, {})
            title = vb.get("title") or va.get("title") or ""
            rows.append({
                "key": k,
                "title": sanitize_for_view(title)[:120],
                "in_a": k in a_map,
                "in_b": k in b_map,
                "status_a": va.get("update_status",""),
                "status_b": vb.get("update_status",""),
                "change_summary": vb.get("change_summary",""),
                "changed_fields": vb.get("changed_fields",""),
            })

    return render_template("compare.html", snapshots=[p.name for p in snaps], a=a, b=b, rows=rows)

@app.route("/article/<key>")
def article(key: str):
    """
    스냅샷 A vs B에서 특정 기사 상세 비교.
    - key는 article_id가 기본. 스냅샷에 article_id가 없으면 url_hash 키로 폴백.
    - a/b 스냅샷 파라미터가 없으면 최신 2개로 자동.
    """
    a = request.args.get("a")
    b = request.args.get("b")
    snaps = list_snapshots()
    if not a or not b:
        if len(snaps) < 2:
            abort(404)
        a, b = snaps[-2].name, snaps[-1].name

    df_a = load_csv(HISTORY_DIR / a)
    df_b = load_csv(HISTORY_DIR / b)

    # 스냅샷별 키 선택(존재 여부에 따라 article_id → url_hash 순)
    key_a = pick_key_column(df_a) if not df_a.empty else "url_hash"
    key_b = pick_key_column(df_b) if not df_b.empty else "url_hash"

    def _find_row(df: pd.DataFrame, kcol: str, kval: str):
        if df.empty or kcol not in df.columns:
            return {}
        part = df[df[kcol] == kval]
        if part.empty and kcol != "url_hash" and "url_hash" in df.columns:
            # article_id 매칭 실패 시 url_hash 폴백 시도
            part = df[df["url_hash"] == kval]
        return part.to_dict(orient="records")[0] if not part.empty else {}

    va = _find_row(df_a, key_a, key)
    vb = _find_row(df_b, key_b, key)

    if not va and not vb:
        abort(404)

    title = sanitize_for_view(vb.get("title") or va.get("title") or "(no title)")
    content_a = sanitize_for_view(va.get("content") or "")
    content_b = sanitize_for_view(vb.get("content") or "")

    # 라인단위 비교가 긴 기사에 적합. 단어단위가 필요하면 .split()로 교체 가능.
    diff_html = difflib.HtmlDiff(wrapcolumn=80).make_table(
        content_a.splitlines(), content_b.splitlines(),
        fromdesc=f"{a}", todesc=f"{b}", context=True, numlines=2
    )

    meta = {
        "published_a": va.get("published_at",""), "modified_a": va.get("modified_at",""),
        "published_b": vb.get("published_at",""), "modified_b": vb.get("modified_at",""),
        "status_a": va.get("update_status",""), "status_b": vb.get("update_status",""),
        "edited_a": va.get("edited",""), "edited_b": vb.get("edited",""),
        "source": vb.get("source") or va.get("source") or "",
        "category": vb.get("category") or va.get("category") or "",
        "article_id_a": va.get("article_id",""), "article_id_b": vb.get("article_id",""),
        "url_hash_a": va.get("url_hash",""), "url_hash_b": vb.get("url_hash",""),
        "url": vb.get("url") or va.get("url") or "",
        "canonical_url": vb.get("canonical_url") or va.get("canonical_url") or "",
    }
    return render_template("article.html", url_hash=key, title=title, a=a, b=b,
                           meta=meta, diff_html=diff_html)

@app.route("/run", methods=["POST"])
def run_now():
    """
    즉시 크롤링 + 스냅샷 (run_crawl_and_snapshot.py 호출)
    """
    proc = subprocess.run(
        ["python", "news_dashboard/run_crawl_and_snapshot.py"],
        capture_output=True, text=True
    )
    out = (proc.stdout or "") + "\n" + (proc.stderr or "")
    return f"""<pre>{out}</pre><p><a href='{url_for('index')}'>Back</a></p>"""

# ---------- Flask 3.x 호환: 백그라운드 스케줄러 ----------
RUN_LOCK = threading.Lock()
SCHEDULER_STARTED = False

# settings에서 스케줄 설정 로드
try:
    import sys
    from pathlib import Path
    sys.path.insert(0, str(PROJECT_ROOT))
    import settings as user_settings
    AUTO_COLLECT_INTERVAL = getattr(user_settings, "AUTO_COLLECT_INTERVAL", 1800)  # 기본 30분
    UPDATE_CHECK_HOURS = getattr(user_settings, "UPDATE_CHECK_HOURS", [12, 15, 18, 21])
    UPDATE_CHECK_ENABLED = getattr(user_settings, "UPDATE_CHECK_ENABLED", False)
except Exception:
    AUTO_COLLECT_INTERVAL = 1800  # 30분
    UPDATE_CHECK_HOURS = [12, 15, 18, 21]
    UPDATE_CHECK_ENABLED = False

def run_crawl_snapshot_once() -> str:
    """일반 수집 실행 (RSS + trending topics)"""
    with RUN_LOCK:
        proc = subprocess.run(
            ["python", "news_dashboard/run_crawl_and_snapshot.py"],
            capture_output=True, text=True
        )
        return (proc.stdout or "") + "\n" + (proc.stderr or "")

def _collector_loop(interval_sec: int):
    """일반 수집 루프 (30분마다)"""
    print(f"[scheduler] 일반 수집 시작 (간격: {interval_sec}초 = {interval_sec//60}분)")
    while True:
        try:
            print(f"[scheduler] 수집 시작: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            run_crawl_snapshot_once()
            print(f"[scheduler] 수집 완료. 다음 수집: {interval_sec//60}분 후")
        except Exception as e:
            print(f"[scheduler] 수집 오류: {e}")
        time.sleep(interval_sec)

def _update_check_loop():
    """수정 여부 판단 루프 (특정 시각에만 - 현재 비활성화)"""
    if not UPDATE_CHECK_ENABLED:
        print("[scheduler] 수정 여부 판단 기능 비활성화됨")
        return

    print(f"[scheduler] 수정 여부 판단 활성화 (시각: {UPDATE_CHECK_HOURS})")
    last_check_hour = -1
    while True:
        now = datetime.now()
        current_hour = now.hour

        # 설정된 시각이고, 아직 체크 안했으면 실행
        if current_hour in UPDATE_CHECK_HOURS and current_hour != last_check_hour:
            try:
                print(f"[scheduler] 수정 여부 판단 시작: {now.strftime('%Y-%m-%d %H:%M:%S')}")
                run_crawl_snapshot_once()
                last_check_hour = current_hour
                print(f"[scheduler] 수정 여부 판단 완료")
            except Exception as e:
                print(f"[scheduler] 수정 판단 오류: {e}")

        # 1분마다 시각 체크
        time.sleep(60)

def start_scheduler_once():
    """
    Flask 3.x: before_first_request 미사용.
    앱 시작 시 1회만 스케줄러 구동. (디버그 리로더와 중복되지 않게)
    """
    global SCHEDULER_STARTED
    if not SCHEDULER_STARTED:
        SCHEDULER_STARTED = True
        # 일반 수집 스레드 (30분마다)
        t1 = threading.Thread(target=_collector_loop, args=(AUTO_COLLECT_INTERVAL,), daemon=True)
        t1.start()
        # 수정 판단 스레드 (특정 시각, 비활성화 가능)
        t2 = threading.Thread(target=_update_check_loop, daemon=True)
        t2.start()
        print(f"[scheduler] 스케줄러 시작됨 - 일반수집: {AUTO_COLLECT_INTERVAL//60}분마다")

if __name__ == "__main__":
    # 디버그 리로더 중복 스레드 방지
    is_reloader_child = os.environ.get("WERKZEUG_RUN_MAIN") == "true"
    if not app.debug or is_reloader_child:
        start_scheduler_once()   # 자동 수집 활성화
    app.run(host="0.0.0.0", port=7860, debug=True)
