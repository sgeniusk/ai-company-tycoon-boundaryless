# feat-023 캐릭터 애니메이션 — 설계·구현 정본 (context-notes)

feat-023 오피스 아트 확장의 **캐릭터 애니메이션 서브트랙** 작업 기록이다. 양산(캐릭터 시트→슬라이스)은 `feat023-office-expansion-gen.md`와 office-visual-rework 메모리에, 여기는 **Unity 반입 + 포즈 배선 + 절차 모션**의 설계 결정과 변경점을 담는다.

## 방향 결정 (2026-06-17)
사용자 선택 — **방법 C (절차 즉시 + imagegen 파일럿)**. 핸드오프가 예고한 "human 파일럿으로 A/B 비교 결정"을 이행.
- **방법 A** (imagegen 풀 프레임) — 포즈당 2~3프레임 재생성. 최고 충실도이나 imagegen이 프레임 간 캐릭터 일관성에 약함(흔들림), 비결정·비용 큼.
- **방법 B** (절차 코드) — 이동 기반 변형만. 결정적·일관·테스트 용이. 단 픽셀 재드로잉(손 타이핑 등)은 불가.
- **방법 C (채택)** — 절차 모션(B)을 즉시 전 포즈 적용해 체감을 올리고, human work 1포즈에 imagegen 2프레임 파일럿(A)을 만들어 비교 후 확대 여부 결정.
- **픽셀 함정** — 런타임 **비균일 scale(squash/stretch)은 Point 필터 픽셀을 직사각으로 뭉갠다**(feat-018 교훈). 그래서 절차 모션은 **이동(translation) 기반만** 쓴다. scale 금지.

## Phase 0 — 15포즈 Resources 반입
- `Tools~/pixel_office/feat023/proc_{char}_{pose}.png`(96×96 투명, 시트 슬라이스 정본 15컷) → `Resources/Art/Actors/`.
- 매핑 — idle→`actor_{c}.png`, work→`actor_{c}_work.png`, cheer→`actor_{c}_cheer.png`(이상 9컷 violet 교체), card_use→`actor_{c}_carduse.png`, alert→`actor_{c}_alert.png`(이상 6컷 신규).
- **AI violet 통일** — 기존 `actor_ai*`가 흰색/스틸이라 character-sheet(violet) 위반이었다. 시트 재양산본으로 idle/work/cheer까지 violet 교체.
- `.meta` — 기존 9컷은 PNG만 교체(메타 보존, GUID 안정). 신규 6컷은 v090 미러 메타(`actor_human.png.meta` 템플릿 — Point·spriteMode 1·alphaIsTransparency·PPU 96·플랫폼 maxTextureSize 4096)를 **결정적 GUID**(파일명 md5)로 생성.
- 반입기 — `Tools~/pixel_office/feat023/import_to_resources.py`(결정적·재실행 안전). 산출 — 15컷 전부 `alpha[0..255]` 확인.

## Phase 1 — card_use / alert 이벤트 배선
card_use·alert는 루프 포즈가 아니라 **이벤트 원샷**이다.
- `ActorAnim.PlayOneShot(int poseState)` 신설 — `CardUse`(3)·`Alert`(4)를 잠깐 덮었다 idle로 복귀. 스프라이트 null이면 무시(드롭인 안전).
- GameScreen이 GameEvents 단일 구독자이자 `_officeSceneContent` 소유자라 **중앙 디렉팅** — `TriggerActorOneShot(poseState, n)`이 무대 액터 중 무작위 n명에 적용.
- 트리거 —
  - **card_use** — `OnDomainUnlocked`·`OnCapabilityUpgraded`(긍정 모먼트, 컷씬과 안 겹침). 무작위 1명이 카드 치켜듦.
  - **alert** — 월 진행 중 이벤트가 **새로** 트리거되는 지점(`ShowEventModal(triggered)` 직후, line ~204). 무작위 1~2명이 놀람.
- **타이밍 함정 회피** — 핸들러는 `AdvanceMonth` 중 발생하는데 직후 `RefreshAll`→`RefreshOfficeScene`이 액터를 **재생성**한다. 그래서 직접 트리거하면 날아간다. → `_pendingCardUse`/`_pendingAlert` 플래그로 쌓고, `RefreshOfficeScene` 끝에서 `FlushActorMoods()`가 재생성된 액터에 적용. 각 플러시는 최대 2명, 플러시 후 0으로 리셋(홍수 방지).

## Phase 2 — 상태-인지 절차 모션 (이동 기반)
- `StaffBob`를 상태-인지로 확장. 같은 GameObject의 `ActorAnim.State`/`StateElapsed`를 지연 획득(추가 순서 무관)해 모션을 분기.
  - **idle** — 통통(Abs Sin) + 미세 좌우 sway.
  - **work** — 빠르고 얕은 앞 기울임(타이핑 리듬).
  - **cheer** — 큰 홉.
  - **card_use** — 위로 팝 후 유지(StateElapsed 지수 엔벨로프).
  - **alert** — 좌우 리코일 셰이크(StateElapsed 감쇠).
- `StaffBob`가 `_baseX`/`_baseY` 기준 x·y 오프셋을 **단독 소유**(이전엔 y만, x는 매 프레임 현재값). 전부 translation — scale 무사용.

## Phase 3 — imagegen 2프레임 파일럿 (미착수, 검증 후 판단)
- human work 1포즈만 Codex imagegen으로 타이핑 2프레임(손 위/아래) → pixel-art-pipeline(96px·16색·투명) → 2프레임 스왑.
- **Phase 2 절차 모션을 인게임에서 보고 충분하면 imagegen 생략**(B로 확정). 부족하면 파일럿 진행해 A 확대 판단.

## 변경 파일
- `Assets/_Project/Scripts/UI/ActorAnim.cs` — Init 6인자(+cardUse/alert), 상태 상수 5종, `PlayOneShot`, `State`/`StateElapsed` 노출, 원샷 상태머신.
- `Assets/_Project/Scripts/UI/StaffBob.cs` — 상태-인지 이동 모션, x·y 단독 소유.
- `Assets/_Project/Scripts/UI/GameScreen.cs` — Init 호출 확장(line ~683), `_pendingCardUse`/`_pendingAlert`, alert 훅(line ~204), card_use 플래그(OnDomainUnlocked/OnCapabilityUpgraded), `TriggerActorOneShot`/`FlushActorMoods`, RefreshOfficeScene 끝 Flush 호출.
- `Assets/_Project/Resources/Art/Actors/` — 9컷 교체 + 6컷 신규(+.meta).
- `Assets/_Project/Tests/PlayMode/ScreenshotCaptureTests.cs` — `Capture_PoseSheet`(20-pose-sheet, 5×3 그리드, 누락 시 빨강) 추가.
- 코어/데이터/세이브 무변경 — UI 레이어만. 세이브 버전 불변.

## 검증 완료 (2026-06-17)
- **단일 라이선스 함정** — `sam defender logue` Unity 점유 중이면 batchmode가 막혀 컴파일조차 불가. 사용자 승인 하에 SIGTERM→SIGKILL로 종료 후 진행. 검증 전 `ps -axo command | grep "[U]nity.app/Contents/MacOS/Unity " | grep -i projectpath`로 미실행 확인.
- `./init.sh` — 컴파일 성공 + **EditMode 145/145 통과, 0 실패**(UI만이라 코어 회귀 없음 확인).
- ScreenshotCaptureTests(`-nographics` **제외** — macOS Metal 오프스크린) — **PlayMode 6/6 통과**(신규 `Capture_PoseSheet` 포함).
  - `20-pose-sheet` — 15포즈 전부 IconLibrary 이름으로 로드, **빨강 누락 0**, AI 5포즈 violet 통일.
  - `08-actor-parade` — violet AI idle 정본 확인.
  - `01d-office-rich` — 런타임 모션 코드(ActorAnim/StaffBob) talent=10에서 무크래시, violet AI 무대 정합.
- **미해결** — 절차 모션의 *움직임 자체*는 정적 캡처로 판단 불가(이동 애니라 프레임이 한 장). 실기/에디터 Play로 체감해야 Phase 3(imagegen 파일럿) 필요 여부 확정.
