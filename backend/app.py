from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from backend.cards_service import CardsService


app = FastAPI(title="CAH Claude Backend")
cards_service = CardsService()


class RoundRequest(BaseModel):
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
