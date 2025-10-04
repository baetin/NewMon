# settings.py
SOURCE_ID = "hankyung"

# 카테고리별 RSS (economy/society/it/sports)
FEEDS = {
    #"https://www.hankyung.com/feed/economy": "economy",
    #"https://www.hankyung.com/feed/society": "society",
    #"https://www.hankyung.com/feed/it":       "it",
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

# ==== 요약 설정 (KoBART 로컬) ====
USE_LOCAL          = True
LOCAL_MODEL        = "gogamza/kobart-summarization"
MAX_SUMMARY_CHARS  = 350

# ==== 이미지 수집 옵션 ====
COLLECT_IMAGES       = True          # 이미지 URL 수집
DOWNLOAD_IMAGES      = True         # 실제 파일 저장까지 할지 (처음엔 False 권장)
IMAGES_DIR           = "exports/images"
MAX_IMAGE_BYTES      = 8 * 1024 * 1024
ALLOWED_IMAGE_MIMES  = {"image/jpeg","image/png","image/webp","image/gif"}