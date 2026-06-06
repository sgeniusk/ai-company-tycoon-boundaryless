# Godot 이행 — 메인 레포로 이전됨

이 게임은 Godot로 이전 중이며, **활성 개발 + 마이그레이션 로드맵의 메인은 Godot 레포**다.

- **메인 레포 (Godot)** `/Users/taewookkim/dev/ai-company-tycoon-godot/`
  - 로드맵 — `docs/godot_migration_strategy.md` · `docs/godot_p1_prototype_spec.md` · `docs/godot_p2_engine_port_design.md`
- **이 웹 레포의 역할 = 포팅 원본 + 오라클 생성기 + 현재 플레이본** (포팅 패리티 도달 후 아카이브).
  - 오라클 하네스 — `src/game/oracle-golden.test.ts` (TS 엔진 실행이라 여기에만 존재)
  - 골든 — `oracle/golden/`에서 생성 → Godot 레포 `oracle-golden/`로 복사되어 C# 패리티가 소비
  - 갱신 — `GEN_GOLDEN=1 npx vitest run src/game/oracle-golden.test.ts` 후 Godot `oracle-golden/`로 재복사

신규 게임 작업은 Godot 레포에서. 이 레포는 엔진 동작의 정답지(oracle)로만 유지.
