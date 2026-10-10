"""Create cropped, white-backed MindAR input images without changing source art."""
from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[1]
IMAGE_DIR = ROOT / "Images"
OUT_DIR = IMAGE_DIR / "targets"
PAGE_TARGET = ROOT / "desert-original.png"
PADDING = 12


def visible_bounds(image: Image.Image) -> tuple[int, int, int, int]:
    rgba = image.convert("RGBA")
    alpha = rgba.getchannel("A")
    # Transparent cutouts are trimmed using their alpha. For page art on white,
    # trim only the empty white border and preserve all printed marks and labels.
    if alpha.getextrema()[0] < 128:
        mask = alpha.point(lambda value: 255 if value > 80 else 0)
    else:
        rgb = rgba.convert("RGB")
        white = Image.new("RGB", rgb.size, (255, 255, 255))
        diff = ImageChops.difference(rgb, white).convert("L")
        mask = diff.point(lambda value: 255 if value > 18 else 0)
    bounds = mask.getbbox() or (0, 0, image.width, image.height)
    left, top, right, bottom = bounds
    return (
        max(0, left - PADDING),
        max(0, top - PADDING),
        min(image.width, right + PADDING),
        min(image.height, bottom + PADDING),
    )


def prepare(source: Path, destination: Path) -> list[int]:
    with Image.open(source) as opened:
        image = opened.convert("RGBA")
        bounds = visible_bounds(image)
        cropped = image.crop(bounds)
        # MindAR sees the same white paper background a printed cutout sits on.
        paper = Image.new("RGBA", cropped.size, (255, 255, 255, 255))
        paper.alpha_composite(cropped)
        paper.convert("RGB").save(destination, format="PNG", optimize=True)
    return [int(value) for value in bounds]


def scene_kind(label: str) -> str:
    name = label.casefold().replace("_", " ")
    if "desert" in name or "village" in name or "houses" in name:
        return "village"
    if "flower" in name or "petal" in name or "stamen" in name:
        return "flower"
    if "khejri" in name or "top piece" in name:
        return "tree"
    if "animal" in name:
        return "animals"
    if "mounted" in name or "ruler" in name:
        return "horse"
    if "tuning" in name or "peg" in name:
        return "instrument"
    if "panel" in name or "front" in name:
        return "panel"
    if "leaf" in name or "leaves" in name:
        return "foliage"
    if "attendant" in name:
        return "attendant"
    if "women" in name or "daughter" in name or "man " in name:
        return "story"
    return "diorama"


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    sources = [PAGE_TARGET, *sorted(IMAGE_DIR.glob("*.png"), key=lambda path: path.name.casefold())]
    entries = []
    for index, source in enumerate(sources):
        label = source.stem.casefold().replace(" ", "-").replace("_", "-")
        target_name = f"{index:02d}_{label}.png"
        bounds = prepare(source, OUT_DIR / target_name)
        entries.append({
            "targetIndex": index,
            "label": source.stem.replace("_", " "),
            "scene": scene_kind(source.stem),
            "source": source.relative_to(ROOT).as_posix(),
            "targetImage": f"Images/targets/{target_name}",
            "crop": {"left": bounds[0], "top": bounds[1], "right": bounds[2], "bottom": bounds[3]},
        })
    (OUT_DIR / "target-manifest.json").write_text(
        json.dumps({"count": len(entries), "targets": entries}, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Prepared {len(entries)} ordered target images in {OUT_DIR.relative_to(ROOT)}")
    print("Source images were left unchanged. Review target quality before compiling.")


if __name__ == "__main__":
    main()
