# 진행 로그 — Unity Port

재시작 상태용이다. 전체 이력 아님. 오래된 증거는 CHANGELOG로. (≤120줄)

## 현재 상태 (Current State)
**마지막 갱신** — 2026-06-07
**활성 피처** — feat-004 상업 연출. 사운드·모션 완료. **아이콘 적용 — 자원 HUD + 제품·도메인·능력 카드 코드 완료 + 검증 통과(EditMode 21/21, 슬라이스 51 스프라이트). 에디터 시각 확인만 남음.**
**현재 목표** — feat-004 비주얼(아이콘 → 파티클 → BGM → 테마)로 상업적 외형을 입힌다.

## 상태 (Status)
### 완료 (What's Done)
- [x] P0 Project Setup — Unity 6000.4.10f1, URP17.4/2D/Input/TMP/Test, 세로 모드, asmdef, 하네스
- [x] feat-001 Data Pipeline — 스키마 9종 + 임포터/DataCatalog/MiniJson. 120 SO 자산
- [x] feat-002 Core Simulation — GameModel + 10 서비스 + MonthController. balance 재현 + 36개월
- [x] feat-003 Vertical Slice UI — 세로 uGUI + SceneBuilder + SaveService. Game.unity
- [x] feat-004 사운드(절차적 SFX 7종 + AudioManager) + 모션(ResourceTicker, UiTween). EditMode 21/21 + PlayMode 2/2
### 진행 중 (What's In Progress)
- [~] feat-004 아이콘 적용 — 자원 HUD(v071)+제품·도메인(v079)+능력(v080). 코드 완료 + 검증 통과. 에디터 시각 확인 후 [x] 처리
- [ ] feat-004 남음(순서) — ③ 파티클(출시·승급) ④ BGM 통합 ⑤ URP 2D 파이프라인 에셋 ⑥ 카이로소프트식 테마

## 다음 (What's Next)
1. 에디터 ▶ 플레이로 아이콘 시각 확인(셀 위치·외형) → 커밋
2. feat-004 ③ 파티클 착수 (출시·승급 버스트)
3. feat-005 플랫폼 — Android/iOS 빌드

## 블로커 / 리스크
- [x] 검증 블로커 해소 — Unity 비는 틈에 `./init.sh` + `ImportAll` 완료. 다른 프로젝트 Codex가 Unity 점유 시 재발 가능 — 검증 전 `ps -axo command | grep "[U]nity.app/Contents/MacOS/Unity " | grep -i projectpath`로 확인.
- [ ] 시각 미확인 — 셀 y축 뒤집힘 계산(texHeight-(row+1)*cell)은 정적으로는 맞지만, 에디터 플레이로 아이콘이 의도한 셀과 맞는지 최종 확인 필요.
- [ ] 입력 백엔드 — activeInputHandler=0(Old). 경고 제거+양쪽 동작은 Both(2)로 (미적용).
- [ ] BGM 미정(AI/CC0). DOTween 미설치. URP 2D 파이프라인 에셋 미할당(빌트인 동작).

## 내린 결정
- 아이콘 아틀라스는 public/assets/ui/v07x-*-atlas.png(균일 그리드 48px). generate-*.mjs drawings 배열이 셀 순서 정답지.
- 셀↔데이터 매핑 — v071 0-7 자원((int)ResourceId), v079 0-14 도메인(domains.json 순), v080 0-11 능력(capabilities.json 순). 전부 데이터 순서와 일치.
- 임포트 — IconAtlasImporter가 Resources/Art/UI로 복사+Grid 슬라이스, 셀에 ui_*/domain_*/cap_* 이름 부여. 런타임 IconLibrary가 Resources.LoadAll로 이름 조회.
- 폴백 안전 — 스프라이트 없으면 null → 아이콘 숨기고 기존 텍스트/이모지 유지. 컴파일·런타임 무손상.

## 이번 세션 수정 파일 (검증 통과 · 커밋 예정)
- 신규 — Assets/Editor/IconAtlasImporter.cs (v071/v079/v080 복사+그리드 슬라이스, AICT 메뉴 / executeMethod)
- 신규 — Assets/_Project/Scripts/UI/IconLibrary.cs (Resources 스프라이트 조회 + Resource/Domain/Capability 매핑)
- 신규 에셋 — Assets/_Project/Resources/Art/UI/v071·v079·v080 .png + .meta(슬라이스 51 스프라이트)
- 수정 — UI/UiFactory.cs (Icon 헬퍼) + UI/GameScreen.cs (자원 HUD 아이콘 + AddCard 아이콘 오버로드 + 제품/도메인/능력 카드 배선 + GetResourcePlainName)

## 검증 증거
- [x] 컴파일/EditMode — `./init.sh` 통과. EditMode 21/21, 컴파일 에러 0, spritesheet 경고 0. 새 4파일 정상 빌드.
- [x] 아이콘 임포트/슬라이스 — IconAtlasImporter.ImportAll exit0. Resources/Art/UI에 3 PNG 복사 + .meta 슬라이스 51 스프라이트(v071 24/v079 15/v080 12), 이름 ui_*/domain_*/cap_* 일치.
- [~] 에디터 시각 확인 — 남음(GUI). 플레이로 HUD·카드 아이콘 위치/외형 확인 권장.
- [x] 스코프 — data/·루트·Core/Systems/Save·Schema 미수정. UI/Editor/Resources만.

## 다음 세션 메모
검증 통과 상태. 에디터 ▶ 플레이로 아이콘 시각 확인 → 커밋 → feat-004 ③ 파티클 착수. 상세는 session-handoff.md.
