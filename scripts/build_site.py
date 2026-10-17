"""Prepare the static site and anonymous, self-contained model pages."""

import json
from pathlib import Path
import secrets
import shutil


ROOT = Path(__file__).resolve().parent.parent


def build(destination):
    destination.mkdir(parents=True, exist_ok=True)
    for name in ("index.html", "viewer.html"):
        shutil.copy2(ROOT / name, destination / name)
    anonymous = destination / "anonymous"
    anonymous.mkdir(exist_ok=True)
    pages = []
    for source in sorted((ROOT / "models").rglob("*.html")):
        token = secrets.token_hex(16)
        shutil.copy2(source, anonymous / f"{token}.html")
        content = source.read_bytes()
        pages.append({
            "id": token,
            "bytes": len(content),
            "lines": len(content.splitlines()),
        })

    (destination / "pages.json").write_text(json.dumps(pages) + "\n", encoding="utf-8")
    print(f"Built {len(pages)} anonymous pages in {destination}")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("destination", type=Path)
    build(parser.parse_args().destination)
