"""
Synthetic training data generator for the Queue Cure wait-time model.

There's no real historical consultation data available yet, so this
generates a realistic, internally-consistent dataset that encodes the
relationships a real clinic queue would show:

  - More patients ahead -> longer wait (roughly linear, the core driver)
  - Higher average consultation time -> longer wait per patient ahead
  - Some doctors are consistently faster/slower than their stated average
    (a per-doctor "efficiency" multiplier)
  - Certain hours of the day (post-lunch, early evening) run slower due
    to backlog effects
  - Weekends are lighter / move faster
  - All of the above is mixed with realistic random noise, so the model
    has to learn genuine patterns rather than fit a perfect formula.

This is clearly synthetic data standing in for real historical
consultation logs. Once Queue Cure has been running in a real clinic for
a while, `queue_predictions` (and a future actual-wait-time column) should
replace this generator as the training source.
"""

import numpy as np
import pandas as pd

RANDOM_SEED = 42

DOCTORS = [
    # (doctor_id, department, base_consultation_minutes, efficiency_multiplier)
    (1, "General Medicine", 10, 1.0),
    (2, "General Medicine", 12, 1.1),
    (3, "Pediatrics", 8, 0.9),
    (4, "Orthopedics", 15, 1.15),
    (5, "Dermatology", 7, 0.85),
    (6, "Cardiology", 18, 1.2),
]

# Hours where backlog tends to build up (lunch rush, end-of-day crunch).
SLOW_HOURS = {12, 13, 17, 18}
FAST_HOURS = {9, 10, 15}


def generate_dataset(n_rows: int = 6000, seed: int = RANDOM_SEED) -> pd.DataFrame:
    rng = np.random.default_rng(seed)

    doctor_ids = rng.choice([d[0] for d in DOCTORS], size=n_rows)
    doctor_lookup = {d[0]: d for d in DOCTORS}

    rows = []
    for doctor_id in doctor_ids:
        _, department, base_consult, efficiency = doctor_lookup[doctor_id]

        patients_ahead = int(rng.integers(0, 16))
        avg_consultation_time = max(3, int(rng.normal(base_consult, 2)))
        current_hour = int(rng.integers(8, 20))
        day_of_week = int(rng.integers(1, 8))  # 1=Mon ... 7=Sun
        total_active_patients = patients_ahead + int(rng.integers(0, 10))

        # --- Core deterministic relationship ---
        base_wait = patients_ahead * avg_consultation_time * efficiency

        # --- Hour-of-day effect ---
        if current_hour in SLOW_HOURS:
            base_wait *= 1.25
        elif current_hour in FAST_HOURS:
            base_wait *= 0.9

        # --- Day-of-week effect (weekends lighter) ---
        if day_of_week in (6, 7):
            base_wait *= 0.8

        # --- Overall load effect: a busy clinic overall slows everyone down a bit ---
        load_factor = 1 + (total_active_patients / 100)
        base_wait *= load_factor

        # --- Realistic noise ---
        noise = rng.normal(0, max(2.0, base_wait * 0.08))
        actual_wait = max(0, base_wait + noise)

        rows.append({
            "patientsAhead": patients_ahead,
            "avgConsultationTime": avg_consultation_time,
            "doctorId": doctor_id,
            "department": department,
            "currentHour": current_hour,
            "dayOfWeek": day_of_week,
            "totalActivePatients": total_active_patients,
            "waitTime": round(actual_wait, 1),
        })

    return pd.DataFrame(rows)


if __name__ == "__main__":
    df = generate_dataset()
    print(df.describe())
    print(df.head(10))
