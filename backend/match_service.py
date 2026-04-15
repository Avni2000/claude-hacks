import os
from pathlib import Path
from typing import Any

from anthropic import Anthropic
from dotenv import load_dotenv


load_dotenv(Path(__file__).with_name(".env"))

BLURB_MODEL = os.getenv("CLAUDE_BLURB_MODEL", "claude-haiku-4-5-20251001")


def _describe(profile: dict[str, Any] | None) -> str:
    if not profile:
        return "Unknown"
    parts: list[str] = []
    if profile.get("name"):
        parts.append(profile["name"])
    role_bits = [profile.get("jobTitle"), profile.get("company")]
    role = " at ".join([b for b in role_bits if b])
    if role:
        parts.append(role)
    if profile.get("bio"):
        parts.append(f"Bio: {profile['bio']}")
    skills = profile.get("skills") or []
    if isinstance(skills, list) and skills:
        parts.append("Skills: " + ", ".join(str(s) for s in skills))
    return ". ".join(parts)


class MatchService:
    def generate_blurb(
        self, me: dict[str, Any], them: dict[str, Any]
    ) -> dict[str, Any]:
        if not me or not them:
            raise RuntimeError("Both `me` and `them` profiles are required.")

        api_key = os.getenv("CLAUDE_API_KEY")
        if not api_key or api_key == "your_claude_api_key_here":
            raise RuntimeError(
                "Set CLAUDE_API_KEY in backend/.env before calling /match/blurb."
            )

        prompt = (
            "You are helping two professionals networking at an event.\n\n"
            f"Me: {_describe(me)}\n\n"
            f"Them: {_describe(them)}\n\n"
            "Write ONE warm sentence (max 18 words) telling me specifically why I "
            "should say hi to them. Reference a concrete overlap or complement. "
            "No greetings, no quotes, no emojis."
        )

        client = Anthropic(api_key=api_key)
        response = client.messages.create(
            model=BLURB_MODEL,
            max_tokens=80,
            temperature=0.7,
            messages=[{"role": "user", "content": prompt}],
        )

        text_blocks = [
            getattr(block, "text", "")
            for block in response.content
            if getattr(block, "type", None) == "text"
        ]
        if not any(text_blocks):
            raise RuntimeError("Claude returned no text content.")

        return {"blurb": "".join(text_blocks).strip()}
