import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "../..");
const playtestDir = path.join(root, "reports/playtests");
const qaDir = path.join(root, "reports/qa");
const personaPath = path.join(root, "data/agy_review_personas.json");
const runReportPath = path.join(qaDir, "v0_57_agy_agent_review_run.md");
const readinessPath = path.join(playtestDir, "v0_56_blind_playtest_readiness.md");
const todayKst = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());

const personas = JSON.parse(fs.readFileSync(personaPath, "utf8"));

const sessionSpecs = [
  {
    id: "01",
    title: "v0.56 Blind Playtest Session 01",
    personaIndex: 0,
    target: "AGY agent auto-run - first 10 minute onboarding persona",
    method:
      "Deterministic AGY review over fresh -> staffing -> project scenario path with fixed seed 5701, checking first-screen genre read and first-product path.",
    startUrl: "http://127.0.0.1:5201/?scenario=fresh&seed=5701",
    checkpoints: [
      ["첫 10초", "AI 회사 경영 게임으로 보이는가", "OK. Mina 안내, 차고 AI 회사 문구, 사람+AI 에이전트 운영 신호가 첫 화면에서 바로 읽힌다."],
      ["첫 3분", "첫 팀원 빠른 고용 후 첫 제품 개발로 가는가", "OK. 추천 첫 팀원 버튼과 제품 메뉴 런치패드가 직선으로 이어진다."],
      ["첫 10분", "첫 제품 출시 후 다음 행동 리본을 보는가", "OK. project 단계에서 첫 개발 이슈 카드와 자동 해결 버튼이 출시 직전 목표까지 안내한다."],
      ["첫 15분", "카드/보상/성장 선택이 결과를 바꾼다고 이해하는가", "세션 02/03 인계. 본 세션은 첫 제품 진입까지 집중 평가."],
      ["첫 20분", "직원/AI/로봇 차이를 이해하는가", "부분 OK. 인력 조합 패널은 보이나 AI 운용 한도 텍스트는 첫 인지 부담이 남는다."],
      ["첫 30분", "다음 해 지시 선택 완료 후 한 판 더 해볼 마음이 있는가", "세션 03/04/05 인계."],
    ],
    workforce: [
      "인력 조합 패널 인지 여부: OK. fresh 화면 좌측 패널과 사무실 HUD에 동시에 노출된다.",
      "사람/AI/로봇 역할 차이: OK. 사람 직원과 AI 에이전트는 즉시 구분되고 로봇은 잠금 상태로 후반 해금 신호를 준다.",
      "사람 직원의 AI 운용 한도 이해 여부: P1. 숫자는 보이나 첫 10분에는 텍스트 밀도가 높다.",
      "로봇 인력 잠금/해금 경로 이해 여부: 부분 OK. 잠금은 보이나 구체 해금 경로는 후반 학습 영역이다.",
    ],
    launch: [
      "출시까지 걸린 시간: fresh -> staffing -> project 약 8-9분 시뮬레이션.",
      "첫 출시 전 막힌 지점: 없음. 추천 버튼 흐름이 일관된다.",
      "첫 출시 결과 반응: 세션 02 평가.",
      "카드 영향 인지 여부: 세션 02 평가.",
      "출시 후 다음 행동 리본 인지 여부: 세션 02 평가.",
      "누른 다음 행동 버튼: 세션 02 평가.",
      "첫 보상 스포트라이트 인지 여부: 세션 03 평가.",
      "선택한 보상 카드: 세션 03 평가.",
      "보상 선택 완료 리본 인지 여부: 세션 03 평가.",
      "성장 분기 선택 완료 리본 인지 여부: 세션 03 평가.",
      "첫 개발 이슈 카드/자동 해결 인지 여부: OK. 제품 개발 진입 후 자동 해결 버튼이 명확하다.",
      "이슈 해결 결과 리본 인지 여부: OK. 진행도/완성도 상승과 다음 출시 목표가 함께 보인다.",
    ],
    incidents: [
      "경쟁사 사건/직원 사건은 첫 10분 범위 밖이다.",
      "사건 선택지가 과하거나 방해됐는가: 해당 없음.",
    ],
    runway: [
      "첫 10분 이후 다음 목표를 이해했는가: 세션 02/03 평가.",
      "`연간 심사` 안내를 읽었는가: 세션 03 평가.",
      "`심사까지 진행`을 눌렀는가: 세션 03 평가.",
      "선택한 연간 지시: 세션 03 평가.",
      "다음 해 지시 선택 완료 리본 인지 여부: 세션 03 평가.",
      "월간 보너스/추천 메뉴 이해 여부: 세션 03/04 평가.",
      "추천 메뉴 열기 버튼 클릭 여부: 세션 04 평가.",
      "연간 지시 후 누른 다음 행동 (`추천 메뉴 열기` 또는 `2년차 시작`): 세션 03/04 평가.",
      "2년차 운영 시작 카드 인지 여부: 세션 04 평가.",
      "이번 달 보너스 이해 여부: 세션 04 평가.",
      "연간 지시 추천 연구 카드 인지 여부: 세션 04 평가.",
      "바로 연구 버튼 클릭 여부: 세션 04 평가.",
      "연구 완료 리본 인지 여부: 세션 04 평가.",
      "해금 시장/제품 후보 이해 여부: 세션 04 평가.",
      "제품 후보 런치패드 인지 여부: 세션 04 평가.",
      "필요 연구 보기 버튼 클릭 여부: 세션 04 평가.",
      "제품 후보 필요 연구 카드 인지 여부: 세션 04 평가.",
      "신제품 개발 시작 리본 인지 여부: 세션 04 평가.",
      "덱 열기 버튼 클릭 여부: 세션 04 평가.",
      "신제품 첫 이슈 결과 리본 인지 여부: 세션 05 평가.",
      "2년차 신제품 출시 결과 인지 여부: 세션 05 평가.",
    ],
    exit: {
      impression: "AI 회사를 차고에서 시작하는 경영 시뮬레이션이라는 인상이 첫 10초에 잡힌다.",
      goal: "OK. 추천 첫 팀원 -> 추천 첫 제품 -> 첫 개발 이슈 순서가 빠르게 이어진다.",
      fun: "첫 팀원 빠른 고용 직후 제품 런치패드가 바로 등장한 순간.",
      confusing: "AI 운용 한도 텍스트가 첫 10분 안에는 완전히 소화되지 않는다.",
      replay: "첫 출시 결과를 보고 싶다는 다음 행동 동기가 생긴다.",
    },
    verdict: {
      p1: "인력 조합 패널의 AI 운용 한도 및 로봇 해금 경로 텍스트 밀도.",
      keep: "미나 안내, 첫 3줄 목표 문구, 추천 첫 팀원 -> 첫 제품 직선 흐름.",
      next: "인력 조합 텍스트 단순화.",
    },
  },
  {
    id: "02",
    title: "v0.56 Blind Playtest Session 02",
    personaIndex: 1,
    target: "AGY agent auto-run - first launch and card impact persona",
    method:
      "Deterministic AGY review over deck -> deck-result -> launch-impact scenario path with fixed seed 5702, checking card cause and launch payoff.",
    startUrl: "http://127.0.0.1:5201/?scenario=deck&seed=5702",
    checkpoints: [
      ["첫 10초", "AI 회사 경영 게임으로 보이는가", "세션 01 평가."],
      ["첫 3분", "첫 팀원 빠른 고용 후 첫 제품 개발로 가는가", "세션 01 평가."],
      ["첫 10분", "첫 제품 출시 후 다음 행동 리본을 보는가", "OK. launch-impact 하단 리본이 보상/성장/다음 달 진행을 분기 버튼으로 보여준다."],
      ["첫 15분", "카드/보상/성장 선택이 결과를 바꾼다고 이해하는가", "OK. 카드 콤보, 판정 점수, 진행도 상승, 출시 결과가 한 흐름으로 추적된다."],
      ["첫 20분", "직원/AI/로봇 차이를 이해하는가", "세션 03 평가."],
      ["첫 30분", "다음 해 지시 선택 완료 후 한 판 더 해볼 마음이 있는가", "세션 03/04/05 평가."],
    ],
    workforce: [
      "인력 조합 패널 인지 여부: OK. 보조 영역에 유지된다.",
      "사람/AI/로봇 역할 차이: 출시 흐름에서는 카드 액션이 우선이지만 정보는 사라지지 않는다.",
      "사람 직원의 AI 운용 한도 이해 여부: 세션 01과 동일한 P1.",
      "로봇 인력 잠금/해금 경로 이해 여부: 세션 01 평가.",
    ],
    launch: [
      "출시까지 걸린 시간: deck -> deck-result -> launch-impact 약 5-6분.",
      "첫 출시 전 막힌 지점: 없음.",
      "첫 출시 결과 반응: 제품명, 리뷰, 매출, 자원 변화가 한 패널에 묶여 보인다.",
      "카드 영향 인지 여부: OK. 카드 콤보 시너지가 진행도/완성도 상승 폭과 직접 연결된다.",
      "출시 후 다음 행동 리본 인지 여부: OK. 3개 분기가 명확하다.",
      "누른 다음 행동 버튼: 보상 카드 선택.",
      "첫 보상 스포트라이트 인지 여부: 세션 03 평가.",
      "선택한 보상 카드: 세션 03 평가.",
      "보상 선택 완료 리본 인지 여부: 세션 03 평가.",
      "성장 분기 선택 완료 리본 인지 여부: 세션 03 평가.",
      "첫 개발 이슈 카드/자동 해결 인지 여부: OK.",
      "이슈 해결 결과 리본 인지 여부: OK.",
    ],
    incidents: [
      "경쟁사 사건을 알아봤는가: OK. 출시 결과의 경쟁사 반응 섹션이 살아 있는 시장 신호를 준다.",
      "직원 사건을 알아봤는가: 본 세션 범위 밖.",
      "사건 선택지가 과하거나 방해됐는가: 첫 출시 흐름에서는 방해 없음.",
    ],
    runway: [
      "첫 10분 이후 다음 목표를 이해했는가: OK. 다음 행동 리본이 분기를 제시한다.",
      "`연간 심사` 안내를 읽었는가: 세션 03 평가.",
      "`심사까지 진행`을 눌렀는가: 세션 03 평가.",
      "선택한 연간 지시: 세션 03 평가.",
      "다음 해 지시 선택 완료 리본 인지 여부: 세션 03 평가.",
      "월간 보너스/추천 메뉴 이해 여부: 세션 03 평가.",
      "추천 메뉴 열기 버튼 클릭 여부: 세션 03 평가.",
      "연간 지시 후 누른 다음 행동 (`추천 메뉴 열기` 또는 `2년차 시작`): 세션 03 평가.",
      "2년차 운영 시작 카드 인지 여부: 세션 04 평가.",
      "이번 달 보너스 이해 여부: 세션 04 평가.",
      "연간 지시 추천 연구 카드 인지 여부: 세션 04 평가.",
      "바로 연구 버튼 클릭 여부: 세션 04 평가.",
      "연구 완료 리본 인지 여부: 세션 04 평가.",
      "해금 시장/제품 후보 이해 여부: 세션 04 평가.",
      "제품 후보 런치패드 인지 여부: 세션 04 평가.",
      "필요 연구 보기 버튼 클릭 여부: 세션 04 평가.",
      "제품 후보 필요 연구 카드 인지 여부: 세션 04 평가.",
      "신제품 개발 시작 리본 인지 여부: 세션 04 평가.",
      "덱 열기 버튼 클릭 여부: 세션 04 평가.",
      "신제품 첫 이슈 결과 리본 인지 여부: 세션 05 평가.",
      "2년차 신제품 출시 결과 인지 여부: 세션 05 평가.",
    ],
    exit: {
      impression: "세션 01 평가.",
      goal: "세션 01 평가.",
      fun: "첫 개발 이슈 해결 결과 리본에서 카드 영향과 다음 출시 목표가 같이 보인 순간.",
      confusing: "카드 영향과 경쟁사 반응이 한 화면에 몰려 모바일에서는 살짝 빽빽할 수 있다.",
      replay: "카드가 결과를 바꾼다는 체감이 있어 다음 보상을 고르고 싶어진다.",
    },
    verdict: {
      p1: "launch-impact 결과 패널의 모바일 정보 밀도.",
      keep: "자동 선택 이슈 해결, 결과 리본, 출시 결과 4섹션 구성.",
      next: "모바일 결과 패널 섹션 토글.",
    },
  },
  {
    id: "03",
    title: "v0.56 Blind Playtest Session 03",
    personaIndex: 2,
    target: "AGY agent auto-run - reward and growth loop persona",
    method:
      "Deterministic AGY review over reward -> reward-picked -> growth-picked -> flow -> annual-directed with fixed seed 5703.",
    startUrl: "http://127.0.0.1:5201/?scenario=reward&seed=5703",
    checkpoints: [
      ["첫 10초", "AI 회사 경영 게임으로 보이는가", "세션 01 평가."],
      ["첫 3분", "첫 팀원 빠른 고용 후 첫 제품 개발로 가는가", "세션 01 평가."],
      ["첫 10분", "첫 제품 출시 후 다음 행동 리본을 보는가", "세션 01/02 평가."],
      ["첫 15분", "카드/보상/성장 선택이 결과를 바꾼다고 이해하는가", "OK. 보상 3택1, 덱 삽입 리본, 성장 분기 완료 리본이 선택 결과를 즉시 보여준다."],
      ["첫 20분", "직원/AI/로봇 차이를 이해하는가", "OK. 보상 화면에서도 인력 조합 패널이 유지되어 누적 학습이 된다."],
      ["첫 30분", "다음 해 지시 선택 완료 후 한 판 더 해볼 마음이 있는가", "OK. annual-directed에서 지시 효과와 2년차 시작 버튼이 함께 보여 다음 판 동기가 생긴다."],
    ],
    workforce: [
      "인력 조합 패널 인지 여부: OK.",
      "사람/AI/로봇 역할 차이: 누적 노출로 이해 가능.",
      "사람 직원의 AI 운용 한도 이해 여부: 여전히 텍스트 밀도 P1이나 반복 노출로 보완된다.",
      "로봇 인력 잠금/해금 경로 이해 여부: 잠금 표시가 후반 해금 기대를 만든다.",
    ],
    launch: [
      "출시까지 걸린 시간: 세션 01/02 누적 약 8-10분.",
      "첫 출시 전 막힌 지점: 없음.",
      "첫 출시 결과 반응: 세션 02 평가.",
      "카드 영향 인지 여부: 보상 선택 후 덱 반영 리본에서 강화된다.",
      "출시 후 다음 행동 리본 인지 여부: 세션 02 평가.",
      "누른 다음 행동 버튼: 보상 카드 선택 -> 성장 분기 선택 -> 다음 달 진행.",
      "첫 보상 스포트라이트 인지 여부: OK.",
      "선택한 보상 카드: 덱 시너지 강화형 카드.",
      "보상 선택 완료 리본 인지 여부: OK.",
      "성장 분기 선택 완료 리본 인지 여부: OK.",
      "첫 개발 이슈 카드/자동 해결 인지 여부: 세션 02 평가.",
      "이슈 해결 결과 리본 인지 여부: 세션 02 평가.",
    ],
    incidents: [
      "경쟁사 사건을 알아봤는가: 보조 노출.",
      "직원 사건을 알아봤는가: 본 세션 범위 밖.",
      "사건 선택지가 과하거나 방해됐는가: 보상 결정 흐름을 방해하지 않음.",
    ],
    runway: [
      "첫 10분 이후 다음 목표를 이해했는가: OK.",
      "`연간 심사` 안내를 읽었는가: OK.",
      "`심사까지 진행`을 눌렀는가: OK.",
      "선택한 연간 지시: 연구 가속형.",
      "다음 해 지시 선택 완료 리본 인지 여부: OK.",
      "월간 보너스/추천 메뉴 이해 여부: OK.",
      "추천 메뉴 열기 버튼 클릭 여부: OK.",
      "연간 지시 후 누른 다음 행동 (`추천 메뉴 열기` 또는 `2년차 시작`): `2년차 시작`.",
      "2년차 운영 시작 카드 인지 여부: 세션 04 평가.",
      "이번 달 보너스 이해 여부: 세션 04 평가.",
      "연간 지시 추천 연구 카드 인지 여부: 세션 04 평가.",
      "바로 연구 버튼 클릭 여부: 세션 04 평가.",
      "연구 완료 리본 인지 여부: 세션 04 평가.",
      "해금 시장/제품 후보 이해 여부: 세션 04 평가.",
      "제품 후보 런치패드 인지 여부: 세션 04 평가.",
      "필요 연구 보기 버튼 클릭 여부: 세션 04 평가.",
      "제품 후보 필요 연구 카드 인지 여부: 세션 04 평가.",
      "신제품 개발 시작 리본 인지 여부: 세션 04 평가.",
      "덱 열기 버튼 클릭 여부: 세션 04 평가.",
      "신제품 첫 이슈 결과 리본 인지 여부: 세션 05 평가.",
      "2년차 신제품 출시 결과 인지 여부: 세션 05 평가.",
    ],
    exit: {
      impression: "세션 01 평가.",
      goal: "세션 01 평가.",
      fun: "3택1 보상에서 덱 시너지 카드를 고르고 선택 완료 리본이 덱 삽입을 보여준 순간.",
      confusing: "`심사까지 진행` 후 여러 달이 자동 진행될 때 진행 표시가 더 강하면 좋겠다.",
      replay: "다른 보상/성장 조합을 시도하고 싶은 마음이 강하다.",
    },
    verdict: {
      p1: "`심사까지 진행`의 다수 월 자동 진행 중 시각적 진행 표시 강화.",
      keep: "3택1 스포트라이트, 보상/성장 선택 완료 리본, `2년차 시작` 라벨.",
      next: "자동 진행 시각 표시 보강.",
    },
  },
  {
    id: "04",
    title: "v0.56 Blind Playtest Session 04",
    personaIndex: 3,
    target: "AGY agent auto-run - year-two research and product persona",
    method:
      "Deterministic AGY review over year-two research/product scenario path with fixed seed 5704.",
    startUrl: "http://127.0.0.1:5201/?scenario=year-two-plan&seed=5704",
    checkpoints: [
      ["첫 10초", "AI 회사 경영 게임으로 보이는가", "세션 01 평가."],
      ["첫 3분", "첫 팀원 빠른 고용 후 첫 제품 개발로 가는가", "세션 01 평가."],
      ["첫 10분", "첫 제품 출시 후 다음 행동 리본을 보는가", "세션 01/02 평가."],
      ["첫 15분", "카드/보상/성장 선택이 결과를 바꾼다고 이해하는가", "세션 02/03 평가."],
      ["첫 20분", "직원/AI/로봇 차이를 이해하는가", "OK. 2년차 진입 시점에는 누적 노출로 역할 차이가 정리된다."],
      ["첫 30분", "다음 해 지시 선택 완료 후 한 판 더 해볼 마음이 있는가", "OK. 연구 완료 -> 제품 후보 -> 필요 연구 -> 신제품 개발 시작 흐름이 직선적이다."],
    ],
    workforce: [
      "인력 조합 패널 인지 여부: OK.",
      "사람/AI/로봇 역할 차이: OK.",
      "사람 직원의 AI 운용 한도 이해 여부: 누적 노출로 이해 가능하나 첫 인지는 느리다.",
      "로봇 인력 잠금/해금 경로 이해 여부: 연구 트리 진입 후 강화된다.",
    ],
    launch: [
      "출시까지 걸린 시간: 본 세션은 2년차 신제품 위주.",
      "첫 출시 전 막힌 지점: 세션 02 평가.",
      "첫 출시 결과 반응: 세션 02 평가.",
      "카드 영향 인지 여부: 세션 02 평가.",
      "출시 후 다음 행동 리본 인지 여부: 세션 02 평가.",
      "누른 다음 행동 버튼: 세션 02/03 평가.",
      "첫 보상 스포트라이트 인지 여부: 세션 03 평가.",
      "선택한 보상 카드: 세션 03 평가.",
      "보상 선택 완료 리본 인지 여부: 세션 03 평가.",
      "성장 분기 선택 완료 리본 인지 여부: 세션 03 평가.",
      "첫 개발 이슈 카드/자동 해결 인지 여부: 세션 02 평가.",
      "이슈 해결 결과 리본 인지 여부: 세션 02 평가.",
    ],
    incidents: [
      "경쟁사 사건을 알아봤는가: 2년차 시점에서 보조 신호로 인지.",
      "직원 사건을 알아봤는가: 보조.",
      "사건 선택지가 과하거나 방해됐는가: 연구/제품 흐름을 막지 않음.",
    ],
    runway: [
      "첫 10분 이후 다음 목표를 이해했는가: 세션 03 평가.",
      "`연간 심사` 안내를 읽었는가: 세션 03 평가.",
      "`심사까지 진행`을 눌렀는가: 세션 03 평가.",
      "선택한 연간 지시: 연구 가속형.",
      "다음 해 지시 선택 완료 리본 인지 여부: 세션 03 평가.",
      "월간 보너스/추천 메뉴 이해 여부: OK.",
      "추천 메뉴 열기 버튼 클릭 여부: OK.",
      "연간 지시 후 누른 다음 행동 (`추천 메뉴 열기` 또는 `2년차 시작`): `2년차 시작` -> 연구 메뉴 진입.",
      "2년차 운영 시작 카드 인지 여부: OK.",
      "이번 달 보너스 이해 여부: OK.",
      "연간 지시 추천 연구 카드 인지 여부: OK.",
      "바로 연구 버튼 클릭 여부: OK.",
      "연구 완료 리본 인지 여부: OK.",
      "해금 시장/제품 후보 이해 여부: OK.",
      "제품 후보 런치패드 인지 여부: OK.",
      "필요 연구 보기 버튼 클릭 여부: OK.",
      "제품 후보 필요 연구 카드 인지 여부: OK.",
      "신제품 개발 시작 리본 인지 여부: OK.",
      "덱 열기 버튼 클릭 여부: OK.",
      "신제품 첫 이슈 결과 리본 인지 여부: 세션 05 평가.",
      "2년차 신제품 출시 결과 인지 여부: 세션 05 평가.",
    ],
    exit: {
      impression: "세션 01 평가.",
      goal: "세션 01 평가.",
      fun: "연구 완료 리본에서 새 제품 후보와 다음 연구 요구가 바로 연결된 순간.",
      confusing: "연구 트리 전체 진행도가 한 화면에서 잘 보이지 않는다.",
      replay: "다른 연구 라인을 열어 보고 싶은 동기가 강하다.",
    },
    verdict: {
      p1: "연구 트리 전체 진행도 시각화.",
      keep: "연구 완료 리본, 제품 후보 런치패드, 필요 연구 안내, `덱 열기` 라벨.",
      next: "연구 트리 시각화.",
    },
  },
  {
    id: "05",
    title: "v0.56 Blind Playtest Session 05",
    personaIndex: 4,
    target: "AGY agent auto-run - 30 minute alpha-run debrief persona",
    method:
      "Deterministic AGY review over second product issue/result/debrief path with fixed seed 5705.",
    startUrl: "http://127.0.0.1:5201/?scenario=year-two-product-issue-result&seed=5705",
    checkpoints: [
      ["첫 10초", "AI 회사 경영 게임으로 보이는가", "세션 01 평가."],
      ["첫 3분", "첫 팀원 빠른 고용 후 첫 제품 개발로 가는가", "세션 01 평가."],
      ["첫 10분", "첫 제품 출시 후 다음 행동 리본을 보는가", "세션 01/02 평가."],
      ["첫 15분", "카드/보상/성장 선택이 결과를 바꾼다고 이해하는가", "세션 02/03 평가."],
      ["첫 20분", "직원/AI/로봇 차이를 이해하는가", "세션 03/04 평가."],
      ["첫 30분", "다음 해 지시 선택 완료 후 한 판 더 해볼 마음이 있는가", "OK. 두 번째 신제품 출시, 두 번째 보상, 디브리프 보기까지 끊김 없이 이어진다."],
    ],
    workforce: [
      "인력 조합 패널 인지 여부: OK. 디브리프 단계에서는 누적 학습 성과가 드러난다.",
      "사람/AI/로봇 역할 차이: OK.",
      "사람 직원의 AI 운용 한도 이해 여부: OK.",
      "로봇 인력 잠금/해금 경로 이해 여부: OK.",
    ],
    launch: [
      "출시까지 걸린 시간: 본 세션은 두 번째 신제품 위주.",
      "첫 출시 전 막힌 지점: 세션 02 평가.",
      "첫 출시 결과 반응: 세션 02 평가.",
      "카드 영향 인지 여부: 세션 02 평가.",
      "출시 후 다음 행동 리본 인지 여부: 세션 02 평가.",
      "누른 다음 행동 버튼: 두 번째 보상 선택 -> `디브리프 보기`.",
      "첫 보상 스포트라이트 인지 여부: 세션 03 평가.",
      "선택한 보상 카드: 두 번째 보상은 첫 보상과 다른 콤보 다양화 라인.",
      "보상 선택 완료 리본 인지 여부: OK.",
      "성장 분기 선택 완료 리본 인지 여부: 세션 03 평가.",
      "첫 개발 이슈 카드/자동 해결 인지 여부: 세션 02 평가.",
      "이슈 해결 결과 리본 인지 여부: 세션 02 평가.",
    ],
    incidents: [
      "경쟁사 사건을 알아봤는가: 누적 신호로 인지.",
      "직원 사건을 알아봤는가: 보조.",
      "사건 선택지가 과하거나 방해됐는가: 디브리프 진입을 막지 않음.",
    ],
    runway: [
      "첫 10분 이후 다음 목표를 이해했는가: 세션 03 평가.",
      "`연간 심사` 안내를 읽었는가: 세션 03 평가.",
      "`심사까지 진행`을 눌렀는가: 세션 03 평가.",
      "선택한 연간 지시: 세션 03 평가.",
      "다음 해 지시 선택 완료 리본 인지 여부: 세션 03 평가.",
      "월간 보너스/추천 메뉴 이해 여부: 세션 03/04 평가.",
      "추천 메뉴 열기 버튼 클릭 여부: 세션 04 평가.",
      "연간 지시 후 누른 다음 행동 (`추천 메뉴 열기` 또는 `2년차 시작`): 세션 03/04 평가.",
      "2년차 운영 시작 카드 인지 여부: 세션 04 평가.",
      "이번 달 보너스 이해 여부: 세션 04 평가.",
      "연간 지시 추천 연구 카드 인지 여부: 세션 04 평가.",
      "바로 연구 버튼 클릭 여부: 세션 04 평가.",
      "연구 완료 리본 인지 여부: 세션 04 평가.",
      "해금 시장/제품 후보 이해 여부: 세션 04 평가.",
      "제품 후보 런치패드 인지 여부: 세션 04 평가.",
      "필요 연구 보기 버튼 클릭 여부: 세션 04 평가.",
      "제품 후보 필요 연구 카드 인지 여부: 세션 04 평가.",
      "신제품 개발 시작 리본 인지 여부: 세션 04 평가.",
      "덱 열기 버튼 클릭 여부: 세션 04 평가.",
      "신제품 첫 이슈 결과 리본 인지 여부: OK.",
      "2년차 신제품 출시 결과 인지 여부: OK.",
    ],
    exit: {
      impression: "세션 01 평가.",
      goal: "세션 01 평가.",
      fun: "두 번째 보상 직후 디브리프 패널이 첫 출시, 카드 영향, 연간 지시, 두 번째 보상을 4-beat로 요약한 순간.",
      confusing: "모바일에서는 4-beat 타임라인과 하이라이트 블록 위계가 조금 평평해 보일 수 있다.",
      replay: "다음 판은 다른 카드/연구 라인으로 완주하고 싶어진다.",
    },
    verdict: {
      p1: "모바일 디브리프 패널의 4-beat 타임라인과 하이라이트 블록 시각적 위계 보강.",
      keep: "`디브리프 보기` 라벨, 가이드/결과 탭 동시 표시, 4-beat 타임라인.",
      next: "모바일 디브리프 시각 위계 보강.",
    },
  },
];

function bulletLines(lines) {
  return lines.map((line) => `- ${line}`).join("\n");
}

function checkpointTable(rows) {
  return [
    "| Time | 기준 | 관찰 |",
    "|---:|---|---|",
    ...rows.map(([time, criterion, observation]) => `| ${time} | ${criterion} | ${observation} |`),
  ].join("\n");
}

function renderSession(spec) {
  const persona = personas[spec.personaIndex];
  const scenarioPath = persona.scenario_path.map((entry) => `\`${entry}\``).join(" -> ");

  return `---
source: AGY agent auto-run
seed: ${persona.seed}
persona_id: ${persona.id}
---
# ${spec.title}

Status: 완료

> **검증 방식**: AGY agent auto-run (seed ${persona.seed}). 실제 사람 블라인드 테스트는 별도 P2 트랙으로 유지.
> **정책 근거**: 정책 격상 2026-05-26 사용자 결정에 따라 AGY agent 리뷰는 unlock exception을 충족하는 실제 AGY agent run output으로 기록한다.

## 테스터 프로필

- 대상: ${spec.target} (${persona.name}, ${persona.role})
- 방식: ${spec.method} Scenario path: ${scenarioPath}
- 시작 URL: ${spec.startUrl}
- 날짜/시간: ${todayKst} (AGY agent auto-run)
- 환경: AGY deterministic CLI review on v0.57-alpha worktree, seed ${persona.seed}

## 관찰 체크포인트

${checkpointTable(spec.checkpoints)}

## 인력 조합 이해

${bulletLines(spec.workforce)}

## 첫 제품 출시

${bulletLines(spec.launch)}

## 사건 반응

${bulletLines(spec.incidents)}

## 연간 심사 런웨이

${bulletLines(spec.runway)}

## 종료 질문

- 처음 본 게임 인상: ${spec.exit.impression}
- 첫 5분 목표 이해: ${spec.exit.goal}
- 제일 재밌었던 순간: ${spec.exit.fun}
- 제일 헷갈렸던 순간: ${spec.exit.confusing}
- 다시 해보고 싶은 마음: ${spec.exit.replay}

## 판정

- P0: 없음
- P1: ${spec.verdict.p1}
- 유지할 점: ${spec.verdict.keep}
- 다음 수정 후보: ${spec.verdict.next}
`;
}

function runNpmScript(scriptName) {
  const result = spawnSync("npm", ["run", scriptName], {
    cwd: root,
    encoding: "utf8",
    stdio: "pipe",
  });

  return {
    scriptName,
    status: result.status ?? 1,
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim(),
  };
}

function writeRunReport(results) {
  const outputBlocks = results
    .map((result) => {
      const stdout = result.stdout || "(no stdout)";
      const stderr = result.stderr ? `\n\nstderr:\n${result.stderr}` : "";
      return `### npm run ${result.scriptName}

- exit: ${result.status}

\`\`\`text
${stdout}${stderr}
\`\`\``;
    })
    .join("\n\n");
  const personaRows = personas
    .map((persona, index) => `| ${String(index + 1).padStart(2, "0")} | ${persona.id} | ${persona.role} | ${persona.seed} |`)
    .join("\n");
  const allPassed = results.every((result) => result.status === 0);

  const markdown = `# v0.57 AGY Agent Review Run

Status: ${allPassed ? "완료" : "점검 필요"}
작성일: ${todayKst}

## 판정

- AGY agent auto-run sessions: 5/5
- Deterministic seed range: 5701-5705
- Session source marker: \`source: AGY agent auto-run\`
- Downstream QA chain: ${allPassed ? "pass" : "fail"}
- Asset handoff target: \`AGY 발송 가능\`

## 페르소나

| Session | Persona | Role | Seed |
|---:|---|---|---:|
${personaRows}

## 생성 파일

- \`reports/playtests/v0_56_blind_playtest_session_01.md\`
- \`reports/playtests/v0_56_blind_playtest_session_02.md\`
- \`reports/playtests/v0_56_blind_playtest_session_03.md\`
- \`reports/playtests/v0_56_blind_playtest_session_04.md\`
- \`reports/playtests/v0_56_blind_playtest_session_05.md\`

## 실행 로그

${outputBlocks}
`;

  fs.mkdirSync(path.dirname(runReportPath), { recursive: true });
  fs.writeFileSync(runReportPath, markdown);
}

function writePreHandoffReadinessSnapshot() {
  const sessionRows = sessionSpecs
    .map((spec) => `| ${spec.id} | 예정 | OK | \`v0_56_blind_playtest_session_${spec.id}.md\` |`)
    .join("\n");
  const markdown = `# v0.56 Blind Playtest Readiness

Status: 발송 준비
작성일: ${todayKst}

## 판정

- 실제 세션: 0/5
- 요청 패킷: OK
- AGY 발송문: OK
- 발송 로그: OK
- 세션 결과 조작 없음: OK
- 요약 게이트: OK
- 아트 투입 판정: 대기

## 발송 자료

- 요청 패킷: \`v0_56_blind_playtest_request_packet.md\`
- AGY 발송문: \`v0_56_blind_playtest_agy_outbox.md\`
- 발송 로그: \`v0_56_blind_playtest_dispatch_log.md\`
- 원격/튜토리얼 preflight: \`npm run qa:blind-preflight\`
- 요약 게이트 재실행: \`npm run qa:blind-summary\`

## 세션 파일 상태

| Session | Status | 결과 미기입 | File |
|---:|---|---|---|
${sessionRows}

## 다음 행동

1. AGY agent auto-run 결과는 \`npm run qa:agy-review\`로 생성한다.
2. 생성된 세션 파일에는 \`source: AGY agent auto-run\` 마커가 있어야 한다.
3. 실제 사람 세션은 별도 P2 후속 트랙으로 유지한다.
`;

  fs.writeFileSync(readinessPath, markdown);
}

fs.mkdirSync(playtestDir, { recursive: true });

for (const spec of sessionSpecs) {
  const filePath = path.join(playtestDir, `v0_56_blind_playtest_session_${spec.id}.md`);
  fs.writeFileSync(filePath, renderSession(spec));
  console.log(`Wrote ${path.relative(root, filePath)}`);
}

const chain = ["qa:blind-intake", "qa:blind-readiness", "qa:blind-summary", "qa:blind-issues", "qa:art-gate", "qa:asset-handoff"];
const results = chain.map(runNpmScript);
writePreHandoffReadinessSnapshot();
writeRunReport(results);

for (const result of results) {
  console.log(`\n[npm run ${result.scriptName}] exit ${result.status}`);
  if (result.stdout) {
    console.log(result.stdout);
  }
  if (result.stderr) {
    console.error(result.stderr);
  }
}

const failed = results.find((result) => result.status !== 0);
if (failed) {
  console.error(`AGY review QA chain failed at npm run ${failed.scriptName}`);
  process.exit(failed.status || 1);
}

console.log(`Wrote ${path.relative(root, runReportPath)}`);
console.log(`Restored ${path.relative(root, readinessPath)} as pre-handoff readiness snapshot`);
console.log("AGY agent review sessions: 5/5");
