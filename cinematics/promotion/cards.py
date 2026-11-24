"""Typeset the promotional film's title cards from the production PROMOTION copy."""
import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

parser = argparse.ArgumentParser()
parser.add_argument("copy", type=Path)
parser.add_argument("directory", type=Path)
args = parser.parse_args()
copy = json.loads(args.copy.read_text())
args.directory.mkdir(parents=True, exist_ok=True)

WIDTH, HEIGHT, SCALE = 960, 540, 2
SERIF = "/usr/share/fonts/opentype/urw-base35/P052-Roman.otf"
SANS = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
SANS_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
CREAM, MUTED, GOLD = "#f4ecdc", "#d5d2be", "#c6ad72"


def font(path, size):
    return ImageFont.truetype(path, round(size * SCALE))


def surface():
    yy, xx = np.mgrid[0:HEIGHT * SCALE, 0:WIDTH * SCALE]
    glow = np.exp(-(((xx / SCALE - 480) / 550) ** 2 + ((yy / SCALE - 220) / 380) ** 2))
    dark, light = np.array([11, 31, 25]), np.array([25, 58, 43])
    rgb = dark[None, None, :] + (light - dark)[None, None, :] * glow[:, :, None]
    image = Image.fromarray(np.uint8(np.clip(rgb, 0, 255)), "RGB")
    draw = ImageDraw.Draw(image)
    draw.rectangle((34 * SCALE, 30 * SCALE, 926 * SCALE, 510 * SCALE), outline="#49614a", width=1)
    # Short gold accents give the shared frame a quiet editorial finish.
    for x, direction in [(34, 1), (926, -1)]:
        for y in [30, 510]:
            draw.line((x * SCALE, y * SCALE, (x + direction * 30) * SCALE, y * SCALE), fill=GOLD, width=2)
    return image, draw


def centered(draw, text, y, path, size, color=CREAM):
    draw.text((WIDTH * SCALE / 2, y * SCALE), text, font=font(path, size), fill=color, anchor="mm")


def tracked(draw, text, y, size=12, spacing=1.8, color=GOLD):
    face = font(SANS, size)
    widths = [draw.textlength(character, font=face) for character in text]
    x = (WIDTH * SCALE - sum(widths) - max(0, len(text) - 1) * spacing * SCALE) / 2
    for character, width in zip(text, widths):
        draw.text((x, y * SCALE), character, font=face, fill=color, anchor="lm")
        x += width + spacing * SCALE


def line(draw, x0, y, x1, color=GOLD):
    draw.line((x0 * SCALE, y * SCALE, x1 * SCALE, y * SCALE), fill=color, width=SCALE)


def save(image, name):
    image.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS).save(args.directory / name)


opening, draw = surface()
universe = copy["universe"].split(" · ")
tracked(draw, universe[0].upper(), 88, 13, 2.5)
tracked(draw, universe[1].upper(), 114, 10.5, 1.7, MUTED)
line(draw, 448, 165, 512)
title_first, title_last = copy["title"].split(" des ", 1)
centered(draw, title_first, 238, SERIF, 73)
centered(draw, "des " + title_last, 318, SERIF, 78)
line(draw, 409, 408, 551)
save(opening, "opening.png")

closing, draw = surface()
tracked(draw, copy["universe"].upper(), 65, 10.5, 1.1, MUTED)
centered(draw, copy["title"], 125, SERIF, 49)
line(draw, 440, 175, 520)
invitation = copy["invitation"].replace(" et alpha-testeur.", "\net alpha-testeur.")
for y, text in zip([223, 260], invitation.splitlines()):
    centered(draw, text, y, SANS_BOLD, 25.5)
centered(draw, copy["contribution"], 313, SANS, 18, GOLD)
line(draw, 448, 355, 512, "#65765a")
centered(draw, copy["site"], 397, SANS, 24)
centered(draw, copy["email"], 441, SANS, 20, MUTED)
save(closing, "closing.png")

print(json.dumps({"opening": str(args.directory / "opening.png"), "closing": str(args.directory / "closing.png")}))
