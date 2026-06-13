# 새 고해상도 배경을 실제 폰 해상도로 cover 스케일(정사각 도트 보존)한 뒤 v090 직원을 합성한 검증 미리보기.
import os
from PIL import Image

HERE = os.path.dirname(__file__)
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
ACTORS = os.path.join(ROOT, "Assets/_Project/Resources/Art/UI/v090-workforce-actor-hires.png")
FLOOR_NATIVE = 348
H_NATIVE = 534


def crop_actors(p):
    im = Image.open(p).convert("RGBA"); w, h = im.size; cw = w // 3; out = []
    for i in range(3):
        cell = im.crop((i * cw, 0, (i + 1) * cw, h)); b = cell.getbbox()
        out.append(cell.crop(b) if b else cell)
    return out


def cover(img, tw, th):
    w, h = img.size; s = max(tw / w, th / h); nw, nh = round(w * s), round(h * s)
    r = img.resize((nw, nh), Image.NEAREST); x = (nw - tw) // 2; y = (nh - th) // 2
    return r.crop((x, y, x + tw, y + th)), s, y


def main():
    bg = Image.open(os.path.join(HERE, "out", "office.png")).convert("RGBA")
    scale_px = bg.size[1] / H_NATIVE  # native→png 배율(=SCALE)
    actors = crop_actors(ACTORS)
    for name, tw, th in [("QHD", 1440, 3120), ("FHD", 1080, 2400), ("iPhone", 1179, 2556)]:
        cov, s, cy = cover(bg, tw, th)
        cov = cov.convert("RGBA")
        floor_screen = round(FLOOR_NATIVE * scale_px * s) - cy
        th_a = int(th * 0.105)
        order = [0, 1, 2, 0]
        sprites = [a.resize((max(1, int(a.width * (th_a / a.height))), th_a), Image.NEAREST)
                   for a in (actors[i] for i in order)]
        gap = int(tw * 0.012)
        total = sum(sp.width for sp in sprites) + gap * (len(sprites) - 1)
        x = (tw - total) // 2
        for sp in sprites:
            cov.alpha_composite(sp, (x, floor_screen - sp.height)); x += sp.width + gap
        cov.convert("RGB").save(os.path.join(HERE, "out", f"phone_{name}.png"))
        print(name, (tw, th), "scale", round(s, 3), "floor_y", floor_screen)


if __name__ == "__main__":
    main()
