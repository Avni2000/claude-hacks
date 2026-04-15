from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from cards_service import CardsService
from match_service import MatchService


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


class RoundRequest(BaseModel):
    seed: int | None = None


class BlurbRequest(BaseModel):
    me: dict[str, Any]
    them: dict[str, Any]


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
