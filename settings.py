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

USER_AGENT = "NewsCrawler/1.0 (+contact: you@example.com)"
REQUEST_TIMEOUT = 20.0
REQUEST_RETRIES  = 2
REQUEST_DELAY    = 1.0

# 본문이 이보다 짧으면 RSS summary로 보강
MIN_CONTENT_CHARS = 800

# CSV 저장 위치
CSV_PATH = "exports/articles.csv"

# ==== 요약 설정 ====
# 1) 의미기반(벡터) 요약을 우선 사용 — 제목+RSS 요약을 질의 벡터로, 본문 문장 중 상위 1~2문장만 선택
USE_SEMANTIC_SUMMARY = True
SEM_MODEL_NAME = "jhgan/ko-sroberta-multitask"  # 한국어 SBERT 계열
SEM_MAX_SENTENCES = 2        # 최종 추출 문장 수 (1~2 추천)
SEM_MIN_SENT_LEN = 15        # 너무 짧은 문장 제외(문자 수 기준)

# 2) 로컬(KoBART) 요약 — 벡터 요약이 실패할 때 폴백
USE_LOCAL          = True
LOCAL_MODEL        = "gogamza/kobart-summarization"
MAX_SUMMARY_CHARS  = 10000

# ==== 이미지 수집 옵션 ====
COLLECT_IMAGES       = True          # 이미지 URL 수집
DOWNLOAD_IMAGES      = True          # 실제 파일 저장까지 할지 (처음엔 False 권장)
IMAGES_DIR           = "exports/images"
MAX_IMAGE_BYTES      = 8 * 1024 * 1024
ALLOWED_IMAGE_MIMES  = {"image/jpeg","image/png","image/webp","image/gif"}
