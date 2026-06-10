# 핸드오프 — events.json 13종 한글화 (정본 데이터 로컬라이즈)

대상 — Codex CLI(데이터 전용, 코드 무변경). 자족적 스펙이다. 산출물은 Claude(편집장)가 SO 재시드 + 캡처 검증한다. 선행 사례는 업그레이드 한글화 커밋 `77a5f10`(같은 부분 번역 패턴의 해소).

## 목표
정본 `data/events.json`(루트, Unity가 `../data`로 임포트)의 이벤트 15종 중 영문 13종을 한글화한다. `viral_demo`·`gpu_price_spike` 2종은 이미 한글 — 단 choices까지 완전 한글인지 확인하고 누락이 있으면 함께 채운다.

## 수정 범위 (이 파일 하나만)
- 파일 — `data/events.json`
- 번역 필드 — 각 이벤트의 `name`, `description`, `choices[].text`, `choices[].description`
- **불변 필드** — `id`, `conditions`, `weight`, `choices[].id`, `choices[].effects` (키·숫자 절대 변경 금지)
- JSON 구조·키 순서 유지, UTF-8(BOM 없음), 들여쓰기 기존 그대로

## 번역 톤·용어
- 카이로소프트풍 경쾌한 경영 시뮬 한국어. 기존 한글 이벤트 `viral_demo`와 `data/upgrades.json`의 한글 톤을 그대로 따른다.
- 자원 용어는 정본 `data/resources.json`의 한글 표시명과 일치시킨다(예: trust→그 파일의 표시명). 임의 신조어 금지.
- `choices[].description`의 효과 요약(예: `-5 Trust, -$1500, -5 Hype (but shows responsibility)`)은 숫자·부호 그대로, 자원명만 한글 용어로, 괄호 뉘앙스도 한글로.
- AI 업계 고유명사(GPU, API, 오픈소스 등)는 통용 표기를 따른다.

## 블래스트 반경 확인 (편집 전 필수)
1. `grep -rn "Hallucination Scandal\|Enterprise Contract\|Server Outage" src/ tests/ --include="*.ts" --include="*.tsx"` 와 `grep -rn ... unity/Assets --include="*.cs"` — 영문 이벤트 문자열에 의존하는 **코드/테스트**가 없는지 확인. 코드/테스트 매칭 발견 시에만 수정하지 말고 보고.
2. `unity/Assets/_Project/ScriptableObjects/Events/*.asset` 의 `displayName` 영문 매칭은 **예상된 SO 미러**다(Claude가 JSON 한글화 후 재시드 예정). 이건 차단 사유가 아니다 — 무시하고 진행.
3. 이벤트는 `id`로만 참조되는 게 정상(업그레이드 때와 동일). name/description은 표시 전용.

## 하지 않는 것
- Unity 실행 금지(단일 라이선스 — Claude가 점유 중). SO 재시드(`DataImporter.ImportAll`)와 캡처 검증은 Claude가 후속 수행한다.
- 루트 React `src/`·Unity C# 코드 수정 금지. 커밋 금지(Claude가 검증 후 커밋).

## 완료 보고 형식
- 번역한 이벤트 id 목록 + 블래스트 반경 grep 결과 요약
- `python3 -c "import json; json.load(open('data/events.json'))"` 파싱 통과 확인
