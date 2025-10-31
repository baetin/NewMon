# summarize_local.py
import time
from typing import List
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
import torch

_PIPE = None  # lazy init

def _ensure_pipe(model_name: str):
    global _PIPE
    if _PIPE is None:
        tok = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForSeq2SeqLM.from_pretrained(
            model_name,
            device_map="auto",         # GPU 있으면 자동 할당
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
        )
        _PIPE = pipeline(
            "summarization",
            model=model, tokenizer=tok
        )
    return _PIPE

def _chunks(txt: str, max_chars=1500):
    txt = (txt or "").strip()
    for i in range(0, len(txt), max_chars):
        yield txt[i:i+max_chars]

@torch.no_grad()
def summarize_local(title: str, content: str, model_name: str, max_chars: int = 350) -> str:
    """
    KoBART 요약 파이프라인 (map-reduce)
    - 긴 본문은 조각별로 부분요약 → 최종 요약 1회 더
    - 지시 프롬프트 없이도 한국어 뉴스에 잘 맞음
    """
    if not content:
        return ""

    pipe = _ensure_pipe(model_name)

    # 1) 부분 요약 (조각당 2~3문장 목표)
    partials: List[str] = []
    for part in _chunks(content, 1500):
        out = pipe(
            part,
            max_length=200,   # 토큰 기준; 모델이 자동 조정
            min_length=60,
            do_sample=False,
            truncation=True
        )[0]["summary_text"].strip()
        partials.append(out)
        time.sleep(0.05)

    merged = " ".join(partials)

    # 2) 최종 통합 요약 (제목 힌트 추가)
    final = pipe(
        f"제목: {title}\n내용 요약: {merged}",
        max_length=220, min_length=80, do_sample=False, truncation=True
    )[0]["summary_text"].strip()

    return (final[:max_chars] + "…") if len(final) > max_chars else final
