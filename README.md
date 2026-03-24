# ⬡ ApexGrid — F1 Visual Intelligence Platform

> The modern Formula 1 intelligence platform. Live telemetry · Tyre strategy · AI race analysis · Fan community.

![ApexGrid](https://img.shields.io/badge/F1-2026_Season-e10600?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge)
![AI](https://img.shields.io/badge/AI-Gemini-orange?style=for-the-badge)

---

## 🏎️ What is ApexGrid?

ApexGrid is a startup-grade F1 analytics and community platform combining:

| Feature | Description |
|---|---|
| 🗺️ **Race Replay** | Animated SVG track map, DRS zones, live car positions |
| 📊 **Tyre Strategy** | Bayesian degradation model for compound analysis |
| ⏱️ **Telemetry** | Speed traces, gear, DRS, brake data per driver |
| 🤖 **GridBot AI** | Gemini-powered race strategy assistant |
| 👥 **Community** | Posts, team rooms, reactions, prediction league |
| 📋 **Race Timeline** | Lap-by-lap event visualization with hover details |

---

## 📁 Project Structure

```
apexgrid/
├── frontend/                  # React SPA
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.jsx            # Main app — all pages and components
│   │   └── index.js
│   └── package.json
│
├── backend/                   # Python FastAPI
│   ├── main.py                # API routes
│   ├── requirements.txt
│   ├── services/
│   │   ├── ergast_fetcher.py  # Ergast API wrapper with cache
│   │   └── bayesian_tyre_model.py  # Tyre degradation model
│   └── ai/
│       └── race_explainer.py  # GridBot AI integration
│
├── database/
│   └── schema.sql             # PostgreSQL schema
│
└── README.md
```

---

## 🚀 Quick Start

### Frontend

```bash
cd frontend
npm install
npm start
# Opens at http://localhost:3000
```

### Backend

```bash
cd backend
pip install -r requirements.txt

# Set environment variables
export GEMINI_API_KEY=...
export DATABASE_URL=postgresql://user:pass@localhost/apexgrid

uvicorn main:app --reload --port 8000
# API at http://localhost:8000
# Docs at http://localhost:8000/docs
```

### Database

```bash
createdb apexgrid
psql apexgrid < database/schema.sql
```

---

## 🌐 Pages

| Page | Route | Description |
|---|---|---|
| Home | `/` | Hero, feature cards, standings strip, community |
| Dashboard | `/dashboard` | Race replay, tyre strategy, telemetry, leaderboard |
| GridBot | `/ai` | AI chat assistant |
| Community | `/community` | Posts, team rooms, predictions |
| Drivers | `/drivers` | Driver profiles, stats, radar charts |

---

## 🗺️ Dashboard Features

### Track Replay
- Animated SVG circuit with real car positions (VER, NOR, LEC, RUS)
- **DRS zones** highlighted in green (toggle with D key — from f1-race-replay)
- Start/finish line, corner labels
- Playback: play/pause, 0.5x–8x speed, scrub bar with event markers
- Safety Car / Yellow Flag status overlays

### Tyre Strategy Visualizer
Powered by `bayesian_tyre_model.py` — a Kalman filter state-space model:
- Compound stint bars (S/M/H/I/W) with degradation indicator
- Degradation percentage shown at bottom of each bar (green → amber → red)
- Pit window recommendations based on remaining tyre life
- Compound suggestions for undercut/overcut windows

### Race Timeline
From `extract_race_events()` in the original race-replay source:
- Interactive hover timeline at lap precision
- Typed events: Safety Car 🚨, Pit 🔧, Overtake ⚡, DRS 💨, Fastest Lap ⏱️
- Color-coded by event type

### Live Leaderboard
- Gap to leader + interval gap
- Tyre compound dot (color-coded)
- DRS active badge
- Click to select driver for telemetry view

### Weather Panel
From `WeatherComponent` in original source:
- Air temperature, track temperature, humidity, wind direction

---

## 🤖 GridBot AI

GridBot is powered by **Gemini** (Google Generative Language API), augmented with live standings/schedule from the F1 data backend.

**Capabilities:**
- Race strategy analysis ("Why did Ferrari lose Bahrain?")
- Concept explanations ("What is an undercut?")
- Driver comparisons ("VER vs NOR pace comparison")
- Race outcome predictions
- Pit window recommendations (backed by Bayesian model)
- Community sentiment summarization

**Quick questions:** pre-loaded chips for common F1 questions.

---

## 👥 Community

### Posts
- Upvote system with ▲ arrows
- Themed reactions: 🏎️ Overtake · 🔥 Hot Take · 🧠 Strategy · 💀 Disaster
- Tags: Strategy Debate, Tech Analysis, Driver Analysis, Team News, Telemetry
- Hot badge for trending posts

### Team Communities
- Red Bull Garage · Ferrari Tifosi · McLaren Papaya Hub · Mercedes Pitwall
- Member counts · Post counts · Join functionality

### Prediction League
- Pre-race predictions: Pole, Winner, Fastest Lap, Podium
- Points system with weekly leaderboard
- Ranks: Rookie → Strategist → Engineer → Race Director

---

## 📊 Data Sources

| Source | Used For |
|---|---|
| [Ergast API](https://ergast.com/mrd/) | Driver standings, race results, lap times, pit stops |
| [FastF1](https://github.com/theOehrly/Fast-F1) | Telemetry, sector times, tyre data (Python) |
| Bayesian Model | Tyre degradation prediction, pit window estimation |
| Gemini API | GridBot AI responses |

---

## 🧠 Tech Stack

**Frontend:** React 18 · Recharts · Barlow Condensed + DM Mono fonts  
**Backend:** Python 3.11 · FastAPI · httpx  
**Database:** PostgreSQL  
**AI:** Gemini (cloud) or Ollama/Gemma (local)  
**Data:** Ergast API · FastF1 library  

---

## ⚙️ Environment Variables

```env
# backend/.env
GEMINI_API_KEY=...
DATABASE_URL=postgresql://localhost/apexgrid
ERGAST_CACHE_TTL_HOURS=1
CORS_ORIGINS=http://localhost:3000
```

---

## 🗺️ Roadmap

- [ ] WebSocket live race updates
- [ ] User authentication & profiles
- [ ] FastF1 telemetry integration (real sector data)
- [ ] Race Replay with real GPS coordinates
- [ ] Mobile app (React Native)
- [ ] "Race in 60 Seconds" sharable recap
- [ ] Strategy Prediction ML model
- [ ] Verified Analyst program

---

## 📝 Credits

Race replay engine concepts adapted from [f1-race-replay](https://github.com/IAmTomShaw/f1-race-replay) by Tom Shaw (MIT License).  
F1 data from [Ergast Motor Racing API](https://ergast.com/mrd/).  
AI powered by Gemini (Google Generative Language API).

---

## ⚠️ Disclaimer

No copyright infringement intended. Formula 1 and related trademarks are property of their respective owners. All data is from publicly available APIs for educational and non-commercial purposes.

---

*Built with ❤️ for F1 fans who want to go deeper.*
