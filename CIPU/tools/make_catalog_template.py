#!/usr/bin/env python3
"""CIPU 型錄風模板（參考 FOFO lookbook 風格）。

白底紙感 + serif 英文鋼印字 + 商品圖 + 虛線描邊 + 手寫感英文註記 + 底部規格表。
尺寸 1080x1350（IG 4:5）。
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "005_11552773_Lissom經典手提包"
OUT = ROOT / "CIPU" / "素材輸出"

SERIF = "/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc"
SERIF_REG = "/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc"
TC = 1  # NotoSerifCJK ttc: 確認後填正確 index（執行時自動偵測）
INK = (40, 38, 36)
SOFT = (110, 105, 100)

PAPER = (250, 249, 246)


def tc_index(path):
    for i in range(8):
        try:
            f = ImageFont.truetype(path, 20, index=i)
            if f.getname()[0].endswith("TC"):
                return i
        except OSError:
            break
    return 0


def bag_crop_and_mask(img):
    g = ImageOps.grayscale(img)
    w, h = g.size
    px = g.load()
    row_has = [any(px[x, y] < 245 for x in range(0, w, 4)) for y in range(h)]
    runs, start = [], None
    for y, has in enumerate(row_has):
        if has and start is None:
            start = y
        elif not has and start is not None:
            runs.append((start, y)); start = None
    if start is not None:
        runs.append((start, h))
    top, bot = [r for r in runs if r[1] - r[0] > 40][0]
    band = img.crop((0, max(0, top - 8), w, min(h, bot + 8)))
    bbox = ImageOps.invert(ImageOps.grayscale(band)).getbbox()
    bag = band.crop(bbox)
    mask = ImageOps.grayscale(bag).point(lambda v: 255 if v < 245 else 0)
    mask = mask.filter(ImageFilter.MaxFilter(9))  # 收攏破碎處
    return bag, mask


def dotted_silhouette(draw, mask, offset_xy, grow=16, step=16, r=2.5, color=(150, 145, 140)):
    """沿包體輪廓外擴 grow px、等距取點畫乾淨的點狀描邊。"""
    import math
    big = mask.filter(ImageFilter.MaxFilter(grow * 2 + 1))
    w, h = mask.size
    px = big.load()
    pts = []
    for y in range(1, h - 1):
        for x in range(1, w - 1):
            if px[x, y] and (not px[x - 1, y] or not px[x + 1, y]
                             or not px[x, y - 1] or not px[x, y + 1]):
                pts.append((x, y))
    if not pts:
        return
    cx = sum(p[0] for p in pts) / len(pts)
    cy = sum(p[1] for p in pts) / len(pts)
    pts.sort(key=lambda p: math.atan2(p[1] - cy, p[0] - cx))
    ox, oy = offset_xy
    last = None
    for x, y in pts:
        if last is None or (x - last[0]) ** 2 + (y - last[1]) ** 2 >= step ** 2:
            draw.ellipse((ox + x - r, oy + y - r, ox + x + r, oy + y + r), fill=color)
            last = (x, y)


def make(out_name="TPL1_型錄風_BK_1080x1350"):
    tc = tc_index(SERIF)
    bag, mask = bag_crop_and_mask(Image.open(SRC / "01_11552773_Lissom經典手提包.jpg").convert("RGB"))

    W, H = 1080, 1350
    c = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(c)

    # 1) 頂部 logo 區留白（y 0–220 不放任何元素，logo 由使用者自行上）

    # 2) 商品圖置中
    scale = (W * 0.52) / bag.width
    nb = bag.resize((int(bag.width * scale), int(bag.height * scale)), Image.LANCZOS)
    nm = mask.resize(nb.size)
    bx, by = (W - nb.width) // 2, 300
    # 點狀描邊（在包後方）
    dotted_silhouette(d, nm, (bx, by))
    white_bag = Image.new("RGB", nb.size, PAPER)
    white_bag.paste(nb, (0, 0), nm)
    c.paste(white_bag, (bx, by), nm)

    # 3) 手寫感英文註記 + 箭頭（斜放 serif italic 用旋轉近似）
    note_f = ImageFont.truetype(SERIF_REG, 34, index=tc)

    def note(text, pos, angle, arrow):
        tw = int(note_f.getlength(text)) + 20
        t = Image.new("RGBA", (tw, 60), (0, 0, 0, 0))
        ImageDraw.Draw(t).text((10, 30), text, font=note_f, fill=INK + (255,), anchor="lm")
        t = t.rotate(angle, expand=True, resample=Image.BICUBIC)
        c.paste(t, pos, t)
        (x1, y1), (x2, y2) = arrow
        d.line((x1, y1, x2, y2), fill=INK, width=3)
        # 簡單箭頭頭
        import math
        ang = math.atan2(y2 - y1, x2 - x1)
        for s in (0.5, -0.5):
            d.line((x2, y2,
                    x2 - 16 * math.cos(ang + s), y2 - 16 * math.sin(ang + s)), fill=INK, width=3)

    note("Light as a cloud", (660, 235), -8, ((735, 300), (700, 350)))
    note("Room for your day", (70, 800), 8, ((300, 790), (350, 720)))

    # 4) 底部規格表
    tab_top = 1040
    rows = [("Name:", "Lissom 經典手提包"),
            ("Collection:", "Lissom 輕奢簡約"),
            ("Size:", "L—cm W—cm H—cm"),
            ("Weight:", "—g")]
    lab_f = ImageFont.truetype(SERIF, 32, index=tc)
    val_f = ImageFont.truetype(SERIF_REG, 32, index=tc)
    x0, x1 = 180, 900
    d.line((x0, tab_top, x1, tab_top), fill=INK, width=4)
    y = tab_top
    for lab, val in rows:
        y += 68
        d.text((x0, y - 30), lab, font=lab_f, fill=INK, anchor="lm")
        d.text((x0 + 230, y - 30), val, font=val_f, fill=INK, anchor="lm")
        d.line((x0, y, x1, y), fill=(190, 186, 180), width=2)

    OUT.mkdir(parents=True, exist_ok=True)
    c.save(OUT / f"{out_name}.png")
    print("saved", out_name)


if __name__ == "__main__":
    make()
