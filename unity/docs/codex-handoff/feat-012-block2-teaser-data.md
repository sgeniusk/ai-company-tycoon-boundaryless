# 핸드오프 — feat-012 #2: teaser 36종 + capability category 12종 + tier 부여 (데이터 전용)

대상 — Codex CLI(데이터 전용, 코드 무변경). 자족적 스펙이다. 산출물은 Claude(편집장)가 SO 재시드 + EditMode + 캡처로 검증한다. 설계 정본은 `unity/docs/feat-012-context-notes.md`.

## 목표
정본 `data/products.json` 36종 전체에 `teaser`·`tier`를, `data/capabilities.json` 12종 전체에 `category`를 추가한다. Unity ProductDef/CapabilityDef와 DataImporter는 이미 이 필드를 읽도록 확장돼 있다(없으면 기본값 — React 비파괴 additive).

## 수정 범위 (이 두 파일만)
- `data/products.json` — 각 제품에 두 필드 추가
  - `teaser` (string) — ??? 잠금 상태에서 보여줄 떡밥 한 줄
  - `tier` (int 1~4) — 트리 깊이
- `data/capabilities.json` — 각 능력에 `category` (string) 추가
- **불변** — 기존 키·숫자·순서 전부 유지. UTF-8(BOM 없음), 들여쓰기 기존 그대로. `prerequisite_products`는 이 블록에서 추가하지 않는다(#3 별도).

## teaser 톤 가이드 (중요)
- 한 줄(40자 내외), 호기심 자극, **스포 금지** — 제품명·정확한 기능을 직접 말하지 않는다. 정황·소품·소문으로 암시한다.
- 예시 톤
  - 플라잉 드론 택시 → "하늘을 나는 무언가의 도면이 책상 위에 있습니다."
  - 신약 탐색 → "연구실에서 분자 모형이 밤새 돌아가고 있다는 소문입니다."
  - 휴머노이드 가사로봇 → "누군가 집안일을 대신해 줄 친구를 만들고 있답니다."
- 카이로소프트풍 경쾌한 경영 시뮬 한국어. 기존 description의 톤을 따르되 절대 같은 문장 재사용 금지.
- 종결 어미는 "~입니다/~합니다/~랍니다" 계열 혼용 가능. 문장 끝 콜론 금지.

## tier 부여 기준
- 1 — 차고 시절 첫 제품군(요구 능력 합계 1~2, 예: foundation_model_v0, ai_writing_assistant)
- 2 — 단일 도메인 성장기(요구 능력 합계 3~5)
- 3 — 복합 능력 요구(요구 능력 합계 6~9 또는 능력 3종 이상)
- 4 — 미래 기술(요구 능력 합계 10+ 또는 safety 포함 고난도, 예: household_helper_android, city_robotaxi_mesh)
- 같은 도메인 안에서 요구 능력이 더 큰 제품이 tier가 낮아지는 역전 금지.

## category 부여 (capabilities.json 12종)
값은 다음 4개 중 하나로 통일한다.
- `research` — language, code, vision, audio, video (모델 연구 계열)
- `applied` — agent, optimization, safety (응용·신뢰 계열)
- `industry` — robotics, manufacturing, logistics (산업 계열)
- `business` — enterprise (비즈니스 계열)
위 매핑을 그대로 쓴다(재량 분류 금지 — UI 그룹 헤더가 이 4값을 가정한다).

## 블래스트 반경 확인 (편집 전 필수)
1. `python3 -c "import json; json.load(open('data/products.json')); json.load(open('data/capabilities.json'))"` 파싱 통과.
2. 루트 React `src/`는 이 키들을 모르는 상태가 정상(additive) — React 쪽 수정 금지.
3. 기존 키 diff가 없는지 확인 — 추가만 있어야 한다.

## 하지 않는 것
- Unity 실행 금지(단일 라이선스). SO 재시드·검증은 Claude가 후속 수행.
- 신규 제품 추가 금지(#3에서 별도 웨이브). 코드·테스트 수정 금지. 커밋 금지.

## 완료 보고 형식
- teaser/tier 부여한 36종 id + tier 분포(1~4 각 몇 종)
- category 매핑 12종 표
- JSON 파싱 통과 + "추가만 있음" diff 요약
