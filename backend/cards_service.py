import json
import os
from pathlib import Path
from typing import Any

import numpy as np
from anthropic import Anthropic
from dotenv import load_dotenv


load_dotenv(Path(__file__).with_name(".env"))

BASE_DIR = Path(__file__).resolve().parent
CARDS_PATH = BASE_DIR / "cah-cards-full.json"
DEFAULT_MODEL = os.getenv("CLAUDE_MODEL", "claude-3-5-sonnet-20241022")


class CardsService:
    def __init__(self, cards_path: Path = CARDS_PATH) -> None:
        raw_data = json.loads(cards_path.read_text(encoding="utf-8"))[0]
        self.black_cards = raw_data["black"]
        self.white_cards = raw_data["white"]

    def generate_round(self, seed: int | None = None) -> dict[str, Any]:
        rng = np.random.default_rng(seed)
        prompt_payload = self._build_prompt_payload(rng)
        generated_cards = self._generate_cards_with_claude(prompt_payload)

        player_two_hand = generated_cards["white_cards"][:10]
        player_three_hand = generated_cards["white_cards"][10:20]
        black_card = generated_cards["black_card"]

        return {
            "prompt_preview": prompt_payload["prompt"],
            "examples_used": prompt_payload["examples"],
            "player1": {
                "role": "card_czar",
                "black_card": black_card,
                "all_cards": {
                    "player2_hand": player_two_hand,
                    "player3_hand": player_three_hand,
                },
            },
            "player2": {
                "role": "player",
                "hand": player_two_hand,
            },
            "player3": {
                "role": "player",
                "hand": player_three_hand,
            },
        }

    def _build_prompt_payload(self, rng: np.random.Generator) -> dict[str, Any]:
        black_examples = self._pick_unique_black_cards(rng, count=6)
        white_examples = self._pick_unique_white_cards(rng, count=20)

        example_rounds: list[dict[str, Any]] = []
        white_index = 0
        for black_card in black_examples[:4]:
            pick_count = max(1, int(black_card.get("pick", 1)))
            answers = white_examples[white_index:white_index + pick_count]
            white_index += pick_count
            example_rounds.append(
                {
                    "black_card": black_card["text"],
                    "pick": pick_count,
                    "sample_answers": [answer["text"] for answer in answers],
                }
            )

        prompt = (
            "You are designing an original party-game round inspired by Cards Against Humanity.\n"
            "Use the example black and white cards below as few-shot tone guidance.\n"
            "Create exactly 1 new black card and exactly 20 new white cards.\n"
            "The black card must include a `pick` value of 1 or 2.\n"
            "Keep the tone absurd, punchy, and darkly comic, but avoid copying the examples.\n"
            "Return valid JSON only with this schema:\n"
            "{\n"
            '  "black_card": {"text": "string", "pick": 1},\n'
            '  "white_cards": ["string", "... exactly 20 total ..."]\n'
            "}\n\n"
            "Example black cards:\n"
            f"{json.dumps(black_examples, indent=2)}\n\n"
            "Example white cards:\n"
            f"{json.dumps(white_examples, indent=2)}\n\n"
            "Example rounds:\n"
            f"{json.dumps(example_rounds, indent=2)}"
        )

        return {
            "prompt": prompt,
            "examples": {
                "black_cards": black_examples,
                "white_cards": white_examples,
                "rounds": example_rounds,
            },
        }

    def _generate_cards_with_claude(self, prompt_payload: dict[str, Any]) -> dict[str, Any]:
        api_key = os.getenv("CLAUDE_API_KEY")
        if not api_key or api_key == "your_claude_api_key_here":
            raise RuntimeError(
                "Set CLAUDE_API_KEY in backend/.env before calling the round endpoint."
            )

        client = Anthropic(api_key=api_key)
        response = client.messages.create(
            model=DEFAULT_MODEL,
            max_tokens=1200,
            temperature=1,
            system=(
                "You create original black and white party-game cards and must respond "
                "with valid JSON only."
            ),
            messages=[{"role": "user", "content": prompt_payload["prompt"]}],
        )

        text_blocks = [
            block.text for block in response.content if getattr(block, "type", None) == "text"
        ]
        if not text_blocks:
            raise RuntimeError("Claude returned no text content.")

        parsed = self._parse_json_payload("".join(text_blocks))
        black_card = parsed.get("black_card", {})
        white_cards = parsed.get("white_cards", [])

        if not isinstance(black_card, dict) or "text" not in black_card:
            raise RuntimeError("Claude response is missing a valid black card.")
        if not isinstance(white_cards, list) or len(white_cards) != 20:
            raise RuntimeError("Claude response must contain exactly 20 white cards.")

        return {
            "black_card": {
                "text": str(black_card["text"]).strip(),
                "pick": int(black_card.get("pick", 1)),
            },
            "white_cards": [str(card).strip() for card in white_cards],
        }

    @staticmethod
    def _parse_json_payload(raw_text: str) -> dict[str, Any]:
        cleaned = raw_text.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
            cleaned = cleaned.rsplit("```", 1)[0]
        return json.loads(cleaned)

    def _pick_unique_black_cards(
        self, rng: np.random.Generator, count: int
    ) -> list[dict[str, Any]]:
        indices = rng.choice(len(self.black_cards), size=count, replace=False)
        return [
            {
                "text": self.black_cards[int(index)]["text"],
                "pick": int(self.black_cards[int(index)].get("pick", 1)),
            }
            for index in indices
        ]

    def _pick_unique_white_cards(
        self, rng: np.random.Generator, count: int
    ) -> list[dict[str, Any]]:
        indices = rng.choice(len(self.white_cards), size=count, replace=False)
        return [{"text": self.white_cards[int(index)]["text"]} for index in indices]
