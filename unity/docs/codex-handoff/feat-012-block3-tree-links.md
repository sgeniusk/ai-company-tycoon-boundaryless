# 핸드오프 — feat-012 #3: prerequisite_products 연계 + 미래 제품 웨이브 (데이터 전용)

대상 — Codex CLI(데이터 전용, 코드 무변경). 자족적 스펙. 선행 — #2(teaser/tier/category)가 먼저 머지돼 있어야 한다. 산출물은 Claude가 SO 재시드 + TechTreeGraphTests(EditMode)로 검증한다. 설계 정본 `unity/docs/feat-012-context-notes.md`.

## 목표
1. 기존 36종에 `prerequisite_products` 연계를 부여해 트리를 2단에서 3~4단으로 깊게 만든다.
2. 신규 미래 제품 +12~16종(도메인당 1~2, tier 3~4 중심)을 추가한다 — 전부 `teaser` 필수.

## 수정 범위 (이 파일 하나만)
- `data/products.json`
- 기존 제품 — `prerequisite_products` (string[]) 추가만. 기존 키·숫자 불변.
- 신규 제품 — 기존 항목과 같은 전체 스키마 + `teaser`/`tier`/`prerequisite_products` 포함.

## 트리 설계 규칙 (검증 게이트가 강제한다)
- **사이클 금지** — 선행 그래프는 DAG.
- **존재하는 id만 참조** — 자기 참조 금지.
- **tier 단조성** — 선행 제품 tier <= 자기 tier.
- **도달 가능성** — 모든 제품은 능력 max 레벨에서 선행 체인을 따라 출시 가능해야 한다.
- tier 1 제품은 선행 없음(빈 배열 또는 키 생략). tier 2+는 같은 도메인 tier 하위 제품 또는 인접 도메인 핵심 제품 1~2개를 선행으로.
- 선행은 최대 3개. 크로스 도메인 선행은 서사가 자연스러울 때만(예: 자율주행 → 비전 검사기+경로 코파일럿).

## 신규 미래 제품 가이드 (12~16종)
- 후보(설계 노트) — 자율주행 키트, 플라잉 드론 택시, 휴머노이드 가사로봇, AGI 연구 보조, 신약 탐색 엔진, 핵융합 제어 보조 등. 도메인 분포 — 한 도메인에 2종 초과 금지.
- 숫자 밸런스 — 같은 도메인 같은 tier 기존 제품의 launch_cost/base_revenue 범위 안에서, tier 4는 tier 3 상위의 1.5~2.5배 스케일. 임의 폭주 금지.
- required_capabilities는 해당 도메인 unlock_requirements 이상 + tier에 맞는 추가 능력. 능력 id는 capabilities.json의 12종만.
- name/description/teaser 전부 한글, 카이로소프트풍. teaser는 #2 톤 가이드(스포 금지, 40자 내외) 동일 적용.
- id는 snake_case 영문, 기존과 충돌 금지.

## 블래스트 반경 확인 (편집 전 필수)
1. `python3 -c "import json; json.load(open('data/products.json'))"` 파싱 통과.
2. 기존 항목 diff는 `prerequisite_products` 추가만이어야 한다.
3. 루트 React `src/` 수정 금지(additive 키는 React가 무시).

## 하지 않는 것
- Unity 실행 금지. capabilities/domains/events 등 다른 데이터 파일 수정 금지. 코드·테스트 수정 금지. 커밋 금지.

## 완료 보고 형식
- 신규 제품 표 — id / 도메인 / tier / 선행 / teaser
- 기존 36종 선행 부여 요약(도메인별 체인 다이어그램 텍스트)
- 사이클·참조·tier 단조성 자가 검사 결과(간단 파이썬 검사 코드 실행 결과 포함)
