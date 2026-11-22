"""Gera os ícones da extensão e a logomarca do side panel a partir de logo2.jpeg.

Uso:  uv run --with pillow python scripts/generate-icons.py
"""
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "assets-src" / "logo2.jpeg"

# Região do emblema (detetive + lupa) na imagem original 1408x768,
# sem o texto "PRIVACY LENS". Bounding box detectado: x 568-835, y 175-487.
EMBLEM_BOX = (536, 166, 866, 496)  # quadrado 330x330 centrado no emblema

SUPER = 8  # fator de supersampling para bordas suaves


def whiten(img: Image.Image) -> Image.Image:
    """Leva o fundo levemente acinzentado (~245) para branco puro."""
    def curve(v: int) -> int:
        if v <= 200:
            return v
        return min(255, 200 + (v - 200) * 55 // 38)
    return img.point([curve(v) for v in range(256)] * 3)


def make_tile(emblem: Image.Image, size: int, margin: int, inset: float) -> Image.Image:
    """Ladrilho branco arredondado com o emblema, fundo transparente."""
    big = size * SUPER
    m = margin * SUPER
    tile = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    mask = Image.new("L", (big, big), 0)
    radius = int((big - 2 * m) * 0.22)
    ImageDraw.Draw(mask).rounded_rectangle((m, m, big - m - 1, big - m - 1), radius=radius, fill=255)

    inner = big - 2 * m
    pad = int(inner * inset)
    content = emblem.resize((inner - 2 * pad, inner - 2 * pad), Image.LANCZOS)
    bg = Image.new("RGB", (big, big), (255, 255, 255))
    bg.paste(content, (m + pad, m + pad))
    tile.paste(bg, (0, 0), mask)
    return tile.resize((size, size), Image.LANCZOS)


def main() -> None:
    src = whiten(Image.open(SOURCE).convert("RGB"))
    emblem = src.crop(EMBLEM_BOX)

    # (tamanho, margem transparente, respiro interno relativo)
    for size, margin, inset in ((16, 0, 0.0), (48, 2, 0.02), (128, 8, 0.03)):
        make_tile(emblem, size, margin, inset).save(ROOT / "public" / f"icon{size}.png", optimize=True)

    # Logomarca do header do side panel (exibida a 28px, gerada em 2x/3x)
    assets = ROOT / "src" / "sidepanel" / "assets"
    assets.mkdir(parents=True, exist_ok=True)
    make_tile(emblem, 96, 0, 0.04).save(assets / "logo.png", optimize=True)


if __name__ == "__main__":
    main()
