# settings.py
SOURCE_ID = "hankyung"

# 카테고리별 RSS (economy/society/it/sports)
FEEDS = {
    # "https://www.hankyung.com/feed/economy": "economy",
    # "https://www.hankyung.com/feed/society": "society",
    # "https://www.hankyung.com/feed/it":       "it",
    "https://www.hankyung.com/feed/sports":   "sports",
}

# 피드(카테고리)별 최대 기사 개수
PER_FEED_LIMIT = 5

# 카테고리 숫자 매핑
CATEGORY_MAP = {
    "economy": 1,
    "society": 2,
    "it": 3,
    "sports": 4,
}

# ==== 스케줄러 설정 ====
AUTO_COLLECT_INTERVAL = 1800  # 일반 수집 간격 (초) - 30분 = 1800초
UPDATE_CHECK_HOURS = [12, 15, 18, 21]  # 수정 여부 판단 시각 (시) - 12시, 3시, 6시, 9시
UPDATE_CHECK_ENABLED = False  # 수정 여부 판단 활성화 여부 (현재 비활성화)

USER_AGENT = "NewsCrawler/1.0 (+contact: you@example.com)"
REQUEST_TIMEOUT = 20.0
REQUEST_RETRIES  = 2
REQUEST_DELAY    = 1.0

# 본문이 이보다 짧으면 RSS summary로 보강
MIN_CONTENT_CHARS = 800

# CSV 저장 위치
CSV_PATH = "exports/articles.csv"

# ==== 기사 누적 설정 ====
# RSS에서 사라진 기사도 계속 추적 (False = RSS만 저장, True = 계속 누적)
ACCUMULATE_ARTICLES = True  # 누적 모드 활성화
ACCUMULATE_MAX_ARTICLES = 10000  # 최대 보관 개수 (0 = 무제한)
ACCUMULATE_MAX_DAYS = 30         # 최대 보관 일수 (0 = 무제한)

# ==== 기존 기사 재크롤링 설정 (하이브리드 모드) ====
RECRAWL_EXISTING_ARTICLES = True  # 기존 기사 URL 재크롤링 여부
RECRAWL_HOURS_LIMIT = 24          # 최근 N시간 이내 기사만 재크롤링 (0 = 모두)
RECRAWL_MAX_ARTICLES = 20         # 재크롤링할 최대 기사 수

# ==== 요약 설정 (3단계 폴백 시스템) ====
# 1) 의미기반(벡터) 요약
USE_SEMANTIC_SUMMARY = True
SEM_MODEL_NAME = "jhgan/ko-sroberta-multitask"  # 한국어 SBERT 계열
SEM_MAX_SENTENCES = 2        # 최종 추출 문장 수 (1~2 추천)
SEM_MIN_SENT_LEN = 15        # 너무 짧은 문장 제외(문자 수 기준)

# 2) 로컬(KoBART) 요약 — 벡터 요약이 실패할 때 폴백
USE_LOCAL          = True
LOCAL_MODEL        = "gogamza/kobart-summarization"
MAX_SUMMARY_CHARS  = 480

# ==== 이미지 수집 옵션 ====
COLLECT_IMAGES       = True          # 이미지 URL 수집 (image_main만 수집)
DOWNLOAD_IMAGES      = True          # 실제 파일 저장 (exports/images/에 다운로드)
IMAGES_DIR           = "exports/images"
MAX_IMAGE_BYTES      = 8 * 1024 * 1024
ALLOWED_IMAGE_MIMES  = {"image/jpeg","image/png","image/webp","image/gif"}

# ==== 인기 기사/트렌딩 토픽 수집 옵션 ====
COLLECT_TRENDING_TOPICS = True       # 인기 기사 제목 수집 여부
TRENDING_LIMIT          = 5          # 수집할 인기 기사 개수
