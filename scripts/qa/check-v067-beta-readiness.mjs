import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const dataDir = path.join(root, "data");
const reportPath = path.join(root, "reports/qa/v0_67_beta_readiness.md");
const jsonMode = process.argv.includes("--json");
const noWrite = process.argv.includes("--no-write");

function readJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, fileName), "utf8"));
}

function readSource(fileName) {
  return fs.readFileSync(path.join(root, fileName), "utf8");
}

const endings = readJson("endings.json").endings ?? [];
const runModifiers = readJson("run_modifiers.json");
const metaUnlocks = readJson("meta_unlocks.json").meta_unlocks ?? [];
const qaScenariosSource = readSource("src/game/qa-scenarios.ts");
const betaReadinessSource = readSource("src/game/beta-readiness.ts");

const routeDimensions = [
  { id: "start_cities", label: "도시", dataKey: "start_cities", conditionField: "start_city_ids" },
  { id: "world_lore", label: "세계", dataKey: "world_lore", conditionField: "world_lore_ids" },
  { id: "market_conditions", label: "시장", dataKey: "market_conditions", conditionField: "market_condition_ids" },
  { id: "founder_traits", label: "창업자", dataKey: "founder_traits", conditionField: "founder_trait_ids" },
];

function getEndingRouteUnlockTags(condition) {
  const tags = new Set();
  const marketIds = new Set(condition.market_condition_ids ?? []);
  const worldIds = new Set(condition.world_lore_ids ?? []);
  const founderIds = new Set(condition.founder_trait_ids ?? []);
  const growthPathIds = new Set(condition.growth_path_ids ?? []);
  const archetypeIds = new Set(condition.archetype_ids ?? []);
  const resources = condition.min_resources ?? {};

  if (
    marketIds.has("ai_boom") ||
    marketIds.has("consumer_hype_cycle") ||
    worldIds.has("open_source_heaven") ||
    founderIds.has("marketer_founder") ||
    founderIds.has("serial_founder") ||
    (resources.hype ?? 0) >= 70
  ) {
    tags.add("growth");
  }

  if (
    marketIds.has("regulation_crackdown") ||
    marketIds.has("enterprise_winter") ||
    worldIds.has("privacy_fortress") ||
    worldIds.has("regulatory_stronghold") ||
    growthPathIds.has("trust_enterprise") ||
    (resources.trust ?? 0) >= 88
  ) {
    tags.add("safety");
    tags.add("quality");
    tags.add("enterprise");
  }

  if (worldIds.has("chip_war") || worldIds.has("bitcoin_gpu_squeeze") || growthPathIds.has("code_vision_lab") || (resources.compute ?? 0) >= 280) {
    tags.add("compute");
    tags.add("hardware");
    tags.add("research");
  }

  if (worldIds.has("robotics_boom") || (resources.automation ?? 0) >= 68 || marketIds.has("steady_market")) {
    tags.add("automation");
    tags.add("ops");
  }

  if (worldIds.has("data_drought") || (resources.data ?? 0) >= 240) {
    tags.add("data");
    tags.add("quality");
  }

  if (
    worldIds.has("ai_winter_redux") ||
    marketIds.has("funding_drought") ||
    founderIds.has("researcher_founder") ||
    archetypeIds.has("lab_in_winter")
  ) {
    tags.add("data");
    tags.add("quality");
    tags.add("research");
  }

  if (worldIds.has("standard") || founderIds.has("no_founder")) {
    tags.add("growth");
    tags.add("automation");
  }

  return tags;
}

function getEndingRouteUnlockLabels(condition) {
  if (condition.fallback === true) return [];

  const targetTags = getEndingRouteUnlockTags(condition);
  if (targetTags.size === 0) return [];

  return metaUnlocks
    .map((unlock) => ({
      unlock,
      score: (unlock.tags ?? []).filter((tag) => targetTags.has(tag)).length,
    }))
    .filter((entry) => entry.score > 0)
    .sort((first, second) => second.score - first.score || first.unlock.cost - second.unlock.cost || first.unlock.id.localeCompare(second.unlock.id))
    .slice(0, 2)
    .map(({ unlock }) => unlock.title);
}

function getAxisCoverage() {
  return routeDimensions.map((dimension) => {
    const coveredIds = new Set();
    for (const ending of endings) {
      for (const id of ending.condition?.[dimension.conditionField] ?? []) coveredIds.add(id);
    }

    const options = runModifiers[dimension.dataKey] ?? [];
    const missingLabels = options.filter((option) => !coveredIds.has(option.id)).map((option) => option.name);

    return {
      id: dimension.id,
      label: dimension.label,
      covered: options.length - missingLabels.length,
      total: options.length,
      complete: missingLabels.length === 0,
      missingLabels,
    };
  });
}

function hasQaScenario(id) {
  return qaScenariosSource.includes(`"${id}"`) && qaScenariosSource.includes(`id === "${id}"`);
}

const replayableEndings = endings.filter((ending) => ending.condition?.fallback !== true);
const fallbackEndings = endings.filter((ending) => ending.condition?.fallback === true);
const rewardTotal = endings.reduce((total, ending) => total + (ending.meta_reward_bonus ?? 0), 0);
const unlockHintEligibleEndings = replayableEndings.filter((ending) => (ending.meta_reward_bonus ?? 0) > 0);
const unlockHintCount = unlockHintEligibleEndings.filter((ending) => getEndingRouteUnlockLabels(ending.condition ?? {}).length > 0).length;
const axes = getAxisCoverage();
const routeAxisCount = axes.filter((axis) => axis.complete).length;
const routeAxisTotal = axes.length;
const routeOptionCount = axes.reduce((total, axis) => total + axis.covered, 0);
const routeOptionTotal = axes.reduce((total, axis) => total + axis.total, 0);
const requiredScenarios = ["beta-readiness", "beta-readiness-complete"];
const scenarios = requiredScenarios.filter(hasQaScenario);

const checks = [
  {
    id: "ending_routes",
    label: "엔딩 루트",
    detail: `${endings.length} 결말 · ${replayableEndings.length} 목표 · ${fallbackEndings.length} 결과 전용`,
    complete: endings.length >= 24 && replayableEndings.length === 23 && fallbackEndings.length === 1,
  },
  {
    id: "reward_pool",
    label: "도감 보상",
    detail: `${rewardTotal} 통찰`,
    complete: rewardTotal === 81 && unlockHintEligibleEndings.length === replayableEndings.length,
  },
  {
    id: "unlock_guidance",
    label: "해금 안내",
    detail: `${unlockHintCount}/${unlockHintEligibleEndings.length}`,
    complete: unlockHintEligibleEndings.length > 0 && unlockHintCount === unlockHintEligibleEndings.length,
  },
  {
    id: "route_coverage",
    label: "루트 커버리지",
    detail: `${routeAxisCount}/${routeAxisTotal} 축 · ${routeOptionCount}/${routeOptionTotal} 옵션`,
    complete: routeAxisCount === routeAxisTotal && routeOptionCount === routeOptionTotal,
  },
  {
    id: "qa_scenarios",
    label: "QA 시나리오",
    detail: scenarios.join(" / "),
    complete: scenarios.length === requiredScenarios.length,
  },
  {
    id: "derive_only_selector",
    label: "파생 전용 셀렉터",
    detail: "collection + axis summary reuse",
    complete: betaReadinessSource.includes("getEndingCollectionSummary") && betaReadinessSource.includes("getEndingAxisCoverageSummary"),
  },
];

const status = checks.every((check) => check.complete) ? "pass" : "fail";
const result = {
  status,
  endingTotal: endings.length,
  replayableTotal: replayableEndings.length,
  fallbackTotal: fallbackEndings.length,
  rewardTotal,
  unlockHintCount,
  unlockHintEligibleCount: unlockHintEligibleEndings.length,
  unlockHintLabel: `${unlockHintCount}/${unlockHintEligibleEndings.length}`,
  routeAxisCount,
  routeAxisTotal,
  routeAxisLabel: `${routeAxisCount}/${routeAxisTotal}`,
  routeOptionCount,
  routeOptionTotal,
  routeOptionLabel: `${routeOptionCount}/${routeOptionTotal}`,
  scenarios,
  axes,
  checks,
  reportPath: path.relative(root, reportPath),
};

const markdown = `# v0.67 Beta Readiness QA

Status: ${status === "pass" ? "PASS" : "FAIL"}

## Summary

- Endings: ${result.endingTotal} total / ${result.replayableTotal} replayable / ${result.fallbackTotal} result-only fallback
- Codex rewards: ${result.rewardTotal} total insight
- Unlock guidance: ${result.unlockHintLabel}
- Route coverage: ${result.routeAxisLabel} axes / ${result.routeOptionLabel} options
- QA scenarios: ${scenarios.join(", ")}

## Checks

| Check | Detail | Status |
|---|---|---|
${checks.map((check) => `| ${check.label} | ${check.detail} | ${check.complete ? "PASS" : "FAIL"} |`).join("\n")}

## Axis Coverage

| Axis | Coverage | Missing |
|---|---:|---|
${axes.map((axis) => `| ${axis.label} | ${axis.covered}/${axis.total} | ${axis.missingLabels.length ? axis.missingLabels.join(", ") : "-"} |`).join("\n")}
`;

if (!noWrite) {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, markdown);
}

if (jsonMode) {
  console.log(JSON.stringify(result));
} else {
  if (!noWrite) console.log(`Wrote ${path.relative(root, reportPath)}`);
  console.log(`Status: ${status.toUpperCase()}`);
  console.log(`Endings: ${result.endingTotal} total / ${result.replayableTotal} replayable`);
  console.log(`Unlock guidance: ${result.unlockHintLabel}`);
  console.log(`Route coverage: ${result.routeAxisLabel} axes / ${result.routeOptionLabel} options`);
}

if (status !== "pass") process.exitCode = 1;
