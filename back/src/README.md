python -m pip install -U pip setuptools wheel

# CPU 전용 PyTorch (가장 안전)
pip install torch --index-url https://download.pytorch.org/whl/cpu

# 나머지
pip install \
  feedparser requests beautifulsoup4 lxml pandas pillow tqdm python-dateutil \
  transformers sentencepiece accelerate safetensors huggingface_hub


pip install httpx trafilatura readability-lxml lxml
(선택) 이미지/HTML 파싱 품질 업
pip install beautifulsoup4

feedparser → RSS 파싱
pip install feedparser python-dateutil

USE_LOCAL=True로 summarize_local을 쓰는 경우(코바트 로컬 요약):
pip install transformers sentencepiece accelerate safetensors huggingface_hub
# 그리고 환경에 맞는 torch (예: CPU)
pip install torch --index-url https://download.pytorch.org/whl/cpu

# 필수
pip install transformers torch sentencepiece

# 성능/안정 보조(권장, 가벼움)
pip install accelerate safetensors huggingface_hub
