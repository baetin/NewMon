# 뉴스 크롤링 & 모니터링 시스템

한경 뉴스 RSS 피드를 자동으로 수집하고, 기사 변경 사항을 추적하며, AI 요약을 제공하는 시스템입니다.

## 주요 기능

- ✅ **RSS 피드 자동 수집** (30분 간격)
- ✅ **기사 변경 감지** (본문, 제목, 메타데이터)
- ✅ **AI 기반 요약** (KoBART + Sentence Transformers)
- ✅ **웹 대시보드** (Flask 기반)
- ✅ **인기 기사 트렌딩 토픽 수집**
- ✅ **이미지 자동 다운로드**
- ✅ **변경 이력 추적 & Diff 비교**

## 설치 방법

### 1. 저장소 클론
```bash
git clone https://github.com/baetin/NewMon.git
cd NewMon
git checkout feature/dedupe-and-summary
```

### 2. 패키지 설치
```bash
pip install -r requirements.txt
```

**필수 패키지:**
- httpx, feedparser, trafilatura (크롤링)
- transformers, torch, sentence-transformers (AI 요약)
- flask (웹 대시보드)
- beautifulsoup4, lxml (HTML 파싱)
- python-dateutil (날짜 처리)
- numpy, scikit-learn (데이터 처리)

## 사용 방법

### 기본 크롤링 실행
```bash
python pipeline_csv.py
```

### 웹 대시보드 실행
```bash
python news_dashboard/server.py
```
- 브라우저에서 `http://localhost:5000` 접속
- 자동 수집 스케줄러가 백그라운드에서 실행됩니다

## 설정 파일

### `settings.py` - 주요 설정

#### 피드 설정
```python
FEEDS = {
    "https://www.hankyung.com/feed/sports": "sports",
}
PER_FEED_LIMIT = 5  # 피드당 최대 기사 개수
```

#### 자동 수집 간격
```python
AUTO_COLLECT_INTERVAL = 1800  # 30분 (초 단위)
```

#### 파일 경로
```python
CSV_PATH = "exports/articles.csv"      # 수집된 기사 저장 경로
IMAGES_DIR = "exports/images"          # 이미지 다운로드 경로
```

#### 기사 누적 설정
```python
ACCUMULATE_ARTICLES = True             # 기사 누적 모드
ACCUMULATE_MAX_ARTICLES = 100          # 최대 보관 기사 수
ACCUMULATE_MAX_DAYS = 30               # 최대 보관 일수
```

#### 재크롤링 설정 (하이브리드 모드)
```python
RECRAWL_EXISTING_ARTICLES = True       # 기존 기사 재크롤링
RECRAWL_HOURS_LIMIT = 24               # 24시간 이내 기사만 재크롤링
RECRAWL_MAX_ARTICLES = 20              # 최대 재크롤링 기사 수
```

#### 이미지 다운로드
```python
DOWNLOAD_IMAGES = True                 # 이미지 실제 다운로드
```

#### AI 요약 설정
```python
USE_SEMANTIC_SUMMARY = True            # 의미 기반 요약 사용
USE_LOCAL = True                       # KoBART 로컬 모델 사용
LOCAL_MODEL = "gogamza/kobart-summarization"
```

## 출력 파일

### `exports/articles.csv`
수집된 기사 정보 (컬럼):
- `url`, `canonical_url`, `article_id`
- `published_date`, `crawled_at`, `modified_at`
- `title`, `focus_area`, `full_text`, `author`
- `summary_text`, `image_url`
- `edited`, `change_summary`, `diff_text`
- `trending_topics`

### `exports/state_hash.json`
기사 상태 추적용 (변경 감지에 사용)

### `exports/images/`
다운로드된 기사 이미지

### `exports/history/`
과거 수집 스냅샷 (타임스탬프별)

## 웹 대시보드 기능

### 주요 페이지
- **홈** (`/`) - 최근 수집된 기사 목록
- **기사 상세** (`/article/<id>`) - 기사 전체 내용 보기
- **히스토리 비교** (`/compare`) - 스냅샷 간 변경 사항 비교
- **테이블 뷰** (`/table`) - CSV 데이터 테이블 형식으로 보기

### 수동 작업
- **수집 실행** - 즉시 크롤링 실행
- **스냅샷 저장** - 현재 상태 스냅샷 저장

## 변경 감지 시스템

### 감지 항목
1. **본문 변경** - 내용 해시 비교로 실제 텍스트 변경 감지
2. **제목 변경** - 제목 문자열 직접 비교
3. **메타데이터 변경** - 수정일시(`modified_at`) 변경
4. **최초 수집 전 수정** - 발행/수정 시간 차이 120초 이상

### 변경 요약 (`change_summary`)
- "본문 변경"
- "제목 변경"
- "메타 변경"
- "최초 수집 전 수정됨"

### Diff 생성 (`diff_text`)
실제 변경된 내용을 `+추가`, `-삭제` 형식으로 표시

## 시스템 구조

```
.
├── pipeline_csv.py          # 메인 크롤링 로직
├── extractor.py             # 기사 추출 & 파싱
├── settings.py              # 설정 파일
├── summarize_local.py       # KoBART 요약 모델
├── requirements.txt         # 패키지 의존성
├── news_dashboard/
│   ├── server.py            # Flask 웹 서버
│   ├── run_crawl_and_snapshot.py  # 크롤링 래퍼
│   ├── templates/           # HTML 템플릿
│   └── static/              # CSS 스타일
└── exports/
    ├── articles.csv         # 수집된 기사
    ├── state_hash.json      # 상태 추적
    ├── images/              # 이미지 파일
    └── history/             # 스냅샷 히스토리
```

## 기술 스택

- **Python 3.11+**
- **크롤링**: httpx, feedparser, trafilatura, BeautifulSoup
- **AI/NLP**: transformers, torch, sentence-transformers, scikit-learn
- **웹**: Flask
- **데이터**: CSV, JSON

## 작동 원리

### 1. RSS 피드 수집
- 설정된 피드 URL에서 최신 기사 수집
- 각 기사의 전체 본문 크롤링 (trafilatura 사용)

### 2. 변경 감지
- 기사 본문의 SHA256 해시 계산
- `state_hash.json`에 저장된 이전 해시와 비교
- 해시가 다르면 실제 본문 Diff 생성

### 3. AI 요약 (3단계 폴백)
1. **의미 기반 요약** (Sentence Transformers + MMR)
2. **KoBART 요약** (로컬 모델)
3. **추출식 요약** (폴백)

### 4. 데이터 저장
- CSV 파일에 누적 저장
- 컬럼명은 DB 친화적으로 설계
- 이미지는 별도 폴더에 다운로드

## 주의사항

### 경로 설정
- 모든 경로는 상대 경로 기본값 사용
- 절대 경로 필요 시 `settings.py` 수정

### 모델 다운로드
- 첫 실행 시 AI 모델 자동 다운로드 (약 1GB)
- 인터넷 연결 필요

### 메모리 사용
- torch, transformers 사용으로 메모리 사용량 높음
- 최소 8GB RAM 권장

## 라이선스

MIT License

## 기여자

- baetin
- Claude Code (AI Assistant)
