"""
gemini_client.py
Minimal Gemini (Google Generative Language API) client using httpx.

No external SDK required; uses GEMINI_API_KEY.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Iterable, Optional

import httpx


class GeminiError(RuntimeError):
    pass


@dataclass(frozen=True)
class GeminiConfig:
    api_key: str
    model: str = "gemini-1.5-flash"
    temperature: float = 0.4
    max_output_tokens: int = 512
    timeout_s: float = 20.0


def _to_gemini_role(role: str) -> str:
    r = (role or "").lower()
    if r in {"assistant", "model"}:
        return "model"
    return "user"


def _msg_text(msg: dict) -> str:
    content = msg.get("content", "")
    if isinstance(content, str):
        return content
    # Best-effort fallback if content is structured
    return str(content)


def _build_contents(messages: Iterable[dict]) -> list[dict]:
    contents: list[dict] = []
    for m in messages:
        if not isinstance(m, dict):
            continue
        role = _to_gemini_role(m.get("role", "user"))
        text = _msg_text(m).strip()
        if not text:
            continue
        contents.append({"role": role, "parts": [{"text": text}]})
    return contents or [{"role": "user", "parts": [{"text": "Hi"}]}]


async def generate_text(
    *,
    config: GeminiConfig,
    messages: list[dict],
    system: str = "",
) -> str:
    """
    Calls:
      POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key=...
    """
    if not config.api_key:
        raise GeminiError("GEMINI_API_KEY is missing.")

    url = (
        "https://generativelanguage.googleapis.com/v1beta/"
        f"models/{config.model}:generateContent"
    )

    payload: dict[str, Any] = {
        "contents": _build_contents(messages),
        "generationConfig": {
            "temperature": config.temperature,
            "maxOutputTokens": config.max_output_tokens,
        },
    }
    if system.strip():
        payload["systemInstruction"] = {"parts": [{"text": system.strip()}]}

    params = {"key": config.api_key}

    async with httpx.AsyncClient(timeout=config.timeout_s) as client:
        resp = await client.post(url, params=params, json=payload)
        try:
            resp.raise_for_status()
        except httpx.HTTPStatusError as e:
            raise GeminiError(
                f"Gemini HTTP {resp.status_code}: {resp.text[:500]}"
            ) from e

    data = resp.json()
    try:
        candidates = data.get("candidates") or []
        parts = candidates[0]["content"]["parts"]
        text = "".join(p.get("text", "") for p in parts).strip()
        if not text:
            raise KeyError("Empty text")
        return text
    except Exception as e:
        raise GeminiError(f"Unexpected Gemini response: {data}") from e

