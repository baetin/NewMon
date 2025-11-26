# news_dashboard/run_crawl_and_snapshot.py
import os, csv, sys, importlib.util
from datetime import datetime
from pathlib import Path

HERE = Path(__file__).resolve().parent
PROJECT_ROOT = HERE.parent  # 예: C:\Users\비월\Desktop\test

# 탐색 우선순위: 프로젝트 루트, 현재 작업 폴더
CANDIDATES = [PROJECT_ROOT, Path.cwd()]

def _safe_prepend_sys_path(p: Path):
    sp = str(p)
    if sp not in sys.path:
        sys.path.insert(0, sp)

def _load_module_from_path(mod_name: str, file_path: Path, prepend_sys_path: bool = True):
    """
    지정 파일을 모듈로 로드. 필요시 해당 디렉터리를 sys.path 맨 앞에 꽂아
    같은 폴더의 extractor.py / settings.py 같은 로컬 임포트가 되게 함.
    """
    if prepend_sys_path:
        _safe_prepend_sys_path(file_path.parent)
    spec = importlib.util.spec_from_file_location(mod_name, str(file_path))
    mod = importlib.util.module_from_spec(spec)
    sys.modules[mod_name] = mod
    assert spec and spec.loader, f"Cannot load {file_path}"
    spec.loader.exec_module(mod)
    return mod

def _find_and_import(filename: str, alias: str):
    last_err = None
    for d in CANDIDATES:
        p = d / filename
        if p.exists():
            try:
                return _load_module_from_path(alias, p, prepend_sys_path=True), d
            except Exception as e:
                last_err = e
    if last_err:
        raise last_err
    raise FileNotFoundError(f"{filename}를 찾지 못했습니다: {CANDIDATES}")

# 1) pipeline_csv.py 찾기 (같은 폴더 모듈 임포트되도록 sys.path 주입)
pipeline_csv, PIPE_DIR = _find_and_import("pipeline_csv.py", "pipeline_csv")
print(f"[DEBUG] PIPE_DIR = {PIPE_DIR}")

# 2) settings.py 로드해서 CSV_PATH 확인
def _load_csv_path() -> str:
    try:
        settings = _load_module_from_path(
            "settings_local_for_dashboard", PIPE_DIR / "settings.py", prepend_sys_path=False
        )
        return getattr(settings, "CSV_PATH", "exports/articles.csv")
    except Exception:
        try:
            settings2, _ = _find_and_import("settings.py", "settings_local_for_dashboard_fallback")
            return getattr(settings2, "CSV_PATH", "exports/articles.csv")
        except Exception:
            return "exports/articles.csv"

CSV_PATH_REL = _load_csv_path()                         # 상대경로 (settings 기준)
CSV_PATH = (PROJECT_ROOT / CSV_PATH_REL).resolve()      # 절대경로
CSV_PATH.parent.mkdir(parents=True, exist_ok=True)

HISTORY_DIR = (PROJECT_ROOT / "exports" / "history").resolve()
HISTORY_DIR.mkdir(parents=True, exist_ok=True)

# ---- 유틸: 값 정리 & 원자적 쓰기 -------------------------------------------------
def _sanitize_cell(v):
    if v is None:
        return ""
    if not isinstance(v, str):
        v = str(v)
    # 테이블 깨짐 방지: 개행/탭/여러 공백 정리
    v = v.replace("\r", " ").replace("\n", " ").replace("\t", " ")
    while "  " in v:
        v = v.replace("  ", " ")
    return v.strip()

def _atomic_write(path: Path, write_fn):
    tmp = path.with_suffix(path.suffix + ".tmp")
    path.parent.mkdir(parents=True, exist_ok=True)
    try:
        with open(tmp, "w", newline="", encoding="utf-8-sig") as f:
            write_fn(f)
        # Windows에서도 Path.replace는 대상이 있으면 대체
        tmp.replace(path)
    finally:
        try:
            if tmp.exists():
                tmp.unlink()
        except Exception:
            pass

# -------- 공통: 동적 컬럼 안전 CSV 쓰기 -------------------------------------------
def _write_rows_csv(path: Path, rows: list[dict]):
    """
    행들의 키를 합집합으로 모아 헤더를 만들고, 누락 키는 빈 문자열로 채워서 씀.
    pipeline_csv.export_csv 가 없을 때의 폴백으로 사용.
    원자적으로 기록하여 읽기 경합 시에도 일관성 보장.
    """
    preferred = [
        "url","canonical_url","guid","article_id",
        "source","url_hash","category",
        "published_at","rss_published_at","modified_at",
        "title","title_key","content","author","summary",
        "image_main","image_urls",
        "update_status","edited","content_hash"
    ]
    # 모든 키 합집합 수집
    all_keys = set()
    for r in rows:
        if isinstance(r, dict):
            all_keys.update(r.keys())
    # 우선순위 + 잔여키(알파벳)
    header = [k for k in preferred if k in all_keys] + sorted(all_keys - set(preferred))

    def _do_write(fh):
        w = csv.writer(fh)
        w.writerow(header)
        for r in rows:
            if not isinstance(r, dict):
                continue
            w.writerow([_sanitize_cell(r.get(k, "")) for k in header])

    _atomic_write(path, _do_write)

# -------- pipeline 호출 후 CSV/스냅샷 처리 ---------------------------------------
def _try_rows_via_run_once():
    if hasattr(pipeline_csv, "run_once"):
        try:
            rows = pipeline_csv.run_once()
            if isinstance(rows, list):
                return rows
        except Exception as e:
            print("[run_once] error:", e)
    return None

def _export_csv(rows):
    """
    1) 사용자의 pipeline_csv.export_csv 가 있으면 그것을 사용(스키마/정렬 그대로)
    2) 없으면 동적 헤더 방식으로 폴백
    """
    if hasattr(pipeline_csv, "export_csv"):
        try:
            return pipeline_csv.export_csv(rows)
        except Exception as e:
            print("[export_csv] pipeline_csv.export_csv error, fallback to dynamic:", e)
    _write_rows_csv(CSV_PATH, rows)
    print(f"saved: {CSV_PATH} ({len(rows)} rows)")

def _try_run_legacy_main():
    """
    pipeline_csv 내부에 main/run 계열 진입점이 있을 경우 호출해 CSV 생성 유도,
    직후 CSV를 읽어 rows로 반환. (레거시 호환)
    """
    for cand in ("main", "run", "run_all", "run_pipeline"):
        if hasattr(pipeline_csv, cand):
            try:
                getattr(pipeline_csv, cand)()
                break
            except Exception as e:
                print(f"[legacy:{cand}] error:", e)
    try:
        import pandas as pd
    except Exception as e:
        print("[legacy] pandas import error:", e)
        return []
    if CSV_PATH.exists():
        try:
            df = pd.read_csv(CSV_PATH, dtype=str).fillna("")
            return df.to_dict(orient="records")
        except Exception as e:
            print("[legacy] read CSV error:", e)
            return []
    return []

def _save_snapshot_from_rows(rows):
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    snap_path = HISTORY_DIR / f"articles_{ts}.csv"
    _write_rows_csv(snap_path, rows)
    print(f"Saved snapshot: {snap_path}")

def _prune_snapshots_if_needed():
    """
    환경변수 SNAPSHOT_KEEP=N 이 설정되면 스냅샷을 최근 N개만 유지(기본 0=끄기)
    """
    keep = int(os.getenv("SNAPSHOT_KEEP", "0") or "0")
    if keep <= 0:
        return
    snaps = sorted(HISTORY_DIR.glob("articles_*.csv"))
    if len(snaps) > keep:
        old = snaps[: len(snaps) - keep]
        for p in old:
            try:
                p.unlink()
            except Exception:
                pass
        if old:
            print(f"[prune] removed {len(old)} old snapshots, keep={keep}")

def main():
    rows = _try_rows_via_run_once()
    if rows is not None:
        _export_csv(rows)
    else:
        rows = _try_run_legacy_main()
        if not rows:
            raise RuntimeError(
                "파이프라인 실행/CSV 읽기 실패: run_once/export_csv 또는 main(레거시) 확인 필요"
            )
    _save_snapshot_from_rows(rows)
    _prune_snapshots_if_needed()

if __name__ == "__main__":
    main()
