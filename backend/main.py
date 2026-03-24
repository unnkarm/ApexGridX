"""
ApexGrid Backend — FastAPI
Serves F1 data from Ergast API + AI endpoints
"""

import os
from datetime import date
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from typing import Optional, Any
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

@app.get("/api/ai/predict/next")
async def predict_next_race():
    """
    Predict next race winner + dark horse + key strategic factor using GridBot.
    Uses live standings/schedule context from Ergast.
    """
    overview = await get_f1_overview(season="current")
    ctx = format_overview_for_prompt(overview, top_n=10)
    next_race = overview.get("nextRace") or {}
    race_name = next_race.get("raceName") or "the next race"
    circuit = (next_race.get("Circuit") or {}).get("circuitName") or ""
    when = next_race.get("date") or ""

    prompt = (
        f"Predict the winner of {race_name}.\n"
        f"Circuit: {circuit}\n"
        f"Date: {when}\n\n"
        "Return:\n"
        "- Likely winner (1 sentence)\n"
        "- Dark horse (1 sentence)\n"
        "- Key strategic factor (1 sentence)\n"
        "Under 90 words."
    )

    reply = await get_gridbot_response_async(
        [{"role": "user", "content": prompt}],
        extra_context=ctx,
    )
    return {"race": {"name": race_name, "circuit": circuit, "date": when}, "prediction": reply}


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


# ── WebSocket Race Rooms (Discord-lite) ───────────────────────────────────

class RoomMessage(BaseModel):
    type: str = "message"  # "message"
    text: str


class _RoomState:
    def __init__(self):
        self.connections: dict[str, set[WebSocket]] = {}
        self.history: dict[str, list[dict[str, Any]]] = {}
        self.members: dict[str, dict[WebSocket, str]] = {}

    def _ensure(self, room_id: str):
        self.connections.setdefault(room_id, set())
        self.history.setdefault(room_id, [])
        self.members.setdefault(room_id, {})

    def online_count(self, room_id: str) -> int:
        return len(self.connections.get(room_id, set()))


rooms = _RoomState()


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


async def _broadcast(room_id: str, payload: dict[str, Any]):
    for ws in list(rooms.connections.get(room_id, set())):
        try:
            await ws.send_json(payload)
        except Exception:
            # Drop broken connection
            try:
                await ws.close()
            except Exception:
                pass
            rooms.connections.get(room_id, set()).discard(ws)
            rooms.members.get(room_id, {}).pop(ws, None)


async def _send_system(room_id: str, text: str):
    payload = {"type": "system", "text": text, "ts": _now_iso()}
    rooms.history[room_id].append(payload)
    rooms.history[room_id] = rooms.history[room_id][-100:]
    await _broadcast(room_id, payload)


@app.get("/api/rooms")
async def list_rooms():
    """
    Lists chat rooms. Rooms are lightweight and can be created on-the-fly
    by connecting to `/ws/rooms/{room_id}`.
    """
    try:
        overview = await get_f1_overview(season="current")
    except Exception:
        overview = {}
    next_race = overview.get("nextRace") or {}
    last_race = overview.get("lastRace") or {}

    def mk(room_id: str, name: str, topic: str) -> dict[str, Any]:
        return {
            "id": room_id,
            "name": name,
            "topic": topic,
            "online": rooms.online_count(room_id),
        }

    out: list[dict[str, Any]] = [
        mk("paddock", "Paddock", "General F1 chat"),
    ]
    if next_race:
        out.append(
            mk(
                f"race-{next_race.get('round','next')}",
                next_race.get("raceName", "Next Race"),
                "Weekend predictions + strategy talk",
            )
        )
    if last_race:
        out.append(
            mk(
                f"race-{last_race.get('round','last')}-review",
                f"{last_race.get('raceName','Last Race')} Review",
                "Post-race analysis + hot takes",
            )
        )
    return {"rooms": out}


@app.get("/api/rooms/{room_id}/history")
async def room_history(room_id: str):
    rooms._ensure(room_id)
    return {"roomId": room_id, "messages": rooms.history.get(room_id, [])[-100:]}


@app.websocket("/ws/rooms/{room_id}")
async def ws_room(room_id: str, websocket: WebSocket):
    user = (websocket.query_params.get("user") or "Guest").strip()[:32]
    await websocket.accept()
    rooms._ensure(room_id)
    rooms.connections[room_id].add(websocket)
    rooms.members[room_id][websocket] = user

    await websocket.send_json(
        {
            "type": "init",
            "roomId": room_id,
            "user": user,
            "online": rooms.online_count(room_id),
            "history": rooms.history.get(room_id, [])[-50:],
        }
    )
    await _send_system(room_id, f"{user} joined")

    try:
        while True:
            data = await websocket.receive_json()
            msg = RoomMessage(**data)
            text = (msg.text or "").strip()
            if not text:
                continue
            payload = {"type": "message", "user": user, "text": text[:1000], "ts": _now_iso()}
            rooms.history[room_id].append(payload)
            rooms.history[room_id] = rooms.history[room_id][-100:]
            await _broadcast(room_id, payload)
    except WebSocketDisconnect:
        pass
    except Exception:
        pass
    finally:
        rooms.connections.get(room_id, set()).discard(websocket)
        rooms.members.get(room_id, {}).pop(websocket, None)
        await _send_system(room_id, f"{user} left")
