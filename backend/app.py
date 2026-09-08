from __future__ import annotations

import os

from flask import Flask, send_from_directory
from flask_cors import CORS
from werkzeug.exceptions import NotFound

from backend.errors import register_error_handlers
from backend.routes.admin import admin_bp
from backend.routes.guest import guest_bp

DEFAULT_FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")


def create_app(frontend_dir: str | None = None, database: str | None = None) -> Flask:
    app = Flask(__name__)

    app.config["DATABASE"] = database or os.environ.get(
        "DATABASE_URL", os.path.join(os.path.dirname(__file__), "..", "data", "calendar.db")
    )
    frontend = frontend_dir or os.environ.get("FRONTEND_DIR", DEFAULT_FRONTEND_DIR)
    cors_origins = os.environ.get("CORS_ORIGINS", "*")

    CORS(app, origins=[o.strip() for o in cors_origins.split(",")])

    from backend.models import init_db

    init_db(app)

    app.register_blueprint(guest_bp, url_prefix="/api")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    register_error_handlers(app)

    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_frontend(path: str):
        if path.startswith("api/"):
            raise NotFound()
        full = os.path.join(frontend, path)
        if path and os.path.isfile(full):
            return send_from_directory(frontend, path)
        return send_from_directory(frontend, "index.html")

    return app
