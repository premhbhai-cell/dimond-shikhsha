#!/usr/bin/env python3
"""Regenerate assets/sliders/slider1/images.json and slider2/images.json."""
import json
from pathlib import Path
root = Path(__file__).resolve().parent / "assets" / "sliders"
extensions = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
for number in (1, 2):
    folder = root / f"slider{number}"
    folder.mkdir(parents=True, exist_ok=True)
    images = sorted(p.name for p in folder.iterdir() if p.is_file() and p.suffix.lower() in extensions)
    (folder / "images.json").write_text(json.dumps(images, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"slider{number}: {len(images)} images")
