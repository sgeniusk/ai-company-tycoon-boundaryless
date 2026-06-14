# feat-021 컨텍스트 노트 — 도감 열람 UI (Collection Gallery)

사용자 방향(2026-06-14) — feat-008 아키타입 12·엔딩 24 + feat-013 시너지/콤보 20의 크로스런 수집을 보는 전용 갤러리. 데이터는 헤드리스 완비, 순수 읽기 UI만. 백로그 1순위.

## 0. 결정 (사용자)
- **카테고리 3종** — 아키타입(12, 잠금/해금) · 엔딩(24, 잠금/해금) · 시너지+콤보(20, **전부 공개·전략 참고**). 시너지는 크로스런 추적이 없어 잠금 안 함.
- **레이아웃** — 그리드 갤러리(셀 탭 → 상세 패널). 미발견은 실루엣+`???`.
- **진입** — 더보기 드로어에 `도감` 버튼.
- **코어 무변경** — Core/Data/Systems/Save 안 건드림. 읽기 전용.

## 1. 데이터 소스 (구현 시 정확한 접근자는 코드 확인)
- **DataCatalog** — 아키타입/엔딩/시너지 리스트. (`Assets/_Project/Scripts/Data/DataCatalog.cs` 접근자 확인.)
  - `ArchetypeDef` — id, displayName, description, requires(List<string> 태그), yieldsSummary, monthlyEffects.
  - `EndingDef` — id, title, flavor, priority, conditionStatus(success/failure/any), minMonth, minProducts, minResources, metaRewardBonus.
  - `IndustrySynergyDef` — id, title, description, requiredDomains(List), monthlyEffects, riskLabel(콤보만 비어있지 않음), tags.
- **발견 추적** — `MetaSaveService`(GameScreen `_meta`). `_meta.Data.discoveredArchetypeIds`/`discoveredEndingIds`(List<string>). 시너지 없음.
- **아이콘** — 전용 아틀라스 없음. 아키타입=`IconLibrary.Get("celebrate_synergy")` 공용 엠블럼, 엔딩=공용/스탬프, 시너지=`IconLibrary.Domain(requiredDomains[0])`. 잠금 셀은 같은 아이콘을 어둡게 틴트(실루엣).

## 2. 구조
- **모달** — `CollectionGallery`(신규 자족 컴포넌트). 스크림(탭하면 닫힘) + 카드(96%×80%, MenuPopup 패턴). 상단 헤더(타이틀 + 닫기) + 3 카테고리 탭 + 탭별 카운트(`발견 N/총 M`, 시너지는 `20종`).
- **그리드** — 스크롤 + GridLayoutGroup 셀. 셀 = 아이콘 + 짧은 이름(잠금=실루엣+`???`). 모바일 가독성(폰트 26+).
- **상세** — 셀 탭 시 카테고리별 상세 패널(이름·설명·조건/효과). 잠금 아키타입/엔딩은 `???`+힌트(아키타입=requires 태그 일부 힌트, 엔딩=조건상태/최소월 힌트). 시너지는 항상 전체 공개(콤보는 리스크 뱃지).

## 3. 파일·배선
- **신규** `Assets/_Project/Scripts/UI/CollectionGallery.cs` (namespace AICompanyTycoon.UI, 한 줄 한국어 헤더). 자체 모달/탭/그리드/상세 빌드. `UiFactory`·`UiTheme` 사용. 스크롤·모달 패턴은 `GameScreen.CreateScrollPanel`·`BuildMenuPopup` 읽어 모방(단 CollectionGallery 내부에 자체 구현 — GameScreen private 호출 불가).
  - API — `public static void Show(Transform canvasParent, DataCatalog catalog, MetaData meta)` (또는 동등). 호출 시 모달 생성, 닫기 시 자기 파괴.
- **GameScreen** — `BuildMoreDrawer`에 `도감` 버튼 추가 → `CollectionGallery.Show(_canvas.transform, _context.Catalog, _meta.Data)` 호출. (GameScreen 변경은 버튼 1개 + 호출 1줄 최소.)

## 4. 검증
- EditMode 145/145(컴파일·코어 회귀 없음).
- PlayMode 신규 캡처 `19-collection`(더보기 → 도감 열기) — 그리드·잠금 실루엣·상세 확인. 발견 0 상태 + (가능하면) 일부 발견 주입 상태.
- 시각 — Claude가 스크린샷으로 그리드 셀 크기·잠금 표시·상세 가독성 튜닝.

## 5. 분업
- Codex — `CollectionGallery.cs` 구현(잘 정의된 읽기 UI, 본 노트 + DataCatalog/MetaSaveService/GameScreen 패턴 참조). **스코프 — 이 신규 파일 + GameScreen 더보기 버튼 배선만. unity/ 밖·코어 금지.**
- Claude — 배선 검토, GameScreen 진입 확인, Unity 검증, 레이아웃 스크린샷 튜닝, 정본 반영.

## 진행 기록
- 2026-06-14 — 사용자 방향 → 탐색(데이터·추적·팝업 패턴) → 2 결정(3종·그리드) → 본 설계. 구현 대기.
