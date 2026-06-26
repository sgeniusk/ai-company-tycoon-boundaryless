# feat-027 신규 오피스 가구 5종 — Codex 크로마키 핸드오프

중간 바닥의 빈 띠를 메울 신규 가구/장식 스프라이트 5종을 feat-024 크로마키 파이프라인으로 양산한다. Claude가 배치 코드(`OfficeProps.cs`)에서 이미 스프라이트 이름을 참조하므로, 반입만 하면 코드 무수정으로 화면에 나타난다.

## 분담 경계 (필독)
- Codex는 이 문서 범위의 **에셋 생성·키잉·반입만** 한다. `.cs`·`progress.md`·`feature_list.json`은 건드리지 않는다(에셋=Codex / 연출·배치 코드=Claude).
- 단일 Unity 라이선스 — 작업 전 `ps -axo command | grep "[U]nity.app" | grep -i projectpath`로 다른 Unity 미실행 확인.

## 대상 5종 (정면 단면 픽셀, feat-020 actor 톤·팔레트 정합)

| 스프라이트 이름 | 무엇 | 배치(코드가 이미 참조) | 크기 가이드 |
|---|---|---|---|
| `prop_rug` | 넓고 낮은 바닥 러그/카펫 | 중앙 바닥, 가장 뒤(직원·가구 아래 깔림) | 가로로 넓게(aspect ≈ 2.5~3), 낮은 높이 |
| `prop_meeting_table` | 회의 테이블 + 의자 몇 개 | 중앙 중간 바닥 | 가로 약간 넓게, 캐릭터보다 낮게 |
| `prop_partition` | 낮은 칸막이/파티션(큐비클 벽) | 우측 중간 바닥 | 세로 낮게, 가로 보통 |
| `prop_plant_big` | 키 큰 화분(잎 무성) | 좌측 중간 바닥 악센트 | 세로로 큼(캐릭터 ~0.8 높이) |
| `prop_shelf_low` | 낮은 수납장/캐비닛 | 후속 배치 여유분(코드 미참조, 반입만) | 가로 보통, 낮게 |

스타일 레퍼런스 — 기존 `Resources/Art/Actors/actor_*`·`prop_*`(feat-020/023/024)의 톤·외곽선·채도. 거친 블록 아닌 feat-024 품질.

## 파이프라인 (feat-024 재사용)

1. **생성** — `codex exec`로 imagegen, **크로마키 배경**(마젠타 `#FF00FF` 또는 녹색 `#00FF00`, 흰배경 금지 — 헤일로). 가구에 키색 침범 금지. 흰색 가전류는 키색과 충분히 분리.
2. **키잉** — `Tools~/pixel_office/feat024/key_props.py`(종횡비 보존, OfficeProps가 aspect만 쓰고 Height 고정 스케일이라 자유). 시트로 묶어 생성 시 슬라이스 후 개별 키잉.
3. **게이트** — `python3 Tools~/pixel_office/feat024/diagnose_halo.py --dir <out> --glob prop_ --thr 198` → **경계 헤일로 0 / semi 0 / 키색잔여 0** PASS 필수.
4. **반입** — `Tools~/pixel_office/feat024/import_props.py`의 NAMES를 5종으로 바꿔 소품 Resources 경로에 반입. **`.meta`는 기존 `prop_*.png.meta` 미러**(Point 필터·Sprite·투명, GUID는 파일명 결정적). IconLibrary가 LoadAll로 자동 조회.
5. **백업** — 원본은 `Tools~/pixel_office/feat027/`(gitignore). AI 생성은 비결정적이라 Resources 가공본이 정본.

## 배선 (코드는 이미 준비됨 — Codex 무수정)
`OfficeProps.cs`가 다음을 이미 참조한다(미반입 시 graceful skip 중) —
- `Rug` 필드 = `prop_rug`
- `MidProps` = `prop_meeting_table`(0.50, footY 205), `prop_partition`(0.70, 198), `prop_plant_big`(0.30, 188) + 기존 `prop_plant`/`prop_bookshelf`
- `prop_shelf_low`는 코드 미참조(여유분) — 반입만 해두면 Claude가 후속 배치.

반입 즉시 자동으로 화면에 뜬다. footY/Height/XNorm 미세 조정(겹침·과밀, 특히 partition 0.70 vs bookshelf 0.84 근접)은 **반입 후 Claude가 캡처 보며** 수행한다.

## 검증 (반입 후 Claude 담당)
- `./init.sh` EditMode 161/161 유지(에셋만, 코드 무변경).
- PlayMode 캡처 `01-main`·`01d-office-rich`·`01f-office-few` 재캡처 → 중간 바닥 채움(러그·회의테이블·파티션·키큰화분) 육안 before/after.

## 정본
설계 `docs/feat-027-office-composition-design.md`, 계획 `docs/feat-027-office-composition-plan.md`.
