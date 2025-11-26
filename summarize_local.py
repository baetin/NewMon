# summarize_local.py
from __future__ import annotations

import os, time, math, warnings
from typing import List, Tuple, Optional

import torch
from transformers import (
    pipeline,
    AutoTokenizer,
    AutoModelForSeq2SeqLM,
)


# ---------------------------
# Global (lazy) pipeline
# ---------------------------
_PIPE = None
_TOK = None
_MODEL_MAX_LEN = 1024  # 안전 기본값 (kobart는 1024 컨텍스트)


def _bool_env(name: str, default: bool) -> bool:
    v = os.environ.get(name)
    if v is None:
        return default
    return v.strip().lower() in ("1", "true", "yes", "y", "on")


def _ensure_pipe(model_name: str):
    """pipeline을 lazy-init. GPU 있으면 fp16로, 없으면 CPU fp32."""
    global _PIPE, _TOK, _MODEL_MAX_LEN

    if _PIPE is not None:
        return _PIPE

    warnings.filterwarnings("ignore", category=UserWarning)

    use_auto_device = _bool_env("SUMM_USE_AUTO_DEVICE", True)
    device_map = "auto" if use_auto_device else None

    dtype = torch.float16 if torch.cuda.is_available() else torch.float32

    _TOK = AutoTokenizer.from_pretrained(model_name, use_fast=True)
    model = AutoModelForSeq2SeqLM.from_pretrained(
        model_name,
        device_map=device_map,
        torch_dtype=dtype,
    )
    model.eval()

    # 모델 최대 길이 추정 (토크나이저/모델에 등록된 값 사용)
    try:
        _MODEL_MAX_LEN = min(
            getattr(model.config, "max_position_embeddings", _MODEL_MAX_LEN),
            getattr(_TOK, "model_max_length", _MODEL_MAX_LEN),
        )
        # 종종 1e30 같은 placeholder가 들어있어 방어
        if _MODEL_MAX_LEN > 8192:
            _MODEL_MAX_LEN = 1024
    except Exception:
        _MODEL_MAX_LEN = 1024

    _PIPE = pipeline(
        task="summarization",
        model=model,
        tokenizer=_TOK,
        # device_map가 auto면 device 지정 불필요
    )
    return _PIPE


# ---------------------------
# Chunking (token-based)
# ---------------------------
def _chunk_tokens(
    text: str,
    tok: AutoTokenizer,
    max_tokens: int,
    overlap: int = 128,
) -> List[str]:
    """
    텍스트를 토큰 길이 기준으로 안정적으로 분할.
    - max_tokens: 각 조각의 인풋 상한
    - overlap: 문맥 손실 방지 오버랩
    """
    text = (text or "").strip()
    if not text:
        return []

    # 긴 연속 공백 제거
    import re
    text = re.sub(r"\s+", " ", text)

    enc = tok(text, add_special_tokens=False, return_attention_mask=False)
    ids = enc["input_ids"]

    if len(ids) <= max_tokens:
        return [text]

    chunks: List[str] = []
    step = max(1, max_tokens - overlap)
    for start in range(0, len(ids), step):
        piece_ids = ids[start : start + max_tokens]
        if not piece_ids:
            break
        chunk = tok.decode(piece_ids, skip_special_tokens=True)
        chunks.append(chunk.strip())
        if start + max_tokens >= len(ids):
            break
    return chunks


def _safe_lengths(model_max_len: int) -> Tuple[int, int, int]:
    """
    인퍼런스 안정성을 위한 길이 설정을 일관되게 반환.
    - enc_len: 인코더 입력 길이(컨텍스트)
    - sum_max: 요약 토큰 상한
    - sum_min: 요약 토큰 하한
    """
    # 대략 kobart 기준 넉넉한 설정
    enc_len = min(900, model_max_len - 64)
    sum_max = 220
    sum_min = 60
    return enc_len, sum_max, sum_min


# ---------------------------
# Summarization (map-reduce)
# ---------------------------
@torch.inference_mode()
def _summarize_piece(pipe, text: str, max_len: int, min_len: int) -> str:
    try:
        out = pipe(
            text,
            max_length=max_len,
            min_length=min_len,
            do_sample=False,
            truncation=True,
        )[0]["summary_text"].strip()
        return out
    except Exception as e:
        # 조각이 너무 짧거나 특수 토큰 문제 등 → 안전 폴백
        return text[: max_len * 4].strip()


def _reduce_summaries(pipe, title: str, summaries: List[str], max_len: int, min_len: int) -> str:
    merged = " ".join(summaries).strip()
    prompt = f"제목: {title}\n내용 요약: {merged}" if title else merged
    return _summarize_piece(pipe, prompt, max_len=max_len, min_len=min_len)


def _compact(text: str, limit_chars: int) -> str:
    text = (text or "").strip()
    return (text[:limit_chars] + "…") if len(text) > limit_chars else text


# ---------------------------
# Public API
# ---------------------------
def summarize_local(
    title: str,
    content: str,
    model_name: str,
    max_chars: int = 480,
) -> str:
    """
    KoBART 계열 요약 (Map-Reduce)
    - 토큰 기준 청크 + 오버랩으로 안정성 확보
    - 각 조각 2~4문장 목표 → 최종 1회 통합 요약
    - GPU 있으면 자동 활용, 없으면 CPU
    """
    if not content:
        return ""

    pipe = _ensure_pipe(model_name)
    tok = _TOK
    model_max = _MODEL_MAX_LEN

    enc_len, sum_max, sum_min = _safe_lengths(model_max)

    # 1) Token-based chunking with overlap
    parts = _chunk_tokens(content, tok, max_tokens=enc_len, overlap=128)
    if not parts:
        parts = [content]

    # 2) Map: part-wise summaries
    partials: List[str] = []
    for part in parts:
        s = _summarize_piece(pipe, part, max_len=sum_max, min_len=sum_min)
        partials.append(s)
        # 살짝 쉰다(호스트 과부하 방지)
        time.sleep(0.03)

    # 3) Reduce: final merge (+ title hint)
    final = _reduce_summaries(pipe, title, partials, max_len=sum_max, min_len=sum_min)

    # 4) Post-compact
    return _compact(final, limit_chars=max_chars)
