# Retrospective Log — AI Company Tycoon: Boundaryless

## Purpose

This log captures lessons learned, process improvements, and team reflections after every 2 milestones. It helps the production process improve over time.

---

## Format

Each retrospective entry follows this structure:

```markdown
## Retrospective: After Milestone X-Y

### Date: YYYY-MM-DD

### What Went Well
- (positive observations)

### What Could Be Improved
- (process issues, friction points)

### What We Learned
- (insights about the game, tools, or workflow)

### Action Items
- (specific changes to make going forward)

### Process Changes
- (any updates to protocols or workflows)
```

---

## Log Entries

### Retrospective: After Alpha v0.12.6-v0.12.7

**Date:** 2026-05-16

**What Went Well:**
- 경쟁사 대응과 사무실 확장이 모두 “다음 행동”을 만드는 시스템으로 연결됐다.
- 보고서, QA 시나리오, 밸런스 기록을 버전별로 남기는 흐름이 안정화됐다.
- 하네스가 기능 추가를 단순 구현이 아니라 검증 가능한 제작 단위로 묶어 주고 있다.

**What Could Be Improved:**
- 기능이 빠르게 늘면서 첫 10분 화면의 정보량이 많아졌다.
- 상점, 덱, 경쟁, 사무실이 모두 중요해져 신규 플레이어가 우선순위를 잃을 수 있다.

**What We Learned:**
- 회사 경영 판타지는 숫자 성장뿐 아니라 공간 변화가 붙을 때 훨씬 선명해진다.
- 장식 아이템은 단순 수집품보다 “배치해야 효과가 나는 선택지”일 때 게임성이 생긴다.

**Action Items:**
- v0.12.8에서 첫 10분 행동 흐름을 압축한다.
- 상점/사무실 안내는 지금 가능한 행동 중심으로 재배치한다.
- 장식 보너스는 전략형 패밀리로 나눌 준비를 한다.

**Process Changes:**
- 플레이어-facing 시스템을 추가할 때마다 Retention/LTV 관점에서 “첫 10분 안에 언제 보이는가”를 보고서에 명시한다.

### Retrospective: After Milestone 0

**Date:** 2026-05-14

**What Went Well:**
- Production harness created with clear structure
- All agent roles defined before any code was written
- Documentation-first approach ensures shared understanding

**What Could Be Improved:**
- N/A (first milestone, no prior work to compare)

**What We Learned:**
- Defining quality gates before implementation prevents scope creep
- Agent-based review provides multiple useful perspectives

**Action Items:**
- Begin Milestone 1 with confidence in the process
- Ensure DebugValidator is the first script written

**Process Changes:**
- None yet (baseline established)
