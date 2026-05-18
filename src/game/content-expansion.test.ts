import { describe, expect, it } from "vitest";
import { items, metaUnlocks, officeExpansions, officeSynergies, officeZones, starterDecks, strategyCards } from "./data";

describe("v0.25 accelerated content expansion", () => {
  it("thickens deckbuilding, roguelite meta, and office growth content pools", () => {
    expect(strategyCards.length).toBeGreaterThanOrEqual(18);
    expect(metaUnlocks.length).toBeGreaterThanOrEqual(6);
    expect(starterDecks.length).toBeGreaterThanOrEqual(7);
    expect(officeExpansions.length).toBeGreaterThanOrEqual(6);
    expect(officeSynergies.length).toBeGreaterThanOrEqual(8);
    expect(officeZones.length).toBeGreaterThanOrEqual(8);
    expect(items.length).toBeGreaterThanOrEqual(45);
  });

  it("keeps every starter deck large enough to support a distinct first run plan", () => {
    const cardIds = new Set(strategyCards.map((card) => card.id));

    for (const deck of starterDecks) {
      expect(deck.card_ids.length, deck.id).toBeGreaterThanOrEqual(6);
      expect(new Set(deck.card_ids).size, deck.id).toBe(deck.card_ids.length);
      expect(deck.card_ids.every((cardId) => cardIds.has(cardId)), deck.id).toBe(true);
    }
  });
});
