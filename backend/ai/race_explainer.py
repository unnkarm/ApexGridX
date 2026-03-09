"""
race_explainer.py
GridBot AI — race strategy explainer and assistant.
Uses Anthropic API (or Ollama/Gemma locally).
"""

import os
from typing import Optional

# ── System prompt ─────────────────────────────────────────────────────────

GRIDBOT_SYSTEM = """You are GridBot — an elite F1 analyst embedded in ApexGrid, the premier F1 intelligence platform.

You blend the precision of a race engineer with the clarity of a broadcast commentator.
Your job: explain race strategies, decode telemetry, predict pit windows, and compare drivers.

Style rules:
- Max 120 words per answer unless asked for detail
- Use 1–2 emojis maximum per response
- Be specific: cite lap numbers, compound names, gap in seconds
- Use plain English — define jargon when you use it
- Reference real 2026 season data when asked about current standings
- End provocative strategy questions with a follow-up question

2026 Season knowledge:
- Races: AUS (VER wins), CHN (NOR wins), JPN (LEC wins)
- Driver standings: VER 77, NOR 62, LEC 56, PIA 49, RUS 37, HAM 30
- Constructor standings: McLaren 111, Red Bull 87, Ferrari 86, Mercedes 59
- Hamilton moved to Ferrari for 2026 (formerly Mercedes since 2013)
- Antonelli (19) promoted to Mercedes — impressive debut
- McLaren leads constructors for first time since 2012
- Tyre compounds: Soft (fastest, ~20 lap life), Medium (~32 laps), Hard (~45 laps)
- DRS: opens within 1.0s of car ahead at detection point, +~15 km/h
- Safety Car history: Bahrain avg lap 12-18, Melbourne avg lap 15-22
- Bayesian tyre degradation model available for pit window predictions
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


# ── Anthropic integration ─────────────────────────────────────────────────

def get_gridbot_response(messages: list[dict], extra_context: str = "") -> str:
    """
    Call Anthropic API to get GridBot response.
    Set ANTHROPIC_API_KEY in environment.
    """
    try:
        import anthropic
        client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

        system = GRIDBOT_SYSTEM
        if extra_context:
            system += f"\n\nAdditional race context:\n{extra_context}"

        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=500,
            system=system,
            messages=messages
        )
        return response.content[0].text

    except ImportError:
        return "Anthropic package not installed. Run: pip install anthropic"
    except KeyError:
        return "ANTHROPIC_API_KEY not set in environment variables."
    except Exception as e:
        return f"GridBot error: {str(e)}"


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
