# Antigravity Art Brief — AI Company Tycoon: Boundaryless

작성일: 2026-05-22  
상태: 준비 중 / v0.56 블라인드 테스트 P0 이후 제작 착수

## 결론

최종 그래픽 에셋은 **v0.56 블라인드 테스트 P0가 닫힌 뒤** 넣는다.

지금 넣지 않는 이유:

- 현재 가장 큰 리스크는 최종 아트가 아니라 첫 20~30분 플레이 흐름의 재미와 이해도다.
- 최종 아트를 먼저 넣으면 UI/흐름 수정 때 재작업 비용이 커진다.
- 이미 v0.53/v0.54/v0.55에서 원본 임포트, 런타임 정규화, 데스크톱/모바일 스크린샷 QA 경로는 준비됐다.

## 작업 시작 조건

아래 조건이 충족되면 안티그래비티 또는 외부 제작자에게 이 브리프를 넘긴다.

- `v0.56-alpha-playtest-slice-lock`의 자동 리허설 통과
- 실제 5명 블라인드 테스트 기록 작성
- P0 이슈가 없거나, P0 수정 후 재검증 완료
- 첫 화면, 첫 출시, 카드 영향, 경쟁사/직원 사건, 연간 심사 후 2년차 연구/제품 후보 흐름이 유지된다는 판단
- `npm run qa:asset-handoff`가 `Status: 아트 요청 가능`과 `AGY 발송 가능`을 표시

## 목표 스타일

- 고해상도 픽셀아트
- 카이로소프트식 아기자기한 등각 사무실 감각
- 한국 시골 차고에서 시작한 AI 회사의 따뜻하고 약간 혼란스러운 분위기
- 화면 첫인상은 “살아 움직이는 작은 회사”
- 너무 진지한 AI 연구소보다 장난감 같은 경영 시뮬레이션 쪽

## 1차 납품 원본

| Asset | Required Source | Runtime Output | Import Command |
|---|---:|---:|---|
| Character event-pose sheet | 1152×9600 RGBA PNG | 576×4800 PNG | `npm run assets:v053 -- --source <character-source>` |
| Office object sheet | 2560×1920 RGBA PNG | 1280×960 PNG | `npm run assets:v054 -- --objects-source <objects-source> --backdrop-source <backdrop-source>` |
| Isometric office backdrop | 5120×2880 RGBA PNG | 2560×1440 PNG | `npm run assets:v054 -- --objects-source <objects-source> --backdrop-source <backdrop-source>` |

## 캐릭터 시트 계약

- 전체 크기: 1152×9600
- 원본 프레임: 384×384
- 런타임 프레임: 192×192
- 배열: 3열 × 25행, 총 75프레임
- 포즈 행: `idle`, `work`, `card_use`, `cheer`, `alert`
- 투명 배경 필수
- 발 위치와 기준 anchor가 행마다 크게 흔들리지 않아야 함
- 사람 직원, AI 에이전트, 로봇 인력의 실루엣 차이가 작게라도 보여야 함

## 오피스 오브젝트 시트 계약

- 전체 크기: 2560×1920
- 투명 배경 필수
- 책상, 의자, 화이트보드, 서버랙, GPU 장비, 작은 장식물, 차고/초기 사무실 소품 포함
- 오브젝트 하단 기준점이 안정적이어야 함
- 등각 배치에서 앞뒤 깊이가 헷갈리지 않도록 명암과 바닥 접점이 필요

## 오피스 배경 계약

- 전체 크기: 5120×2880
- 런타임: 2560×1440
- 강원 산골 차고/작은 사무실 느낌
- 첫 화면에서 “AI 회사”로 읽히는 최소 단서 필요: 모니터, 화이트보드, 서버 장비, 개발 책상
- UI가 얹힐 수 있으므로 핵심 오브젝트를 화면 가장자리와 하단 HUD 뒤에 몰아넣지 않기
- 너무 어둡거나 흐리거나 배경만 분위기 있는 이미지는 피함

## QA 경로

원본이 들어오면 아래 순서로 검증한다.

```bash
npm run assets:v053 -- --source <character-source>
npm run assets:v054 -- --objects-source <objects-source> --backdrop-source <backdrop-source>
npm run qa:office-visuals:screenshots
npm run harness:gate
```

검수 URL:

- `http://127.0.0.1:5201/?scenario=office-visuals`
- `http://127.0.0.1:5201/?scenario=fresh`
- `http://127.0.0.1:5201/?scenario=launch-impact`

## 합격 기준

- 캐릭터 발 위치가 바닥과 맞음
- `idle`, `work`, `card_use`, `cheer`, `alert`가 구분됨
- 오브젝트가 캐릭터와 충돌하거나 핵심 UI를 가리지 않음
- 배경이 사무실/차고/AI 회사 판타지를 첫 10초 안에 보조함
- 데스크톱 1366×768과 모바일 390×844 스크린샷에서 텍스트와 HUD가 겹치지 않음
- `npm run harness:gate` 통과

## 비목표

- v0.56 블라인드 테스트 전 최종 아트 확정
- 프레임 계약 변경
- 새 캐릭터 수 대량 추가
- 새 gameplay 시스템 추가
- 모바일 전용 아트 별도 제작

## 제작자에게 줄 한 줄 요약

한국 시골 차고에서 시작한 작은 AI 회사가 사람 직원, AI 에이전트, 로봇 인력과 함께 첫 제품을 출시하는 고해상도 픽셀아트 등각 사무실을 만든다. 귀엽지만 너무 장식적이지 않고, 게임 화면에서 직원과 장비가 바로 읽혀야 한다.

## 발송 패킷

실제 발송 전에는 `npm run qa:asset-handoff`를 실행한다. `reports/playtests/v0_56_final_art_handoff_packet.md`가 `Status: 아트 요청 가능`을 보여줄 때만 AGY 또는 외부 제작자에게 전달한다.
