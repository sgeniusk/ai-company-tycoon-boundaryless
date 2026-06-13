# feat-020 계획 — 아트 품질 재생성 (AI 이미지 시트 → pixel-art-pipeline → 애니메이션)

사용자 방향(2026-06-14) — 절차 생성 픽셀아트(feat-016~019의 gen_office.py + v090/v091) **퀄리티가 별로**. 대신 **Codex CLI가 pixel-art-look 이미지 시트를 생성**하고, **`pixel-art-pipeline` 스킬로 진짜 고정크기 픽셀아트 자산으로 가공**해 쓴다. **움직임(애니메이션)도** 넣는다. 3시간 뒤 ultracode로 재시작, 코딩은 Sonnet/Codex CLI에 위임 가능.

## 핵심 — 무엇을 바꾸고 무엇을 유지하나
- **유지(feat-019 런타임 시스템)** — 2열 원근 배치(`PlaceActorRow`), juice(StaffBob/WorkLoop/SpeechBubble/CrunchFlame/FloatingText), `AmbientRoomFx`, 그라데이션 스크림, 컷씬, 캡처 하네스 20:9. 새 아트가 이 시스템에 **드롭인**된다.
- **교체(아트 자산)** — 절차 생성 PNG를 AI 생성→파이프라인 가공 픽셀아트로. 추가로 **스프라이트 시트 애니**(직원 idle/타이핑/환호 프레임)로 "움직임" 강화.

## 대상 자산 (우선순위)
1. **직원 액터** (인간/AI/로봇) + **애니 프레임**(idle 2~4프레임, 타이핑/작업, 환호). 가장 눈에 띔. **파일럿 1종 먼저.**
2. **오피스 배경 4종** (차고/성장/데이터센터/랜드마크) — 20:9 세로(현 1440x3204 cover 규격 유지, FLOOR_Y 정합).
3. **가구/책상** — 현재 C# 절차 오클루더 대체 또는 보강용 스프라이트.
4. (선택) 이펙트(불꽃·이모트) 고급화.

## 파이프라인 (pixel-art-pipeline 스킬)
- Codex CLI(또는 가용 이미지 모델)로 pixel-art-look 시트 생성 → 스킬로 **진짜 NxN 픽셀화 + 팔레트 제한 + 투명 배경 + 그리드 제거** → 게임 자산화.
- 애니메이션 — 프레임을 시트로 뽑아 Unity에서 스프라이트 시퀀스(코드 프레임 스왑 또는 Animator)로 재생. 기존 v090 팔레트와 톤 통일.

## ★ 선행 검증 (대량 생성 전 필수)
- **Codex CLI의 실제 이미지 생성 가능 여부 확인.** 과거 메모리 — agy 비대화형 발사 거부, Codex는 *절차 생성*만 성공 검증됨. Codex가 raster 이미지를 못 뽑으면 대안 — (a) 사용자 대화형 이미지 툴, (b) 다른 이미지 생성 MCP, (c) 고급 절차 생성 + 파이프라인 후처리.
- **파일럿 먼저** — 직원 1종 + idle 애니만 생성·가공·Unity 반입·캡처 검증 → 품질 OK 확인 후 나머지로 확장. 품질 미달이면 멈추고 사용자에게 보고.

## 분업 (ultracode)
- Claude(편집장) — 오케스트레이션, 파이프라인 가공, Unity 통합·검증, 정본 반영.
- Codex CLI 5.5 xhigh — 이미지 시트 생성, grunt 코딩.
- Sonnet — 코딩 위임 가능(사용자 허용).
- dynamic workflow — 자산별 생성→가공→검증 파이프라인 + 적대 리뷰.

## 검증
- 생성/가공 자산 육안(Read PNG) — 진짜 픽셀(정사각·팔레트·투명) 확인.
- Unity EditMode 145/145 + PlayMode 캡처(01d-office-rich 등)로 합성·애니 확인. 시작 전 다른 Unity 미실행 `ps` 확인(단일 라이선스).
- 로컬 커밋만, push는 사용자 확인.

## 재시작 절차 (3시간 뒤 런)
1. `cd /Users/taewookkim/dev/ai-company-tycoon/unity`, `git log`로 feat-019(83e8e67) 확인, `ps`로 Unity 미실행 확인.
2. 이 문서 + `pixel-art-pipeline` 스킬 로드. feat-020 feature_list 등록.
3. **선행 검증(Codex 이미지 생성 가능?)** → 파일럿(직원 1종 애니) → 품질 게이트 → 확장.
4. ultracode workflow로 자산별 파이프라인 + Unity 통합 + 캡처 검증 + 트랙별 커밋.
