import type { ProductDefinition, ReleaseReview } from "./types";

export function createReleaseHeadline(product: ProductDefinition, review: ReleaseReview): string {
  if (review.score >= 85) return `${product.name}, 첫 출시부터 시장의 기대를 넘다`;
  if (review.score >= 70) return `${product.name}, 탄탄한 완성도로 첫 이용자를 모으다`;
  return `${product.name}, 아쉬운 출발 속에서도 다음 개선점을 찾다`;
}

export function createMarketReaction(product: ProductDefinition, review: ReleaseReview): string {
  const users = product.base_users_per_month.toLocaleString("ko-KR");

  if (product.tags.includes("enterprise")) {
    return `초기 고객은 신뢰와 안정성을 묻고 있습니다. 예상 신규 이용자 ${users}명.`;
  }
  if (product.tags.includes("developer")) {
    return `개발자 커뮤니티가 성능과 워크플로를 검증하기 시작했습니다. 예상 신규 이용자 ${users}명.`;
  }
  if (review.score >= 85) {
    return `이용자 반응이 빠르게 번지고 있습니다. 예상 신규 이용자 ${users}명.`;
  }
  return `이용자는 호기심을 보이지만 다음 개선을 기다립니다. 예상 신규 이용자 ${users}명.`;
}
