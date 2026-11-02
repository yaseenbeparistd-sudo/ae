"""
OneView Monitor — FastAPI Application Entry Point

Main application setup with CORS, routers, lifespan events.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.database import init_db
from app.api.applications import router as applications_router
from app.api.health_api import router as health_router
from app.api.auth import router as auth_router
from app.api.logs import router as logs_router
from app.api.metrics import router as metrics_router
from app.api.connectors import router as connectors_router
from app.api.dashboard import router as dashboard_router
from app.api.infrastructure import router as infrastructure_router
from app.api.alerts import router as alerts_router
from app.api.kavacha import router as kavacha_router
from app.api.kavach_dashboard_api import router as kavach_dashboard_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # Startup
    if settings.DEBUG:
        await init_db()
    yield
    # Shutdown (cleanup if needed)


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Unified application tracking and infrastructure observability platform",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────────────────────

prefix = settings.API_PREFIX

app.include_router(auth_router, prefix=f"{prefix}/auth", tags=["Authentication"])
app.include_router(dashboard_router, prefix=f"{prefix}/dashboard", tags=["Dashboard"])
app.include_router(applications_router, prefix=f"{prefix}/applications", tags=["Applications"])
app.include_router(health_router, prefix=f"{prefix}", tags=["Health"])
app.include_router(metrics_router, prefix=f"{prefix}", tags=["Metrics"])
app.include_router(logs_router, prefix=f"{prefix}", tags=["Logs"])
app.include_router(infrastructure_router, prefix=f"{prefix}", tags=["Infrastructure"])
app.include_router(connectors_router, prefix=f"{prefix}/connectors", tags=["Connectors"])
app.include_router(alerts_router, prefix=f"{prefix}/alerts", tags=["Alerts"])
app.include_router(kavacha_router, prefix=f"{prefix}/kavacha", tags=["NextGen2"])
app.include_router(kavach_dashboard_router, prefix=f"{prefix}/kavach-dashboard", tags=["Kavach Business Dashboard"])


# ── System Health ────────────────────────────────────────────────────────────

@app.get("/api/v1/system/health", tags=["System"])
async def system_health():
    """System health check endpoint."""
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "demo_mode": settings.DEMO_MODE,
    }
