"""
Queue Cure - AI Wait Time Prediction Service

A small FastAPI microservice that estimates how long a patient will wait
before their consultation, given live queue conditions. Spring Boot calls
POST /predict for every prediction request; this service never touches
MySQL directly - it only knows the feature values it's given.

Confidence score: RandomForestRegressor doesn't produce a probability the
way a classifier does, so confidence here is derived from how much the
individual trees in the forest agree with each other for this specific
input. Tight agreement across trees -> high confidence; wide spread ->
lower confidence. This is a real (if simple) uncertainty signal, not an
arbitrary number - it's the standard way to get per-prediction confidence
out of a Random Forest from scikit-learn.
"""

import logging
import os
from contextlib import asynccontextmanager

import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from train_model import train, MODEL_PATH

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("queue-cure-ai")

MODEL_BUNDLE: dict = {}


def load_or_train_model() -> dict:
    """Loads the saved model bundle, training a fresh one if missing.

    Training on first boot keeps local/dev setup to a single
    `docker compose up` or `uvicorn main:app` - no separate manual
    training step is required, while `train_model.py` can still be run
    standalone to retrain deliberately (e.g. after updating the
    synthetic data generator, or swapping in real historical data).
    """
    if os.path.exists(MODEL_PATH):
        logger.info("Loading existing model bundle from %s", MODEL_PATH)
        return joblib.load(MODEL_PATH)

    logger.info("No existing model found - training a new one from synthetic data")
    return train()


@asynccontextmanager
async def lifespan(app: FastAPI):
    MODEL_BUNDLE.update(load_or_train_model())
    logger.info(
        "Model ready. Validation MAE=%.2f min, R^2=%.3f",
        MODEL_BUNDLE.get("validation_mae", float("nan")),
        MODEL_BUNDLE.get("validation_r2", float("nan")),
    )
    yield


app = FastAPI(
    title="Queue Cure AI Prediction Service",
    description="Predicts patient waiting time using queue conditions and historical consultation patterns.",
    version="1.0.0",
    lifespan=lifespan,
)


class PredictionRequest(BaseModel):
    patientsAhead: int = Field(ge=0, description="Number of patients ahead in the queue")
    avgConsultationTime: int = Field(gt=0, description="Average consultation duration in minutes")
    doctorId: int | None = Field(default=None, description="Doctor identifier, if known")
    department: str | None = Field(default="General Medicine", description="Department name")
    currentHour: int = Field(ge=0, le=23, description="Current hour of day, 0-23")
    dayOfWeek: int = Field(ge=1, le=7, description="ISO day of week, 1=Monday .. 7=Sunday")
    totalActivePatients: int = Field(ge=0, description="Total patients currently WAITING or CURRENT")


class PredictionResult(BaseModel):
    predictedWaitTime: int
    confidence: float


@app.get("/health")
def health():
    return {"status": "ok", "modelLoaded": "model" in MODEL_BUNDLE}


@app.post("/predict", response_model=PredictionResult)
def predict(request: PredictionRequest):
    if "model" not in MODEL_BUNDLE:
        raise HTTPException(status_code=503, detail="Model is not loaded yet")

    model = MODEL_BUNDLE["model"]
    encoder = MODEL_BUNDLE["encoder"]
    feature_columns = MODEL_BUNDLE["feature_columns"]

    # doctorId of None means "general/shared queue" - the model was
    # trained on real doctor ids, so we substitute 0 as a neutral stand-in
    # rather than sending a null straight into a numeric feature vector.
    doctor_id = request.doctorId if request.doctorId is not None else 0
    department = request.department or "General Medicine"

    feature_row = {
        "patientsAhead": request.patientsAhead,
        "avgConsultationTime": request.avgConsultationTime,
        "doctorId": doctor_id,
        "currentHour": request.currentHour,
        "dayOfWeek": request.dayOfWeek,
        "totalActivePatients": request.totalActivePatients,
    }
    numeric_vector = np.array([[feature_row[col] for col in feature_columns]], dtype=float)
    categorical_vector = encoder.transform([[department]])
    feature_vector = np.hstack([numeric_vector, categorical_vector])

    # Per-tree predictions give us both the ensemble estimate (their mean,
    # which is what model.predict() returns) and a measure of agreement
    # we use for the confidence score.
    tree_predictions = np.array([tree.predict(feature_vector)[0] for tree in model.estimators_])
    predicted_wait = float(tree_predictions.mean())
    predicted_wait = max(0.0, predicted_wait)

    confidence = compute_confidence(tree_predictions, predicted_wait)

    return PredictionResult(
        predictedWaitTime=round(predicted_wait),
        confidence=round(confidence, 2),
    )


def compute_confidence(tree_predictions: np.ndarray, predicted_wait: float) -> float:
    """Derives a 0-1 confidence score from agreement across the forest's trees.

    Coefficient of variation (std / mean) is used as the disagreement
    signal, then mapped onto a 0.5-0.97 confidence range so the service
    never reports unrealistic 100% certainty, nor drops below a "this is
    still a rough estimate" floor.
    """
    if predicted_wait <= 0:
        return 0.6

    std = float(tree_predictions.std())
    coefficient_of_variation = std / max(predicted_wait, 1.0)

    # Lower CoV -> higher confidence. Clamp to a sensible band.
    raw_confidence = 1.0 - min(coefficient_of_variation, 1.0)
    return 0.5 + raw_confidence * 0.47
