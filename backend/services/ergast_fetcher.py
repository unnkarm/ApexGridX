"""
ergast_fetcher.py
Fetches and caches F1 data from the Ergast Motor Racing API.
https://ergast.com/mrd/
"""

import httpx
import asyncio
import json
import os
from datetime import datetime, timedelta
from typing import Optional, Any

ERGAST_BASE = "https://ergast.com/api/f1"
CACHE_DIR = ".apexgrid-cache"
CACHE_TTL_HOURS = 1  # Live standings cache; race results cached longer


def _cache_path(key: str) -> str:
    os.makedirs(CACHE_DIR, exist_ok=True)
    safe = key.replace("/", "_").replace("?", "_")
    return os.path.join(CACHE_DIR, f"{safe}.json")


def _read_cache(key: str, ttl_hours: int = CACHE_TTL_HOURS) -> Optional[Any]:
    path = _cache_path(key)
    if not os.path.exists(path):
        return None
    mtime = datetime.fromtimestamp(os.path.getmtime(path))
    if datetime.now() - mtime > timedelta(hours=ttl_hours):
        return None
    with open(path) as f:
        return json.load(f)


def _write_cache(key: str, data: Any):
    with open(_cache_path(key), "w") as f:
        json.dump(data, f)


async def fetch(path: str, ttl_hours: int = CACHE_TTL_HOURS) -> dict:
    """Fetch from Ergast API with local file cache."""
    cached = _read_cache(path, ttl_hours)
    if cached:
        return cached

    url = f"{ERGAST_BASE}/{path}.json"
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(url)
        resp.raise_for_status()
        data = resp.json()

    _write_cache(path, data)
    return data


# ── Convenience wrappers ──────────────────────────────────────────────────

async def get_driver_standings(season: str = "current") -> list:
    data = await fetch(f"{season}/driverStandings", ttl_hours=1)
    lists = data["MRData"]["StandingsTable"]["StandingsLists"]
    return lists[0]["DriverStandings"] if lists else []


async def get_constructor_standings(season: str = "current") -> list:
    data = await fetch(f"{season}/constructorStandings", ttl_hours=1)
    lists = data["MRData"]["StandingsTable"]["StandingsLists"]
    return lists[0]["ConstructorStandings"] if lists else []


async def get_race_schedule(season: str = "current") -> list:
    data = await fetch(season, ttl_hours=24)
    return data["MRData"]["RaceTable"]["Races"]


async def get_race_results(season: str, round_num: int) -> dict:
    data = await fetch(f"{season}/{round_num}/results", ttl_hours=168)  # 1 week
    races = data["MRData"]["RaceTable"]["Races"]
    return races[0] if races else {}


async def get_pit_stops(season: str, round_num: int) -> list:
    data = await fetch(f"{season}/{round_num}/pitstops", ttl_hours=168)
    races = data["MRData"]["RaceTable"]["Races"]
    return races[0].get("PitStops", []) if races else []


async def get_lap_times(season: str, round_num: int) -> list:
    data = await fetch(f"{season}/{round_num}/laps", ttl_hours=168)
    return data["MRData"]["RaceTable"].get("Races", [])


async def get_qualifying_results(season: str, round_num: int) -> dict:
    data = await fetch(f"{season}/{round_num}/qualifying", ttl_hours=168)
    races = data["MRData"]["RaceTable"]["Races"]
    return races[0] if races else {}


async def get_driver_info(driver_id: str) -> dict:
    data = await fetch(f"drivers/{driver_id}", ttl_hours=720)  # 30 days
    drivers = data["MRData"]["DriverTable"]["Drivers"]
    return drivers[0] if drivers else {}


# ── CLI test ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    async def main():
        print("Fetching 2026 driver standings...")
        standings = await get_driver_standings()
        for s in standings[:5]:
            d = s["Driver"]
            print(f"  P{s['position']} {d['code']} — {s['points']} pts")

    asyncio.run(main())
