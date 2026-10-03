# Production Deployment Guide

## Overview

MediTwin-AI is packaged for production containerization using Docker Compose or cloud container runtimes (AWS ECS, Google Cloud Run, Azure Container Apps, DigitalOcean).

---

## 1. Docker Compose Single-Command Deployment

The included `docker-compose.yml` orchestrates three containerized tiers:

1. **`meditwin_postgres`**: PostgreSQL 15 Alpine database with persistent volume mount (`postgres_data`).
2. **`meditwin_backend`**: FastAPI application server with Uvicorn worker processes and automatic database/seed initialization.
3. **`meditwin_frontend`**: React 19 production build served via Nginx with SPA fallback routing and reverse-proxy API routing.

### Launch Command:
```bash
docker compose up --build
```

### Access Points:
- **Frontend Web Application:** `http://localhost:3000`
- **Backend API & OpenAPI Docs:** `http://localhost:8000/docs`
- **Health Check Endpoint:** `http://localhost:8000/health`
- **PostgreSQL Database:** `localhost:5432`

---

## 2. Environment Variables Configuration

Create a `.env` file in the `backend/` directory based on `backend/.env.example`:

| Variable | Description | Default / Production Value |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@postgres:5432/meditwin_ai` |
| `SECRET_KEY` | Cryptographic JWT signing key | `meditwin_super_secure_jwt_secret_key_2026_prod` |
| `ALGORITHM` | JWT signature algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token lifespan | `120` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token lifespan | `7` |
| `UPLOAD_DIR` | PDF and diagnostic document directory | `/app/uploads` |

---

## 3. Production Hardening Checklist

1. **SSL/TLS:** Terminate SSL at an edge load balancer or reverse proxy (AWS ALB / Cloudflare / Traefik).
2. **Database Backups:** Enable automated daily snapshots for the PostgreSQL database.
3. **CORS Whitelist:** Configure `allow_origins` in `app/main.py` with your custom production domain.
4. **Health Monitoring:** Point load balancer health probes to `GET /health` (returns HTTP 200 with `{ "status": "success", "database": "Connected" }`).
