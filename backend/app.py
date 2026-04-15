from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.cards_service import CardsService
from backend.game_service import GameService
from backend.match_service import MatchService


app = FastAPI(title="CAH Claude Backend")

# The Expo app calls this backend directly; CORS only matters for the
# web target but is harmless on native.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

cards_service = CardsService()
match_service = MatchService()
game_service = GameService(cards_service=cards_service)


class RoundRequest(BaseModel):
    seed: int | None = None


class BlurbRequest(BaseModel):
    me: dict[str, Any]
    them: dict[str, Any]


class JoinGameRequest(BaseModel):
    player: dict[str, Any]
    room_code: str | None = "nearby-demo"
    seed: int | None = None


class SubmitCardsRequest(BaseModel):
    player_id: str
    selected_indices: list[int]


class WinnerRequest(BaseModel):
    player_id: str
    winner_player_id: str


class NextRoundRequest(BaseModel):
    player_id: str
    seed: int | None = None


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/round")
def create_round(request: RoundRequest) -> dict:
    try:
        return cards_service.generate_round(seed=request.seed)
    except RuntimeError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unexpected backend error: {exc}") from exc


@app.post("/match/blurb")
def match_blurb(request: BlurbRequest) -> dict:
    try:
        return match_service.generate_blurb(me=request.me, them=request.them)
    except RuntimeError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unexpected backend error: {exc}") from exc


@app.post("/games/join")
def join_game(request: JoinGameRequest) -> dict:
    try:
        return game_service.join_room(
            player=request.player,
            room_code=request.room_code,
            seed=request.seed,
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unexpected backend error: {exc}") from exc


@app.get("/games/{room_code}")
def get_game(room_code: str, player_id: str) -> dict:
    try:
        return game_service.get_state(room_code=room_code, player_id=player_id)
    except RuntimeError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unexpected backend error: {exc}") from exc


@app.post("/games/{room_code}/submit")
def submit_cards(room_code: str, request: SubmitCardsRequest) -> dict:
    try:
        return game_service.submit_cards(
            room_code=room_code,
            player_id=request.player_id,
            selected_indices=request.selected_indices,
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unexpected backend error: {exc}") from exc


@app.post("/games/{room_code}/winner")
def choose_winner(room_code: str, request: WinnerRequest) -> dict:
    try:
        return game_service.choose_winner(
            room_code=room_code,
            player_id=request.player_id,
            winner_player_id=request.winner_player_id,
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unexpected backend error: {exc}") from exc


@app.post("/games/{room_code}/next-round")
def next_round(room_code: str, request: NextRoundRequest) -> dict:
    try:
        return game_service.next_round(
            room_code=room_code,
            player_id=request.player_id,
            seed=request.seed,
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unexpected backend error: {exc}") from exc
