import {
  annualDirectiveChoices,
  annualReviews,
  campaignEndings,
  campaignShocks,
  companyLocations,
  competitors,
  derivationRules,
  metaUnlocks,
  products,
  resources,
  starterDecks,
  strategyCards,
  worldEvents,
} from "./data";
import type { GameState } from "./types";

export interface StateIntegrityReport {
  ok: boolean;
  issues: string[];
  warnings: string[];
}

export function validateGameStateIntegrity(state: GameState): StateIntegrityReport {
  const issues: string[] = [];
  const warnings: string[] = [];
  const allProducts = [...products, ...(state.generatedProducts ?? [])];
  const productIds = new Set(allProducts.map((product) => product.id));
  const competitorIds = new Set(competitors.map((competitor) => competitor.id));
  const locationIds = new Set(companyLocations.map((location) => location.id));
  const cardIds = new Set(strategyCards.map((card) => card.id));
  const annualReviewIds = new Set(annualReviews.map((review) => review.id));
  const annualDirectiveChoiceIds = new Set(annualDirectiveChoices.map((choice) => choice.id));
  const campaignShockIds = new Set(campaignShocks.map((shock) => shock.id));
  const worldEventIds = new Set(worldEvents.map((event) => event.id));
  const derivationRuleIds = new Set(derivationRules.map((rule) => rule.id));
  const endingIds = new Set(campaignEndings.map((ending) => ending.id));
  const metaUnlockIds = new Set(metaUnlocks.map((unlock) => unlock.id));
  const starterDeckIds = new Set(starterDecks.map((deck) => deck.id));

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
    const product = allProducts.find((entry) => entry.id === productId);
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

  if (!Array.isArray(state.seenTutorials)) {
    issues.push("seenTutorials must be an array");
  }

  if (!Array.isArray(state.discoveredPayoffIds)) {
    issues.push("discoveredPayoffIds must be an array");
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

  if (!Array.isArray(state.campaignShockHistory)) {
    issues.push("campaignShockHistory must be an array");
  } else {
    for (const shockId of state.campaignShockHistory) {
      if (!campaignShockIds.has(shockId)) issues.push(`campaign shock "${shockId}" is unknown`);
    }
  }

  if (!Array.isArray(state.worldEventHistory)) {
    issues.push("worldEventHistory must be an array");
  } else {
    for (const eventId of state.worldEventHistory) {
      if (!worldEventIds.has(eventId)) issues.push(`world event "${eventId}" is unknown`);
    }
  }

  if (state.annualDirective) {
    if (!annualReviewIds.has(state.annualDirective.reviewId)) {
      issues.push(`annual directive review "${state.annualDirective.reviewId}" is unknown`);
    }
    if (!["passed", "recovery"].includes(state.annualDirective.source)) {
      issues.push(`annual directive source "${state.annualDirective.source}" is invalid`);
    }
    if (!Number.isFinite(state.annualDirective.expiresMonth)) {
      issues.push(`annual directive "${state.annualDirective.title}" has invalid expiresMonth`);
    }
    if (!Array.isArray(state.annualDirective.rewardBiasTags)) {
      issues.push(`annual directive "${state.annualDirective.title}" rewardBiasTags must be an array`);
    }
  }

  if (state.pendingAnnualDirectiveChoices) {
    const pending = state.pendingAnnualDirectiveChoices;
    if (!annualReviewIds.has(pending.reviewId)) {
      issues.push(`pending annual directive review "${pending.reviewId}" is unknown`);
    }
    if (!["passed", "recovery"].includes(pending.source)) {
      issues.push(`pending annual directive source "${pending.source}" is invalid`);
    }
    if (!Array.isArray(pending.offeredDirectiveIds) || pending.offeredDirectiveIds.length === 0 || pending.offeredDirectiveIds.length > 3) {
      issues.push("pending annual directive choices must include 1-3 offers");
    } else {
      for (const choiceId of pending.offeredDirectiveIds) {
        if (!annualDirectiveChoiceIds.has(choiceId)) {
          issues.push(`pending annual directive choice "${choiceId}" is unknown`);
        }
      }
    }
  }

  if (!Number.isFinite(state.roguelite.runNumber) || state.roguelite.runNumber < 1) {
    issues.push("roguelite runNumber must be a positive number");
  }

  if (!Number.isFinite(state.roguelite.deckEditTokens) || state.roguelite.deckEditTokens < 0) {
    issues.push("roguelite deckEditTokens must be a non-negative number");
  }

  if (!Array.isArray(state.roguelite.unlockedMetaIds)) {
    issues.push("roguelite unlockedMetaIds must be an array");
  } else {
    const seenMetaUnlockIds = new Set<string>();
    for (const unlockId of state.roguelite.unlockedMetaIds) {
      if (typeof unlockId !== "string" || !unlockId.length) {
        issues.push("roguelite unlockedMetaIds must contain non-empty strings");
      } else if (!metaUnlockIds.has(unlockId)) {
        issues.push(`roguelite meta unlock "${unlockId}" is unknown`);
      } else if (seenMetaUnlockIds.has(unlockId)) {
        issues.push(`roguelite meta unlock "${unlockId}" is duplicated`);
      }
      seenMetaUnlockIds.add(unlockId);
    }
  }

  const unlockedMetaIdSet = new Set(Array.isArray(state.roguelite.unlockedMetaIds) ? state.roguelite.unlockedMetaIds : []);
  const starterDeck = starterDecks.find((deck) => deck.id === state.roguelite.starterDeckId);
  if (state.roguelite.starterDeckId !== undefined && !starterDeckIds.has(state.roguelite.starterDeckId)) {
    issues.push(`roguelite starter deck "${state.roguelite.starterDeckId}" is unknown`);
  } else if (starterDeck?.required_meta_id && !unlockedMetaIdSet.has(starterDeck.required_meta_id)) {
    issues.push(`roguelite starter deck "${starterDeck.id}" requires meta unlock "${starterDeck.required_meta_id}"`);
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

  if (!Array.isArray(state.roguelite.discoveredArchetypeIds)) {
    issues.push("roguelite discoveredArchetypeIds must be an array");
  } else {
    const seenArchetypeIds = new Set<string>();
    for (const archetypeId of state.roguelite.discoveredArchetypeIds) {
      if (typeof archetypeId !== "string" || !archetypeId.length) {
        issues.push("roguelite discoveredArchetypeIds must contain non-empty strings");
      } else if (!derivationRuleIds.has(archetypeId)) {
        issues.push(`discovered archetype "${archetypeId}" is unknown`);
      } else if (seenArchetypeIds.has(archetypeId)) {
        issues.push(`discovered archetype "${archetypeId}" is duplicated`);
      }
      seenArchetypeIds.add(archetypeId);
    }
  }

  if (!Array.isArray(state.roguelite.discoveredEndingIds)) {
    issues.push("roguelite discoveredEndingIds must be an array");
  } else {
    const seenEndingIds = new Set<string>();
    for (const endingId of state.roguelite.discoveredEndingIds) {
      if (typeof endingId !== "string" || !endingId.length) {
        issues.push("roguelite discoveredEndingIds must contain non-empty strings");
      } else if (!endingIds.has(endingId)) {
        issues.push(`discovered ending "${endingId}" is unknown`);
      } else if (seenEndingIds.has(endingId)) {
        issues.push(`discovered ending "${endingId}" is duplicated`);
      }
      seenEndingIds.add(endingId);
    }
  }

  if (state.roguelite.pendingCardReward) {
    if (!productIds.has(state.roguelite.pendingCardReward.productId)) {
      issues.push(`pending card reward product "${state.roguelite.pendingCardReward.productId}" is unknown`);
    }
    for (const cardId of state.roguelite.pendingCardReward.offeredCardIds) {
      if (!cardIds.has(cardId)) issues.push(`pending card reward card "${cardId}" is unknown`);
    }
  }

  if (!Array.isArray(state.roguelite.runHistory)) {
    issues.push("roguelite runHistory must be an array");
  } else {
    for (const record of state.roguelite.runHistory) {
      if (record.endingId && !endingIds.has(record.endingId)) {
        issues.push(`run history ending "${record.endingId}" is unknown`);
      }
      if (record.campaignRank && !["S", "A", "B", "C", "D"].includes(record.campaignRank)) {
        issues.push(`run history campaignRank "${record.campaignRank}" is invalid`);
      }
      if (record.survivedYears !== undefined && (!Number.isFinite(record.survivedYears) || record.survivedYears < 0)) {
        issues.push(`run history "${record.id}" has invalid survivedYears`);
      }
    }
  }

  return { ok: issues.length === 0, issues, warnings };
}
