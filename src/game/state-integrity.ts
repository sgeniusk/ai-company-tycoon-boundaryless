import { competitors, products, resources } from "./data";
import type { GameState } from "./types";

export interface StateIntegrityReport {
  ok: boolean;
  issues: string[];
  warnings: string[];
}

export function validateGameStateIntegrity(state: GameState): StateIntegrityReport {
  const issues: string[] = [];
  const warnings: string[] = [];
  const productIds = new Set(products.map((product) => product.id));
  const competitorIds = new Set(competitors.map((competitor) => competitor.id));

  for (const resourceId of Object.keys(resources)) {
    const value = state.resources[resourceId];
    if (typeof value !== "number" || !Number.isFinite(value)) {
      issues.push(`resource "${resourceId}" must be a finite number`);
    }
  }

  for (const productId of state.activeProducts) {
    if (!productIds.has(productId)) issues.push(`active product "${productId}" is unknown`);
  }

  for (const [productId, level] of Object.entries(state.productLevels)) {
    const product = products.find((entry) => entry.id === productId);
    if (!product) {
      issues.push(`product level "${productId}" is unknown`);
    } else if (!Number.isFinite(level) || level < 1 || level > product.max_level) {
      issues.push(`product level "${productId}" is outside 1-${product.max_level}`);
    }
  }

  for (const project of state.productProjects) {
    if (!productIds.has(project.productId)) issues.push(`project "${project.id}" references unknown product "${project.productId}"`);
    if (!Number.isFinite(project.progress) || !Number.isFinite(project.quality)) {
      issues.push(`project "${project.id}" has invalid progress or quality`);
    }
  }

  for (const competitor of state.competitorStates) {
    if (!competitorIds.has(competitor.id)) warnings.push(`competitor state "${competitor.id}" is not in current data`);
    if (!Number.isFinite(competitor.score) || !Number.isFinite(competitor.marketShare)) {
      issues.push(`competitor "${competitor.id}" has invalid score or market share`);
    }
  }

  if (!["playing", "success", "failure"].includes(state.status)) {
    issues.push(`status "${state.status}" is invalid`);
  }

  return { ok: issues.length === 0, issues, warnings };
}
