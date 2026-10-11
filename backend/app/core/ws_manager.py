from __future__ import annotations

from typing import Any, Dict, Optional, Set

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        # ticket_id -> set of active websockets
        self.rooms: Dict[int, Set[WebSocket]] = {}

    async def connect(self, ticket_id: int, websocket: WebSocket) -> None:
        if ticket_id not in self.rooms:
            self.rooms[ticket_id] = set()
        self.rooms[ticket_id].add(websocket)

    def disconnect(self, ticket_id: int, websocket: WebSocket) -> None:
        if ticket_id in self.rooms:
            self.rooms[ticket_id].discard(websocket)
            if not self.rooms[ticket_id]:
                self.rooms.pop(ticket_id, None)

    async def broadcast(
        self,
        ticket_id: int,
        payload: Dict[str, Any],
        exclude: Optional[Set[WebSocket]] = None,
    ) -> None:
        print("starting broadcast to ticket_id:", ticket_id)
        if ticket_id not in self.rooms:
            print(ticket_id, "not in rooms")
            return
        exclude_set = exclude or set()
        for ws in list(self.rooms[ticket_id]):
            if ws in exclude_set:
                continue
            try:
                await ws.send_json(payload)
            except Exception:
                pass


manager = ConnectionManager()
