# Queue Cure — Socket Event Flow Diagram

```mermaid
sequenceDiagram
    participant R as Receptionist Dashboard
    participant API as Spring Boot REST API
    participant DB as MySQL
    participant WS as WebSocket Topic (/topic/queue)
    participant P as Patient Waiting Room

    R->>API: POST /api/queue/next (Call Next)
    API->>DB: Update patient statuses + queue settings
    DB-->>API: Persisted
    API->>WS: Broadcast QueueUpdateEvent (NEXT_CALLED)
    WS-->>R: Live update (all open dashboard tabs)
    WS-->>P: Live update (all open patient screens)
    Note over R,P: Both screens re-render instantly, no refresh
```

## Event Types

| Event Type          | Triggered By                          |
|----------------------|-----------------------------------------|
| `PATIENT_ADDED`      | POST /api/patients                     |
| `PATIENT_REMOVED`    | DELETE /api/patients/{id}              |
| `NEXT_CALLED`        | POST /api/queue/next                   |
| `SETTINGS_UPDATED`   | PUT /api/settings/time                 |

## Payload Shape

```json
{
  "eventType": "NEXT_CALLED",
  "timestamp": "2026-06-19T10:15:00",
  "queueStatus": {
    "currentToken": 6,
    "currentPatientId": 21,
    "currentPatientName": "Priya Nair",
    "waitingCount": 9,
    "completedCount": 5,
    "averageConsultationTime": 10,
    "lastGeneratedToken": 20
  },
  "waitingPatients": [
    {
      "id": 22,
      "tokenNumber": 7,
      "patientName": "Vikram Rao",
      "status": "WAITING",
      "tokensAhead": 0,
      "estimatedWaitMinutes": 0
    }
  ]
}
```

Every connected client (any number of dashboard tabs and patient screens) receives the same broadcast, so the entire system stays in sync from a single source of truth in MySQL.
