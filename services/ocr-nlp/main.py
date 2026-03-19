from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Optional

import io

import cv2
import numpy as np
import pytesseract
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageOps


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@dataclass(frozen=True)
class ParsedTime:
    hour: str
    minute: str


def _pad2(n: int) -> str:
    return f"{n:02d}"


def _to_24h(hour: int, ampm: Optional[str]) -> int:
    if ampm is None:
        return hour
    a = ampm.lower()
    if a == "am":
        return 0 if hour == 12 else hour
    if a == "pm":
        return 12 if hour == 12 else hour + 12
    return hour


def _normalize_text(s: str) -> str:
    s = s.replace("\u2013", "-").replace("\u2014", "-")  # en/em dashes
    s = s.replace("—", "-").replace("–", "-")
    s = re.sub(r"[ \t]+", " ", s)
    s = re.sub(r"\n{3,}", "\n\n", s)
    return s.strip()


def _extract_time_range(raw: str):
    """
    Heuristics for common handwritten patterns:
    - "Dentist 3-4pm"
    - "3pm-4pm dentist"
    - "15:00-16:30"
    - "3:15-4"
    """
    text = raw.lower()

    patterns = [
        # 3-4pm / 3 - 4 pm / 3:15-4:05pm
        re.compile(
            r"\b(?P<sh>\d{1,2})(?::(?P<sm>\d{2}))?\s*(?P<sampm>am|pm)?\s*[-to]+\s*"
            r"(?P<eh>\d{1,2})(?::(?P<em>\d{2}))?\s*(?P<eampm>am|pm)?\b"
        ),
        # 3pm to 4pm
        re.compile(
            r"\b(?P<sh>\d{1,2})(?::(?P<sm>\d{2}))?\s*(?P<sampm>am|pm)\s*(?:to)\s*"
            r"(?P<eh>\d{1,2})(?::(?P<em>\d{2}))?\s*(?P<eampm>am|pm)\b"
        ),
    ]

    for pat in patterns:
        m = pat.search(text)
        if not m:
            continue

        sh = int(m.group("sh"))
        eh = int(m.group("eh"))
        sm = int(m.group("sm") or "0")
        em = int(m.group("em") or "0")
        sampm = m.group("sampm")
        eampm = m.group("eampm")

        # if only one am/pm written, apply to both
        ampm = sampm or eampm

        sh24 = _to_24h(sh, ampm)
        eh24 = _to_24h(eh, ampm)

        # sanity clamp
        if not (0 <= sh24 <= 23 and 0 <= eh24 <= 23 and 0 <= sm <= 59 and 0 <= em <= 59):
            continue

        start = ParsedTime(hour=_pad2(sh24), minute=_pad2(sm))
        end = ParsedTime(hour=_pad2(eh24), minute=_pad2(em))
        return start, end, m.span()

    return None, None, None


def _derive_title(raw: str, time_span):
    cleaned = raw
    if time_span is not None:
        a, b = time_span
        cleaned = (raw[:a] + " " + raw[b:]).strip()
    cleaned = _normalize_text(cleaned)
    cleaned = cleaned.replace("\n", " ").strip()
    cleaned = re.sub(r"\s{2,}", " ", cleaned)
    return cleaned if cleaned else None


def _prep_image(img: Image.Image) -> Image.Image:
    # Basic preprocessing tuned for pen-on-light-background:
    # - fix orientation
    # - convert to grayscale
    # - upscale
    # - adaptive threshold to get strong foreground strokes
    img = ImageOps.exif_transpose(img)
    gray = img.convert("L")

    # upscale so Tesseract sees larger glyphs
    scale = 2.0
    new_size = (int(gray.width * scale), int(gray.height * scale))
    gray = gray.resize(new_size, Image.Resampling.LANCZOS)

    arr = np.array(gray)
    arr = cv2.adaptiveThreshold(
        arr,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        31,
        15,
    )

    return Image.fromarray(arr)


@app.get("/health")
async def health():
    return {"ok": True}


@app.post("/parse-event")
async def parse_event(image: UploadFile = File(...)):
    content = await image.read()
    img = Image.open(io.BytesIO(content))  # type: ignore[name-defined]
    img = _prep_image(img)

    # Restrict character set and use LSTM engine with a text-block page segmentation.
    config = (
        "--psm 6 "
        "--oem 1 "
        "-c tessedit_char_whitelist="
        "0123456789"
        "abcdefghijklmnopqrstuvwxyz"
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        ":-/ "
    )

    raw_text = pytesseract.image_to_string(img, lang="eng", config=config).strip()
    raw_text = _normalize_text(raw_text)

    start, end, span = _extract_time_range(raw_text)
    title = _derive_title(raw_text, span)

    return {
        "rawText": raw_text,
        "title": title,
        "startTime": None if start is None else {"hour": start.hour, "minute": start.minute},
        "endTime": None if end is None else {"hour": end.hour, "minute": end.minute},
    }

