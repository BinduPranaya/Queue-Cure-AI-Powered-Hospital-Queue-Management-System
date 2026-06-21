# Queue Cure — AI Wait Time Prediction Service

A FastAPI microservice that predicts patient waiting time from live queue conditions. Called by the Spring Boot backend's `GET /api/prediction/{tokenId}` endpoint.

## Why a separate service?

Keeping the ML model in Python (rather than re-implementing it in Java) lets Queue Cure use scikit-learn directly and iterate on the model independently of the core queue application. The Spring Boot backend treats this service as an optional enhancement: if it's down or slow, predictions fall back automatically to the existing deterministic formula (`tokensAhead × averageConsultationTime`).

## Model

- **Phase 1 (implemented here):** `RandomForestRegressor` (scikit-learn).
- **Phase 2 (future):** swap in an `XGBRegressor` — the feature pipeline (`build_feature_matrix` in `train_model.py`) is written so the model class can change without touching `main.py`'s request handling.

### Training data

There's no real historical consultation data yet, so `data_generator.py` produces a realistic **synthetic** dataset that encodes the relationships a real clinic would show (more patients ahead → longer wait, per-doctor speed differences, busier hours, lighter weekends, plus random noise). Once Queue Cure has run in production for a while, replace `generate_dataset()` with a loader that reads real records (e.g. from the `queue_predictions` table, extended with an `actualWaitTime` column once you start logging it) — the rest of the pipeline doesn't need to change.

### Features

| Feature | Source |
|---------|--------|
| `patientsAhead` | Live count from the queue |
| `avgConsultationTime` | Doctor-specific or global setting |
| `doctorId` | Patient's assigned doctor (0 = general queue) |
| `department` | One-hot encoded |
| `currentHour` | 0–23 |
| `dayOfWeek` | 1 (Mon) – 7 (Sun) |
| `totalActivePatients` | WAITING + CURRENT count |

### Confidence score

Random forests don't natively output a probability. Confidence here comes from how much the forest's individual trees *agree* with each other for a given input — tight agreement → high confidence, wide spread → lower confidence — mapped onto a 0.5–0.97 range so the service never claims false certainty.

## Running locally

```bash
cd ai-service
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The model trains automatically on first startup (no `model.pkl` present yet) and is cached to disk for subsequent runs. To force a retrain (e.g. after changing `data_generator.py`):

```bash
python train_model.py
```

## API

### `POST /predict`

```json
// Request
{
  "patientsAhead": 8,
  "avgConsultationTime": 10,
  "doctorId": 1,
  "department": "General Medicine",
  "currentHour": 11,
  "dayOfWeek": 3,
  "totalActivePatients": 12
}

// Response
{
  "predictedWaitTime": 86,
  "confidence": 0.88
}
```

### `GET /health`

```json
{ "status": "ok", "modelLoaded": true }
```

Interactive API docs (Swagger UI) are available at `http://localhost:8000/docs` once running.

## Configuring the backend to use this service

In `backend/src/main/resources/application.yml`:

```yaml
app:
  ai-service:
    base-url: http://localhost:8000   # or http://ai-service:8000 in docker-compose
    timeout-ms: 1500
```

If this service is unreachable within `timeout-ms`, the backend logs a warning and falls back to the deterministic formula automatically — patients always get a wait-time estimate either way.
