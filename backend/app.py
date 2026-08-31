from __future__ import annotations

from flask import Flask, redirect
from flask_cors import CORS

from backend.errors import register_error_handlers
from backend.routes.guest import guest_bp
from backend.routes.admin import admin_bp


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app, origins=["http://localhost:3000"])

    app.register_blueprint(guest_bp, url_prefix="/api")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    register_error_handlers(app)

    @app.route("/")
    def root():
        return redirect("/api/event-types")

    return app


app = create_app()
