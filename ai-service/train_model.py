"""
Trains the Queue Cure wait-time prediction model and saves it to disk.

Phase 1 (per the feature spec): a RandomForestRegressor, trained on the
synthetic dataset from data_generator.py. The model and its supporting
preprocessing (department one-hot encoder) are bundled into a single
pickle so the FastAPI app can load and use them with one joblib.load call.

Run directly to (re)train:
    python train_model.py
"""

import joblib
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder

from data_generator import generate_dataset

MODEL_PATH = "model.pkl"

FEATURE_COLUMNS = [
    "patientsAhead",
    "avgConsultationTime",
    "doctorId",
    "currentHour",
    "dayOfWeek",
    "totalActivePatients",
]
CATEGORICAL_COLUMNS = ["department"]
TARGET_COLUMN = "waitTime"


def build_feature_matrix(df, encoder: OneHotEncoder, fit: bool):
    numeric = df[FEATURE_COLUMNS].to_numpy(dtype=float)

    if fit:
        categorical = encoder.fit_transform(df[CATEGORICAL_COLUMNS])
    else:
        categorical = encoder.transform(df[CATEGORICAL_COLUMNS])

    return np.hstack([numeric, categorical])


def train():
    df = generate_dataset()

    encoder = OneHotEncoder(handle_unknown="ignore", sparse_output=False)

    train_df, test_df = train_test_split(df, test_size=0.2, random_state=42)

    X_train = build_feature_matrix(train_df, encoder, fit=True)
    y_train = train_df[TARGET_COLUMN].to_numpy()

    X_test = build_feature_matrix(test_df, encoder, fit=False)
    y_test = test_df[TARGET_COLUMN].to_numpy()

    model = RandomForestRegressor(
        n_estimators=150,
        max_depth=12,
        min_samples_leaf=4,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    predictions = model.predict(X_test)
    mae = mean_absolute_error(y_test, predictions)
    r2 = r2_score(y_test, predictions)

    print(f"Validation MAE: {mae:.2f} minutes")
    print(f"Validation R^2: {r2:.3f}")

    bundle = {
        "model": model,
        "encoder": encoder,
        "feature_columns": FEATURE_COLUMNS,
        "categorical_columns": CATEGORICAL_COLUMNS,
        "validation_mae": mae,
        "validation_r2": r2,
    }
    joblib.dump(bundle, MODEL_PATH)
    print(f"Saved model bundle to {MODEL_PATH}")

    return bundle


if __name__ == "__main__":
    train()
