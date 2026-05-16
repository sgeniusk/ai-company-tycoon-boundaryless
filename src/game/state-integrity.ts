import { annualReviews, companyLocations, competitors, products, resources, strategyCards } from "./data";
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
  const locationIds = new Set(companyLocations.map((location) => location.id));
  const cardIds = new Set(strategyCards.map((card) => card.id));
  const annualReviewIds = new Set(annualReviews.map((review) => review.id));

  for (const resourceId of Object.keys(resources)) {
    const value = state.resources[resourceId];
    if (typeof value !== "number" || !Number.isFinite(value)) {
      issues.push(`resource "${resourceId}" must be a finite number`);
    }
  }

  if (!locationIds.has(state.locationId)) {
    issues.push(`location "${state.locationId}" is unknown`);
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

  for (const modifier of state.activeDevelopmentPuzzleModifiers) {
    if (!cardIds.has(modifier.sourceCardId)) issues.push(`puzzle modifier "${modifier.id}" references unknown card "${modifier.sourceCardId}"`);
    if (!Number.isFinite(modifier.usesRemaining) || modifier.usesRemaining < 0) {
      issues.push(`puzzle modifier "${modifier.id}" has invalid usesRemaining`);
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

  if (!Array.isArray(state.annualReviewHistory)) {
    issues.push("annualReviewHistory must be an array");
  } else {
    for (const entry of state.annualReviewHistory) {
      if (!annualReviewIds.has(entry.reviewId)) issues.push(`annual review "${entry.reviewId}" is unknown`);
      if (!Number.isFinite(entry.month) || !Number.isFinite(entry.score)) {
        issues.push(`annual review "${entry.reviewId}" has invalid month or score`);
      }
    }
  }

  if (!Number.isFinite(state.roguelite.runNumber) || state.roguelite.runNumber < 1) {
    issues.push("roguelite runNumber must be a positive number");
  }

  if (!Number.isFinite(state.roguelite.deckEditTokens) || state.roguelite.deckEditTokens < 0) {
    issues.push("roguelite deckEditTokens must be a non-negative number");
  }

  for (const cardId of [
    ...state.roguelite.deck.drawPile,
    ...state.roguelite.deck.hand,
    ...state.roguelite.deck.discardPile,
    ...state.roguelite.deck.playedThisTurn,
  ]) {
    if (!cardIds.has(cardId)) issues.push(`strategy deck card "${cardId}" is unknown`);
  }

  for (const cardId of state.roguelite.upgradedCardIds) {
    if (!cardIds.has(cardId)) issues.push(`upgraded strategy card "${cardId}" is unknown`);
  }

  if (state.roguelite.pendingCardReward) {
    if (!productIds.has(state.roguelite.pendingCardReward.productId)) {
      issues.push(`pending card reward product "${state.roguelite.pendingCardReward.productId}" is unknown`);
    }
    for (const cardId of state.roguelite.pendingCardReward.offeredCardIds) {
      if (!cardIds.has(cardId)) issues.push(`pending card reward card "${cardId}" is unknown`);
    }
  }

  return { ok: issues.length === 0, issues, warnings };
}
