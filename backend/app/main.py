from fastapi import FastAPI, WebSocket, WebSocketDisconnect

app = FastAPI(title="Mini Helpdesk API", version="0.1.0")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


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
