# 핸드오프 — feat-014 #5: 성급 비주얼 사다리 배경 3종 절차 생성

대상 — 이미지 생성(Codex 절차 생성, v090/v091 패턴). 자족 스펙. 산출물은 Claude가 캡처 하네스로 검증한다. **코드 배선은 이미 완료** — 이 핸드오프는 PNG 3장 생성 + Resources 배치만 필요하다.

## 배경 — 코드는 드롭인 준비 완료
`Systems.StageVisual.BackgroundKey(stageId)`가 성급별 배경 리소스 키를 반환하고, `GameScreen.LoadStageBackground()`가 단계 전용 텍스처를 로드하되 **없으면 기본 `Art/Background/office`로 폴백**한다. 단계 승급 시 `RefreshStageBackground()`가 자동 스왑. 따라서 아래 3장을 지정 경로에 넣기만 하면 즉시 동작한다(코드 수정 불필요).

## 생성할 배경 3종 (RGB, 1080×1920 세로, office.png와 동일 구도·등각)
기존 `unity/Assets/_Project/Resources/Art/Background/office.png`(차고 오피스)를 **구도·원근·팔레트 앵커**로 삼아 같은 가족 룩으로 3단계 진화시킨다. 직원·가구가 그 위에 얹히므로(전경 UI 레이어) **바닥 원근과 중앙 무대 공간은 office.png와 동일하게 유지**해야 액터가 안 뜬다.

| 파일 (Resources 경로) | 성급 | 컨셉 |
|---|---|---|
| `Art/Background/office_growth.png` | 3·4성 (바이럴앱·기업벤더) | 확장된 스타트업 오피스 — 층고 높고, 통유리 창, 화이트보드 벽, 식물·라운지. 차고티를 벗은 깔끔한 성장기 사무실. |
| `Art/Background/office_datacenter.png` | 5성 (AI 플랫폼 자이언트) | 데이터센터 통합 본사 — 뒤편에 서버랙 열·냉각 파이프·LED 상태등, 유리 너머 GPU 팜. 규모와 인프라가 보이는 위용. |
| `Art/Background/office_landmark.png` | 6성 (바운더리리스) | 랜드마크 본사 — 도시 스카이라인이 내려다보이는 최상층, 통유리 파노라마, 미래적 곡선 구조. 정점의 위엄. |

## 톤·제약
- office.png의 **다크 아웃라인·청록/골드 액센트·따뜻한 크림 톤**과 한 가족. 캐릭터 시트(`docs/art-pipeline/character-sheet.md`) 팔레트 정합.
- 위에 반투명 크림 스크림(알파 0.38)이 얹히므로 **너무 어둡거나 채도 높으면 안 됨** — office.png 밝기 수준 유지.
- **중앙~하단 1/3은 비교적 비워** 둔다(직원 액터·가구가 놓이는 무대). 디테일은 상단·측면에.
- 세로 1080×1920, RGB(투명 불필요 — 전체 배경).

## 생성 방식 (v090/v091 선례)
- `agy` 비대화형은 권한 거부됨 — **Codex 절차 생성(mjs 스크립트)으로 결정론 생성** 후 SHA 기록. 선례 `scripts/assets/generate-v090-workforce-actor-hires.mjs` 패턴.
- 산출 위치 — `unity/Assets/_Project/Resources/Art/Background/`에 직접, 또는 `public/assets/`에 두고 임포트. **Resources 경로가 최종**(코드가 `Resources.Load`로 읽음).
- 각 PNG에 `.meta`가 없으면 Unity가 자동 생성하나, Texture2D로 읽히도록 임포트 설정(기본 Sprite 아님 — `Resources.Load<Texture2D>`) 확인.

## 검증 (Claude 후속)
- `ScreenshotCaptureTests`에 성급 주입 캡처 추가(IPO 캡처처럼 `CompanyStageId` 강제) → 3단계 배경이 뜨는지 + 직원 겹침/가림 없는지.
- EditMode `StageVisualTests` 4종(키 매핑)은 이미 통과 — 텍스처 반입 후에도 무영향.
- 일관성 — office.png와 한 가족인지, 스크림 얹은 뒤 텍스트 가독성.

## 스코프
- 이미지 3장 + (필요 시) 생성 mjs 스크립트. **C# 코드 무수정**(배선 완료). Core/Data/Systems/Save 불침습.
