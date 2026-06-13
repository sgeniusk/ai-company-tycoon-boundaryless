# 생성한 배경 위에 v090 직원 3종을 게임 OfficeScene과 유사하게 합성한 미리보기. 바닥선·책상 정합 확인용.
import sys, os
from PIL import Image

HERE = os.path.dirname(__file__)
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
ACTORS = os.path.join(ROOT, "Assets/_Project/Resources/Art/UI/v090-workforce-actor-hires.png")


def crop_actors(path):
    im = Image.open(path).convert("RGBA")
    w, h = im.size
    cw = w // 3
    out = []
    for i in range(3):
        cell = im.crop((i * cw, 0, (i + 1) * cw, h))
        bbox = cell.getbbox()
        out.append(cell.crop(bbox) if bbox else cell)
    return out


def main():
    bg_name = sys.argv[1] if len(sys.argv) > 1 else "office"
    floor_ratio = float(sys.argv[2]) if len(sys.argv) > 2 else 0.643  # FLOOR_Y/H = 206/320
    bg = Image.open(os.path.join(HERE, "out", bg_name + ".png")).convert("RGBA")
    W, H = bg.size
    actors = crop_actors(ACTORS)

    # 직원 4명(human,ai,robot,human) 하단 중앙 일렬 — 게임 RefreshOfficeScene 모사
    target_h = int(H * 0.115)  # 화면 높이의 ~11.5%
    order = [0, 1, 2, 0]
    sprites = []
    for idx in order:
        a = actors[idx]
        s = target_h / a.height
        sprites.append(a.resize((max(1, int(a.width * s)), target_h), Image.NEAREST))

    gap = int(W * 0.012)
    total = sum(s.width for s in sprites) + gap * (len(sprites) - 1)
    x = (W - total) // 2
    floor_y = int(H * floor_ratio)
    for s in sprites:
        bg.alpha_composite(s, (x, floor_y - s.height))
        x += s.width + gap

    # 바닥선 가이드(빨강 점선) — 확인용, 최종엔 끔
    if "--guide" in sys.argv:
        for gx in range(0, W, 12):
            for gy in range(floor_y, floor_y + 3):
                bg.putpixel((gx, gy), (255, 0, 0, 255))

    out = os.path.join(HERE, "out", bg_name + "_preview.png")
    bg.convert("RGB").save(out)
    print("wrote", out)


if __name__ == "__main__":
    main()
