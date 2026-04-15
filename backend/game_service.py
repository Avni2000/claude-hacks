import threading
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

from backend.cards_service import CardsService


MAX_PLAYERS = 3


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _clean_room_code(room_code: str | None) -> str:
    cleaned = (room_code or "nearby-demo").strip().lower().replace(" ", "-")
    return cleaned or "nearby-demo"


@dataclass
class PlayerState:
    id: str
    name: str
    profile: dict[str, Any]
    joined_at: str = field(default_factory=_now_iso)


class GameService:
    def __init__(self, cards_service: CardsService) -> None:
        self.cards_service = cards_service
        self._lock = threading.Lock()
        self._sessions: dict[str, dict[str, Any]] = {}

    def join_room(
        self,
        player: dict[str, Any],
        room_code: str | None = None,
        seed: int | None = None,
    ) -> dict[str, Any]:
        player_id = str(player.get("id") or "").strip()
        player_name = str(player.get("name") or "").strip()
        if not player_id or not player_name:
            raise RuntimeError("Each player must have an `id` and `name` before joining a game.")

        normalized_room = _clean_room_code(room_code)
        with self._lock:
            session = self._sessions.get(normalized_room)
            if session is None:
                session = self._create_session(normalized_room)
                self._sessions[normalized_room] = session

            existing = next(
                (p for p in session["players"] if p.id == player_id),
                None,
            )
            if existing:
                existing.name = player_name
                existing.profile = dict(player)
            else:
                if len(session["players"]) >= MAX_PLAYERS:
                    raise RuntimeError(
                        f"Room `{normalized_room}` is already full. Open a different room code to start another table."
                    )
                session["players"].append(
                    PlayerState(id=player_id, name=player_name, profile=dict(player))
                )

            if len(session["players"]) == MAX_PLAYERS and not session["round_started"]:
                self._start_next_round(session, seed=seed)
            else:
                session["updated_at"] = _now_iso()

            return self._build_snapshot(session, player_id)

    def get_state(self, room_code: str, player_id: str) -> dict[str, Any]:
        with self._lock:
            session = self._require_session(room_code)
            self._require_player(session, player_id)
            return self._build_snapshot(session, player_id)

    def submit_cards(
        self, room_code: str, player_id: str, selected_indices: list[int]
    ) -> dict[str, Any]:
        with self._lock:
            session = self._require_session(room_code)
            self._require_player(session, player_id)
            round_state = self._require_active_round(session)
            if player_id == round_state["czar_id"]:
                raise RuntimeError("The Card Czar does not submit answer cards.")
            if round_state["status"] != "playing":
                raise RuntimeError("Card submissions are closed for this round.")

            pick_count = int(round_state["black_card"].get("pick", 1))
            if len(selected_indices) != pick_count:
                raise RuntimeError(f"Select exactly {pick_count} card(s) for this prompt.")

            hand = list(round_state["hands"].get(player_id, []))
            if not hand:
                raise RuntimeError("Your hand is empty for this round.")

            unique_indices = []
            for raw_index in selected_indices:
                index = int(raw_index)
                if index < 0 or index >= len(hand):
                    raise RuntimeError("One of the selected cards is out of range.")
                if index in unique_indices:
                    raise RuntimeError("Select unique cards only.")
                unique_indices.append(index)

            round_state["submissions"][player_id] = [hand[index] for index in unique_indices]

            non_czar_ids = [p.id for p in session["players"] if p.id != round_state["czar_id"]]
            if all(pid in round_state["submissions"] for pid in non_czar_ids):
                round_state["status"] = "judging"
            session["updated_at"] = _now_iso()

            return self._build_snapshot(session, player_id)

    def choose_winner(
        self, room_code: str, player_id: str, winner_player_id: str
    ) -> dict[str, Any]:
        with self._lock:
            session = self._require_session(room_code)
            self._require_player(session, player_id)
            round_state = self._require_active_round(session)

            if player_id != round_state["czar_id"]:
                raise RuntimeError("Only the Card Czar can choose the winning submission.")
            if round_state["status"] != "judging":
                raise RuntimeError("Wait for every player to submit before choosing a winner.")
            if winner_player_id not in round_state["submissions"]:
                raise RuntimeError("That winning submission does not exist in this round.")

            round_state["winner_player_id"] = winner_player_id
            round_state["status"] = "completed"
            session["updated_at"] = _now_iso()
            return self._build_snapshot(session, player_id)

    def next_round(
        self, room_code: str, player_id: str, seed: int | None = None
    ) -> dict[str, Any]:
        with self._lock:
            session = self._require_session(room_code)
            self._require_player(session, player_id)
            if len(session["players"]) != MAX_PLAYERS:
                raise RuntimeError("Need exactly 3 players in the room before dealing the next round.")
            self._start_next_round(session, seed=seed)
            return self._build_snapshot(session, player_id)

    def _create_session(self, room_code: str) -> dict[str, Any]:
        return {
            "room_code": room_code,
            "players": [],
            "round_number": 0,
            "round_started": False,
            "round": None,
            "created_at": _now_iso(),
            "updated_at": _now_iso(),
        }

    def _start_next_round(self, session: dict[str, Any], seed: int | None = None) -> None:
        if len(session["players"]) != MAX_PLAYERS:
            raise RuntimeError("Need 3 players to start a round.")

        session["round_number"] += 1
        round_payload = self.cards_service.generate_round(seed=seed)
        black_card = dict(round_payload["player1"]["black_card"])

        players = list(session["players"])
        czar_index = (session["round_number"] - 1) % len(players)
        czar_id = players[czar_index].id
        answer_players = [p for p in players if p.id != czar_id]

        session["round"] = {
            "status": "playing",
            "czar_id": czar_id,
            "black_card": black_card,
            "hands": {
                answer_players[0].id: list(round_payload["player2"]["hand"]),
                answer_players[1].id: list(round_payload["player3"]["hand"]),
            },
            "submissions": {},
            "winner_player_id": None,
            "started_at": _now_iso(),
        }
        session["round_started"] = True
        session["updated_at"] = _now_iso()

    def _require_session(self, room_code: str) -> dict[str, Any]:
        normalized_room = _clean_room_code(room_code)
        session = self._sessions.get(normalized_room)
        if session is None:
            raise RuntimeError(f"Room `{normalized_room}` does not exist yet.")
        return session

    @staticmethod
    def _require_player(session: dict[str, Any], player_id: str) -> None:
        if not any(player.id == player_id for player in session["players"]):
            raise RuntimeError("You are not part of this room yet.")

    @staticmethod
    def _require_active_round(session: dict[str, Any]) -> dict[str, Any]:
        round_state = session.get("round")
        if not round_state:
            raise RuntimeError("This room has not started a round yet.")
        return round_state

    def _build_snapshot(self, session: dict[str, Any], player_id: str) -> dict[str, Any]:
        round_state = session.get("round") or {}
        players = session["players"]
        submissions = round_state.get("submissions", {})
        winner_player_id = round_state.get("winner_player_id")
        current_player = next(player for player in players if player.id == player_id)
        czar_id = round_state.get("czar_id")
        current_role = "card_czar" if player_id == czar_id else "player"

        judging_submissions = []
        if round_state.get("status") in {"judging", "completed"}:
            for submission_player_id, cards in submissions.items():
                judging_submissions.append(
                    {
                        "player_id": submission_player_id,
                        "cards": cards,
                        "is_winner": submission_player_id == winner_player_id,
                        "player_name": self._player_name(players, submission_player_id)
                        if round_state.get("status") == "completed"
                        else None,
                    }
                )

        return {
            "room_code": session["room_code"],
            "status": round_state.get("status", "lobby") if session["round_started"] else "lobby",
            "player_count": len(players),
            "max_players": MAX_PLAYERS,
            "round_number": session["round_number"],
            "created_at": session["created_at"],
            "updated_at": session["updated_at"],
            "players": [
                {
                    "id": player.id,
                    "name": player.name,
                    "role": "card_czar" if player.id == czar_id else "player",
                    "submitted": player.id in submissions,
                    "is_me": player.id == player_id,
                }
                for player in players
            ],
            "me": {
                "id": current_player.id,
                "name": current_player.name,
                "role": current_role,
                "hand": list(round_state.get("hands", {}).get(player_id, [])),
                "has_submitted": player_id in submissions,
            },
            "black_card": round_state.get("black_card"),
            "pick_count": int(round_state.get("black_card", {}).get("pick", 1))
            if round_state.get("black_card")
            else 1,
            "submission_count": len(submissions),
            "judging_submissions": judging_submissions,
            "winner_player_id": winner_player_id,
            "winner_name": self._player_name(players, winner_player_id)
            if winner_player_id
            else None,
        }

    @staticmethod
    def _player_name(players: list[PlayerState], player_id: str | None) -> str | None:
        if not player_id:
            return None
        player = next((entry for entry in players if entry.id == player_id), None)
        return player.name if player else None
