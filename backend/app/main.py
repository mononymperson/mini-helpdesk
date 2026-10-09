import logging
from typing import Any

from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.exceptions import RequestValidationError
from fastapi.openapi.utils import get_openapi
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api import router
from app.schemas.common import ResponseJson


logger = logging.getLogger(__name__)

app = FastAPI(title="Mini Helpdesk API", version="0.1.0")
app.include_router(router)


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi


def _error_message(detail: Any) -> str:
    if isinstance(detail, list):
        messages = []
        for item in detail:
            messages.append(str(item))
        return "; ".join(messages)

    if isinstance(detail, dict):
        messages = []
        for field, message in detail.items():
            messages.append(f"{field}: {message}")
        return "; ".join(messages)

    return str(detail)


def _validation_error_dict(detail: dict[Any, Any]) -> dict[str, str]:
    errors = {}
    for field, message in detail.items():
        errors[str(field)] = str(message)
    return errors


def _validation_errors(exc: RequestValidationError) -> dict[str, str]:
    errors: dict[str, str] = {}
    for error in exc.errors():
        location = error.get("loc", [])

        field = "general"
        for part in reversed(location):
            if part not in ("body", "query", "path", "header"):
                field = str(part)
                break

        message = str(error.get("msg", "Invalid value"))
        if error.get("type") == "missing" or (
            error.get("type") == "string_too_short"
            and error.get("input") == ""
        ):
            message = f"{field} is required"

        if field not in errors:
            errors[field] = message

    return errors


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(
    request: Request,
    exc: StarletteHTTPException,
) -> JSONResponse:
    del request

    if exc.status_code == 422 and isinstance(exc.detail, dict):
        body = ResponseJson(
            message="Validation failed",
            errors=_validation_error_dict(exc.detail),
        ).model_dump(mode="json")
        return JSONResponse(status_code=422, content=body)

    body = ResponseJson(
        message=_error_message(exc.detail),
    ).model_dump(mode="json")
    return JSONResponse(
        status_code=exc.status_code,
        content=body,
        headers=exc.headers,
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    del request
    body = ResponseJson(
        message="Validation failed",
        errors=_validation_errors(exc),
    ).model_dump(mode="json")
    return JSONResponse(status_code=422, content=body)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    del request
    logger.exception("Unhandled application error", exc_info=exc)
    body = ResponseJson(
        message="Internal server error",
    ).model_dump(mode="json")
    return JSONResponse(status_code=500, content=body)


@app.get("/health")
def health() -> ResponseJson[dict[str, str]]:
    return ResponseJson(data={"status": "ok"}, message="Service is healthy")


@app.websocket("/ws/notifications")
async def notifications(websocket: WebSocket) -> None:
    await websocket.accept()
    await websocket.send_json({"type": "connected", "message": "WebSocket connected"})
    try:
        while True:
            message = await websocket.receive_text()
            await websocket.send_json({"type": "echo", "message": message})
    except WebSocketDisconnect:
        pass
