# 단일 마젠타/녹색 크로마키 이미지 → 투명 픽셀 스프라이트. 배경만 투명, subject 원색 보존.
# 하드 마스크(키색 거리) + 테두리 flood + 1px 침식(경계 블리드 제거) + 배경색을 subject 평균으로 치환 후 LANCZOS 다운스케일 + 16색 양자화.
# 사용법 — python3 key_one.py <in.png> <out.png> [--key magenta|green] [--h 150]
import sys, argparse
import numpy as np
from PIL import Image
from scipy import ndimage

KEYS = {'magenta': (255, 0, 255), 'green': (0, 255, 0)}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('inp'); ap.add_argument('out')
    ap.add_argument('--key', default='magenta'); ap.add_argument('--h', type=int, default=150)
    a = ap.parse_args()
    key = np.array(KEYS[a.key], dtype=np.float64)

    im = Image.open(a.inp).convert('RGB')
    rgb = np.array(im).astype(np.float64)

    # 키색 거리 — 배경 후보(순마젠타 근처).
    dist = np.sqrt(((rgb - key) ** 2).sum(axis=-1))
    is_key = dist < 100.0

    # 테두리에서 연결된 키색만 진짜 배경(내부에 갇힌 유사색 보호).
    lbl, n = ndimage.label(is_key)
    border_ids = set(lbl[0, :]) | set(lbl[-1, :]) | set(lbl[:, 0]) | set(lbl[:, -1])
    border_ids.discard(0)
    outside = np.isin(lbl, list(border_ids))
    subject = ~outside

    # 가장 큰 subject 연결요소만(부유 얼룩 제거).
    slbl, sn = ndimage.label(subject)
    if sn > 1:
        sizes = ndimage.sum(np.ones_like(slbl), slbl, index=range(1, sn + 1))
        subject = (slbl == (1 + int(np.argmax(sizes))))

    # 경계 1px 침식 — 안티앨리어스로 마젠타가 스민 바깥 링 제거.
    subject = ndimage.binary_erosion(subject, iterations=1)

    ys, xs = np.where(subject)
    if len(xs) == 0:
        print('빈 subject'); sys.exit(1)

    # 배경 픽셀 색을 subject 평균으로 치환 → 다운스케일 시 마젠타 블리드 방지.
    mean = rgb[subject].mean(axis=0)
    rgb_fill = rgb.copy()
    rgb_fill[~subject] = mean

    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    rgb_c = rgb_fill[y0:y1, x0:x1].astype(np.uint8)
    alpha_c = (subject[y0:y1, x0:x1].astype(np.float64) * 255.0)

    # 게임 크기로 축소 — 색은 LANCZOS, 알파는 별도 LANCZOS 후 0.5 임계.
    th = a.h
    tw = max(1, round(rgb_c.shape[1] * th / rgb_c.shape[0]))
    rgb_small = Image.fromarray(rgb_c, 'RGB').resize((tw, th), Image.LANCZOS)
    a_small = Image.fromarray(alpha_c.astype(np.uint8), 'L').resize((tw, th), Image.LANCZOS)
    a_arr = (np.array(a_small) >= 128).astype(np.uint8)

    # 16색 양자화(RGB) + 하드 알파.
    rgb_q = rgb_small.quantize(colors=16, dither=Image.NONE).convert('RGB')
    out = np.dstack([np.array(rgb_q), (a_arr * 255).astype(np.uint8)])
    out[a_arr == 0] = 0
    Image.fromarray(out.astype(np.uint8), 'RGBA').save(a.out)

    # 헤일로 진단 — 알파 경계 링에 키색 잔여.
    m = out[..., 3] > 0
    edge = m & ~ndimage.binary_erosion(m)
    diff = np.abs(out[..., :3].astype(int) - KEYS[a.key]).sum(axis=-1)
    halo = int(((diff < 60) & edge).sum())
    print(f'out={a.out} size={tw}x{th} subject_px={int(m.sum())} edge_halo={halo}')


if __name__ == '__main__':
    main()
