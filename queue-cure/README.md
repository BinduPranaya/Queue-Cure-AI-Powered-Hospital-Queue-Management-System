# Queue Cure 🩺

**Real-time clinic queue management — no more paper tokens, no more guessing your wait time.**

Queue Cure replaces manual, paper-token queue handling in clinics with a live, web-based system. Receptionists manage the queue from a dashboard; patients see their token, their position, and their estimated wait time update instantly on a screen — no refresh required.

---

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
- **Patient Waiting Room** — a calm, full-screen display showing the current token, plus a personal lookup screen for "tokens ahead of me" and "estimated wait."

Every change made on the dashboard is broadcast over WebSocket and reflected on the patient screen within milliseconds.

## Problem Statement

Many clinics still rely on paper tokens and manual queue tracking. This creates two recurring problems:

- **Patients** have no visibility into their position in line or how long they'll wait.
- **Receptionists** must track everything manually, with no live overview of queue load or performance.

Queue Cure solves this with a persistent, database-backed queue and real-time updates pushed to every connected screen.

## Technology Stack

| Layer       | Technology |
|-------------|------------|
| Backend     | Java 21, Spring Boot 3, Spring Data JPA, Spring WebSocket (STOMP) |
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
├── controller   → REST endpoints (PatientController, QueueController, SettingsController)
├── service      → Business logic & queue rules (PatientService, QueueSettingsService)
├── repository   → Spring Data JPA repositories
├── entity       → JPA entities (Patient, QueueSettings, PatientStatus)
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
// Request
{ "patientName": "Ramesh" }

// Response (201 Created)
{ "tokenNumber": 1, "message": "Patient Added Successfully" }
```

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
- MySQL 8 (or Docker)

### Option A — Run with Docker Compose (recommended)

```bash
docker compose up --build
```

This starts MySQL, the backend (port 8080), and the frontend (port 5173) together.

### Option B — Run manually

**1. Start MySQL** and create the database (or let Spring Boot auto-create it):

```sql
CREATE DATABASE IF NOT EXISTS queue_cure;
```

**2. Backend**

```bash
cd backend
# Edit src/main/resources/application.yml if your MySQL credentials differ
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`.

**3. Frontend**

```bash
cd frontend
npm install
cp .env.example .env   # adjust VITE_API_BASE_URL if needed
npm run dev
```

Visit `http://localhost:5173`:
- `/dashboard` — receptionist dashboard
- `/waiting-room` — patient waiting room display
- `/waiting-room/my-token` — individual token lookup

## Project Structure

```
queue-cure/
├── backend/      Spring Boot application (Java 21)
├── frontend/     React application (Vite)
└── docker-compose.yml
```

## Screenshots

> _Add screenshots of the Receptionist Dashboard and Patient Waiting Room here once deployed._

| Screen | Description |
|--------|--------------|
| Dashboard | Statistics cards, add patient form, queue table, current token panel |
| Waiting Room | Large live token display, live indicator, tokens-ahead lookup |

## Future Enhancements

- Multi-doctor / multi-counter support
- Online appointment booking
- SMS notifications when a patient's turn is near
- WhatsApp queue alerts
- AI-based wait time prediction (using historical consultation durations)
- Patient visit history
- Cloud deployment guide (AWS / Render / Railway)
- Expanded analytics dashboard with charts over time

---

Built with Spring Boot, React, and a lot of patience for queues. 🎫
