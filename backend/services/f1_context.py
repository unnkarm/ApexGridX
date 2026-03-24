from __future__ import annotations

from datetime import date, datetime
from typing import Any, Optional

from . import ergast_fetcher


def _parse_race_date(race: dict) -> Optional[date]:
    d = (race or {}).get("date")
    if not d:
        return None
    try:
        return datetime.strptime(d, "%Y-%m-%d").date()
    except Exception:
        return None


async def get_f1_overview(season: str = "current") -> dict[str, Any]:
    """
    Returns a compact snapshot for UI + AI prompts.
    Uses Ergast as the F1 data source.
    """
    driver = await ergast_fetcher.get_driver_standings(season=season)
    constructor = await ergast_fetcher.get_constructor_standings(season=season)
    races = await ergast_fetcher.get_race_schedule(season=season)

    today = date.today()
    races_with_dates = [(r, _parse_race_date(r)) for r in races]

    next_race = None
    last_race = None
    for r, rd in races_with_dates:
        if rd and rd >= today and next_race is None:
            next_race = r
        if rd and rd < today:
            last_race = r

    return {
        "season": season,
        "generatedAt": datetime.utcnow().isoformat() + "Z",
        "driverStandings": driver,
        "constructorStandings": constructor,
        "races": races,
        "nextRace": next_race,
        "lastRace": last_race,
    }


def format_overview_for_prompt(overview: dict[str, Any], *, top_n: int = 10) -> str:
    """
    Produce a short plaintext context blob for LLM prompting.
    """
    season = overview.get("season", "current")
    generated_at = overview.get("generatedAt", "")

    driver = overview.get("driverStandings") or []
    constructor = overview.get("constructorStandings") or []
    next_race = overview.get("nextRace") or {}
    last_race = overview.get("lastRace") or {}

    def fmt_driver(d: dict) -> str:
        drv = d.get("Driver") or {}
        code = drv.get("code") or f"{drv.get('familyName', '')}".upper()
        return f"P{d.get('position')} {code} {d.get('points')}pts"

    def fmt_constructor(c: dict) -> str:
        cons = c.get("Constructor") or {}
        name = cons.get("name") or cons.get("constructorId") or "UNK"
        return f"P{c.get('position')} {name} {c.get('points')}pts"

    def fmt_race(r: dict) -> str:
        if not r:
            return "None"
        return f"{r.get('raceName')} (Round {r.get('round')}, {r.get('date')})"

    drivers_line = " · ".join(fmt_driver(x) for x in driver[:top_n]) or "No data"
    constructors_line = " · ".join(fmt_constructor(x) for x in constructor[:top_n]) or "No data"

    return "\n".join(
        [
            f"F1 overview (season={season}, generatedAt={generated_at})",
            f"Next race: {fmt_race(next_race)}",
            f"Last race: {fmt_race(last_race)}",
            f"Driver standings (top {top_n}): {drivers_line}",
            f"Constructor standings (top {top_n}): {constructors_line}",
        ]
    )

