# Queue Cure — Deployment Guide

This guide covers deploying Queue Cure's backend, frontend, and database to common hosting targets.

## 1. Docker Compose (single host)

The simplest path — runs MySQL, backend, and frontend together on one machine or VM.

```bash
docker compose up --build -d
```

- Frontend: `http://<host>:5173`
- Backend: `http://<host>:8080`
- MySQL data persists in the `queue_cure_mysql_data` volume.

To point the frontend at a different backend host in production, set the build arg:

```bash
docker compose build --build-arg VITE_API_BASE_URL=https://api.yourdomain.com frontend
```

## 2. Backend — standalone JAR

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

- **Render / Railway**: deploy the backend as a Docker service using `backend/Dockerfile`; add a managed MySQL instance and set `SPRING_DATASOURCE_*` env vars.
- **AWS Elastic Beanstalk / ECS**: build and push the Docker image, point `SPRING_DATASOURCE_URL` at an RDS MySQL instance.
- **A plain VM**: use a `systemd` service running `java -jar app.jar` behind Nginx/Caddy for TLS termination.

## 3. Frontend — static hosting

Since the frontend builds to static files, it can be hosted anywhere static sites are served:

```bash
cd frontend
npm install
VITE_API_BASE_URL=https://api.yourdomain.com npm run build
```

Upload the contents of `dist/` to:

- **Netlify / Vercel** — set `VITE_API_BASE_URL` as a build-time environment variable, build command `npm run build`, publish directory `dist`.
- **Nginx / Apache** — copy `dist/` to the web root; ensure unknown paths fall back to `index.html` (see `frontend/nginx.conf`) so React Router works on refresh.
- **S3 + CloudFront** — upload `dist/`, set the CloudFront default root object to `index.html`, and configure a custom error response (403/404 → `/index.html`, HTTP 200) for client-side routing.

## 4. Database

- For production, use a managed MySQL service (AWS RDS, PlanetScale, Railway MySQL, etc.) rather than the bundled Docker container.
- Set `spring.jpa.hibernate.ddl-auto=validate` (instead of `update`) once the schema is stable, and manage migrations with a tool like Flyway or Liquibase for safer schema changes over time.

## 5. CORS & WebSocket considerations

- Update `app.cors.allowed-origins` (backend) to the exact production frontend origin(s).
- The STOMP endpoint registration in `WebSocketConfig` uses `setAllowedOriginPatterns("*")` for development convenience — restrict this to your production frontend origin before going live.
- If deploying behind a reverse proxy (Nginx, ALB, etc.), ensure WebSocket upgrade headers (`Upgrade`, `Connection`) are passed through to the backend.

## 6. Environment variable summary

| Variable | Where | Purpose |
|----------|-------|---------|
| `SPRING_DATASOURCE_URL` | Backend | MySQL JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | Backend | MySQL username |
| `SPRING_DATASOURCE_PASSWORD` | Backend | MySQL password |
| `APP_CORS_ALLOWED_ORIGINS` | Backend | Comma-separated allowed frontend origins |
| `VITE_API_BASE_URL` | Frontend (build-time) | Backend base URL for REST + WebSocket |
