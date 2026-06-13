# feat-018 컨텍스트 노트 — 픽셀 배경 폰 고품질 대응 (cover + 고해상도)

사용자 우려(2026-06-13) — "고품질을 원한다고 했잖아. 혹시 폰에서 보면 고품질이 아닌거 아냐?"

## 0. 문제 진단 (실증)
feat-016 배경은 1080x1920(9:16) + `preserveAspect=false` 풀스트레치였다. 실제 폰에서 깨진다.
- **비율** — 캔버스 9:16(1.78)인데 폰은 20:9(2.22)로 더 길쭉 → 세로 1.25배 stretch.
- **해상도** — QHD 폰 1440폭인데 배경 1080폭 → 1.33배 업스케일.
- **비정수 non-uniform** — 1.25/1.33배 stretch는 Point 필터로도 **도트가 직사각으로 뭉개지고 크기 불균일**. 픽셀아트 정사각 픽셀이 무너짐.
- 헤드리스 1080x1920 캡처는 우연히 정수배라 완벽했던 것 — 폰 미검증이었음. `Tools~/pixel_office/phonecheck/`에 stretch(뭉개짐) vs cover(정사각) 비교 증거.

## 1. 해결 (사용자 결정 — cover + 고해상도 + 도트 작게)
**cover의 본질 = uniform scale(가로세로 같은 배율)이라 도트가 정사각 유지.** 비율 안 맞아도 크롭만 발생, 직사각 왜곡 없음.
- **고해상도 + 20:9 비율** — 네이티브 캔버스 180x320(9:16) → **240x534(≈20:9)**. SCALE 6 → **1440x3204**(QHD 1:1, FHD 0.75 다운스케일). 도트는 240폭이라 현 180폭보다 작아 디테일 ↑.
- **cover 스케일** — `BuildOfficeBackground`에 `AspectRatioFitter(EnvelopeParent)` + aspectRatio=tex.w/tex.h. 풀스트레치(Stretch+preserveAspect=false) 제거. 종횡비 유지로 화면 채우고 넘침 크롭.
- **meta** — maxTextureSize 2048 → **4096**(3204>2048 다운스케일 방지). filterMode 0(Point) + textureCompression 0 유지.
- **FLOOR_Y 348 → 384** — 20:9 폰 cover 크롭 기준 액터 anchor 0.20과 직원 발 정합(러그가 발 받침).
- 비율 20:9라 좌우 크롭 최소(룸 좌우 보존), 짧은 폰(19.5:9)은 상하 약간 크롭(천장/바닥 버퍼로 흡수).

## 2. 영향 범위
- `Tools~/pixel_office/gen_office.py` — W/H/SCALE/FLOOR_Y + 4종 빌더 좌표 전면 재조정.
- `Resources/Art/Background/*.png` 4종 1440x3204 교체 + meta 4096.
- `GameScreen.BuildOfficeBackground` — cover(AspectRatioFitter).
- `ScreenshotCaptureTests.CaptureCanvas` — 해상도 파라미터화(w,h 기본값) + 01c-phone-2400(20:9) 캡처 추가.
- 승급 컷씬(feat-017)이 같은 배경 PNG 재사용 — 자동 반영(컷씬 무대 안 작은 영역이라 stretch 영향 미미).

## 3. 검증
- EditMode 145/145(cover 코드 컴파일).
- PlayMode 폰 캡처 `Logs/shots/01c-phone-2400.png`(1080x2400, 20:9) — 도트 정사각 균일 + 직원이 배경 러그 위 정합 확인. 이전 stretch 직사각 뭉개짐 해소.

## 진행 기록
- 2026-06-13 — 사용자 우려로 등록 → 실증(stretch 뭉개짐) → cover+고해상도 재작업 → 폰 20:9 캡처 검증 완료.

## 남은 폴리시 / 후속
- **벽 중앙 휑함** — 세로 20:9로 길어지며 직원 위~요소 아래 벽이 빈다. 벽 중하단에 포스터·선반·액자·식물 등 디테일 추가 필요(4종).
- **액터 정합 폰별 변동** — cover 크롭이 비율마다 달라 FLOOR_Y=384는 20:9 최적. 19.5:9(아이폰)/21:9에선 미세 어긋남. 필요 시 액터 OfficeScene anchor를 cover-aware로.
- 캡처 하네스 기본(01-main 등)은 9:16이라 cover에서 상하 크롭 큼 — 폰 비율(20:9)로 기본 전환 검토.
