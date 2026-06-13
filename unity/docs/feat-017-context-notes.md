# feat-017 컨텍스트 노트 — 픽셀 컷씬 시스템 (출시 발표회부터)

사용자 피드백(2026-06-13) — "출시나 뭐나 할 때마다 창이랑 픽셀캐릭터들이 움직이는 씬이 등장할 차례." 시뮬 게임도 "화려함은 없어도 보는 맛은 있어야지. 아기자기하게."

## 0. 브레인스토밍 합의 (사용자 결정)
1. **형태** — 전용 컷씬 **모달 윈도우**(화면 딤 + 중앙 픽셀 윈도우 + 그 안 미니 무대에서 직원 연기).
2. **트리거** — 장기적으로 출시·승급·상장·능력업/해금 전부. 단 **지금은 제품 출시(발표회) 1종에 집중**, 나머지는 골격 재사용으로 후속.
3. **톤** — 이벤트별 맞춤(출시=발표회, 승급=이사 몽타주, 상장=세리머니). 출시 발표회부터.
4. **차등화(tier)** — 잦은 이벤트가 매번 풀 컷씬이면 흐름이 끊김. 빅(상장·랜드마크 승급=풀)/중(출시·일반 승급=미디엄)/소(능력업·해금=미니 인라인). 출시는 중 tier.
5. **아트** — **골격 먼저(코드 모션 + 기존 v090 직원 재사용)**, agy 포즈 스프라이트는 핸드오프 스펙을 써주면 사용자가 agy로 생성해 드롭인 교체(생동감 업그레이드). agy 비대화형은 권한 거부 이력이라 Claude가 직접 못 돌림 — [[agy-noninteractive-permission-denied]].

## 1. 아키텍처
**`CutsceneDirector`** (신규, `Scripts/UI/`) — FxManager와 동일 패턴.
- `[RuntimeInitializeOnLoadMethod(BeforeSceneLoad)]` 자동 부트스트랩 + DontDestroyOnLoad.
- 전용 Overlay Canvas(sortingOrder 230 — 메인 UI 위, 모달처럼 덮음). CanvasScaler 1080x1920 기준.
- `GameEvents.ProductLaunched` 구독 → 출시 컷씬 큐잉·재생.
- 코드 코루틴 애니메이션(ParticleSystem/DOTween 불필요), `Time.unscaledDeltaTime` 사용(틱과 무관).

## 2. 출시 컷씬 구조 (모달 1프레임 → 시퀀스)
- **스크림** — 화면 전체 딤(0.55 검정), raycast 막아 입력 차단.
- **픽셀 윈도우 프레임** — 중앙, 가로 ~92% / 세로 ~46%. 배경 룸과 같은 픽셀 문법(INK 윤곽선·MINT/YELLOW 악센트). 타이틀바("신제품 출시!") + 제품명.
- **미니 무대** — 윈도우 안. 바닥 + 커튼 + 스포트라이트 콘. 절차 생성(배경 헬퍼 재사용 가능하면).
- **발표 직원**(중앙) — v090 actor_human, 제품 아이콘(IconLibrary 제품 키 또는 범용)을 머리 위로 **들어올림**(코드: anchoredPosition Y + 살짝 회전).
- **객석 직원**(좌우 2~3) — actor_ai/robot, **점프·박수**(StaffBob 강화 모션 + 스케일 펄스).
- **색종이** — 무대 위 자체 색종이(FxManager.Celebrate 재사용 또는 컷씬 내부 코루틴, GoldCyan 팔레트).
- **하단** — "탭하여 계속" + 자동 닫힘 타이머.

## 3. 시퀀스 타임라인 (중 tier, ~1.5s)
1. 0.0s — 스크림 페이드인 + 윈도우 팝인(UiTween.PopIn 재사용).
2. 0.2s — 무대 라이트 켜짐, 발표 직원 등장.
3. 0.5s — 제품 들어올림 + 색종이 버스트 + 객석 환호.
4. 1.2s — "탭하여 계속" 깜빡임. 탭 또는 1.5s 후 자동 닫힘(윈도우 팝아웃 + 스크림 페이드아웃).
- **탭 스킵** — 언제든 탭하면 즉시 닫힘.
- **반복 출시 간략화** — 같은 런 N번째(예 3회+) 출시부터 길이 절반·색종이 축소(첫 출시는 풀). 카운터는 Director 내부(세이브 불필요, 세션 한정).

## 4. tier 골격 (출시 먼저, 확장 대비)
- `enum CutsceneTier { Mini, Medium, Big }`. 출시=Medium. Director는 tier로 길이·요소 차등. 승급/상장/능력업은 후속 블록에서 같은 Director에 케이스 추가.

## 5. 아트 파이프라인 (agy 핸드오프 후속)
- 1차 — v090 3종(actor_human/ai/robot) 그대로 + 코드 모션(들기·점프·박수·스케일·회전). 새 스프라이트 0장으로 "보는 맛" 확보.
- 2차(후속) — agy용 포즈 핸드오프 스펙 `docs/agy-handoff/cutscene-poses.md` 작성: 필요 포즈(발표-팔들기, 환호-양팔만세, 박수, 점프), v090 팔레트·256px·바이블 마커·정면. 생성되면 IconLibrary에 포즈 키 추가 + Director가 모션 대신 포즈 스프라이트 스왑.

## 6. 기존 시스템 관계
- FxManager(전역 파티클) — 출시 시 컷씬이 화면을 덮으므로 뒤의 OnProductLaunched 파티클은 가려짐(무해). 깔끔히 하려면 컷씬 활성 중 FxManager 출시 버스트 스킵 플래그 검토(과하면 생략).
- 능력업/해금 등 컷씬 미적용 이벤트는 FxManager 파티클 그대로.

## 7. 검증
- EditMode — Director의 순수 로직(tier 판정·반복 카운터)이 헤드리스 가능하면 테스트. 145 유지.
- PlayMode 캡처 — ScreenshotCaptureTests에 출시 컷씬 트리거(`GameEvents.RaiseProductLaunched` 또는 출시 버튼) → 컷씬 프레임 캡처(예 15-cutscene-launch.png). 발표 직원·객석·색종이·윈도우 가독 확인.

## 진행 기록
- 2026-06-13 — 브레인스토밍 합의로 등록. 출시 발표회 컷씬 골격(코드 모션) 구현 착수.
- 2026-06-13 — **골격 구현 완료** — `Scripts/UI/CutsceneDirector.cs`(FxManager 패턴, sortingOrder 230 Overlay Canvas, ProductLaunched 구독). 출시 시 모달 윈도우(타이틀 "신제품 출시!" + 커튼 무대 + 중앙 발표 직원 머리 위 제품 별박스 + 좌우 객석 로봇 + 색종이). 코드 모션 — PresenterLift(발표자 들썩+제품 회전), FanCheer(객석 점프+스쿼시), ConfettiCo(자체 색종이). 탭 스킵(스크림 Button) + 자동 닫힘, 반복 출시 3회+ 간략화(_launchCount). tier enum(Mini/Medium/Big, 출시=Medium) 골격 — 승급·상장·미니는 후속.
- 2026-06-13 — **검증** — EditMode 145/145(컴파일+로직 무변경) + PlayMode 캡처 `Logs/shots/15-cutscene-launch.png`. 제품-머리 겹침 버그 1회 수정(product y 150→210, presenter y -70→-90/size 260→240). 모션 코루틴 while 조건을 `actor != null`로(닫힘 시 파괴 객체 접근 방지). 정적 캡처라 모션·색종이는 한 프레임만 잡힘.
- 2026-06-13 — **곁다리 수정** — feat-016 검증 중 발견한 "No cameras rendering"(Game.unity 씬 카메라 0개) 해소. `GameBootstrap.EnsureCamera()`가 더미 메인 카메라 런타임 보장(cullingMask 0, Overlay UI 독립). EnsureEventSystem 패턴 답습.
- 2026-06-13 — **tier 확장 #1~#3 완료** — CutsceneDirector 일반화(공통 모달 셸 + 종류별 Populate*: Launch/StageUp/Ipo) + 미니 별도 큐 경로. #1 승급(CompanyStageChanged 구독, 새 성급 배경 StageVisual 재사용 + 직원 3종 점프, "새 오피스로 이사!"). #2 상장(신규 GameEvents.IpoCompleted + GameScreen ShowIpoModal 성공 블록 배선, 기존 FxManager.Celebrate+SpawnCelebration("상장") 제거 → 세리머니 컷씬: 종 흔들기+직원 환호+$ 플로팅(FloatingText)+폭죽). #3 미니(CapabilityUpgraded/DomainUnlocked 구독, 하단 코너 윈도우 슬라이드 인/아웃 + 캐릭터 1명 + ▲, 스크림 없음·raycastTarget false로 입력 통과, 자체 큐). 검증 — EditMode 145/145 + PlayMode 캡처 16-stageup·17-ipo·18-mini. 미니 캐릭터 14px 잘림 → 좌표 안쪽 조정(재캡처 생략, 좌표 상수라 회귀 0).

## tier 확장 설계 (사용자 승인 2026-06-13)
브레인스토밍 합의 — 출시(기존) 외 승급·상장·미니 3종 추가.
- **트리거** — 승급=`CompanyStageChanged`(이미 발동), 상장=신규 `GameEvents.IpoCompleted`(GameScreen ShowIpoModal 성공 블록 line~1230에서 발동), 능력업=`CapabilityUpgraded`·해금=`DomainUnlocked`.
- **승급(Big, 새 오피스 공개)** — 모달 윈도우 안에 새 성급 배경(StageVisual.BackgroundKey 4종 재사용)을 깔고 직원 점프 환호 + "○○으로 성장!" 타이틀 + 색종이.
- **상장(Big, 세리머니)** — 무대 위 종(벨) + 직원 환호 + "$" 플로팅 + 금빛 폭죽 + "상장 성공!". 기존 IPO 모달(공모율 결정) 확정 직후 재생. GameScreen의 SpawnCelebration("상장") 빅팝은 컷씬으로 대체(중복 제거).
- **미니(능력업·해금, 코너 윈도우)** — 하단 한쪽 작은 윈도우 슬라이드 인 → 캐릭터 1명 엄지척 + "LEVEL UP!"/"도메인 해금!" → ~1s 슬라이드 아웃. **스크림 없음·입력 통과**(GraphicRaycaster 미적용 레이어). 자체 큐로 연속.
- **구조** — Director 일반화. 공통 모달 셸(BuildModalShell: 스크림+윈도우+타이틀+무대+탭스킵) 추출 → 출시/승급/상장이 무대 내용(Populate*)만 다르게. 모달은 `_playing` 1개씩(재생 중 무시). 미니는 별도 코너 레이어 + 큐(모달과 독립).
- **블록** — #1 Director 일반화+승급 / #2 IpoCompleted+상장 / #3 미니 코너.

## 남은 폴리시 / 후속
- 스포트라이트(발표자 뒤 노란 콘) 약함 — 강화 여지.
- 색종이 정적 캡처 미포착 — 실플레이 OK, 더 풍성/오래 가능.
- **agy 포즈 핸드오프** — `docs/agy-handoff/cutscene-poses.md`. 생성되면 IconLibrary 포즈 키 추가 + MakeActor가 포즈 스프라이트 스왑(코드 모션 → 포즈+모션 혼합).
- tier 확장 — 승급(이사 몽타주)·상장(세리머니)·능력업(미니 인라인) 케이스를 같은 Director에 추가.
