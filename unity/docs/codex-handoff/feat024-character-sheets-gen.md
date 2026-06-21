# feat-024 캐릭터 크로마키 시트 생성 핸드오프 (Codex imagegen)

준비 2026-06-21 (Claude). 정본 표준 — [chroma-key-art-regen.md](chroma-key-art-regen.md) + `AGENTS.md` 아트 생성 표준. 이 문서는 **생성 단계(imagegen)** 의 자기완결 스펙이다. 키잉·게이트·반입은 Claude가 완비했다(아래 '후처리' 참조).

## 목표
캐릭터 3종(human/ai/robot) × 5포즈를 **크로마키 배경 시트**로 생성한다. 흰배경을 절대 쓰지 않는다 — 흰끼가 경계에 베이크인돼 투명화 후 헤일로(잔상)가 남고 후처리로 제거 불가(딥리서치 w4bn7b024 확정).

## 출력 (정확히 이 경로·형식)
- `unity/Tools~/pixel_office/feat024/raw_human_sheet.png`
- `unity/Tools~/pixel_office/feat024/raw_ai_sheet.png`
- `unity/Tools~/pixel_office/feat024/raw_robot_sheet.png`

각 시트 = **5포즈 가로 1행** `[idle, work, card_use, cheer, alert]`, 동일 스케일·발 베이스라인 정렬·균일 간격. 권장 해상도 **1536×512 이상**(셀당 ≥300px, 96px로 축소되므로 디테일 여유). 캐릭터 전신이 셀 안에 다 들어오게(잘림 금지).

## 키색 배경 (피사체 주색조와 먼 색)
| 캐릭터 | 키색 배경 | 이유 |
|---|---|---|
| human | **순수 마젠타 `#FF00FF`** | 베이지/녹색조끼라 마젠타와 멂 |
| robot | **순수 마젠타 `#FF00FF`** | 회색/은색이라 마젠타와 멂 |
| ai | **순수 녹색 `#00FF00`** | violet(보라)이 마젠타에 근접 → 녹색 사용 |

프롬프트 말미 고정 문구 — `pure solid <KEYCOLOR> background filling all space between and around the character, absolutely no white, no light gray, no gradient, no shadow on the background`.

## 캐릭터 식별 마커 (레퍼런스 — 같은 폴더 `ref_{char}.png` 첨부, 톤·마커·포즈 일치)
- **human** — 회사원. 갈색 머리, 베이지 피부, **녹색 조끼 + 셔츠/넥타이**, 진청 바지. 친근한 표정.
- **ai** — **violet(보라) 데스크톱 로봇.** 큰 사각 모니터 얼굴(어두운 화면 + 밝은 눈 2개), 둥근 보라 몸통에 **"Ai" 배지**, 머리 위 작은 안테나/센서, 집게손.
- **robot** — **회색/은색 휴머노이드 로봇.** 사각 머리(가로 모니터 눈), 가슴 패널, 관절 팔다리, 한 손에 렌치(C자).

## 5포즈 정의
| 포즈 | 동작 |
|---|---|
| idle | 정면 차렷·대기 |
| work | 작업 중 (human 타이핑 자세, ai 화면 발광·집중, robot 렌치 작업) |
| card_use | 도구/카드를 머리 위로 들어올림 (해금·강화 순간) |
| cheer | 양팔 들어 만세·환호 |
| alert | 놀람 — 양팔 벌리거나 위로, 표정 강조 (이벤트 반응) |

## 키색·순백 금지 제약 (헤일로·키색 침범 방지 — 매우 중요)
1. **캐릭터에 키색을 쓰지 않는다.** human/robot은 마젠타·핫핑크 금지. ai는 녹색·라임 금지(violet 유지). 키색이 캐릭터에 있으면 키잉 때 구멍이 뚫린다.
2. **순백(#FFFFFF) 큰 면적 자제.** 밝은 부분(로봇 하이라이트·화면)도 밝은 회색 **≤ 230** 으로 톤다운. near-white가 경계에 닿으면 헤일로로 오판된다.
3. 안티앨리어스 경계는 무방(후처리가 키색 거리로 처리). 단 배경은 **단일 솔리드 키색**이어야 한다.

## 후처리 (Claude가 이미 완비 — 생성만 넘기면 됨)
1. `key_chroma.py <char> --key magenta|green` — color-to-alpha 키잉 + 키색 잔여 차단(거리 145) + hole-fill + connected-components + 경계 내부색 디컨탬 + premult 96px 리사이즈 + 16색 양자화 + 하드 알파. 출력 `proc_{char}_{pose}.png`.
2. `diagnose_halo.py --dir feat024 --glob proc_` — 게이트. 경계 헤일로/semi/키색잔여 **전부 0이면 PASS**(파일별 키색 인지). 합성 자체검증 15컷 PASS 확인됨.
3. `import_to_resources.py` (feat023) — `proc_*.png` → `Resources/Art/Actors/actor_*.png`, .meta GUID 보존.

## 발사 (둘 중 하나)
- **codex exec** — `codex exec -i ref_human.png "위 human 스펙대로 1536×512 마젠타배경 5포즈 시트를 unity/Tools~/pixel_office/feat024/raw_human_sheet.png 로 저장"` (캐릭터별 3회).
- **대화형 Codex 세션** — 이 문서 + `ref_{char}.png` 첨부해 3장 생성 (feat-020/023 검증 경로).

## 검증 게이트 (생성물 합격 기준)
생성 직후 Claude가 `key_chroma.py` → `diagnose_halo.py` 로 **halo=0 / semi=0 / 키색잔여=0** 확인 + 검증 시트(`_{char}_chroma_check.png`) 육안으로 형태·식별·키색 침범 없음 확인. 통과해야 반입.
