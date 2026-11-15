# Queue Cure — Deployment Guide

This guide covers deploying Queue Cure's backend, frontend, and database to common hosting targets.

## 1. Docker Compose (single host)

The simplest path — runs MySQL, the AI prediction service, backend, and frontend together on one machine or VM.

```bash
docker compose up --build -d
```

- Frontend: `http://<host>:5173`
- Backend: `http://<host>:8080`
- AI Service: `http://<host>:8000`
- MySQL data persists in the `queue_cure_mysql_data` volume.

To point the frontend at a different backend host in production, set the build arg:

```bash
docker compose build --build-arg VITE_API_BASE_URL=https://api.yourdomain.com frontend
```

## 2. AI Prediction Service — standalone

```bash
cd ai-service
docker build -t queue-cure-ai .
docker run -p 8000:8000 queue-cure-ai
```

This service is stateless and read-only with respect to the rest of the system — it only needs the request body Spring Boot sends it, so it can be deployed and scaled independently (e.g. as a separate Render/Railway service, or an AWS Lambda behind API Gateway for low-traffic clinics). Point the backend at it via `AI_SERVICE_URL` / `app.ai-service.base-url`.

If this service is down, slow, or returns an error, the backend automatically falls back to the deterministic wait-time formula — there's no hard dependency, so it's safe to deploy, restart, or scale it independently of the core application.

## 3. Backend — standalone JAR

```bash
cd backend
mvn clean package -DskipTests
java -jar target/queue-cure-backend-1.0.0.jar \
  --spring.datasource.url=jdbc:mysql://<db-host>:3306/queue_cure \
  --spring.datasource.username=<user> \
  --spring.datasource.password=<password> \
  --app.cors.allowed-origins=https://yourdomain.com
```

Any Spring Boot property can be overridden via `--property=value`, environment variables (e.g. `SPRING_DATASOURCE_URL`), or a profile-specific `application-prod.yml`.

### Cloud options

- **Render / Railway**: deploy the backend as a Docker service. If the service root directory is the repository root, use the root `Dockerfile`. If the service root directory is `backend`, use `backend/Dockerfile`. Add a managed MySQL instance and set the `SPRING_DATASOURCE_*` env vars.
- **AWS Elastic Beanstalk / ECS**: build and push the Docker image, point `SPRING_DATASOURCE_URL` at an RDS MySQL instance.
- **A plain VM**: use a `systemd` service running `java -jar app.jar` behind Nginx/Caddy for TLS termination.

### Render backend settings

For a Render Web Service using the repository root:

- **Environment**: `Docker`
- **Dockerfile path**: `Dockerfile`
- **Docker build context directory**: `.`

Set these variables on the backend service:

```text
SPRING_DATASOURCE_URL=jdbc:mysql://<host>:3306/<database>?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME=<user>
SPRING_DATASOURCE_PASSWORD=<password>
CORS_ALLOWED_ORIGINS=https://<your-frontend-domain>
AI_SERVICE_URL=https://<your-ai-service-domain>
```

Render supplies `PORT`; the backend reads it automatically through `application.yml`.

## 4. Frontend — static hosting

Since the frontend builds to static files, it can be hosted anywhere static sites are served:

```bash
cd frontend
npm install
VITE_API_BASE_URL=https://api.yourdomain.com npm run build
```

Upload the contents of `dist/` to:

- **Netlify / Vercel / Render Static Site** — set `VITE_API_BASE_URL` as a build-time environment variable, build command `npm run build`, publish directory `dist`. For Render, set the root directory to `frontend`.
- **Nginx / Apache** — copy `dist/` to the web root; ensure unknown paths fall back to `index.html` (see `frontend/nginx.conf`) so React Router works on refresh.
- **S3 + CloudFront** — upload `dist/`, set the CloudFront default root object to `index.html`, and configure a custom error response (403/404 → `/index.html`, HTTP 200) for client-side routing.

## 5. Database

- For production, use a managed MySQL service (AWS RDS, PlanetScale, Railway MySQL, etc.) rather than the bundled Docker container.
- Set `spring.jpa.hibernate.ddl-auto=validate` (instead of `update`) once the schema is stable, and manage migrations with a tool like Flyway or Liquibase for safer schema changes over time.

## 6. CORS & WebSocket considerations

- Update `app.cors.allowed-origins` (backend) to the exact production frontend origin(s).
- The STOMP endpoint registration in `WebSocketConfig` uses `setAllowedOriginPatterns("*")` for development convenience — restrict this to your production frontend origin before going live.
- If deploying behind a reverse proxy (Nginx, ALB, etc.), ensure WebSocket upgrade headers (`Upgrade`, `Connection`) are passed through to the backend.

## 7. Environment variable summary

| Variable | Where | Purpose |
|----------|-------|---------|
| `SPRING_DATASOURCE_URL` | Backend | MySQL JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | Backend | MySQL username |
| `SPRING_DATASOURCE_PASSWORD` | Backend | MySQL password |
| `CORS_ALLOWED_ORIGINS` | Backend | Comma-separated allowed frontend origins |
| `AI_SERVICE_URL` | Backend | Base URL of the FastAPI AI prediction service |
| `VITE_API_BASE_URL` | Frontend (build-time) | Backend base URL for REST + WebSocket |
