# Queue Cure 🩺

**Real-time clinic queue management — no more paper tokens, no more guessing your wait time.**

Queue Cure replaces manual, paper-token queue handling in clinics with a live, web-based system. Receptionists manage the queue from a dashboard; patients see their token, their position, and their estimated wait time update instantly on a screen — no refresh required.

---
## Deployed Link
(#https://queue-cure-ai-powered-hospital-queu.vercel.app)

## Table of Contents

1. [Project Overview](#project-overview)
2. [Problem Statement](#problem-statement)
3. [Technology Stack](#technology-stack)
4. [Architecture](#architecture)
5. [Database Design](#database-design)
6. [API Documentation](#api-documentation)
7. [WebSocket Event Flow](#websocket-event-flow)
8. [Setup Instructions](#setup-instructions)
9. [Project Structure](#project-structure)
10. [Screenshots](#screenshots)
11. [Future Enhancements](#future-enhancements)

---

## Project Overview

Queue Cure is a full-stack web application with two live, synchronized views:

- **Receptionist Dashboard** — add patients, call the next patient, adjust consultation time, monitor live analytics.
- **Patient Waiting Room** — a calm, full-screen display showing the current token, plus a personal lookup screen for "tokens ahead of me," an **AI-predicted wait time** with a live countdown, and "estimated wait."

Every change made on the dashboard is broadcast over WebSocket and reflected on the patient screen within milliseconds.

### AI Wait Time Prediction

A separate FastAPI microservice predicts each patient's wait time using a `RandomForestRegressor` trained on queue conditions (patients ahead, doctor, department, time of day, day of week, total active patients). The backend calls it from `GET /api/prediction/{tokenId}` and falls back to the deterministic formula automatically if the AI service is ever unreachable, so a missing prediction service never breaks the patient experience. See [`ai-service/README.md`](ai-service/README.md) for details on the model and how to retrain it.

## Problem Statement

Many clinics still rely on paper tokens and manual queue tracking. This creates two recurring problems:

- **Patients** have no visibility into their position in line or how long they'll wait.
- **Receptionists** must track everything manually, with no live overview of queue load or performance.

Queue Cure solves this with a persistent, database-backed queue and real-time updates pushed to every connected screen.

## Technology Stack

| Layer       | Technology |
|-------------|------------|
| Backend     | Java 21, Spring Boot 3, Spring Data JPA, Spring WebSocket (STOMP) |
| AI Service  | Python, FastAPI, scikit-learn (RandomForestRegressor) |
| Database    | MySQL 8 |
| Frontend    | React (Vite), React Router, Axios, SockJS, @stomp/stompjs, Tailwind CSS |
| Deployment  | Docker, Docker Compose, Nginx (frontend), Spring Boot embedded Tomcat (backend) |

## Architecture

```
┌──────────────────────────┐        REST (Axios)        ┌──────────────────────────┐
│   Receptionist Dashboard │ ──────────────────────────▶ │                          │
│   (React, /dashboard)    │ ◀────────────────────────── │     Spring Boot API      │
└──────────────────────────┘      WebSocket (STOMP)      │  Controller → Service →  │
            ▲                  ┌────────────────────────▶│   Repository → MySQL     │
            │                  │                          │                          │
┌──────────────────────────┐   │                          └──────────────────────────┘
│   Patient Waiting Room    │──┘                                      │
│   (React, /waiting-room)  │◀─────────────────────────────────────────┘
└──────────────────────────┘        Live broadcast on /topic/queue
```

### Backend Layered Architecture

```
com.queuecure
├── controller   → REST endpoints (PatientController, QueueController, SettingsController,
│                  DoctorController, PredictionController)
├── service      → Business logic & queue rules (PatientService, QueueSettingsService,
│                  DoctorService, PredictionService, AiPredictionClient)
├── repository   → Spring Data JPA repositories
├── entity       → JPA entities (Patient, QueueSettings, PatientStatus, Doctor, QueuePrediction)
├── dto          → Request/response payloads (records)
├── websocket    → STOMP broadcast payloads & broadcaster (QueueBroadcaster, QueueUpdateEvent)
├── exception    → Custom exceptions + GlobalExceptionHandler
├── config       → WebSocketConfig, CorsConfig
└── util         → Shared constants
```

## Database Design

### `patients`

| Column        | Type         | Notes                                  |
|----------------|--------------|-----------------------------------------|
| id             | BIGINT (PK)  | Auto-increment                         |
| token_number   | INT          | Unique, sequential                     |
| patient_name   | VARCHAR(150) | Required                               |
| doctor_id      | BIGINT       | Optional - null means general/shared queue |
| status         | VARCHAR(20)  | WAITING / CURRENT / COMPLETED / CANCELLED |
| created_at     | DATETIME     | Set on insert                          |
| updated_at     | DATETIME     | Set on every update                    |

### `queue_settings`

| Column                    | Type | Notes                                         |
|----------------------------|------|------------------------------------------------|
| id                         | BIGINT (PK) | Single row in practice                  |
| average_consultation_time  | INT  | Minutes, used in ETA calculation        |
| current_token              | INT  | Token currently being served (0 = idle) |
| last_generated_token       | INT  | Used to derive the next token number    |

### `doctors`

| Column                      | Type         | Notes                                    |
|-------------------------------|--------------|--------------------------------------------|
| id                            | BIGINT (PK)  | Auto-increment                           |
| name                          | VARCHAR(150) | Required                                 |
| department                    | VARCHAR(100) | Required                                 |
| average_consultation_time     | INT          | Optional - falls back to the global setting |

### `queue_predictions`

Logs every AI (or fallback) wait-time prediction made, for later predicted-vs-actual analysis.

| Column                  | Type     | Notes                                  |
|---------------------------|----------|------------------------------------------|
| id                       | BIGINT (PK) | Auto-increment                       |
| doctor_id                | BIGINT   | 0 = general queue                      |
| patients_ahead           | INT      | Feature value at prediction time       |
| avg_consultation_time    | INT      | Feature value at prediction time       |
| predicted_wait_time       | INT      | Minutes                                |
| confidence                | INT      | 0-100, null for fallback predictions   |
| token_number              | INT      | The token this prediction was made for |
| prediction_date           | DATETIME | Set on insert                          |

## API Documentation

Base URL: `http://localhost:8080/api`

### Patients

| Method | Endpoint                      | Description                          |
|--------|--------------------------------|---------------------------------------|
| POST   | `/patients`                   | Add a new patient, returns token number |
| GET    | `/patients`                   | List all patients (any status)       |
| GET    | `/patients/waiting`           | List only WAITING patients with live ETA |
| GET    | `/patients/token/{tokenNumber}` | Look up a single patient by token  |
| DELETE | `/patients/{id}`              | Remove (cancel) a patient            |

**POST /api/patients**
```json
// Request - doctorId is optional
{ "patientName": "Ramesh", "doctorId": 1 }

// Response (201 Created)
{ "tokenNumber": 1, "message": "Patient Added Successfully" }
```

### Doctors

| Method | Endpoint        | Description                          |
|--------|------------------|----------------------------------------|
| POST   | `/doctors`       | Add a new doctor                      |
| GET    | `/doctors`       | List all doctors                      |

```json
// POST /api/doctors request
{ "name": "Dr. Sharma", "department": "General Medicine", "averageConsultationTime": 10 }
```

### AI Prediction

| Method | Endpoint                    | Description                                   |
|--------|------------------------------|-------------------------------------------------|
| GET    | `/prediction/{tokenId}`     | AI-predicted wait time for a single token      |
| GET    | `/prediction/analytics`     | Admin stats: avg predicted wait, peak hour, per-doctor breakdown |

**GET /api/prediction/{tokenId}**
```json
{
  "tokenNumber": 15,
  "patientsAhead": 8,
  "predictedWaitTime": 52,
  "confidence": 87,
  "source": "ai-model"
}
```

`source` is `"ai-model"` when the FastAPI service responded successfully, or `"fallback-formula"` if it was unreachable and Queue Cure fell back to the deterministic `tokensAhead × averageConsultationTime` calculation - `confidence` is `null` in that case.

### Queue

| Method | Endpoint              | Description                                 |
|--------|------------------------|-----------------------------------------------|
| GET    | `/queue/status`        | Current queue snapshot                       |
| POST   | `/queue/next`          | Call next patient (409 if queue is empty)     |
| GET    | `/queue/analytics`     | Dashboard analytics                           |

**GET /api/queue/status**
```json
{
  "currentToken": 5,
  "currentPatientId": 14,
  "currentPatientName": "Anita Sharma",
  "waitingCount": 10,
  "completedCount": 4,
  "averageConsultationTime": 10,
  "lastGeneratedToken": 19
}
```

### Settings

| Method | Endpoint          | Description                          |
|--------|--------------------|----------------------------------------|
| PUT    | `/settings/time`   | Update average consultation time      |

```json
// Request
{ "averageConsultationTime": 15 }
```

### Error Responses

All errors follow a consistent shape with the appropriate HTTP status code:

```json
{
  "timestamp": "2026-06-19T10:15:00",
  "status": 409,
  "error": "Queue Empty",
  "message": "No patients in queue. Cannot call next patient.",
  "details": null
}
```

| Status | Scenario                          |
|--------|-------------------------------------|
| 400    | Validation failure / malformed body |
| 404    | Patient not found                  |
| 409    | Queue empty / invalid state transition |
| 500    | Database or unexpected error       |

## WebSocket Event Flow

```
 Receptionist Dashboard
         │
         │  1. Call Next / Add Patient / Remove / Update Settings (REST)
         ▼
 Spring Boot Backend
         │
         │  2. Persist change to MySQL
         │  3. Recompute queue status + waiting list
         ▼
 WebSocket Topic  (/topic/queue)
         │
         │  4. Broadcast QueueUpdateEvent to every subscriber
         ▼
 Patient Waiting Room  +  Receptionist Dashboard (all open tabs)
         │
         │  5. Re-render instantly — no page refresh
         ▼
       Done
```

- **Endpoint:** `ws://localhost:8080/ws` (SockJS fallback supported)
- **Topic:** `/topic/queue`
- **Event types:** `PATIENT_ADDED`, `PATIENT_REMOVED`, `NEXT_CALLED`, `SETTINGS_UPDATED`

Every event payload includes the full current `queueStatus` and `waitingPatients` list, so clients can re-render directly from the socket message without an extra REST call.

## Setup Instructions

### Prerequisites

- Java 21+
- Maven 3.9+
- Node.js 20+
- Python 3.12+ (for the AI prediction service)
- MySQL 8 (or Docker)

### Option A — Run with Docker Compose (recommended)

```bash
docker compose up --build
```

This starts MySQL, the AI prediction service (port 8000), the backend (port 8080), and the frontend (port 5173) together.

### Option B — Run manually

**1. Start MySQL** and create the database (or let Spring Boot auto-create it):

```sql
CREATE DATABASE IF NOT EXISTS queue_cure;
```

**2. AI Prediction Service**

```bash
cd ai-service
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The model trains automatically on first startup (see [`ai-service/README.md`](ai-service/README.md)). This service is optional — the backend falls back to a deterministic formula if it isn't running.

**3. Backend**

```bash
cd backend
# Edit src/main/resources/application.yml if your MySQL credentials
# or AI service URL differ
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`.

**4. Frontend**

```bash
cd frontend
npm install
cp .env.example .env   # adjust VITE_API_BASE_URL if needed
npm run dev
```

Visit `http://localhost:5173`:
- `/dashboard` — receptionist dashboard
- `/waiting-room` — patient waiting room display
- `/waiting-room/my-token` — individual token lookup with AI wait prediction

## Project Structure

```
queue-cure/
├── backend/      Spring Boot application (Java 21)
├── ai-service/   FastAPI wait-time prediction microservice (Python)
├── frontend/     React application (Vite)
└── docker-compose.yml
```

## Screenshots

> _Add screenshots of the Receptionist Dashboard and Patient Waiting Room here once deployed._

| Screen | Description |
|--------|--------------|
| Dashboard | Statistics cards, add patient form, queue table, current token panel, AI prediction insights |
| Waiting Room | Large live token display, live indicator, tokens-ahead lookup |
| Token Lookup | AI-predicted wait time with progress bar, countdown timer, and confidence score |

## Future Enhancements

- Multi-counter support beyond doctor tagging (parallel queues per doctor)
- Online appointment booking
- SMS notifications when a patient's turn is near
- WhatsApp queue alerts
- Phase 2 AI model: XGBoost Regressor trained on real historical consultation data
- Predicted vs. actual wait time comparison dashboard (once actual wait times are logged)
- Patient visit history
- Cloud deployment guide (AWS / Render / Railway)
- Expanded analytics dashboard with charts over time (wait time trend, department-wise breakdown)

---

Built with Spring Boot, FastAPI, React, and a lot of patience for queues. 🎫
