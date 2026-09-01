from __future__ import annotations

import os

from flask import Flask, send_from_directory
from flask_cors import CORS
from werkzeug.exceptions import NotFound

from backend.errors import register_error_handlers
from backend.routes.guest import guest_bp
from backend.routes.admin import admin_bp

FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app, origins=["http://localhost:3000"])

    app.register_blueprint(guest_bp, url_prefix="/api")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    register_error_handlers(app)

    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_frontend(path: str):
        if path.startswith("api/"):
            raise NotFound()
        full = os.path.join(FRONTEND_DIR, path)
        if path and os.path.isfile(full):
            return send_from_directory(FRONTEND_DIR, path)
        return send_from_directory(FRONTEND_DIR, "index.html")

    return app


app = create_app()
