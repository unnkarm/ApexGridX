# ⬡ ApexGrid — The Visual Intelligence Platform for Formula 1

> **Understand Formula 1 like never before.**
> Live telemetry · Tyre strategy · AI race analysis · Fan community

ApexGrid is a full-stack F1 intelligence platform built for fans who want more than standings — they want to *understand* the race. The platform combines real-time data visualization, Bayesian tyre modelling, interactive track replays, and an AI assistant into a single, startup-grade web application.

---

## 📸 Preview

| Hero Landing | Race Dashboard | AI GridBot |
|---|---|---|
| Animated speed lines, countdown, CTA | Track map, leaderboard, telemetry | Chat UI with race context |

---

## 🗂️ Project Structure

```
apexgrid/
│
├── ApexGrid.jsx              # Main platform — landing page + full dashboard
├── F1Tracker.jsx             # Standalone season tracker widget
├── README.md                 # This file
│
├── frontend/
│   ├── components/
│   │   ├── Hero.jsx          # Animated landing section
│   │   ├── TrackMap.jsx      # SVG circuit renderer with animated cars
│   │   ├── LiveLeaderboard.jsx
│   │   ├── TyreStrategyBar.jsx
│   │   ├── RaceTimeline.jsx
│   │   ├── TelemetryPanel.jsx
│   │   ├── PlaybackControls.jsx
│   │   ├── AIChat.jsx        # GridBot chat interface
│   │   └── CommunitySection.jsx
│   │
│   └── pages/
│       ├── Landing           # Hero + features + standings + community
│       ├── Dashboard         # Race replay + strategy + timeline + telemetry
│       ├── Drivers           # Driver profiles with radar charts
│       ├── Community         # Posts, team rooms, predictions
│       └── GridBot           # Full AI assistant page
│
├── backend/                  # (Python FastAPI — see Backend Setup)
│   ├── main.py
│   ├── api/
│   │   ├── races.py
│   │   ├── drivers.py
│   │   └── standings.py
│   ├── services/
│   │   └── ergast_fetcher.py
│   └── ai/
│       ├── race_explainer.py
│       └── chat_assistant.py
│
└── f1-race-replay/           # Upstream Python visualization engine (see Credits)
    ├── src/
    │   ├── race_replay.py    # Arcade-based race window
    │   ├── bayesian_tyre_model.py
    │   ├── tyre_degradation_integration.py
    │   ├── f1_data.py
    │   └── ui_components.py
    └── main.py
```

---

## ✨ Features

### 🏠 Landing Page
- **Animated hero** with canvas speed-line particles and red glow orb
- **Live countdown** to the next race, ticking in real time
- **Feature showcase** — 3 interactive cards linking to each platform section
- **2026 Driver Standings strip** — sortable, color-coded by team
- **Community section** embedded in the landing flow
- **Footer** with GitHub, API docs, newsletter, and social links

### 📊 Race Dashboard
The centerpiece. Built directly on concepts from the `f1-race-replay` engine.

| Tab | What it shows |
|-----|--------------|
| **Track Replay** | SVG circuit with animated driver dots, DRS zones (green), safety car coloring, pit lane indicator, playback controls |
| **Tyre Strategy** | Compound bars with Bayesian degradation meter per stint, plus season points progression chart |
| **Race Timeline** | Hover-interactive horizontal timeline — Safety Car, pit stops, overtakes, fastest lap, finish |
| **Telemetry** | Live speed trace (AreaChart), gear/DRS/tyre stats, driver radar chart (pace/racecraft/consistency/experience) |

**Sidebar (always visible):**
- Live leaderboard with gap to leader, interval, tyre compound dot, DRS indicator
- Track conditions: air temp, track temp, humidity, wind direction
- Race results summary: podium + fastest lap

### 🗺️ Track Map (SVG Renderer)
Inspired by `build_track_from_example_lap()` and `draw_finish_line()` from `race_replay.py`:

- Procedurally generated circuit geometry using trigonometric track points
- **DRS zones** highlighted in green along the outer track edge (toggleable — key `D` in the Python version)
- **4 animated cars** — VER (main, red glow), LEC, NOR, RUS (ghost cars at offset positions)
- Start/finish line, corner labels (T1, T5, T10, T15)
- Car angle computed from movement vector for realistic orientation

### 📊 Tyre Strategy Visualizer
Inspired by `BayesianTyreDegradationModel` and `TyreDegradationIntegrator` from the Python engine:

- **Compound bars** (Soft/Medium/Hard/Inter/Wet) color-coded and proportionally sized by stint length
- **Degradation meter** at the bottom of each bar — green (fresh) → yellow (worn) → red (critical)
- Hover tooltip shows compound name, lap count, and degradation percentage
- Supports multi-stint strategies (1-stop, 2-stop, 3-stop)

### ⏯️ Playback Controls
Mirrors `RaceControlsComponent` from `ui_components.py`:

- Play/Pause, Restart buttons
- Speed selector: **0.5x · 1x · 2x · 4x · 8x**
- Progress bar with event markers (SC, pit stops) — matches `RaceProgressBarComponent`
- Lap counter and race time display

### 🏆 Live Leaderboard
Built on `LeaderboardComponent` architecture:

- Ordered by track position (gap-based, mirroring `driver_progress` calculations)
- Gap to leader + interval gap display
- Tyre compound dot with compound-accurate color
- **DRS indicator** badge (green) when DRS is open
- Click any driver to select them → highlights their telemetry + track dot

### 🌡️ Weather Panel
From `WeatherComponent` in `ui_components.py`:

- Air temperature, track temperature, humidity, wind speed + direction (NNW format)
- Updates contextually per lap

### 🤖 GridBot — AI Race Assistant
Powered by the **Claude API** (`claude-sonnet-4-20250514`):

- Full 2026 season context injected into every request
- Explains strategies, predicts outcomes, compares drivers, summarizes races
- **Community Sentiment widget** — real-time sentiment breakdown (e.g. "72% think Ferrari pitted too early")
- Quick-question chips for instant exploration
- Multi-turn conversation history maintained per session

**Example interactions:**
```
User: Why did Hamilton pit early in Australia?
GridBot: Hamilton opted for an early undercut on lap 18, using the Safety Car window
         to switch from Mediums to Hards without losing track position...

User: What is a Bayesian tyre model?
GridBot: It's a state-space model that estimates tyre degradation in real time using
         prior beliefs + observed lap times. The model in this project tracks α (degradation state),
         fuel load, and track abrasion to predict when a driver should pit...
```

### 👥 Community
- **Hot posts** with upvotes, comments, F1-themed reaction buttons (🏎️ Overtake / 🔥 Hot Take / 🧠 Strategy / 💀 Disaster)
- **Team Communities** — Red Bull Garage, Ferrari Tifosi, McLaren Papaya Hub, Mercedes Pitwall, and more
- **Prediction Leaderboard** — weekly race prediction contest with ranked standings
- Post cards with time, tag badges (Strategy Debate / Tech Analysis / Driver Analysis), and author avatars

### 🧑‍✈️ Driver Profiles
- Cards for all 10 drivers with team color accent, 3-stat grid (points/wins/podiums)
- **Skill bars** — Pace and Racecraft, animated on mount
- **Radar chart** — Pace / Racecraft / Consistency / Experience / Championships
- Driving style quote per driver

---

## 🧠 Data Sources

### Live Data (Ergast API)
```
Base URL: https://ergast.com/api/f1/

Driver standings:   /current/driverStandings.json
Constructor stands: /current/constructorStandings.json
Race results:       /{year}/{round}/results.json
Qualifying:         /{year}/{round}/qualifying.json
Lap times:          /{year}/{round}/laps.json
Pit stops:          /{year}/{round}/pitstops.json
```

### Telemetry Data (FastF1)
The `f1-race-replay` engine uses **FastF1** to fetch real telemetry:

```python
import fastf1

session = fastf1.get_session(2025, 'Bahrain', 'R')
session.load()

lap = session.laps.pick_fastest()
telemetry = lap.get_telemetry()  # Speed, Gear, Throttle, Brake, DRS, X, Y
```

FastF1 caches data locally in `.fastf1-cache/` on first run.

---

## 🚀 Quick Start

### Frontend (React)

```bash
# Clone the repository
git clone https://github.com/yourname/apexgrid
cd apexgrid

# Install dependencies
npm install

# Set your Anthropic API key (for GridBot)
echo "VITE_ANTHROPIC_API_KEY=sk-ant-..." > .env

# Start dev server
npm run dev
```

The main app is a single React file (`ApexGrid.jsx`) with no external backend required for the frontend — all data is currently seeded from the 2026 season. Swap in Ergast API calls to make it live.

### Python Race Replay Engine

```bash
cd f1-race-replay

# Create virtual environment
python -m venv venv
source venv/activate        # macOS/Linux
# or: .\venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Run with GUI menu
python main.py

# Run specific race directly
python main.py --viewer --year 2025 --round 12

# Run without HUD
python main.py --viewer --year 2025 --round 12 --no-hud

# Run qualifying session
python main.py --viewer --year 2025 --round 12 --qualifying

# Run sprint race
python main.py --viewer --year 2025 --round 12 --sprint
```

### Python Backend (FastAPI)

```bash
cd backend

pip install fastapi uvicorn httpx fastf1

# Start API server
uvicorn main:app --reload --port 8000

# Endpoints:
# GET /api/standings/drivers
# GET /api/standings/constructors
# GET /api/races/{year}
# GET /api/race/{year}/{round}/results
# GET /api/race/{year}/{round}/telemetry/{driver}
# POST /api/ai/explain
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Recharts, SVG animations |
| **Styling** | Tailwind-compatible inline CSS, CSS variables |
| **Fonts** | Barlow Condensed (display) · DM Mono (data) · Outfit (body) |
| **Charts** | Recharts — LineChart, AreaChart, RadarChart |
| **AI** | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| **Race Engine** | Python + Arcade (f1-race-replay) |
| **Telemetry** | FastF1 |
| **Data API** | Ergast F1 API |
| **Backend** | Python FastAPI |
| **Database** | PostgreSQL (for community + user accounts) |
| **Real-time** | WebSockets (Socket.io for community live updates) |

---

## 🧮 Bayesian Tyre Model

The tyre degradation system (from `bayesian_tyre_model.py`) uses a **state-space model**:

```
State equation:
  α_{t+1} = (1 - I_pit) × (α_t + ν × A_track) + I_pit × α_reset + η_t

Observation equation:
  y_t = α_t + γ × fuel_t + δ_mismatch + ε_t
```

Where:
- `α_t` — degradation state at lap t
- `ν` — degradation rate (compound-specific)
- `A_track` — track abrasion factor
- `I_pit` — pit stop indicator (resets state)
- `γ` — fuel effect coefficient (~0.032s/kg)
- `δ_mismatch` — compound/condition mismatch penalty
- `η_t`, `ε_t` — process and observation noise

**Tyre profiles:**

| Compound | Category | Degradation Rate | Warmup Laps |
|----------|----------|-----------------|-------------|
| Soft     | SLICK    | High             | 1           |
| Medium   | SLICK    | Medium           | 2           |
| Hard     | SLICK    | Low              | 3           |
| Inter    | INTER    | Medium           | 2           |
| Wet      | WET      | Low              | 3           |

**Condition mismatch penalties** (extra seconds per lap):

| Tyre | Condition | Penalty |
|------|-----------|---------|
| SLICK | DAMP | +2.0s |
| SLICK | WET | +8.0s |
| INTER | DRY | +1.5s |
| WET | DRY | +4.0s |

---

## 🎮 Race Replay Controls (Python Engine)

| Key | Action |
|-----|--------|
| `SPACE` | Pause / Resume |
| `←` / `→` | Rewind / Fast-forward |
| `↑` / `↓` | Increase / Decrease playback speed |
| `1`–`4` | Set speed directly (0.5x, 1x, 2x, 4x) |
| `R` | Restart replay |
| `D` | Toggle DRS zones |
| `L` | Toggle driver name labels |
| `B` | Toggle progress bar |
| `I` | Toggle session info banner |
| `H` | Toggle controls popup |
| `ESC` | Close window |
| Click leaderboard | Select driver (shows telemetry) |
| Shift-click | Multi-select drivers |

---

## 🗺️ Roadmap

### v1.0 — Current
- [x] Landing page with animated hero
- [x] Race dashboard (track replay, tyre strategy, timeline, telemetry)
- [x] Live leaderboard with DRS + tyre indicators
- [x] AI GridBot assistant (Claude-powered)
- [x] Community posts + team communities + prediction league
- [x] Driver profiles with radar charts
- [x] Python race replay engine with Bayesian tyre model

### v1.1 — In Progress
- [ ] Live Ergast API integration (replace seeded data)
- [ ] FastAPI backend with real endpoints
- [ ] User accounts (sign up / sign in)
- [ ] Favorite drivers + team tracking
- [ ] Push notifications (race alerts, fastest lap, safety car)

### v1.2 — Planned
- [ ] Strategy prediction tool ("Suggest optimal pit window")
- [ ] Win probability model using ML
- [ ] Qualifying session replay (partially implemented in Python engine)
- [ ] Sprint race support
- [ ] Race in 60 seconds — auto-generated highlight reel
- [ ] Creator mode — user-authored race breakdown articles
- [ ] Verified analyst badges + reputation system

### v2.0 — Vision
- [ ] Real-time WebSocket data during race weekends
- [ ] 3D track visualization (Three.js)
- [ ] Driver comparison tool (head-to-head stats across seasons)
- [ ] Historical race browser (all seasons via Ergast)
- [ ] Mobile app (React Native)

---

## 🔧 Environment Variables

```env
# Anthropic (required for GridBot)
VITE_ANTHROPIC_API_KEY=sk-ant-...

# Backend (optional — for FastAPI server)
ERGAST_BASE_URL=https://ergast.com/api/f1
OPENF1_BASE_URL=https://api.openf1.org/v1
DATABASE_URL=postgresql://user:pass@localhost:5432/apexgrid

# FastF1 cache (Python engine)
FASTF1_CACHE_PATH=./.fastf1-cache
```

---

## 📡 API Reference

### GridBot (POST /api/ai/explain)

```json
{
  "question": "Why did Ferrari lose Bahrain GP?",
  "context": {
    "race": "Bahrain GP",
    "year": 2026,
    "round": 4
  }
}
```

Response:
```json
{
  "answer": "Ferrari struggled with tyre degradation after lap 25, forcing an earlier-than-planned second stop. Red Bull maintained better pace on the Hard compound throughout the final stint...",
  "sources": ["Ergast lap time data", "FastF1 tyre telemetry"]
}
```

### Standings (GET /api/standings/drivers)

```json
{
  "season": "2026",
  "drivers": [
    {
      "position": 1,
      "code": "VER",
      "name": "Max Verstappen",
      "team": "Red Bull Racing",
      "points": 77,
      "wins": 2
    }
  ]
}
```

---

## 🏁 Data Pipeline (Python Engine)

```
FastF1 API
    ↓
f1_data.py (telemetry loading + frame generation)
    ↓
bayesian_tyre_model.py (degradation estimation)
    ↓
tyre_degradation_integration.py (per-lap tyre health)
    ↓
race_replay.py (Arcade window + track rendering)
    ↓
ui_components.py (LeaderboardComponent, WeatherComponent,
                   RaceProgressBarComponent, DriverInfoComponent,
                   SessionInfoComponent, RaceControlsComponent)
```

---

## 🎨 Design System

**Aesthetic:** Motorsport engineering — carbon fibre base, electric red accent, telemetry green data.

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#050507` | Page background |
| `--surface` | `#0d0d10` | Section backgrounds |
| `--card` | `#111115` | Card backgrounds |
| `--border` | `#1e1e28` | All borders |
| `--red` | `#e10600` | F1 red accent — CTAs, highlights |
| `--green` | `#00e676` | Data green — DRS zones, live indicator |
| `--teal` | `#00bcd4` | Secondary data — pit stops |
| `--gold` | `#ffc107` | P1 / fastest lap |
| `--text` | `#f0f0f6` | Primary text |
| `--muted` | `rgba(240,240,246,0.45)` | Secondary text |

**Typography:**
- **Barlow Condensed 900** — Display headings, section titles, driver names
- **DM Mono 500** — Numbers, lap times, telemetry values
- **Outfit 400–700** — Body copy, UI labels

---

## 🙏 Credits

| Project | Author | License |
|---------|--------|---------|
| [f1-race-replay](https://github.com/IAmTomShaw/f1-race-replay) | Tom Shaw | MIT |
| [FastF1](https://github.com/theOehrly/Fast-F1) | Oehrly | MIT |
| [Ergast F1 API](https://ergast.com/mrd/) | Ergast | Free (non-commercial) |
| [Recharts](https://recharts.org/) | recharts-org | MIT |
| [Anthropic Claude](https://anthropic.com) | Anthropic | API Terms |

---

## ⚠️ Disclaimer

No copyright infringement intended. Formula 1, F1, and all associated marks are the property of Formula One Licensing B.V. All data is sourced from publicly available APIs and is used for educational and non-commercial purposes only.

---

## 📝 License

MIT License — see [LICENSE](./LICENSE) for details.

---

<div align="center">
  <strong>Built for the fans who want to understand the race, not just watch it. 🏎️</strong>
</div>
