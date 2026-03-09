-- ApexGrid Database Schema
-- PostgreSQL

-- ── Users ──────────────────────────────────────────────────────────────────
CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    username    VARCHAR(50)  UNIQUE NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    avatar_url  TEXT,
    favorite_driver  VARCHAR(10),
    favorite_team    VARCHAR(50),
    reputation  INTEGER DEFAULT 0,
    rank        VARCHAR(20) DEFAULT 'Rookie',  -- Rookie, Strategist, Engineer, Race Director
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Community Posts ────────────────────────────────────────────────────────
CREATE TABLE posts (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    body        TEXT,
    tag         VARCHAR(50),     -- Strategy Debate, Tech Analysis, Driver Analysis, etc
    team_tag    VARCHAR(50),     -- Ferrari, McLaren, etc
    race_tag    VARCHAR(100),    -- Australian GP 2026
    upvotes     INTEGER DEFAULT 0,
    is_hot      BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE post_reactions (
    id       SERIAL PRIMARY KEY,
    post_id  INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    user_id  INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type     VARCHAR(20) NOT NULL,  -- overtake, hot_take, strategy, disaster
    UNIQUE(post_id, user_id)
);

CREATE TABLE comments (
    id         SERIAL PRIMARY KEY,
    post_id    INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
    body       TEXT NOT NULL,
    parent_id  INTEGER REFERENCES comments(id),
    upvotes    INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Prediction Contests ────────────────────────────────────────────────────
CREATE TABLE prediction_contests (
    id          SERIAL PRIMARY KEY,
    race_name   VARCHAR(100) NOT NULL,
    season      INTEGER NOT NULL,
    round       INTEGER NOT NULL,
    closes_at   TIMESTAMPTZ NOT NULL,
    status      VARCHAR(20) DEFAULT 'open',  -- open, closed, scored
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE predictions (
    id             SERIAL PRIMARY KEY,
    contest_id     INTEGER REFERENCES prediction_contests(id),
    user_id        INTEGER REFERENCES users(id),
    pole_position  VARCHAR(10),
    race_winner    VARCHAR(10),
    fastest_lap    VARCHAR(10),
    p2             VARCHAR(10),
    p3             VARCHAR(10),
    points_earned  INTEGER DEFAULT 0,
    is_scored      BOOLEAN DEFAULT FALSE,
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(contest_id, user_id)
);

CREATE TABLE prediction_leaderboard (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER REFERENCES users(id) UNIQUE,
    total_pts   INTEGER DEFAULT 0,
    correct     INTEGER DEFAULT 0,
    season      INTEGER DEFAULT 2026,
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Race Cache (mirrors Ergast + FastF1 data) ──────────────────────────────
CREATE TABLE races (
    id           SERIAL PRIMARY KEY,
    season       INTEGER NOT NULL,
    round        INTEGER NOT NULL,
    name         VARCHAR(100),
    circuit      VARCHAR(100),
    country      VARCHAR(50),
    race_date    DATE,
    total_laps   INTEGER,
    status       VARCHAR(20) DEFAULT 'upcoming',  -- upcoming, done
    winner_code  VARCHAR(10),
    fastest_lap_code VARCHAR(10),
    UNIQUE(season, round)
);

CREATE TABLE race_results (
    id          SERIAL PRIMARY KEY,
    race_id     INTEGER REFERENCES races(id),
    position    INTEGER,
    driver_code VARCHAR(10),
    team        VARCHAR(50),
    laps        INTEGER,
    time_str    VARCHAR(20),
    points      NUMERIC(4,1),
    status      VARCHAR(30),  -- Finished, +1 Lap, Retirement, etc
    fastest_lap BOOLEAN DEFAULT FALSE
);

CREATE TABLE pit_stops (
    id          SERIAL PRIMARY KEY,
    race_id     INTEGER REFERENCES races(id),
    driver_code VARCHAR(10),
    stop_number INTEGER,
    lap         INTEGER,
    duration_s  NUMERIC(6,3),
    compound_in  VARCHAR(15),
    compound_out VARCHAR(15)
);

-- ── Tyre Strategy (from Bayesian model output) ─────────────────────────────
CREATE TABLE tyre_stints (
    id          SERIAL PRIMARY KEY,
    race_id     INTEGER REFERENCES races(id),
    driver_code VARCHAR(10),
    stint_num   INTEGER,
    compound    VARCHAR(15),
    lap_start   INTEGER,
    lap_end     INTEGER,
    deg_pct     NUMERIC(5,1),  -- degradation % at end of stint
    avg_lap_s   NUMERIC(6,3)
);

-- ── Indexes ────────────────────────────────────────────────────────────────
CREATE INDEX idx_posts_created   ON posts(created_at DESC);
CREATE INDEX idx_posts_upvotes   ON posts(upvotes DESC);
CREATE INDEX idx_posts_race_tag  ON posts(race_tag);
CREATE INDEX idx_posts_team_tag  ON posts(team_tag);
CREATE INDEX idx_predictions_contest ON predictions(contest_id);
CREATE INDEX idx_race_results_race   ON race_results(race_id);
CREATE INDEX idx_tyre_stints_race    ON tyre_stints(race_id, driver_code);
