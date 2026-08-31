from __future__ import annotations

from flask import jsonify


class ApiError(Exception):
    def __init__(self, status_code: int, code: str, message: str, details: list[str] | None = None):
        self.status_code = status_code
        self.code = code
        self.message = message
        self.details = details


class NotFoundError(ApiError):
    def __init__(self, message: str = "Ресурс не найден"):
        super().__init__(404, "NOT_FOUND", message)


class ConflictError(ApiError):
    def __init__(self, message: str = "Слот занят"):
        super().__init__(409, "SLOT_BUSY", message)


class ValidationError(ApiError):
    def __init__(self, message: str = "Некорректные входные данные", details: list[str] | None = None):
        super().__init__(400, "VALIDATION_ERROR", message, details)


def register_error_handlers(app):
    @app.errorhandler(ApiError)
    def handle_api_error(error: ApiError):
        body = {"code": error.code, "message": error.message}
        if error.details:
            body["details"] = error.details
        return jsonify(body), error.status_code
