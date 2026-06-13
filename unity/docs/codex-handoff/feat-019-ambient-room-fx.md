# Codex 핸드오프 — feat-019 T4: AmbientRoomFx (앰비언트 룸 애니메이션)

reasoning=xhigh. 정적 PNG 배경 위에 가벼운 절차 애니 오버레이를 얹어 방을 "살아있게" 한다. 모니터 글로우·LED 점멸·조명 깜빡·먼지/광선·식물 흔들. 룸 4종 프리셋.

## 산출물
- **신규 파일** `Assets/_Project/Scripts/UI/AmbientRoomFx.cs` 1개. **다른 파일 수정 금지**(배선은 Claude가 GameScreen에서 함).
- C# 한 줄 한국어 헤더로 시작(`// 정적 오피스 배경 위 절차 앰비언트 애니 — 모니터 글로우·LED·조명·먼지를 룸별로 연출`).

## 패턴 (먼저 읽을 것)
다음 기존 컴포넌트의 컨벤션을 그대로 따른다 — uGUI 코드 빌드, 코루틴/Update 모션, 풀링 없이 생성·소멸.
- `Assets/_Project/Scripts/UI/FxManager.cs` — Canvas/Image 절차 생성, sin 모션, 색 팔레트.
- `Assets/_Project/Scripts/UI/StaffBob.cs`·`ReactionBubble.cs` — 단순 MonoBehaviour Update 애니 + Init.
- `Assets/_Project/Scripts/UI/GameScreen.cs`(360~389 `BuildOfficeBackground`) — cover 배경 배치 방식(정합 이해용).
- `Assets/_Project/Scripts/UI/UiTheme.cs` — 색 상수(MINT/YELLOW 등 대응 톤).

## 좌표 정합 계약 (★ 핵심 — 이게 틀리면 글로우가 엉뚱한 곳에 뜸)
배경은 네이티브 캔버스 **240×534**(`Tools~/pixel_office/gen_office.py` W,H) 를 6x 업스케일해 cover로 화면을 채운다.
- GameScreen이 `AmbientRoomFx`를 붙일 때 **coverRoot**(RectTransform)를 넘긴다. **coverRoot는 sizeDelta=(240,534), pivot=(0.5,0.5)** 로 BG와 동일한 AspectRatioFitter(EnvelopeParent) 아래 놓인다 → coverRoot의 로컬 1유닛 = 네이티브 캔버스 1픽셀, BG와 1:1 정합.
- 따라서 캔버스 좌표 `(cx, cy)`(좌상단 원점, gen_office.py 기준)를 coverRoot 로컬 위치로:
  ```
  Vector2 CanvasToLocal(float cx, float cy) => new Vector2(cx - 120f, 267f - cy);
  // x: 0..240 → -120..120 ; y: 캔버스 아래로 증가 → UI 위로 증가라 (267 - cy)
  ```
- 모든 글로우 자식 Image는 이 helper로 anchoredPosition 설정(anchor/pivot 0.5). 크기도 캔버스 픽셀 단위로 주면 cover가 BG와 같은 배율로 키운다.

### Init API (GameScreen이 호출)
```csharp
public void Init(string roomKey, RectTransform coverRoot)
// roomKey: "office" | "office_growth" | "office_datacenter" | "office_landmark"
// coverRoot: 위 계약대로 (240x534, cover). 모든 자식을 coverRoot 아래 생성.
```
roomKey 미지정/미일치는 "office" 폴백. 재호출(룸 변경) 시 기존 자식 정리 후 재구성하는 `Rebuild` 분리 권장.

## 룸별 애니 스펙 (캔버스 좌표는 gen_office.py 실측)
공통 — 모든 모션은 **결정적 sin/스텝**(시간 기반), Update에서 할당 0(자식 캐시 리스트 재사용). 한 룸당 애니 자식 **≤ 30개**. 글로우는 밝은 색 반투명 Image(소프트 사각, 알파 sin). 과하지 않게(알파 peak ~0.35).

### office (차고)
- **펜던트 조명 깜빡** — 전구 (78,32),(140,32). 따뜻한 YELLOW 글로우 원뿔, 알파 flicker(불규칙 — sin 합성 or 의사난수 스텝, 형광등 깜빡 느낌). (78,32)는 강하게, (140,32)는 약하게.
- **창 햇빛 셔머** — 창 (20,62)-(84,118). 옅은 MINT/WHITE 글로우, 느린 알파 호흡(period ~4s).
- **셔터 바닥 햇살** — 셔터 하단 x162~230, y≈FLOOR_Y(384). 따뜻한 바닥 글로우 미세 펄스.
- **줄전구 트윙클** — y150, x16~160, 14px마다 전구. 전구별 위상차 트윙클(YELLOW).
- **모니터 글로우** — 책상 모니터 ~(55, 343)·(161, 343)(draw_desk x34/x140, top=FLOOR_Y-30, 모니터 중앙). 화면색(MINT/BLUE) 글로우 pulse.
- **먼지 모트** — 창·펜던트 광선 영역에 작은 밝은 점 2~4개가 천천히 부유(느린 상하 drift + 페이드).

### office_growth (스타트업)
- **통창 데이라이트** — (16,46)-(100,122),(140,46)-(224,122). 옅은 셔머 호흡.
- **펜던트 3** — x54,118,182 y≈38. YELLOW 글로우 약한 펄스.
- **네온 포스터 펄스** — (98,204)-(160,252) 민트 외곽. MINT 네온 글로우 호흡(눈에 띄게 — 스타트업 활기).
- **모니터 글로우** — 책상 x22,100,182 top=FLOOR_Y-30.
- **식물 흔들** — (86,FLOOR_Y-1),(170,FLOOR_Y-1),(170,206). 잎 영역 미세 좌우 스웨이(회전 or x오프셋 sin, ±1~2px).

### office_datacenter (데이터센터) — LED가 시그니처
- **서버랙 LED 점멸** — 랙 (8,42)-(78,380),(162,42)-(232,380). 랙 표면 곳곳 작은 LED(MINT/YELLOW/BLUE) 가 **개별 위상 점멸**(blink, 스텝). 랙당 8~12개. 가장 눈에 띄는 효과.
- **대시보드 글로우** — (92,54)-(148,92),(92,100)-(148,138). 차트 영역 옅은 MINT 스캔/펄스.
- **LED 신호탑** — x117, y244~300. 4색 세그먼트 순차 점멸.
- **상태 타일/세계시계** — (88~152,150~230). 소수 타일 깜빡.
- **냉각 글로우** — x82,158 세로(y44~378). 차가운 MINT 세로 글로우 느린 펄스.

### office_landmark (랜드마크)
- **일몰 통창 셔머** — (10,34)-(230,150). 따뜻한 ORANGE/PURPLE 글로우 아주 느린 호흡 + 창 안 도시 불빛 몇 개 트윙클.
- **다운라이트** — x30,74,118,162,206 y≈23. 골드 글로우 약한 펄스.
- **로고월 글로우** — 중앙 (120, 164). MINT 글로우 호흡(브랜드 존재감).
- **골드 어워드 셔머** — x38,196 y≈220. 골드 반짝 미세.
- **대형 화분 스웨이** — x6,x220 y≈FLOOR_Y. 큰 잎 느린 스웨이.

## 성능·품질 가드
- Update 할당 0 — 자식 Image 참조를 List/배열에 캐시, 색·알파·위치만 갱신.
- `Time.unscaledTime` 사용(게임 일시정지·모달 중에도 방은 숨 쉬게). 단 과하면 산만하니 알파 상한 준수.
- 켜기/끄기 토글 가능(`SetActive` or enabled). 배경 PNG는 절대 안 가림(글로우는 알파 ≤0.4 가산 느낌).
- 모든 좌표는 위 CanvasToLocal 계약 사용 — 하드코딩 화면픽셀 금지.

## 검증 (Codex 자체)
- 컴파일만 자체 확인하면 됨(`AmbientRoomFx`는 GameScreen 배선 전이라 단독 PlayMode 캡처는 Claude가 통합 후 수행).
- 스크립트가 컴파일되고, Init/Rebuild/Update 구조가 위 스펙과 패턴에 맞는지. **Unity batchmode 실행 금지**(Claude가 라이선스 직렬 검증). 코드만 작성.

## 인수 기준 (Claude 통합 시 확인)
- roomKey 4종 분기 + 폴백.
- CanvasToLocal 계약 정확.
- 룸당 ≤30 자식, Update 할당 0.
- 글로우가 배경 발광 요소(모니터·LED·창·조명) 위에 정합(통합 스크린샷으로 Claude 확인·미세 좌표 튜닝).
