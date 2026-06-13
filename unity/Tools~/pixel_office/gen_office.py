# 정면 단면 픽셀오피스 룸 절차 생성기 — v090 직원 팔레트에 맞춘 진짜 도트 사무실 배경.
# 네이티브 저해상도 캔버스(180x320 세로)에 픽셀 단위로 그린 뒤 정수배(6x) nearest 업스케일 → 1080x1920.
# 세로 모바일 풀스트레치 배경용. 성급 4종(차고→스타트업→데이터센터→랜드마크)을 같은 룸 문법으로 그린다.
import sys, os
from PIL import Image

# 캔버스 240x534(≈20:9 세로) — 폰 비율에 맞춰 cover 스케일 시 좌우 크롭 최소.
# SCALE 6 → 1440x3204(QHD 폰 1:1, FHD는 깔끔한 다운스케일). 도트는 현 180폭 대비 240폭이라 약간 작아 디테일 ↑.
W, H = 240, 534
SCALE = 6  # 240x534 -> 1440x3204

# --- v090 직원 스프라이트에서 추출한 팔레트 (통일감의 핵심) ---
INK     = (0x1F, 0x19, 0x12)  # 윤곽선 (거의 검정)
INK2    = (0x28, 0x26, 0x22)
MINT    = (0x5F, 0xC6, 0xA6)
MINT_D  = (0x2B, 0x6B, 0x4F)
METAL   = (0x8A, 0x9A, 0xA0)
METAL_L = (0xCD, 0xDA, 0xDB)
METAL_D = (0x48, 0x56, 0x62)
NAVY    = (0x1C, 0x30, 0x3F)
NAVY_D  = (0x24, 0x2D, 0x35)
BLUE    = (0x33, 0x5F, 0x7A)
PURPLE  = (0x6F, 0x5B, 0xB2)
PURPLE_D= (0x3F, 0x37, 0x71)
YELLOW  = (0xF4, 0xCC, 0x70)
CREAM   = (0xFF, 0xF7, 0xDF)
SKIN    = (0xF5, 0xB8, 0x84)
WOOD    = (0xC6, 0x76, 0x54)
WOOD_D  = (0x8A, 0x4E, 0x36)
WOOD_L  = (0xE0, 0x9A, 0x6E)
ORANGE  = (0xE8, 0x90, 0x43)
RED     = (0xD6, 0x48, 0x38)
WHITE   = (0xF6, 0xFA, 0xEF)


def mix(a, b, t):
    return tuple(int(round(a[i] * (1 - t) + b[i] * t)) for i in range(3))


def shade(c, amt):
    # amt<0 어둡게, >0 밝게
    if amt < 0:
        return mix(c, INK, -amt)
    return mix(c, WHITE, amt)


class Canvas:
    def __init__(self, w, h, bg):
        self.w, self.h = w, h
        self.px = Image.new("RGBA", (w, h), bg + (255,))
        self.d = self.px.load()

    def put(self, x, y, c):
        if 0 <= x < self.w and 0 <= y < self.h:
            self.d[x, y] = c + (255,) if len(c) == 3 else c

    def rect(self, x0, y0, x1, y1, c):
        for y in range(max(0, y0), min(self.h, y1)):
            for x in range(max(0, x0), min(self.w, x1)):
                self.d[x, y] = (c + (255,)) if len(c) == 3 else c

    def hline(self, x0, x1, y, c):
        for x in range(max(0, x0), min(self.w, x1)):
            self.put(x, y, c)

    def vline(self, x, y0, y1, c):
        for y in range(max(0, y0), min(self.h, y1)):
            self.put(x, y, c)

    def outline(self, x0, y0, x1, y1, c):
        self.hline(x0, x1, y0, c)
        self.hline(x0, x1, y1 - 1, c)
        self.vline(x0, y0, y1, c)
        self.vline(x1 - 1, y0, y1, c)

    def dither(self, x0, y0, x1, y1, c, step=2, phase=0):
        # 체커 디더링으로 벽 질감
        for y in range(max(0, y0), min(self.h, y1)):
            for x in range(max(0, x0), min(self.w, x1)):
                if (x + y + phase) % step == 0:
                    self.d[x, y] = c + (255,)

    def speckle(self, x0, y0, x1, y1, c, density=0.12, seed=1):
        # 결정적 의사난수 점묘 — 대각줄 없는 자연스러운 콘크리트 노이즈
        for y in range(max(0, y0), min(self.h, y1)):
            for x in range(max(0, x0), min(self.w, x1)):
                hsh = ((x * 73856093) ^ (y * 19349663) ^ (seed * 83492791)) & 0xFFFF
                if (hsh / 65535.0) < density:
                    self.d[x, y] = c + (255,)

    def vgrad(self, x0, y0, x1, y1, top, bot):
        # 세로 그라데이션 (밴딩으로 도트감 유지)
        h = max(1, y1 - y0)
        for y in range(max(0, y0), min(self.h, y1)):
            t = (y - y0) / h
            c = mix(top, bot, t)
            for x in range(max(0, x0), min(self.w, x1)):
                self.d[x, y] = c + (255,)

    def save(self, path):
        big = self.px.resize((self.w * SCALE, self.h * SCALE), Image.NEAREST)
        big.save(path)


# ============================================================
# 공통 룸 셸 — 정면 단면(벽+바닥). FLOOR_Y가 직원이 서는 바닥선.
# ============================================================
FLOOR_Y = 384  # 직원 발바닥선 (240x534, 20:9 폰 cover 기준 액터 anchor 0.20과 정합)


def draw_window(c, x0, y0, x1, y1, sky_top, sky_bot, frame, glass_shade=True):
    # 창문 — 프레임 + 하늘(또는 도시) + 십자 새시
    c.rect(x0, y0, x1, y1, mix(sky_top, sky_bot, 0.5))
    c.vgrad(x0 + 1, y0 + 1, x1 - 1, y1 - 1, sky_top, sky_bot)
    # 유리 하이라이트 (대각)
    if glass_shade:
        for i in range(0, (x1 - x0)):
            yy = y0 + 2 + (i % 5)
            c.put(x0 + 1 + i, yy, shade(mix(sky_top, sky_bot, 0.3), 0.4))
    midx = (x0 + x1) // 2
    midy = (y0 + y1) // 2
    c.vline(midx, y0, y1, frame)
    c.hline(x0, x1, midy, frame)
    c.outline(x0, y0, x1, y1, INK)
    c.rect(x0 - 1, y0 - 1, x1 + 1, y0 + 1, frame)  # 상단 새시 두께


def draw_desk(c, x0, top, w, monitor_color):
    # 벽에 붙은 워크데스크 — 상판 + 다리 + 모니터. top=상판 윗면 y.
    x1 = x0 + w
    legh = 14
    # 상판
    c.rect(x0, top, x1, top + 4, WOOD_L)
    c.rect(x0, top + 4, x1, top + 6, WOOD_D)
    c.outline(x0, top, x1, top + 6, INK)
    # 다리
    c.rect(x0 + 1, top + 6, x0 + 3, top + 6 + legh, WOOD_D)
    c.rect(x1 - 3, top + 6, x1 - 1, top + 6 + legh, WOOD_D)
    # 모니터
    mw = 12
    mx = x0 + (w - mw) // 2
    my = top - 11
    c.rect(mx, my, mx + mw, my + 9, NAVY_D)
    c.rect(mx + 1, my + 1, mx + mw - 1, my + 7, monitor_color)
    # 화면 코드라인
    c.hline(mx + 2, mx + mw - 3, my + 3, shade(monitor_color, 0.5))
    c.hline(mx + 2, mx + mw - 4, my + 5, shade(monitor_color, 0.3))
    c.outline(mx, my, mx + mw, my + 9, INK)
    c.rect(mx + mw // 2 - 1, my + 9, mx + mw // 2 + 1, my + 11, METAL_D)  # 스탠드
    c.hline(mx + mw // 2 - 3, mx + mw // 2 + 3, top - 1, INK)  # 받침


def draw_plant(c, x, base_y):
    # 작은 화분 — office.png 녹색 화분 계승 (도트 버전)
    c.rect(x, base_y - 4, x + 6, base_y, WOOD_D)
    c.outline(x, base_y - 4, x + 6, base_y, INK)
    c.rect(x + 1, base_y - 9, x + 5, base_y - 4, MINT_D)
    c.put(x + 2, base_y - 11, MINT); c.put(x + 3, base_y - 11, MINT)
    c.put(x + 1, base_y - 9, MINT); c.put(x + 4, base_y - 9, MINT_D)
    c.put(x + 3, base_y - 13, MINT)


def draw_box(c, x, base_y, w, h):
    # 골판지 박스 (차고 어수선함)
    c.rect(x, base_y - h, x + w, base_y, WOOD)
    c.rect(x, base_y - h, x + w, base_y - h + 2, WOOD_L)
    c.outline(x, base_y - h, x + w, base_y, INK)
    c.hline(x + w // 2, x + w // 2 + 1, base_y - h, INK)
    c.put(x + w // 2, base_y - h + 1, WOOD_D)
    c.vline(x + w // 2, base_y - h, base_y - h + 3, WOOD_D)  # 테이프 이음


def draw_pendant_light(c, x, y, glow):
    # 매달린 형광등/전구 + 빛 번짐
    c.vline(x, 0, y, INK2)  # 전선
    c.rect(x - 5, y, x + 6, y + 3, METAL_D)
    c.rect(x - 4, y + 1, x + 5, y + 2, YELLOW)
    c.outline(x - 5, y, x + 6, y + 3, INK)
    if glow:
        # 빛 원뿔 (반투명 도트)
        for dy in range(1, 26):
            ww = 4 + dy
            yy = y + 3 + dy
            a = max(0, 60 - dy * 2)
            for dx in range(-ww, ww + 1):
                xx = x + dx
                if 0 <= xx < c.w and 0 <= yy < c.h and (xx + yy) % 2 == 0:
                    base = c.d[xx, yy]
                    c.d[xx, yy] = mix(base[:3], YELLOW, a / 255.0) + (255,)


# ============================================================
# 벽 중하단 데코 헬퍼 — 20:9로 길어진 벽의 빈 중하단(직원 머리 위)을 채운다.
# 안전영역 : 중앙은 캔버스 y 150~310(직원 머리 ~323 위), 좌우 끝(x<32·x>208)은 y 350까지.
# 공통 문법 — 벽에 '걸린' 느낌(상단 못 + 우·하단 그림자)으로 통일감 유지.
# ============================================================
def _hang_shadow(c, x0, y0, x1, y1):
    # 액자·패널 우·하단 1px 그림자 — 벽에서 살짝 떠 보이게.
    c.vline(x1, y0 + 1, y1 + 1, INK2)
    c.hline(x0 + 1, x1 + 1, y1, INK2)


def draw_frame(c, x0, y0, x1, y1, frame_col, kind="abstract", accent=MINT, nail=True):
    # 벽걸이 액자 — 프레임 + 내용(abstract/chart/photo/award/text). 못·그림자로 '걸린' 느낌.
    _hang_shadow(c, x0, y0, x1, y1)
    c.rect(x0, y0, x1, y1, frame_col)
    c.rect(x0, y0, x1, y0 + 1, shade(frame_col, 0.25))
    c.rect(x0, y1 - 1, x1, y1, shade(frame_col, -0.25))
    c.outline(x0, y0, x1, y1, INK)
    ix0, iy0, ix1, iy1 = x0 + 2, y0 + 2, x1 - 2, y1 - 2
    if ix1 - ix0 < 2 or iy1 - iy0 < 2:
        return
    if kind == "abstract":
        c.vgrad(ix0, iy0, ix1, iy1, shade(accent, 0.35), shade(accent, -0.3))
        for k in range(iy0 + 1, iy1, 3):
            c.hline(ix0, ix1, k, shade(accent, 0.12))
        c.rect(ix0, iy0, (ix0 + ix1) // 2, (iy0 + iy1) // 2, mix(accent, WHITE, 0.3))
    elif kind == "chart":
        c.rect(ix0, iy0, ix1, iy1, NAVY_D)
        prev = iy1 - 1
        span = max(2, iy1 - iy0 - 2)
        for i, lx in enumerate(range(ix0 + 1, ix1 - 1)):
            hh = iy1 - 2 - int((i * 1.7) % span)
            for yy in range(min(hh, prev), max(hh, prev) + 1):
                c.put(lx, yy, shade(accent, -0.15))
            c.put(lx, hh, accent)
            prev = hh
    elif kind == "photo":
        c.vgrad(ix0, iy0, ix1, iy1, mix(BLUE, WHITE, 0.45), mix(MINT, WHITE, 0.55))
        for hx in range(ix0 + 1, ix1 - 1, 3):
            c.rect(hx, iy1 - 3, hx + 2, iy1, INK2)
            c.put(hx, iy1 - 4, SKIN)
    elif kind == "award":
        c.vgrad(ix0, iy0, ix1, iy1, shade(NAVY, -0.05), NAVY_D)
        mx = (ix0 + ix1) // 2
        c.rect(mx - 2, iy0 + 2, mx + 3, iy0 + 7, YELLOW)
        c.put(mx - 1, iy0 + 1, YELLOW)
        c.vline(mx - 1, iy0 + 7, iy1 - 1, RED)
        c.vline(mx + 1, iy0 + 7, iy1 - 1, shade(YELLOW, -0.1))
    elif kind == "text":
        c.rect(ix0, iy0, ix1, iy1, CREAM)
        for k in range(iy0 + 2, iy1 - 1, 3):
            c.hline(ix0 + 2, ix1 - 2 - ((k * 5) % 4), k, shade(accent, -0.2))
    if nail:
        c.put((x0 + x1) // 2, y0 - 1, METAL_L)


def draw_shelf(c, x0, x1, y, mat=WOOD):
    # 벽 선반 — 판 + 양끝 브래킷. y는 판 윗면.
    c.rect(x0, y, x1, y + 2, shade(mat, 0.2))
    c.rect(x0, y + 2, x1, y + 3, shade(mat, -0.3))
    c.outline(x0, y, x1, y + 3, INK)
    c.vline(x0 + 1, y + 3, y + 7, shade(mat, -0.3))
    c.vline(x1 - 2, y + 3, y + 7, shade(mat, -0.3))


def draw_trophy(c, x, base_y, cup=YELLOW):
    # 작은 트로피 — 컵 + 받침.
    c.rect(x, base_y - 2, x + 6, base_y, shade(cup, -0.3))
    c.rect(x + 1, base_y - 6, x + 5, base_y - 2, cup)
    c.rect(x, base_y - 9, x + 6, base_y - 6, cup)
    c.put(x - 1, base_y - 8, shade(cup, -0.2))
    c.put(x + 6, base_y - 8, shade(cup, -0.2))
    c.outline(x, base_y - 9, x + 6, base_y, INK)
    c.put(x + 2, base_y - 8, shade(cup, 0.4))


def draw_potted(c, x, base_y, big=False, pot=WOOD_D, leaf=MINT_D):
    # 화분 — big=대형 야자(랜드마크 측벽용), 아니면 기존 draw_plant.
    if not big:
        draw_plant(c, x, base_y)
        return
    c.rect(x, base_y - 12, x + 14, base_y, pot)
    c.rect(x, base_y - 12, x + 14, base_y - 9, shade(pot, 0.2))
    c.outline(x, base_y - 12, x + 14, base_y, INK)
    cx = x + 7
    for ang, ln in ((-6, 18), (-2, 26), (2, 24), (6, 16)):
        for t in range(ln):
            lx = cx + int(ang * t / 8)
            ly = base_y - 12 - t
            c.put(lx, ly, leaf if t % 2 else shade(leaf, 0.25))
            c.put(lx + 1, ly, shade(leaf, -0.2))


def draw_string_lights(c, x0, x1, y, bulb=YELLOW):
    # 늘어진 전구 줄 — 차고·스타트업 활기. 처짐 곡선 반복.
    for i, x in enumerate(range(x0, x1)):
        yy = y + int(3 * (1 - abs((i % 28) - 14) / 14.0))
        c.put(x, yy, INK2)
        if i % 14 == 7:
            c.put(x, yy + 2, bulb)
            c.put(x, yy + 3, shade(bulb, -0.2))
            c.put(x - 1, yy + 2, shade(bulb, -0.1))
            c.put(x + 1, yy + 2, shade(bulb, -0.1))


def draw_poster(c, x0, y0, x1, y1, paper=CREAM, ink=NAVY, accent=RED):
    # 핀업 포스터 — 큰 상승 화살표 + 텍스트 줄. 모서리 핀.
    _hang_shadow(c, x0, y0, x1, y1)
    c.rect(x0, y0, x1, y1, paper)
    c.outline(x0, y0, x1, y1, INK)
    ax0, ay0 = x0 + 4, y1 - 5
    ax1, ay1 = x1 - 5, y0 + 6
    steps = max(2, ax1 - ax0)
    for i in range(steps + 1):
        t = i / steps
        px = ax0 + i
        py = int(ay0 + (ay1 - ay0) * t)
        c.put(px, py, accent)
        c.put(px, py + 1, shade(accent, -0.2))
    for d in range(4):
        c.put(ax1 - d, ay1, accent)
        c.put(ax1, ay1 + d, accent)
    for k in range(y1 - 4, y1 - 1):
        c.hline(x0 + 3, x1 - 4, k, shade(ink, 0.1))
    c.put(x0 + 1, y0 + 1, RED)
    c.put(x1 - 2, y0 + 1, MINT)


def draw_sticky_notes(c, x0, y0, x1, y1):
    # 포스트잇·메모 군집 — 스타트업 어수선한 활기.
    cols = [YELLOW, MINT, mix(RED, WHITE, 0.4), mix(BLUE, WHITE, 0.5), ORANGE]
    for ny in range(y0, y1 - 7, 9):
        for nx in range(x0, x1 - 7, 9):
            col = cols[(nx * 7 + ny * 3) % len(cols)]
            js = (nx + ny) % 3 - 1
            c.rect(nx, ny + js, nx + 7, ny + 7 + js, col)
            c.rect(nx, ny + js, nx + 7, ny + 1 + js, shade(col, 0.2))
            c.outline(nx, ny + js, nx + 7, ny + 7 + js, shade(col, -0.4))
            c.hline(nx + 1, nx + 5, ny + 3 + js, shade(col, -0.3))
            c.hline(nx + 1, nx + 6, ny + 5 + js, shade(col, -0.3))


def draw_status_tile(c, x0, y0, x1, y1, accent=MINT, mode=0):
    # 작은 상태 모니터 타일 — 데이터센터 중앙 그리드용.
    c.rect(x0, y0, x1, y1, shade(NAVY_D, -0.2))
    c.outline(x0, y0, x1, y1, INK)
    c.rect(x0 + 1, y0 + 1, x1 - 1, y0 + 2, shade(NAVY, 0.1))
    if mode == 0:
        prev = y1 - 2
        span = max(2, y1 - y0 - 4)
        for i, lx in enumerate(range(x0 + 2, x1 - 1)):
            hh = y1 - 2 - ((i * 2) % span)
            for yy in range(min(hh, prev), max(hh, prev) + 1):
                c.put(lx, yy, shade(accent, -0.3))
            c.put(lx, hh, accent)
            prev = hh
    elif mode == 1:
        span = max(2, y1 - y0 - 4)
        for j, bx in enumerate(range(x0 + 2, x1 - 1, 3)):
            bh = 2 + (j * 3) % span
            c.rect(bx, y1 - 1 - bh, bx + 2, y1 - 1, accent if j % 2 else BLUE)
    elif mode == 2:
        c.rect(x0 + 2, y0 + 3, x1 - 2, y1 - 2, NAVY_D)
        c.hline(x0 + 2, x0 + 2 + (x1 - x0 - 4) * 2 // 3, (y0 + y1) // 2, accent)
        c.hline((x0 + x1) // 2, x1 - 2, y0 + 4, YELLOW)


def draw_led_tower(c, x, y0, y1):
    # 세로 상태 LED 신호탑 — 데이터센터 경고·상태.
    c.rect(x, y0, x + 6, y1, shade(NAVY_D, -0.3))
    c.outline(x, y0, x + 6, y1, INK)
    cols = [RED, YELLOW, MINT, BLUE]
    step = max(3, (y1 - y0) // 4)
    for i, yy in enumerate(range(y0 + 1, y1 - 1, step)):
        col = cols[i % len(cols)]
        c.rect(x + 1, yy, x + 5, yy + step - 1, shade(col, -0.1))
        c.rect(x + 2, yy + 1, x + 4, yy + 2, shade(col, 0.35))


# ============================================================
# 성급 1 — 차고 (garage_prototype, seed_startup) : office.png
# ============================================================
def draw_rug(c, cx, top, w, h, c1, c2):
    # 직원 발밑 러그 — 접지감 + 워크스페이스 묶기. 살짝 사다리꼴(원근).
    for i, y in enumerate(range(top, top + h)):
        t = i / max(1, h)
        half = int(w * (0.82 + 0.18 * t) / 2)  # 앞으로 넓어짐
        for x in range(cx - half, cx + half):
            checker = ((x // 5) + (y // 5)) % 2
            c.put(x, y, c1 if checker == 0 else c2)
    half0 = int(w * 0.82 / 2)
    half1 = int(w / 2)
    c.hline(cx - half0, cx + half0, top, INK)
    c.hline(cx - half1, cx + half1, top + h - 1, INK)


def build_garage():
    c = Canvas(W, H, METAL_D)
    # --- 천장 그림자 + 노출 보 (상단은 cover 크롭 버퍼) ---
    c.vgrad(0, 0, W, 26, shade(METAL_D, -0.5), shade(METAL_D, -0.22))
    c.rect(0, 24, W, 28, INK2)
    for bx in range(20, W, 46):
        c.rect(bx, 0, bx + 6, 25, shade(METAL_D, -0.55))  # 보
        c.vline(bx, 0, 25, INK)
        c.vline(bx + 6, 0, 25, shade(METAL_D, -0.7))

    # --- 뒷벽 : 콘크리트 차고 (회청 그라데이션 + 점묘 질감) ---
    wall_top, wall_bot = shade(METAL, -0.32), shade(METAL_D, -0.05)
    c.vgrad(0, 28, W, FLOOR_Y, wall_top, wall_bot)
    c.speckle(0, 28, W, FLOOR_Y, shade(METAL_D, -0.22), density=0.10, seed=3)
    c.speckle(0, 28, W, FLOOR_Y, shade(METAL, 0.12), density=0.06, seed=9)
    c.speckle(0, 28, W, FLOOR_Y, INK2, density=0.015, seed=21)  # 얼룩/금
    # 콘크리트 패널 줄눈
    for py in range(86, FLOOR_Y, 64):
        c.hline(0, W, py, shade(METAL_D, -0.28))
        c.hline(0, W, py + 1, shade(METAL, 0.08))
    for px_ in range(78, W, 78):
        c.vline(px_, 28, FLOOR_Y, shade(METAL_D, -0.18))
        c.vline(px_ + 1, 28, FLOOR_Y, shade(METAL, 0.05))

    # --- 차고 셔터 도어 (우측) — 반쯤 내려와 아래 틈으로 햇빛 ---
    sx0, sx1 = 162, 230
    sy0, sy1 = 40, FLOOR_Y
    c.rect(sx0 - 2, sy0 - 6, sx1 + 2, sy0 + 2, shade(METAL_D, -0.1))
    c.outline(sx0 - 2, sy0 - 6, sx1 + 2, sy0 + 2, INK)
    c.rect(sx0, sy0, sx1, sy1, shade(METAL, -0.02))
    for yy in range(sy0 + 3, sy1, 6):  # 셔터 가로 슬랫(굴곡)
        c.hline(sx0 + 1, sx1 - 1, yy, shade(METAL_D, -0.08))
        c.hline(sx0 + 1, sx1 - 1, yy + 1, shade(METAL_L, 0.12))
        c.hline(sx0 + 1, sx1 - 1, yy + 2, shade(METAL, -0.02))
    c.outline(sx0, sy0, sx1, sy1, INK)
    c.vline(sx0 + 1, sy0, sy1, shade(METAL_L, 0.15))  # 좌측 광택
    hx = (sx0 + sx1) // 2
    c.rect(hx - 6, sy1 - 28, hx + 6, sy1 - 22, INK2)
    c.rect(hx - 5, sy1 - 27, hx + 5, sy1 - 23, METAL_L)
    c.rect(sx0 + 3, sy1 - 5, sx1 - 3, sy1, mix(YELLOW, CREAM, 0.5))
    glow_floor = mix(YELLOW, ORANGE, 0.25)
    for dx in range(sx0, sx1):
        for dy in range(0, 12):
            yy = sy1 + dy
            if 0 <= yy < c.h and ((dx + yy) % 2 == 0):
                base = c.d[dx, yy][:3]
                c.d[dx, yy] = mix(base, glow_floor, max(0.0, 0.5 - dy * 0.04)) + (255,)

    # --- 작은 창문 (좌상) — 낮 하늘 ---
    draw_window(c, 20, 62, 84, 118, mix(MINT, WHITE, 0.5), mix(BLUE, MINT, 0.4), METAL_L)
    c.hline(20, 84, 119, shade(METAL_D, -0.2))

    # --- 화이트보드 (빨간 줄 + 상승 차트) ---
    bx0, by0 = 98, 64
    c.rect(bx0, by0, bx0 + 56, by0 + 38, CREAM)
    c.outline(bx0, by0, bx0 + 56, by0 + 38, INK)
    c.rect(bx0, by0, bx0 + 56, by0 + 4, METAL_L)
    c.hline(bx0 + 6, bx0 + 46, by0 + 13, RED)
    c.hline(bx0 + 9, bx0 + 40, by0 + 20, RED)
    c.hline(bx0 + 6, bx0 + 32, by0 + 27, NAVY)
    c.rect(bx0 + 38, by0 + 31, bx0 + 49, by0 + 34, MINT_D)
    c.rect(bx0 + 43, by0 + 28, bx0 + 46, by0 + 34, MINT)

    # --- 노출 배관 (벽 좌측 세로, ㄱ자) ---
    for dx, base in ((9, INK), (10, shade(WOOD, -0.1)), (11, shade(WOOD, 0.18))):
        c.vline(dx, 28, FLOOR_Y, base)
    c.rect(9, 28, 34, 32, shade(WOOD, -0.1)); c.outline(9, 28, 34, 32, INK)
    for jy in range(58, FLOOR_Y, 46):
        c.rect(7, jy, 14, jy + 4, shade(WOOD, -0.22)); c.outline(7, jy, 14, jy + 4, INK)

    # --- 패그보드 + 공구 ---
    pb_x, pb_y = 128, 124
    c.rect(pb_x, pb_y, pb_x + 26, pb_y + 24, shade(WOOD, 0.22))
    c.outline(pb_x, pb_y, pb_x + 26, pb_y + 24, INK)
    c.speckle(pb_x + 1, pb_y + 1, pb_x + 25, pb_y + 23, shade(WOOD, -0.15), density=0.08, seed=5)
    c.vline(pb_x + 7, pb_y + 4, pb_y + 17, INK2); c.rect(pb_x + 5, pb_y + 3, pb_x + 9, pb_y + 6, METAL)
    c.vline(pb_x + 16, pb_y + 4, pb_y + 16, INK2); c.rect(pb_x + 13, pb_y + 15, pb_x + 20, pb_y + 18, METAL_D)

    # --- 벽 중하단 디테일 (직원 머리 위 빈 중앙 벽) ---
    draw_string_lights(c, 16, 160, 150)            # 가로 전구 줄
    draw_shelf(c, 20, 78, 174)                     # 좌중앙 선반
    c.rect(26, 162, 34, 174, RED); c.outline(26, 162, 34, 174, INK)     # 페인트캔
    c.rect(28, 159, 32, 162, METAL_L)
    c.rect(42, 166, 50, 174, MINT); c.outline(42, 166, 50, 174, INK)    # 캔2
    c.rect(58, 168, 65, 174, WOOD_L); c.outline(58, 168, 65, 174, INK)  # 머그
    c.put(65, 170, WOOD_L); c.put(66, 171, WOOD_L)
    draw_poster(c, 100, 158, 150, 210, CREAM, NAVY, RED)               # 중앙 상승 포스터
    draw_sticky_notes(c, 96, 232, 156, 292)                            # 포스트잇 메모
    sten = mix(MINT, METAL_L, 0.5)                                     # 좌측 스프레이 스텐실 화살표 ↑
    for dy in range(11):
        c.hline(28 - dy, 30 + dy, 256 + dy, sten)
    c.rect(26, 267, 32, 305, sten)

    # --- 매달린 형광등 (빛) ---
    draw_pendant_light(c, 78, 32, glow=True)
    draw_pendant_light(c, 140, 32, glow=False)

    # --- 바닥 : 콘크리트 + 원근 (하단은 cover 크롭 버퍼) ---
    c.vgrad(0, FLOOR_Y, W, H, shade(WOOD, 0.0), shade(WOOD_D, -0.05))
    c.rect(0, FLOOR_Y, W, FLOOR_Y + 7, shade(WOOD, -0.12))  # 벽-바닥 접합 그림자대
    c.hline(0, W, FLOOR_Y, INK)
    c.hline(0, W, FLOOR_Y + 1, shade(WOOD_L, 0.12))
    c.speckle(0, FLOOR_Y + 2, W, H, shade(WOOD_D, -0.12), density=0.07, seed=11)
    c.speckle(0, FLOOR_Y + 2, W, H, shade(WOOD_L, 0.1), density=0.04, seed=14)
    vp = (W // 2, FLOOR_Y - 80)
    for fx in range(-60, W + 61, 38):
        for s in range(70):
            t = s / 70.0
            xx = int(vp[0] + (fx - vp[0]) * (0.5 + t * 0.6))
            yy = int(FLOOR_Y + 5 + (H - FLOOR_Y) * t)
            if FLOOR_Y + 4 < yy < H:
                c.put(xx, yy, shade(WOOD_D, -0.16))

    # 책상은 런타임 C#이 직원 발치에 전경 오클루더로 그린다(2열 원근) — BG 떠있는 책상 제거 (feat-019 T1).

    # --- 직원 발밑 러그 ---
    draw_rug(c, W // 2, FLOOR_Y - 10, 176, 52, mix(NAVY, MINT_D, 0.3), shade(NAVY, -0.15))

    # --- 바닥 소품 ---
    draw_box(c, 8, H - 14, 20, 18)
    draw_box(c, 26, H - 9, 14, 12)
    draw_plant(c, 214, FLOOR_Y - 1)
    c.rect(52, FLOOR_Y - 6, 60, FLOOR_Y - 1, WHITE); c.outline(52, FLOOR_Y - 6, 60, FLOOR_Y - 1, INK)
    c.rect(60, FLOOR_Y - 5, 63, FLOOR_Y - 2, METAL_L)
    c.hline(90, 150, H - 24, INK2)
    c.hline(150, 188, H - 20, INK2)

    return c


def draw_skyline_window(c, x0, y0, x1, y1, frame, night=False, sunset=False):
    # 통창 + 도시 스카이라인. night=야경, sunset=일몰.
    if night:
        sky_t, sky_b = (0x12, 0x16, 0x2A), (0x24, 0x2D, 0x45)
    elif sunset:
        sky_t, sky_b = mix(PURPLE, ORANGE, 0.4), mix(ORANGE, YELLOW, 0.5)
    else:
        sky_t, sky_b = mix(MINT, WHITE, 0.55), mix(BLUE, MINT, 0.45)
    c.vgrad(x0, y0, x1, y1, sky_t, sky_b)
    # 먼 빌딩 실루엣 (2겹)
    far = mix(sky_b, INK, 0.25 if not night else 0.4)
    near = mix(sky_b, INK, 0.45 if not night else 0.6)
    horizon = y1 - 4
    bx = x0 + 1
    seed = 0
    while bx < x1 - 2:
        seed = (seed * 1103515245 + 12345) & 0x7FFFFFFF
        bw = 4 + (seed >> 8) % 7
        bh = 8 + (seed >> 4) % 22
        col = far if (seed >> 3) % 2 == 0 else near
        top = max(y0 + 2, horizon - bh)
        c.rect(bx, top, min(x1 - 1, bx + bw), horizon, col)
        # 창문 불빛
        if night or sunset:
            for wy in range(top + 2, horizon - 1, 4):
                for wx in range(bx + 1, min(x1 - 1, bx + bw) - 1, 3):
                    if ((wx * 31 + wy * 17 + seed) % 5) < 2:
                        c.put(wx, wy, YELLOW)
        bx += bw + 1
    # 새시
    midx = (x0 + x1) // 2
    for gx in range(x0, x1, (x1 - x0) // 3 + 1):
        c.vline(gx, y0, y1, frame)
    midy = (y0 + y1) // 2
    c.hline(x0, x1, midy, frame)
    c.outline(x0, y0, x1, y1, INK)
    c.rect(x0 - 2, y0 - 2, x1 + 2, y0, frame)
    c.rect(x0 - 2, y1, x1 + 2, y1 + 2, shade(frame, -0.3))  # 창대


def draw_server_rack(c, x0, y0, x1, y1):
    # 서버랙 — 검은 캐비닛 + LED 라인. 데이터센터 벽.
    c.rect(x0, y0, x1, y1, shade(NAVY_D, -0.3))
    c.outline(x0, y0, x1, y1, INK)
    for uy in range(y0 + 3, y1 - 1, 4):  # 1U 슬롯
        c.hline(x0 + 2, x1 - 2, uy, shade(NAVY_D, -0.55))
        c.hline(x0 + 2, x1 - 2, uy + 1, shade(METAL_D, -0.1))
        # LED — 좌측 점등
        for li, lx in enumerate(range(x0 + 3, x0 + 9, 2)):
            on = ((lx * 13 + uy * 7) % 7) < 3
            col = MINT if on else (BLUE if (lx + uy) % 3 else shade(NAVY, -0.2))
            c.put(lx, uy, col)
        # 우측 활동 LED
        if ((uy * 5) % 4) < 2:
            c.put(x1 - 4, uy, YELLOW)
    c.vline(x0 + 10, y0 + 1, y1 - 1, shade(NAVY_D, -0.5))  # 캐비닛 분할


def draw_dashboard(c, x0, y0, x1, y1):
    # 벽걸이 모니터링 대시보드 — 라인차트 + 막대.
    c.rect(x0, y0, x1, y1, NAVY_D)
    c.outline(x0, y0, x1, y1, INK)
    c.rect(x0 + 1, y0 + 1, x1 - 1, y0 + 3, shade(NAVY, 0.1))  # 헤더바
    # 라인차트
    prev = (y1 - 4)
    for i, lx in enumerate(range(x0 + 2, x1 - 2)):
        h = (y1 - 5) - int(3 + 2.5 * ((i * 0.9) % 4) + (i % 3))
        c.put(lx, h, MINT)
        if abs(h - prev) > 1:
            for yy in range(min(h, prev), max(h, prev)):
                c.put(lx, yy, shade(MINT, -0.2))
        prev = h
    # 막대
    for j, bxp in enumerate(range(x0 + 3, x1 - 3, 4)):
        bh = 3 + (j * 2) % 6
        c.rect(bxp, y1 - 3 - bh, bxp + 2, y1 - 3, YELLOW if j % 3 == 0 else BLUE)


def draw_logo_wall(c, cx, y0, accent):
    # 본사 로고 월 — 추상 'AI' 마크.
    c.rect(cx - 9, y0, cx - 2, y0 + 14, accent)       # A 기둥
    c.rect(cx - 9, y0, cx - 6, y0 + 14, shade(accent, 0.2))
    c.rect(cx - 11, y0 + 5, cx, y0 + 8, accent)        # A 가로
    c.rect(cx + 3, y0, cx + 7, y0 + 14, accent)        # I
    c.outline(cx - 11, y0 - 1, cx + 8, y0 + 15, shade(accent, -0.4))


def build_growth():
    # 스타트업 오피스 — 밝고 활기. 흰/민트 벽, 통창 스카이라인, 카펫. (240x534)
    c = Canvas(W, H, mix(CREAM, METAL_L, 0.5))
    c.vgrad(0, 0, W, 22, mix(WHITE, METAL_L, 0.4), mix(CREAM, METAL_L, 0.5))
    c.rect(0, 20, W, 23, shade(METAL_L, -0.15))
    wain = FLOOR_Y - 58
    c.vgrad(0, 23, W, wain, mix(WHITE, MINT, 0.12), mix(CREAM, METAL_L, 0.45))
    c.speckle(0, 23, W, wain, mix(METAL_L, MINT, 0.3), density=0.03, seed=7)
    c.rect(0, wain, W, FLOOR_Y, shade(WOOD, 0.18))
    c.rect(0, wain, W, wain + 3, shade(WOOD, 0.35))
    c.speckle(0, wain + 3, W, FLOOR_Y, shade(WOOD, -0.08), density=0.05, seed=12)
    for px_ in range(36, W, 36):
        c.vline(px_, wain + 3, FLOOR_Y, shade(WOOD, -0.12))
    c.rect(0, wain - 4, W, wain, MINT)  # 민트 악센트 띠
    # 통창 2개 (낮 스카이라인)
    draw_skyline_window(c, 16, 46, 100, 122, METAL_L)
    draw_skyline_window(c, 140, 46, 224, 122, METAL_L)
    # 펜던트 조명 3개
    for lx in range(54, W, 64):
        c.vline(lx, 22, 36, INK2)
        c.rect(lx - 5, 36, lx + 6, 41, YELLOW); c.outline(lx - 5, 36, lx + 6, 41, INK)
    # 화이트보드 상승차트
    bx0, by0 = 102, 150
    c.rect(bx0, by0, bx0 + 56, by0 + 32, WHITE); c.outline(bx0, by0, bx0 + 56, by0 + 32, INK)
    c.rect(bx0, by0, bx0 + 56, by0 + 4, METAL_L)
    px, py = bx0 + 6, by0 + 24
    for step in range(9):
        nx, ny = px + 5, py - (1 if step % 2 else 3)
        c.vline(px, min(py, ny), max(py, ny) + 1, MINT_D)
        px, py = nx, max(by0 + 8, ny)
    c.put(px, py, MINT)
    # 벽시계
    c.rect(28, 152, 42, 166, WHITE); c.outline(28, 152, 42, 166, INK)
    c.vline(35, 155, 161, INK); c.hline(35, 40, 160, INK2)
    # --- 벽 중하단 디테일 (가장 휑한 벽 — 갤러리·네온 포스터·선반) ---
    draw_frame(c, 20, 196, 52, 230, WOOD, "photo")            # 좌 갤러리 3종
    draw_frame(c, 20, 240, 52, 274, MINT, "abstract")
    draw_frame(c, 58, 212, 86, 252, YELLOW, "chart", accent=MINT)
    draw_frame(c, 100, 206, 158, 250, NAVY, "text", accent=MINT)  # 중앙 네온 모션 포스터
    c.outline(98, 204, 160, 252, MINT)
    c.outline(97, 203, 161, 253, shade(MINT, -0.3))
    draw_shelf(c, 168, 222, 206)                              # 우 선반 + 식물·책·트로피
    draw_plant(c, 170, 206)
    c.rect(186, 196, 190, 206, BLUE); c.outline(186, 196, 190, 206, INK)
    c.rect(190, 198, 194, 206, RED); c.outline(190, 198, 194, 206, INK)
    c.rect(194, 200, 198, 206, MINT_D); c.outline(194, 200, 198, 206, INK)
    draw_trophy(c, 210, 206, YELLOW)
    draw_sticky_notes(c, 168, 256, 214, 300)                 # 우중앙 코르크 메모
    # 책상은 런타임 C#이 그린다 (feat-019 T1) — BG 떠있는 책상 제거.
    draw_plant(c, 86, FLOOR_Y - 1)
    draw_plant(c, 170, FLOOR_Y - 1)
    # 카펫 바닥
    c.vgrad(0, FLOOR_Y, W, H, mix(METAL_L, MINT, 0.2), mix(METAL, BLUE, 0.2))
    c.rect(0, FLOOR_Y, W, FLOOR_Y + 6, shade(MINT_D, -0.1))
    c.hline(0, W, FLOOR_Y, INK)
    c.speckle(0, FLOOR_Y + 2, W, H, mix(METAL, MINT, 0.3), density=0.06, seed=15)
    draw_rug(c, W // 2, FLOOR_Y - 10, 176, 52, mix(MINT, WHITE, 0.4), MINT)
    return c


def build_datacenter():
    # 데이터센터 — 차가운 하이테크. 서버랙 벽, 네이비, 테크 바닥. (240x534)
    c = Canvas(W, H, shade(NAVY_D, -0.2))
    c.vgrad(0, 0, W, 26, shade(NAVY_D, -0.5), shade(NAVY_D, -0.25))
    c.rect(0, 24, W, 27, INK)
    for lx in range(24, W, 56):
        c.rect(lx, 6, lx + 28, 8, mix(MINT, WHITE, 0.5))
        c.rect(lx, 8, lx + 28, 9, MINT)
    c.vgrad(0, 27, W, FLOOR_Y, shade(NAVY, -0.15), shade(NAVY_D, -0.1))
    c.speckle(0, 27, W, FLOOR_Y, shade(NAVY, 0.08), density=0.02, seed=4)
    # 서버랙 좌우
    draw_server_rack(c, 8, 42, 78, FLOOR_Y - 4)
    draw_server_rack(c, 162, 42, 232, FLOOR_Y - 4)
    # 모니터링 대시보드 2
    draw_dashboard(c, 92, 54, 148, 92)
    draw_dashboard(c, 92, 100, 148, 138)
    # 케이블 트레이
    c.rect(82, 34, 158, 39, shade(METAL_D, -0.2)); c.outline(82, 34, 158, 39, INK)
    for cx in range(84, 158, 3):
        c.put(cx, 36, MINT if cx % 2 else BLUE)
    # 냉각 글로우
    for gy in range(44, FLOOR_Y - 6, 3):
        c.put(82, gy, mix(MINT, NAVY, 0.5))
        c.put(158, gy, mix(MINT, NAVY, 0.5))
    # --- 벽 중하단 디테일 (서버랙 사이 빈 중앙 통로) ---
    for cx0 in (88, 110, 132):                      # 세계 시계 행 (3개 디지털)
        c.rect(cx0, 150, cx0 + 18, 166, shade(NAVY_D, -0.25)); c.outline(cx0, 150, cx0 + 18, 166, INK)
        c.rect(cx0 + 2, 153, cx0 + 16, 163, NAVY_D)
        c.hline(cx0 + 3, cx0 + 7, 158, MINT)
        c.put(cx0 + 8, 157, YELLOW); c.put(cx0 + 8, 159, YELLOW)
        c.hline(cx0 + 10, cx0 + 14, 158, MINT)
        c.hline(cx0 + 4, cx0 + 13, 161, shade(MINT, -0.4))
    draw_status_tile(c, 88, 174, 116, 200, MINT, 0)   # 상태 타일 2x2
    draw_status_tile(c, 120, 174, 152, 200, YELLOW, 1)
    draw_status_tile(c, 88, 204, 116, 230, BLUE, 2)
    draw_status_tile(c, 120, 204, 152, 230, MINT, 0)
    draw_led_tower(c, 117, 244, 300)                  # 중앙 LED 신호탑
    c.rect(96, 250, 114, 254, shade(NAVY, 0.12)); c.rect(126, 250, 144, 254, shade(NAVY, 0.12))
    # 콘솔 책상은 런타임 C#이 그린다 (feat-019 T1).
    # 테크 타일 바닥
    c.vgrad(0, FLOOR_Y, W, H, shade(NAVY_D, 0.05), shade(NAVY_D, -0.15))
    c.rect(0, FLOOR_Y, W, FLOOR_Y + 5, shade(MINT, -0.2))
    c.hline(0, W, FLOOR_Y, INK)
    for tx in range(0, W, 28):
        c.vline(tx, FLOOR_Y + 5, H, shade(NAVY, -0.2))
    for ty in range(FLOOR_Y + 14, H, 20):
        c.hline(0, W, ty, shade(NAVY, -0.18))
    draw_rug(c, W // 2, FLOOR_Y - 8, 166, 48, shade(NAVY, -0.05), shade(NAVY_D, -0.05))
    for ry in range(FLOOR_Y - 2, FLOOR_Y + 34, 4):
        c.put(W // 2 - 40, ry, MINT); c.put(W // 2 + 40, ry, MINT)
    return c


def build_landmark():
    # 랜드마크 본사 — 정점. 파노라마 야경, 고급 마감, 로고 월. (240x534)
    c = Canvas(W, H, shade(NAVY, -0.1))
    c.vgrad(0, 0, W, 20, shade(NAVY_D, -0.3), shade(NAVY, -0.05))
    c.rect(0, 18, W, 22, shade(PURPLE_D, -0.1))
    for lx in range(30, W, 44):  # 다운라이트
        c.put(lx, 23, YELLOW)
        for dy in range(24, 32):
            if (lx + dy) % 2 == 0:
                c.put(lx, dy, mix(YELLOW, c.d[lx, dy][:3], 0.6))
    # 파노라마 통유리 (일몰)
    draw_skyline_window(c, 10, 34, 230, 150, mix(METAL_L, PURPLE, 0.2), sunset=True)
    # 대리석 패널
    panel_top = 150
    c.vgrad(0, panel_top, W, FLOOR_Y, mix(CREAM, PURPLE, 0.12), mix(METAL_L, PURPLE, 0.2))
    c.speckle(0, panel_top, W, FLOOR_Y, WHITE, density=0.03, seed=8)
    c.speckle(0, panel_top, W, FLOOR_Y, mix(PURPLE, METAL, 0.4), density=0.02, seed=19)
    c.rect(0, panel_top, W, panel_top + 3, YELLOW)  # 골드 트림
    for px_ in range(52, W, 52):
        c.vline(px_, panel_top + 3, FLOOR_Y, mix(PURPLE, METAL_L, 0.4))
    draw_logo_wall(c, W // 2, panel_top + 14, MINT)
    # --- 벽 중하단 디테일 (대리석 벽 — 어워드·골드 액자·대형 화분) ---
    draw_frame(c, 22, 196, 60, 244, YELLOW, "award")          # 로고월 양옆 골드 어워드 액자
    draw_frame(c, 180, 196, 218, 244, YELLOW, "award")
    for fx in (38, 196):                                       # 골드 픽처 라이트
        c.rect(fx, 192, fx + 4, 195, YELLOW)
        c.put(fx + 1, 195, mix(YELLOW, CREAM, 0.5))
    draw_frame(c, 96, 254, 144, 308, mix(PURPLE, YELLOW, 0.3), "abstract", accent=PURPLE)  # 중앙 추상 벽아트
    draw_shelf(c, 52, 90, 264, mat=mix(WOOD, PURPLE, 0.2))     # 트로피 선반 좌우
    draw_trophy(c, 58, 264, YELLOW); draw_trophy(c, 72, 264, MINT)
    draw_shelf(c, 150, 188, 264, mat=mix(WOOD, PURPLE, 0.2))
    draw_trophy(c, 156, 264, MINT); draw_trophy(c, 170, 264, YELLOW)
    draw_potted(c, 6, FLOOR_Y - 2, big=True, pot=PURPLE_D, leaf=MINT_D)    # 좌우 끝 대형 화분
    draw_potted(c, 220, FLOOR_Y - 2, big=True, pot=PURPLE_D, leaf=MINT_D)
    # 라운지 콘솔은 런타임 C#이 그린다 (feat-019 T1).
    draw_plant(c, 92, FLOOR_Y - 1)
    draw_plant(c, 140, FLOOR_Y - 1)
    # 광택 대리석 바닥 + 반사
    c.vgrad(0, FLOOR_Y, W, H, mix(METAL_L, PURPLE, 0.18), mix(METAL, PURPLE_D, 0.25))
    c.rect(0, FLOOR_Y, W, FLOOR_Y + 5, YELLOW)
    c.hline(0, W, FLOOR_Y, INK)
    c.speckle(0, FLOOR_Y + 5, W, H, WHITE, density=0.02, seed=17)
    for rx in range(28, W, 38):
        for ry in range(FLOOR_Y + 5, H, 2):
            c.put(rx, ry, mix(c.d[rx, ry][:3], ORANGE, 0.18))
    draw_rug(c, W // 2, FLOOR_Y - 10, 182, 54, mix(PURPLE, METAL_L, 0.35), PURPLE_D)
    return c


BUILDERS = {
    "office": build_garage,
    "office_growth": build_growth,
    "office_datacenter": build_datacenter,
    "office_landmark": build_landmark,
}


def main():
    out_dir = os.path.join(os.path.dirname(__file__), "out")
    os.makedirs(out_dir, exist_ok=True)
    targets = sys.argv[1:] or list(BUILDERS.keys())
    for name in targets:
        if name not in BUILDERS:
            print("unknown:", name); continue
        c = BUILDERS[name]()
        path = os.path.join(out_dir, name + ".png")
        c.save(path)
        print("wrote", path, "->", (c.w * SCALE, c.h * SCALE))


if __name__ == "__main__":
    main()
