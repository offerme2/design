#!/usr/bin/env python3
"""CIPU W1 B 系列（有字廣告感）素材產生器。

從 005 Lissom 經典手提包的白底商品圖裁出包體，
套上「單一句圖上文字」輸出 1080x1080 與 1080x1920 兩種尺寸。
規格依 CIPU/2026-W1_廣告素材測試計畫.md：純白底、商品大、只放一句話。
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "005_11552773_Lissom經典手提包"
OUT = ROOT / "CIPU" / "素材輸出"

FONT_PATH = "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc"
FONT_REG = "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc"
TC_BOLD = 3  # ttc index: Noto Sans CJK TC

INK = (26, 26, 26)
GREY = (120, 120, 120)


def bag_crop(img: Image.Image) -> Image.Image:
    """裁出畫面中最大的非白色區塊（包體），排除下方的背帶配件。"""
    g = ImageOps.grayscale(img)
    w, h = g.size
    px = g.load()
    # 每列是否含非白像素
    row_has = [any(px[x, y] < 245 for x in range(0, w, 4)) for y in range(h)]
    # 找連續區段，取最高的那段（包體在上、配件在下）
    runs, start = [], None
    for y, has in enumerate(row_has):
        if has and start is None:
            start = y
        elif not has and start is not None:
            runs.append((start, y)); start = None
    if start is not None:
        runs.append((start, h))
    runs = [r for r in runs if r[1] - r[0] > 40]
    top, bot = runs[0]
    band = img.crop((0, max(0, top - 8), w, min(h, bot + 8)))
    bbox = ImageOps.invert(ImageOps.grayscale(band)).getbbox()
    return band.crop(bbox)


def compose(src_file: str, headline: str, sub: str, out_name: str):
    bag = bag_crop(Image.open(SRC / src_file).convert("RGB"))

    for size, tag in (((1080, 1080), "1080x1080"), ((1080, 1920), "1080x1920")):
        W, H = size
        canvas = Image.new("RGB", size, (255, 255, 255))
        d = ImageDraw.Draw(canvas)

        brand_f = ImageFont.truetype(FONT_REG, 34, index=TC_BOLD)
        head_f = ImageFont.truetype(FONT_PATH, 76, index=TC_BOLD)
        sub_f = ImageFont.truetype(FONT_REG, 30, index=TC_BOLD)

        top = 150 if H == 1080 else 420
        d.text((W / 2, top), "CIPU｜Lissom", font=brand_f, fill=GREY, anchor="mm")
        d.text((W / 2, top + 90), headline, font=head_f, fill=INK, anchor="mm")

        # 商品圖：寬度上限 82%，高度塞進剩餘空間
        area_top = top + 170
        area_bot = H - (120 if H == 1080 else 380)
        max_w, max_h = int(W * 0.82), area_bot - area_top
        scale = min(max_w / bag.width, max_h / bag.height)
        nb = bag.resize((int(bag.width * scale), int(bag.height * scale)), Image.LANCZOS)
        canvas.paste(nb, ((W - nb.width) // 2, area_top + (max_h - nb.height) // 2))

        d.text((W / 2, area_bot + (50 if H == 1080 else 90)), sub,
               font=sub_f, fill=GREY, anchor="mm")

        OUT.mkdir(parents=True, exist_ok=True)
        canvas.save(OUT / f"{out_name}_{tag}.png")
        print("saved", out_name, tag)


if __name__ == "__main__":
    compose("01_11552773_Lissom經典手提包.jpg",
            "通勤、接送、採買，一包搞定", "Lissom 經典手提包", "B1_情境型_BK")
    compose("01_11552773_Lissom經典手提包.jpg",
            "輕量好收納，出門不負擔", "Lissom 經典手提包", "B2_利益型_BK")
    compose("11_11552773_Lissom經典手提包.jpg",
            "低調百搭，每天都能背", "Lissom 經典手提包", "B3_風格型_GY")
