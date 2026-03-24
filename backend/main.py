"""
ApexGrid Backend — FastAPI
Serves F1 data from Ergast API + AI endpoints
"""

import os
from datetime import date
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from typing import Optional
from dotenv import load_dotenv

from services import ergast_fetcher
from services.f1_context import get_f1_overview, format_overview_for_prompt
from ai.race_explainer import get_gridbot_response_async

load_dotenv()

app = FastAPI(
    title="ApexGrid API",
    description="F1 Visual Intelligence Platform Backend",
    version="1.0.0"
)

cors_origins = os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in cors_origins if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ERGAST_BASE = "https://ergast.com/api/f1"

# ── Ergast API helpers ────────────────────────────────────────────────────

async def fetch_ergast(path: str):
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{ERGAST_BASE}/{path}.json", timeout=10)
        resp.raise_for_status()
        return resp.json()

# ── Routes ────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "ApexGrid API running", "version": "1.0.0"}


@app.get("/api/standings/drivers")
async def driver_standings(season: str = "current"):
    """Get current driver championship standings from Ergast"""
    standings = await ergast_fetcher.get_driver_standings(season=season)
    if not standings:
        raise HTTPException(status_code=404, detail="No standings found")
    return standings


@app.get("/api/standings/constructors")
async def constructor_standings(season: str = "current"):
    """Get constructor championship standings"""
    standings = await ergast_fetcher.get_constructor_standings(season=season)
    if not standings:
        raise HTTPException(status_code=404, detail="No standings found")
    return standings


@app.get("/api/races")
async def race_schedule(season: str = "current"):
    """Get full season race schedule"""
    return await ergast_fetcher.get_race_schedule(season=season)


@app.get("/api/races/{round}/results")
async def race_results(round: int, season: str = "current"):
    """Get race results for a specific round"""
    race = await ergast_fetcher.get_race_results(season=season, round_num=round)
    if not race:
        raise HTTPException(status_code=404, detail="Race not found")
    return race


@app.get("/api/races/{round}/laps")
async def race_laps(round: int, season: str = "current"):
    """Get lap time data for a race"""
    data = await fetch_ergast(f"{season}/{round}/laps")
    return data["MRData"]["RaceTable"]


@app.get("/api/races/{round}/pitstops")
async def pit_stops(round: int, season: str = "current"):
    """Get pit stop data for a race"""
    return await ergast_fetcher.get_pit_stops(season=season, round_num=round)


@app.get("/api/drivers/{driver_id}/seasons")
async def driver_seasons(driver_id: str):
    """Get all seasons a driver competed in"""
    data = await fetch_ergast(f"drivers/{driver_id}/seasons")
    return data["MRData"]["SeasonTable"]["Seasons"]


@app.get("/api/drivers/{driver_id}/results")
async def driver_results(driver_id: str, limit: int = 10):
    """Get recent race results for a driver"""
    data = await fetch_ergast(f"drivers/{driver_id}/results?limit={limit}")
    races = data["MRData"]["RaceTable"]["Races"]
    return races


@app.get("/api/f1/overview")
async def f1_overview(season: str = "current"):
    """A single-call overview: standings + races + next/last race."""
    return await get_f1_overview(season=season)


# ── AI endpoints ──────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    race_context: Optional[str] = None

class StrategyRequest(BaseModel):
    driver_code: str
    current_lap: int
    current_compound: str
    total_laps: int
    gap_to_leader: float
    gap_to_behind: float

@app.post("/api/ai/chat")
async def ai_chat(req: ChatRequest):
    """
    GridBot AI chat endpoint.
    Gemini-powered, augmented with live F1 standings/schedule from Ergast.
    """
    messages = [{"role": m.role, "content": m.content} for m in req.messages]

    extra_context_parts: list[str] = []
    if req.race_context:
        extra_context_parts.append(req.race_context)

    try:
        overview = await get_f1_overview(season="current")
        extra_context_parts.append(format_overview_for_prompt(overview, top_n=10))
    except Exception:
        # Don't fail the chat endpoint if the data source is down.
        pass

    reply = await get_gridbot_response_async(
        messages,
        extra_context="\n\n".join(p for p in extra_context_parts if p.strip()),
    )

    return {
        "reply": reply,
        "model": os.environ.get("GEMINI_MODEL", "gemini-1.5-flash"),
        "status": "ok" if "not set" not in reply.lower() else "configure_api_key",
    }


@app.post("/api/ai/strategy")
async def strategy_prediction(req: StrategyRequest):
    """
    Pit stop strategy predictor.
    Returns optimal pit window based on tyre degradation model.
    Inspired by bayesian_tyre_model.py from f1-race-replay.
    """
    # Simplified heuristic — replace with Bayesian model in production
    remaining = req.total_laps - req.current_lap
    
    compound_life = {"SOFT": 20, "MEDIUM": 32, "HARD": 45}
    expected_life = compound_life.get(req.current_compound.upper(), 30)
    
    # Estimate laps already on this compound (approximation)
    laps_on_tyre = min(req.current_lap, expected_life)
    remaining_tyre_life = max(0, expected_life - laps_on_tyre)
    
    optimal_pit_start = req.current_lap + max(5, remaining_tyre_life - 3)
    optimal_pit_end = optimal_pit_start + 5
    
    # Suggest next compound
    if req.current_compound.upper() == "SOFT":
        suggested = "MEDIUM" if remaining > 20 else "HARD"
    elif req.current_compound.upper() == "MEDIUM":
        suggested = "HARD"
    else:
        suggested = "MEDIUM"
    
    return {
        "driver": req.driver_code,
        "current_lap": req.current_lap,
        "current_compound": req.current_compound,
        "optimal_pit_window": {"start": int(optimal_pit_start), "end": int(min(optimal_pit_end, req.total_laps - 3))},
        "suggested_compound": suggested,
        "remaining_tyre_life_estimate": int(remaining_tyre_life),
        "recommendation": f"Pit between laps {int(optimal_pit_start)}–{int(min(optimal_pit_end, req.total_laps-3))} for {suggested} tyres"
    }


@app.get("/api/ai/race-summary/{season}/{round}")
async def race_summary(season: str, round: int):
    """
    Auto-generate race summary using AI.
    Fetches real Ergast data and generates narrative.
    """
    results = await race_results(round, season)
    top3 = results.get("Results", [])[:3]
    
    summary_data = {
        "race": results.get("raceName"),
        "circuit": results.get("Circuit", {}).get("circuitName"),
        "date": results.get("date"),
        "winner": top3[0]["Driver"]["familyName"] if top3 else "Unknown",
        "podium": [r["Driver"]["familyName"] for r in top3],
        "fastest_lap": next(
            (r["Driver"]["familyName"] for r in results.get("Results", [])
             if r.get("FastestLap", {}).get("rank") == "1"), None
        )
    }
    
    return {
        "summary": summary_data,
        "narrative": f"{summary_data['winner']} claimed victory at the {summary_data['race']} ahead of a competitive field.",
        "status": "basic_summary"
    }
