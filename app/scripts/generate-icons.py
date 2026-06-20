
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent / "assets"
BG = "#0f172a"
FG = "#f8fafc"
SPLASH_BG = "#f8fafc"


def load_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for path in (
        "/System/Library/Fonts/SFNS.ttf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ):
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def draw_ms_tile(size: int, radius_ratio: float = 0.1875) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    margin = int(size * 0.08)
    box = [margin, margin, size - margin, size - margin]
    radius = int(size * radius_ratio)
    draw.rounded_rectangle(box, radius=radius, fill=BG)

    font_size = int(size * 0.38)
    font = load_font(font_size)
    text = "MS"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (size - tw) // 2 - bbox[0]
    y = (size - th) // 2 - bbox[1]
    draw.text((x, y), text, fill=FG, font=font)
    return img


def draw_ms_foreground(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    font_size = int(size * 0.32)
    font = load_font(font_size)
    text = "MS"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (size - tw) // 2 - bbox[0]
    y = (size - th) // 2 - bbox[1]
    draw.text((x, y), text, fill=BG, font=font)
    return img


def draw_monochrome(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    font_size = int(size * 0.32)
    font = load_font(font_size)
    text = "MS"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (size - tw) // 2 - bbox[0]
    y = (size - th) // 2 - bbox[1]
    draw.text((x, y), text, fill="#000000", font=font)
    return img


def draw_splash(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), SPLASH_BG)
    tile_size = int(size * 0.28)
    tile = draw_ms_tile(tile_size)
    offset = (size - tile_size) // 2
    img.paste(tile, (offset, offset), tile)
    return img.convert("RGB")


def solid_bg(size: int, color: str) -> Image.Image:
    img = Image.new("RGB", (size, size), color)
    return img


def main() -> None:
    ROOT.mkdir(parents=True, exist_ok=True)
    icon = draw_ms_tile(1024)
    icon.save(ROOT / "icon.png", "PNG")

    splash = draw_splash(1024)
    splash.save(ROOT / "splash-icon.png", "PNG")

    draw_ms_foreground(1024).save(ROOT / "android-icon-foreground.png", "PNG")
    solid_bg(1024, BG).save(ROOT / "android-icon-background.png", "PNG")
    draw_monochrome(1024).save(ROOT / "android-icon-monochrome.png", "PNG")

    favicon = draw_ms_tile(48)
    favicon.save(ROOT / "favicon.png", "PNG")
    print("Generated MS icons in", ROOT)


if __name__ == "__main__":
    main()
