# 정면 단면 픽셀오피스 룸 절차 생성기 — v090 직원 팔레트에 맞춘 진짜 도트 사무실 배경.
# 네이티브 저해상도 캔버스(180x320 세로)에 픽셀 단위로 그린 뒤 정수배(6x) nearest 업스케일 → 1080x1920.
# 세로 모바일 풀스트레치 배경용. 성급 4종(차고→스타트업→데이터센터→랜드마크)을 같은 룸 문법으로 그린다.
import sys, os
from PIL import Image

W, H = 180, 320
SCALE = 6  # 180x320 -> 1080x1920

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
FLOOR_Y = 206  # 직원 발바닥선 (캡처로 미세조정 가능)


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
    # --- 천장 그림자 + 노출 보 ---
    c.vgrad(0, 0, W, 18, shade(METAL_D, -0.5), shade(METAL_D, -0.22))
    c.rect(0, 16, W, 19, INK2)
    for bx in range(14, W, 34):
        c.rect(bx, 0, bx + 5, 17, shade(METAL_D, -0.55))  # 보
        c.vline(bx, 0, 17, INK)
        c.vline(bx + 5, 0, 17, shade(METAL_D, -0.7))

    # --- 뒷벽 : 콘크리트 차고 (회청 그라데이션 + 점묘 질감) ---
    wall_top, wall_bot = shade(METAL, -0.32), shade(METAL_D, -0.05)
    c.vgrad(0, 18, W, FLOOR_Y, wall_top, wall_bot)
    c.speckle(0, 18, W, FLOOR_Y, shade(METAL_D, -0.22), density=0.10, seed=3)
    c.speckle(0, 18, W, FLOOR_Y, shade(METAL, 0.12), density=0.06, seed=9)
    c.speckle(0, 18, W, FLOOR_Y, INK2, density=0.015, seed=21)  # 얼룩/금
    # 콘크리트 패널 줄눈
    for py in range(52, FLOOR_Y, 46):
        c.hline(0, W, py, shade(METAL_D, -0.28))
        c.hline(0, W, py + 1, shade(METAL, 0.08))
    for px_ in range(58, W, 58):
        c.vline(px_, 18, FLOOR_Y, shade(METAL_D, -0.18))
        c.vline(px_ + 1, 18, FLOOR_Y, shade(METAL, 0.05))

    # --- 차고 셔터 도어 (우측) — 반쯤 내려와 아래 틈으로 햇빛 ---
    sx0, sx1 = 120, 172
    sy0, sy1 = 26, FLOOR_Y
    # 셔터 상단 박스(롤)
    c.rect(sx0 - 2, sy0 - 5, sx1 + 2, sy0 + 2, shade(METAL_D, -0.1))
    c.outline(sx0 - 2, sy0 - 5, sx1 + 2, sy0 + 2, INK)
    c.rect(sx0, sy0, sx1, sy1, shade(METAL, -0.02))
    for yy in range(sy0 + 3, sy1, 5):  # 셔터 가로 슬랫(굴곡)
        c.hline(sx0 + 1, sx1 - 1, yy, shade(METAL_D, -0.08))
        c.hline(sx0 + 1, sx1 - 1, yy + 1, shade(METAL_L, 0.12))
        c.hline(sx0 + 1, sx1 - 1, yy + 2, shade(METAL, -0.02))
    c.outline(sx0, sy0, sx1, sy1, INK)
    c.vline(sx0 + 1, sy0, sy1, shade(METAL_L, 0.15))  # 좌측 광택
    # 손잡이
    hx = (sx0 + sx1) // 2
    c.rect(hx - 5, sy1 - 22, hx + 5, sy1 - 18, INK2)
    c.rect(hx - 4, sy1 - 21, hx + 4, sy1 - 19, METAL_L)
    # 바닥 틈으로 새는 햇빛
    c.rect(sx0 + 3, sy1 - 4, sx1 - 3, sy1, mix(YELLOW, CREAM, 0.5))
    glow_floor = mix(YELLOW, ORANGE, 0.25)
    for dx in range(sx0, sx1):
        for dy in range(0, 10):
            yy = sy1 + dy
            if 0 <= yy < c.h and ((dx + yy) % 2 == 0):
                base = c.d[dx, yy][:3]
                c.d[dx, yy] = mix(base, glow_floor, max(0.0, 0.5 - dy * 0.05)) + (255,)

    # --- 작은 창문 (좌상) — 낮 하늘 ---
    draw_window(c, 15, 34, 53, 72, mix(MINT, WHITE, 0.5), mix(BLUE, MINT, 0.4), METAL_L)
    # 창틀 그림자
    c.hline(15, 53, 73, shade(METAL_D, -0.2))

    # --- 화이트보드 (office.png 빨간 줄 계승) ---
    bx0, by0 = 66, 38
    c.rect(bx0, by0, bx0 + 40, by0 + 27, CREAM)
    c.outline(bx0, by0, bx0 + 40, by0 + 27, INK)
    c.rect(bx0, by0, bx0 + 40, by0 + 3, METAL_L)
    c.hline(bx0 + 5, bx0 + 33, by0 + 9, RED)
    c.hline(bx0 + 7, bx0 + 28, by0 + 14, RED)
    c.hline(bx0 + 5, bx0 + 22, by0 + 19, NAVY)
    c.rect(bx0 + 26, by0 + 22, bx0 + 35, by0 + 24, MINT_D)  # 작은 차트 막대
    c.rect(bx0 + 30, by0 + 20, bx0 + 33, by0 + 24, MINT)

    # --- 노출 배관 (벽 좌측 세로, ㄱ자) ---
    for dx, base in ((7, INK), (8, shade(WOOD, -0.1)), (9, shade(WOOD, 0.18))):
        c.vline(dx, 20, FLOOR_Y, base)
    c.rect(7, 20, 30, 23, shade(WOOD, -0.1)); c.outline(7, 20, 30, 23, INK)  # 가로 분기
    for jy in range(40, FLOOR_Y, 34):
        c.rect(5, jy, 12, jy + 3, shade(WOOD, -0.22)); c.outline(5, jy, 12, jy + 3, INK)

    # --- 패그보드 + 공구 (셔터 좌측 위) ---
    pb_x, pb_y = 95, 80
    c.rect(pb_x, pb_y, pb_x + 20, pb_y + 18, shade(WOOD, 0.22))
    c.outline(pb_x, pb_y, pb_x + 20, pb_y + 18, INK)
    c.speckle(pb_x + 1, pb_y + 1, pb_x + 19, pb_y + 17, shade(WOOD, -0.15), density=0.08, seed=5)
    c.vline(pb_x + 5, pb_y + 3, pb_y + 13, INK2); c.rect(pb_x + 4, pb_y + 2, pb_x + 7, pb_y + 4, METAL)
    c.vline(pb_x + 12, pb_y + 3, pb_y + 12, INK2); c.rect(pb_x + 10, pb_y + 11, pb_x + 15, pb_y + 14, METAL_D)

    # --- 매달린 형광등 (빛) ---
    draw_pendant_light(c, 58, 22, glow=True)
    draw_pendant_light(c, 100, 22, glow=False)

    # --- 바닥 : 콘크리트 + 원근 ---
    c.vgrad(0, FLOOR_Y, W, H, shade(WOOD, 0.0), shade(WOOD_D, -0.05))
    c.rect(0, FLOOR_Y, W, FLOOR_Y + 6, shade(WOOD, -0.12))  # 벽-바닥 접합 그림자대
    c.hline(0, W, FLOOR_Y, INK)
    c.hline(0, W, FLOOR_Y + 1, shade(WOOD_L, 0.12))
    c.speckle(0, FLOOR_Y + 2, W, H, shade(WOOD_D, -0.12), density=0.07, seed=11)
    c.speckle(0, FLOOR_Y + 2, W, H, shade(WOOD_L, 0.1), density=0.04, seed=14)
    # 바닥 원근 타일 라인 (소실점 중앙 위)
    vp = (W // 2, FLOOR_Y - 60)
    for fx in range(-40, W + 41, 30):
        for s in range(60):
            t = s / 60.0
            xx = int(vp[0] + (fx - vp[0]) * (0.5 + t * 0.6))
            yy = int(FLOOR_Y + 4 + (H - FLOOR_Y) * t)
            if FLOOR_Y + 3 < yy < H:
                c.put(xx, yy, shade(WOOD_D, -0.16))

    # --- 책상 라인 (직원 뒤) ---
    draw_desk(c, 20, FLOOR_Y - 24, 30, MINT)
    draw_desk(c, 96, FLOOR_Y - 24, 30, BLUE)

    # --- 직원 발밑 러그 (워크스페이스) — 직원 발이 러그 상단부에 닿게 ---
    draw_rug(c, W // 2, FLOOR_Y - 8, 138, 40, mix(NAVY, MINT_D, 0.3), shade(NAVY, -0.15))

    # --- 바닥 소품 ---
    draw_box(c, 6, H - 10, 17, 15)
    draw_box(c, 21, H - 7, 12, 10)
    draw_plant(c, 156, FLOOR_Y - 1)
    # 커피 머그
    c.rect(40, FLOOR_Y - 5, 46, FLOOR_Y - 1, WHITE); c.outline(40, FLOOR_Y - 5, 46, FLOOR_Y - 1, INK)
    c.rect(46, FLOOR_Y - 4, 48, FLOOR_Y - 2, METAL_L)
    # 케이블 (바닥 정리)
    c.hline(68, 112, H - 18, INK2)
    c.hline(112, 140, H - 16, INK2)

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
    # 스타트업 오피스 — 밝고 활기. 흰/민트 벽, 통창 스카이라인, 카펫.
    c = Canvas(W, H, mix(CREAM, METAL_L, 0.5))
    # 천장
    c.vgrad(0, 0, W, 16, mix(WHITE, METAL_L, 0.4), mix(CREAM, METAL_L, 0.5))
    c.rect(0, 15, W, 17, shade(METAL_L, -0.15))
    # 밝은 벽 (상단 페인트 / 하단 우드 웨인스코트)
    wain = FLOOR_Y - 42
    c.vgrad(0, 17, W, wain, mix(WHITE, MINT, 0.12), mix(CREAM, METAL_L, 0.45))
    c.speckle(0, 17, W, wain, mix(METAL_L, MINT, 0.3), density=0.03, seed=7)
    c.rect(0, wain, W, FLOOR_Y, shade(WOOD, 0.18))  # 우드 패널
    c.rect(0, wain, W, wain + 2, shade(WOOD, 0.35))
    c.speckle(0, wain + 2, W, FLOOR_Y, shade(WOOD, -0.08), density=0.05, seed=12)
    for px_ in range(28, W, 28):
        c.vline(px_, wain + 2, FLOOR_Y, shade(WOOD, -0.12))
    # 민트 악센트 띠
    c.rect(0, wain - 3, W, wain, MINT)

    # 큰 통창 (낮 스카이라인) 2개
    draw_skyline_window(c, 12, 30, 78, 86, METAL_L)
    draw_skyline_window(c, 104, 30, 168, 86, METAL_L)
    # 펜던트 조명 3개
    for lx in range(40, W, 50):
        c.vline(lx, 16, 26, INK2)
        c.rect(lx - 4, 26, lx + 5, 30, YELLOW); c.outline(lx - 4, 26, lx + 5, 30, INK)

    # 화이트보드(상승 차트) 중앙 벽
    bx0, by0 = 84, 96
    c.rect(bx0, by0, bx0 + 44, by0 + 24, WHITE); c.outline(bx0, by0, bx0 + 44, by0 + 24, INK)
    c.rect(bx0, by0, bx0 + 44, by0 + 3, METAL_L)
    px, py = bx0 + 4, by0 + 18
    for step in range(8):  # 우상향 라인
        nx, ny = px + 4, py - (1 if step % 2 else 2)
        c.vline(px, min(py, ny), max(py, ny) + 1, MINT_D)
        px, py = nx, max(by0 + 6, ny)
    c.put(px, py, MINT)
    # 벽시계
    c.rect(20, 100, 30, 110, WHITE); c.outline(20, 100, 30, 110, INK)
    c.put(25, 102, INK); c.put(25, 105, INK2); c.vline(25, 102, 106, INK)

    # 책상 줄 (직원 뒤)
    draw_desk(c, 16, FLOOR_Y - 24, 28, MINT)
    draw_desk(c, 76, FLOOR_Y - 24, 28, YELLOW)
    draw_desk(c, 136, FLOOR_Y - 24, 28, BLUE)
    # 화분들
    draw_plant(c, 64, FLOOR_Y - 1)
    draw_plant(c, 128, FLOOR_Y - 1)

    # 바닥 카펫
    c.vgrad(0, FLOOR_Y, W, H, mix(METAL_L, MINT, 0.2), mix(METAL, BLUE, 0.2))
    c.rect(0, FLOOR_Y, W, FLOOR_Y + 5, shade(MINT_D, -0.1))
    c.hline(0, W, FLOOR_Y, INK)
    c.speckle(0, FLOOR_Y + 2, W, H, mix(METAL, MINT, 0.3), density=0.06, seed=15)
    draw_rug(c, W // 2, FLOOR_Y - 8, 138, 40, mix(MINT, WHITE, 0.4), MINT)
    return c


def build_datacenter():
    # 데이터센터 — 차가운 하이테크. 서버랙 벽, 네이비, 테크 바닥.
    c = Canvas(W, H, shade(NAVY_D, -0.2))
    c.vgrad(0, 0, W, 16, shade(NAVY_D, -0.5), shade(NAVY_D, -0.25))
    c.rect(0, 15, W, 18, INK)
    # 천장 LED 스트립
    for lx in range(20, W, 44):
        c.rect(lx, 2, lx + 22, 4, mix(MINT, WHITE, 0.5))
        c.rect(lx, 4, lx + 22, 5, MINT)

    # 뒷벽 — 어두운 패널
    c.vgrad(0, 16, W, FLOOR_Y, shade(NAVY, -0.15), shade(NAVY_D, -0.1))
    c.speckle(0, 16, W, FLOOR_Y, shade(NAVY, 0.08), density=0.02, seed=4)
    # 서버랙 벽 (좌/우 2뱅크)
    draw_server_rack(c, 6, 28, 60, FLOOR_Y - 4)
    draw_server_rack(c, 120, 28, 174, FLOOR_Y - 4)
    # 중앙 모니터링 대시보드 2개
    draw_dashboard(c, 70, 36, 110, 64)
    draw_dashboard(c, 70, 70, 110, 96)
    # 케이블 트레이 (천장 아래 가로)
    c.rect(60, 22, 120, 26, shade(METAL_D, -0.2)); c.outline(60, 22, 120, 26, INK)
    for cx in range(62, 120, 3):
        c.put(cx, 24, MINT if cx % 2 else BLUE)
    # 냉각 바람 글로우(서버 사이)
    for gy in range(30, FLOOR_Y - 6, 3):
        c.put(63, gy, mix(MINT, NAVY, 0.5))
        c.put(117, gy, mix(MINT, NAVY, 0.5))

    # 책상(콘솔) 줄
    draw_desk(c, 64, FLOOR_Y - 24, 24, MINT)
    draw_desk(c, 96, FLOOR_Y - 24, 24, BLUE)

    # 바닥 — 테크 타일(라이즈드 플로어)
    c.vgrad(0, FLOOR_Y, W, H, shade(NAVY_D, 0.05), shade(NAVY_D, -0.15))
    c.rect(0, FLOOR_Y, W, FLOOR_Y + 4, shade(MINT, -0.2))
    c.hline(0, W, FLOOR_Y, INK)
    # 타일 격자 (원근)
    for tx in range(0, W, 22):
        c.vline(tx, FLOOR_Y + 4, H, shade(NAVY, -0.2))
    for i, ty in enumerate(range(FLOOR_Y + 10, H, 16)):
        c.hline(0, W, ty, shade(NAVY, -0.18))
    # 바닥 LED 러너
    draw_rug(c, W // 2, FLOOR_Y - 6, 130, 36, shade(NAVY, -0.05), shade(NAVY_D, -0.05))
    for ry in range(FLOOR_Y - 2, FLOOR_Y + 26, 4):
        c.put(W // 2 - 30, ry, MINT); c.put(W // 2 + 30, ry, MINT)
    return c


def build_landmark():
    # 랜드마크 본사 — 정점. 파노라마 야경, 고급 마감, 로고 월.
    c = Canvas(W, H, shade(NAVY, -0.1))
    c.vgrad(0, 0, W, 14, shade(NAVY_D, -0.3), shade(NAVY, -0.05))
    # 우물천장 + 다운라이트
    c.rect(0, 13, W, 16, shade(PURPLE_D, -0.1))
    for lx in range(24, W, 36):
        c.put(lx, 17, YELLOW)
        for dy in range(18, 24):
            if (lx + dy) % 2 == 0:
                c.put(lx, dy, mix(YELLOW, c.d[lx, dy][:3], 0.6))

    # 파노라마 통유리 (일몰 도시) — 벽 거의 전체
    draw_skyline_window(c, 8, 24, 172, 96, mix(METAL_L, PURPLE, 0.2), sunset=True)
    # 벽 하단 — 대리석/우드 마감
    panel_top = 96
    c.vgrad(0, panel_top, W, FLOOR_Y, mix(CREAM, PURPLE, 0.12), mix(METAL_L, PURPLE, 0.2))
    c.speckle(0, panel_top, W, FLOOR_Y, WHITE, density=0.03, seed=8)  # 대리석 결
    c.speckle(0, panel_top, W, FLOOR_Y, mix(PURPLE, METAL, 0.4), density=0.02, seed=19)
    c.rect(0, panel_top, W, panel_top + 2, YELLOW)  # 골드 트림
    for px_ in range(40, W, 40):
        c.vline(px_, panel_top + 2, FLOOR_Y, mix(PURPLE, METAL_L, 0.4))

    # 로고 월 (중앙) — 통유리 위 띄움? 패널 위
    draw_logo_wall(c, W // 2, panel_top + 8, MINT)

    # 라운지 — 책상 대신 고급 콘솔
    draw_desk(c, 18, FLOOR_Y - 24, 28, PURPLE)
    draw_desk(c, 134, FLOOR_Y - 24, 28, MINT)
    draw_plant(c, 70, FLOOR_Y - 1)
    draw_plant(c, 104, FLOOR_Y - 1)

    # 바닥 — 광택 대리석 + 반사
    c.vgrad(0, FLOOR_Y, W, H, mix(METAL_L, PURPLE, 0.18), mix(METAL, PURPLE_D, 0.25))
    c.rect(0, FLOOR_Y, W, FLOOR_Y + 4, YELLOW)  # 골드 베이스보드
    c.hline(0, W, FLOOR_Y, INK)
    c.speckle(0, FLOOR_Y + 4, W, H, WHITE, density=0.02, seed=17)
    # 창문 반사 (바닥에 세로 빛)
    for rx in range(20, W, 30):
        for ry in range(FLOOR_Y + 4, H, 2):
            c.put(rx, ry, mix(c.d[rx, ry][:3], ORANGE, 0.18))
    draw_rug(c, W // 2, FLOOR_Y - 8, 140, 42, mix(PURPLE, METAL_L, 0.35), PURPLE_D)
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
