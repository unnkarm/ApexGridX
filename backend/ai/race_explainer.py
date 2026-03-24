"""
race_explainer.py
GridBot AI — race strategy explainer and assistant.
Uses Gemini API (or Ollama/Gemma locally).
"""

import os
import asyncio

# ── System prompt ─────────────────────────────────────────────────────────

GRIDBOT_SYSTEM = """You are GridBot — an elite F1 analyst embedded in ApexGrid, the premier F1 intelligence platform.

You blend the precision of a race engineer with the clarity of a broadcast commentator.
Your job: explain race strategies, decode telemetry, predict pit windows, and compare drivers.

Style rules:
- Max 120 words per answer unless asked for detail
- Use 1–2 emojis maximum per response
- Be specific: cite lap numbers, compound names, gap in seconds
- Use plain English — define jargon when you use it
- When asked about current standings/schedule/results, use the provided live context (if present). If it's missing, say you don't have the latest data.
- End provocative strategy questions with a follow-up question
"""

CONCEPT_PROMPTS = {
    "drs": "Explain DRS (Drag Reduction System) simply. Include: when it activates, how much speed it adds, where it's used.",
    "undercut": "Explain the undercut strategy. Include: how it works, when teams use it, an example from recent racing.",
    "overcut": "Explain the overcut strategy. How is it different from undercut? When does it work?",
    "safety_car": "Explain safety car deployment. Include: why it's deployed, how teams use it strategically, virtual vs physical SC.",
    "pit_stop": "Explain F1 pit stops. Include: how fast modern stops are, what happens, tyre strategy basics.",
    "qualifying": "Explain F1 qualifying format (Q1/Q2/Q3). Include: elimination format, why pole position matters.",
    "points": "Explain the F1 points system. Include: points per position, bonus points, why constructors championship matters.",
    "tire_deg": "Explain tyre degradation in F1. Include: what causes it, cliff effect, how Bayesian models predict it.",
}


# ── Gemini integration ───────────────────────────────────────────────────

async def get_gridbot_response_async(messages: list[dict], extra_context: str = "") -> str:
    """
    Call Gemini API to get GridBot response.
    Set GEMINI_API_KEY in environment.
    """
    from .gemini_client import GeminiConfig, GeminiError, generate_text

    try:
        system = GRIDBOT_SYSTEM
        if extra_context:
            system += f"\n\nLive F1 context:\n{extra_context}"

        def _env_float(key: str, default: float) -> float:
            try:
                return float(os.environ.get(key, default))
            except Exception:
                return default

        def _env_int(key: str, default: int) -> int:
            try:
                return int(os.environ.get(key, default))
            except Exception:
                return default

        cfg = GeminiConfig(
            api_key=os.environ["GEMINI_API_KEY"],
            model=os.environ.get("GEMINI_MODEL", "gemini-1.5-flash"),
            temperature=_env_float("GEMINI_TEMPERATURE", 0.4),
            max_output_tokens=_env_int("GEMINI_MAX_OUTPUT_TOKENS", 512),
        )
        return await generate_text(config=cfg, messages=messages, system=system)
    except KeyError:
        return "GEMINI_API_KEY not set in environment variables."
    except GeminiError as e:
        return f"GridBot Gemini error: {str(e)}"
    except Exception as e:
        return f"GridBot error: {str(e)}"


def get_gridbot_response(messages: list[dict], extra_context: str = "") -> str:
    """Synchronous wrapper for scripts/tests."""
    return asyncio.run(get_gridbot_response_async(messages, extra_context=extra_context))


def explain_concept(concept_key: str) -> str:
    """Get a simple explanation of an F1 concept."""
    prompt = CONCEPT_PROMPTS.get(concept_key.lower())
    if not prompt:
        available = ", ".join(CONCEPT_PROMPTS.keys())
        return f"Unknown concept. Available: {available}"

    messages = [{"role": "user", "content": prompt}]
    return get_gridbot_response(messages)


def explain_race_result(race_name: str, results: dict) -> str:
    """Generate narrative race summary from Ergast results data."""
    top3 = results.get("Results", [])[:3]
    winner = top3[0]["Driver"]["familyName"] if top3 else "Unknown"
    podium = [r["Driver"]["familyName"] for r in top3]

    prompt = f"""Explain why {winner} won the {race_name}.
Podium: {', '.join(podium)}.
Provide a 3-bullet analysis: strategy, pace, key moments. Keep it under 100 words."""

    messages = [{"role": "user", "content": prompt}]
    return get_gridbot_response(messages)


def predict_race_outcome(circuit: str, driver_standings: list) -> str:
    """Predict likely winner for upcoming race based on historical data."""
    top5 = [f"{d['position']}. {d['Driver']['code']} ({d['points']}pts)" for d in driver_standings[:5]]
    top5_str = "\n".join(top5)

    prompt = f"""Predict the winner of the upcoming {circuit} Grand Prix.
Current top 5 standings:
{top5_str}

Give: likely winner, dark horse pick, key strategic factor. Under 80 words."""

    messages = [{"role": "user", "content": prompt}]
    return get_gridbot_response(messages)


if __name__ == "__main__":
    print("Testing GridBot...")
    print(explain_concept("drs"))
