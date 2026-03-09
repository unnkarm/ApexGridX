"""
bayesian_tyre_model.py
Ported and simplified from f1-race-replay/src/bayesian_tyre_model.py

Universal Bayesian state-space model for tyre degradation.

State equation:
    α_{t+1} = (1 - I_pit) * (α_t + ν * A_track) + I_pit * α_reset + η_t

Observation equation:
    y_t = α_t + γ * fuel_t + δ_mismatch + ε_t
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, List, Optional, Tuple
import math


class TyreCompound(Enum):
    SOFT   = "SOFT"
    MEDIUM = "MEDIUM"
    HARD   = "HARD"
    INTER  = "INTERMEDIATE"
    WET    = "WET"


class TrackCondition(Enum):
    DRY  = "DRY"
    DAMP = "DAMP"
    WET  = "WET"


@dataclass
class TyreProfile:
    compound: TyreCompound
    deg_rate: float          # seconds per lap degradation
    warmup_laps: int         # laps to reach optimal temp
    max_life: int            # expected max laps before cliff
    reset_pace: float        # pace loss at cliff (s)

    def __post_init__(self):
        if self.deg_rate < 0:
            raise ValueError("deg_rate must be non-negative")


TYRE_PROFILES: Dict[TyreCompound, TyreProfile] = {
    TyreCompound.SOFT:   TyreProfile(TyreCompound.SOFT,   deg_rate=0.08, warmup_laps=2,  max_life=20, reset_pace=2.5),
    TyreCompound.MEDIUM: TyreProfile(TyreCompound.MEDIUM, deg_rate=0.05, warmup_laps=3,  max_life=32, reset_pace=1.8),
    TyreCompound.HARD:   TyreProfile(TyreCompound.HARD,   deg_rate=0.03, warmup_laps=4,  max_life=45, reset_pace=1.2),
    TyreCompound.INTER:  TyreProfile(TyreCompound.INTER,  deg_rate=0.04, warmup_laps=2,  max_life=35, reset_pace=2.0),
    TyreCompound.WET:    TyreProfile(TyreCompound.WET,    deg_rate=0.02, warmup_laps=1,  max_life=40, reset_pace=1.5),
}

MISMATCH_PENALTIES: Dict[Tuple[TyreCompound, TrackCondition], float] = {
    (TyreCompound.SOFT,   TrackCondition.DRY):  0.0,
    (TyreCompound.SOFT,   TrackCondition.DAMP): 2.0,
    (TyreCompound.SOFT,   TrackCondition.WET):  8.0,
    (TyreCompound.MEDIUM, TrackCondition.DRY):  0.0,
    (TyreCompound.MEDIUM, TrackCondition.DAMP): 0.8,
    (TyreCompound.MEDIUM, TrackCondition.WET):  5.0,
    (TyreCompound.HARD,   TrackCondition.DRY):  0.0,
    (TyreCompound.HARD,   TrackCondition.DAMP): 0.5,
    (TyreCompound.HARD,   TrackCondition.WET):  4.0,
    (TyreCompound.INTER,  TrackCondition.DRY):  1.5,
    (TyreCompound.INTER,  TrackCondition.DAMP): 0.0,
    (TyreCompound.INTER,  TrackCondition.WET):  0.5,
    (TyreCompound.WET,    TrackCondition.DRY):  4.0,
    (TyreCompound.WET,    TrackCondition.DAMP): 1.0,
    (TyreCompound.WET,    TrackCondition.WET):  0.0,
}


@dataclass
class BayesianState:
    """Kalman filter state for tyre degradation."""
    alpha: float = 0.0       # estimated degradation (s)
    variance: float = 1.0    # uncertainty
    lap: int = 0


class BayesianTyreModel:
    """
    State-space Kalman filter for tyre degradation prediction.
    Tracks cumulative pace loss due to rubber wear, fuel load, and track condition.
    """

    SIGMA_EPS = 0.3    # observation noise (s)
    SIGMA_ETA = 0.1    # process noise (s)
    FUEL_EFFECT = 0.032  # s per kg
    STARTING_FUEL = 110.0
    FUEL_BURN_RATE = 1.6  # kg per lap

    def __init__(self, compound: TyreCompound, condition: TrackCondition = TrackCondition.DRY):
        self.compound = compound
        self.condition = condition
        self.profile = TYRE_PROFILES[compound]
        self.state = BayesianState()
        self.history: List[BayesianState] = []

    def _fuel_load(self, lap: int) -> float:
        return max(0.0, self.STARTING_FUEL - lap * self.FUEL_BURN_RATE)

    def _mismatch_penalty(self) -> float:
        return MISMATCH_PENALTIES.get((self.compound, self.condition), 0.0)

    def update(self, observed_lap_time: float, base_pace: float, lap: int) -> float:
        """
        Kalman filter update step.
        Returns estimated tyre degradation contribution (seconds).
        """
        fuel = self._fuel_load(lap)
        fuel_contribution = self.FUEL_EFFECT * fuel
        mismatch = self._mismatch_penalty()

        # Predicted observation
        y_pred = self.state.alpha + fuel_contribution + mismatch

        # Innovation
        innovation = observed_lap_time - base_pace - y_pred

        # Kalman gain
        predicted_var = self.state.variance + self.SIGMA_ETA ** 2
        kalman_gain = predicted_var / (predicted_var + self.SIGMA_EPS ** 2)

        # Update state
        new_alpha = self.state.alpha + kalman_gain * innovation
        new_variance = (1 - kalman_gain) * predicted_var

        # Track abrasion — alpha increases slightly each lap
        abrasion = self.profile.deg_rate * 0.5
        new_alpha += abrasion

        self.state = BayesianState(alpha=new_alpha, variance=new_variance, lap=lap)
        self.history.append(BayesianState(alpha=new_alpha, variance=new_variance, lap=lap))
        return new_alpha

    def predict_remaining_life(self, cliff_threshold: float = 1.5) -> int:
        """Estimate remaining laps before hitting cliff degradation."""
        current_deg = self.state.alpha
        laps_on = self.state.lap
        remaining_until_cliff = self.profile.max_life - laps_on

        # Extrapolate linearly
        if self.profile.deg_rate > 0:
            laps_to_threshold = max(0, (cliff_threshold - current_deg) / self.profile.deg_rate)
            return int(min(remaining_until_cliff, laps_to_threshold))
        return remaining_until_cliff

    def pit_recommendation(self, current_lap: int, total_laps: int, gap_ahead: float) -> dict:
        """
        Suggest optimal pit window.
        Takes into account remaining tyre life, track position, and gap to car ahead.
        """
        remaining_life = self.predict_remaining_life()
        laps_remaining = total_laps - current_lap

        # Undercut window — pit if within 2s of car ahead and tyre has < 8 laps
        undercut_viable = gap_ahead < 2.0 and remaining_life < 8

        pit_start = current_lap + max(3, remaining_life - 5)
        pit_end = current_lap + remaining_life + 2

        next_compound = {
            TyreCompound.SOFT:   TyreCompound.MEDIUM if laps_remaining > 20 else TyreCompound.HARD,
            TyreCompound.MEDIUM: TyreCompound.HARD,
            TyreCompound.HARD:   TyreCompound.MEDIUM,
        }.get(self.compound, TyreCompound.HARD)

        return {
            "pit_window_start": int(min(pit_start, total_laps - 3)),
            "pit_window_end":   int(min(pit_end,   total_laps - 2)),
            "next_compound":    next_compound.value,
            "undercut_viable":  undercut_viable,
            "remaining_tyre_life": remaining_life,
            "current_degradation_s": round(self.state.alpha, 3),
        }

    def deg_percentage(self) -> float:
        """0–100 degradation percentage for UI display."""
        if self.profile.max_life == 0:
            return 100.0
        return min(100.0, (self.state.lap / self.profile.max_life) * 100.0)


# ── Convenience factory ───────────────────────────────────────────────────

def create_model(compound_str: str, condition_str: str = "DRY") -> BayesianTyreModel:
    compound = TyreCompound(compound_str.upper())
    condition = TrackCondition(condition_str.upper())
    return BayesianTyreModel(compound, condition)


if __name__ == "__main__":
    # Quick demo
    model = create_model("SOFT")
    base = 90.0  # ~1:30 base pace
    print(f"Soft tyre degradation simulation:")
    for lap in range(1, 22):
        noise = (lap * 0.05) + 0.1 * (lap // 10)
        observed = base + noise
        deg = model.update(observed, base, lap)
        print(f"  Lap {lap:2d}: observed={observed:.3f}s  deg={deg:.3f}s  remaining={model.predict_remaining_life()} laps")
    print(f"\nPit recommendation: {model.pit_recommendation(21, 58, 1.5)}")
