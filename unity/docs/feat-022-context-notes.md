# feat-022 컨텍스트 노트 — 트렌드 콘텐츠 웨이브 (2025-26 AI 트렌드 월드 이벤트)

사용자 방향(2026-06-14) — 콘텐츠 확장(Codex 자율). 기존 30 월드 이벤트(feat-007) 위에 2025-26 AI 트렌드 이벤트 ~12종 추가. 도감·리플레이 다양성 ↑. 데이터 전용, 코어 로직 무변경.

## 0. 정본·제약 (탐색 결과)
- 정본 데이터 — `data/world_events.json`(루트, 30종, React와 공유). `WorldEventDef`(id/title/description/trigger/yearMin·Max/resourceEffects/worldLoreTags). 1회성 효과(year*12월에 발동), 시드 파생 선택(FNV-1a, 연차 게이트 2-10, worldLoreTags 편향, 히스토리 중복방지).
- 추가 경로 — JSON에 추가 → `DataImporter.ImportWorldEvents`(메뉴 AICT/Import Data From JSON 또는 batchmode -executeMethod) → SO 재생성 → DataCatalog.
- **★ 깨지는 테스트(반드시 갱신)** — `WorldEventTests.cs` — (1) `Assert.AreEqual(30, worldEvents.Count)` → N, (2) **시드 교차 픽스처**(we-test/open_source_heaven/chip_war 시드의 연차별 이벤트 ID). 이벤트 추가 시 시드 파생 선택이 바뀌어 픽스처가 변동 → 재생성 필수.
- 패리티 — 픽스처는 React FNV-1a 알고리즘을 정본 데이터에 적용한 기대값. root data를 React와 공유 + Unity==React 알고리즘이므로, 새 데이터로 재산출한 Unity GetSchedule = React 산출(동일 알고리즘). React `src/game/world-events.ts`(node)로 교차 확인 가능(픽스처 생성 스크립트는 없음 → Unity GetSchedule 산출을 정본으로, 가능 시 node 교차 확인).

## 1. 콘텐츠 브리프 (Codex 작성 — data/world_events.json만)
~12종 추가(30→~42). 기존 빈 테마/2025-26 트렌드 채움. 각 이벤트 — 한국어 title·description, trigger(연차+테마 메모), year_range[2..10], resource_effects(cash/users/data/compute/hype/trust/automation/talent 일부), world_lore_tags(기존 태그 재사용 — regulation_heavy/safety_first/open_source_heaven/community_models/embodied_demand/standard_world/chip_war 등).
후보 트렌드(가감 가능) —
1. 에이전틱 AI 붐 — 자율 에이전트 채택 급증(users/hype↑, compute 소모↑).
2. 에이전트 규제 백래시 — 자율행동 책임 논쟁(trust/hype↓, regulation_heavy).
3. 전력·데이터센터 병목 — 전력 제약(compute↓, cash 비용↑, hardware/compute_expensive).
4. 추론비용 붕괴 — 효율 점프로 마진 압박(compute 효율↑·cash 혼합, inference/open_source).
5. 오픈웨이트 규제 클램프 — 가중치 공개 규제(open_source_heaven, 혼합).
6. 합성데이터 책임 — 합성 학습 IP/규제(data↓·규제비용, synthetic_premium/regulation_heavy).
7. 추론 모델 경쟁(o1식) — 리즈닝 경쟁(research/hype↑, compute↑).
8. 컨텍스트 길이 경쟁 — 롱컨텍스트 경쟁(data/hype↑).
9. AI 자금 긴축 우려 — 버블 경계·펀딩 위축(cash↓, standard_world/regulation).
10. 칩 수출 규제 격화 — 수출통제 강화(compute↓, chip_war).
11. 온디바이스 AI 전환 — 엣지 추론(users↑, compute↓).
12. 정렬 연구 호황 — 안전 투자(trust↑·cash 비용, safety_first).
**밸런스** — 연차 2-10 분산, +/- 균형(밸런스 가드 없음 — 한 해 과한 음수 cash 금지). 시작 자원·tier 도달성 게이트 깨지 않게.

## 2. 분업
- **Codex** — `data/world_events.json`에 ~12 이벤트 추가만. JSON 유효성 자체 점검. **테스트·코드·SO·import 실행 금지**(깨짐 — Claude가 처리). unity/ 밖·다른 파일 금지(루트 data/world_events.json은 예외 — 정본).
- **Claude** — import(batchmode) → 카운트 갱신 → 시드 픽스처 재생성(GetSchedule 산출 → 단언 갱신, node 교차 확인) → 밸런스 회귀 점검 → 검증·커밋.

## 3. 검증
- EditMode 145+ (갱신 카운트 + 재생성 픽스처 그린, 결정성·중복방지 유지).
- 표준 런 회귀 — 시작 자원 initialValue 일치, tier 도달성 게이트 그린(밸런스 영향 없음).
- 데이터+테스트만, 코어 로직 무변경.

## 진행 기록
- 2026-06-14 — 사용자 방향(콘텐츠 확장) → 탐색(스키마·정본·픽스처 제약) → 본 설계. Codex 콘텐츠 → Claude import·픽스처 재생성 대기.
