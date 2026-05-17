import { productIdeas } from "./data";
import type {
  ProductDefinition,
  ProductIdeaBoldOptionDefinition,
  ProductIdeaCompatibilityRuleDefinition,
  ProductIdeaSubjectDefinition,
  ProductIdeaTypeDefinition,
  ResourceMap,
} from "./types";

export interface ProductConcept {
  id: string;
  title: string;
  pitch: string;
  subject: ProductIdeaSubjectDefinition;
  productType: ProductIdeaTypeDefinition;
  boldOption: ProductIdeaBoldOptionDefinition;
  noveltyTier: "steady" | "promising" | "wild" | "legendary";
  score: number;
  prototypeCost: ResourceMap;
  capabilityRequirements: string[];
  suggestedDomain: string;
  strengths: string[];
  risks: string[];
  tags: string[];
  matchedRules: string[];
}

export interface ProductIdeaCoverage {
  subjects: number;
  productTypes: number;
  boldOptions: number;
  curatedRules: number;
  totalCombinations: number;
}

export interface RenewalReleaseOption {
  id: "major_update" | "renewal_launch" | "spin_off";
  label: string;
  releaseName: string;
  description: string;
  effects: string[];
  risk: string;
}

export const productIdeaSubjects = productIdeas.subjects;
export const productIdeaTypes = productIdeas.product_types;
export const productIdeaBoldOptions = productIdeas.bold_options;
export const productIdeaCompatibilityRules = productIdeas.compatibility_rules;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function findById<T extends { id: string }>(items: T[], id: string, label: string): T {
  const item = items.find((entry) => entry.id === id);
  if (!item) throw new Error(`Unknown ${label}: ${id}`);
  return item;
}

function hasAnyTag(sourceTags: string[], requiredTags?: string[]): boolean {
  if (!requiredTags?.length) return true;
  return requiredTags.some((tag) => sourceTags.includes(tag));
}

function matchesRule(
  rule: ProductIdeaCompatibilityRuleDefinition,
  subject: ProductIdeaSubjectDefinition,
  productType: ProductIdeaTypeDefinition,
  boldOption: ProductIdeaBoldOptionDefinition,
): boolean {
  return (
    hasAnyTag(subject.tags, rule.subject_tags) &&
    hasAnyTag(productType.tags, rule.type_tags) &&
    hasAnyTag(boldOption.tags, rule.option_tags)
  );
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function toNoveltyTier(score: number, risk: number): ProductConcept["noveltyTier"] {
  if (score >= 88 || risk >= 14) return "legendary";
  if (score >= 76 || risk >= 11) return "wild";
  if (score >= 62) return "promising";
  return "steady";
}

function getConceptCost(
  subject: ProductIdeaSubjectDefinition,
  productType: ProductIdeaTypeDefinition,
  boldOption: ProductIdeaBoldOptionDefinition,
): ResourceMap {
  const multiplier = productType.cost_multiplier * boldOption.cost_multiplier;
  return {
    cash: Math.round((1200 + subject.market_heat * 260 + subject.risk * 180) * multiplier),
    compute: Math.round((12 + subject.market_heat * 2 + Object.keys(productType.capability_bias).length * 4) * multiplier),
    data: Math.round((8 + subject.market_heat + Object.keys(subject.capability_bias).length * 4) * Math.max(1, boldOption.cost_multiplier)),
  };
}

function getCapabilityRequirements(
  subject: ProductIdeaSubjectDefinition,
  productType: ProductIdeaTypeDefinition,
): string[] {
  const merged = { ...subject.capability_bias, ...productType.capability_bias };
  return Object.entries(merged)
    .sort(([, first], [, second]) => second - first)
    .slice(0, 4)
    .map(([capabilityId, level]) => `${capabilityId} Lv.${level}`);
}

export function getProductIdeaCoverage(): ProductIdeaCoverage {
  return {
    subjects: productIdeaSubjects.length,
    productTypes: productIdeaTypes.length,
    boldOptions: productIdeaBoldOptions.length,
    curatedRules: productIdeaCompatibilityRules.length,
    totalCombinations: productIdeaSubjects.length * productIdeaTypes.length * productIdeaBoldOptions.length,
  };
}

export function createProductConcept(subjectId: string, productTypeId: string, boldOptionId: string): ProductConcept {
  const subject = findById(productIdeaSubjects, subjectId, "product idea subject");
  const productType = findById(productIdeaTypes, productTypeId, "product idea type");
  const boldOption = findById(productIdeaBoldOptions, boldOptionId, "product idea bold option");
  const matchedRules = productIdeaCompatibilityRules.filter((rule) => matchesRule(rule, subject, productType, boldOption));
  const score = clamp(
    42 + subject.market_heat * 2 + productType.score_bonus + boldOption.score_delta + matchedRules.reduce((sum, rule) => sum + rule.score_bonus, 0),
    0,
    100,
  );
  const risk = clamp(subject.risk + boldOption.risk_delta + matchedRules.length, 0, 20);
  const primaryRule = matchedRules[0];
  const title = `${primaryRule?.title_prefix ? `${primaryRule.title_prefix} ` : ""}${boldOption.name} ${subject.name} ${productType.name}`;
  const pitch = [
    subject.description,
    `${productType.description}`,
    `${boldOption.name}: ${boldOption.description}`,
    primaryRule?.pitch,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    id: `${subject.id}_${productType.id}_${boldOption.id}`,
    title,
    pitch,
    subject,
    productType,
    boldOption,
    noveltyTier: toNoveltyTier(score, risk),
    score,
    prototypeCost: getConceptCost(subject, productType, boldOption),
    capabilityRequirements: getCapabilityRequirements(subject, productType),
    suggestedDomain: subject.domain,
    strengths: unique([
      ...matchedRules.flatMap((rule) => rule.strengths),
      boldOption.tags.includes("subscription") ? "반복 매출" : "",
      productType.tags.includes("platform") ? "네트워크 효과" : "",
      subject.tags.includes("ip") ? "IP 확장" : "",
    ]).slice(0, 5),
    risks: unique([
      ...matchedRules.flatMap((rule) => rule.risks),
      risk >= 11 ? "실행 난이도 높음" : "시장 검증 필요",
      subject.risk >= 8 ? "규제/하드웨어 부담" : "",
    ]).slice(0, 5),
    tags: unique([...subject.tags, ...productType.tags, ...boldOption.tags]),
    matchedRules: matchedRules.map((rule) => rule.id),
  };
}

export function getRenewalReleaseOptions(product: ProductDefinition, nextLevel = 2): RenewalReleaseOption[] {
  return [
    {
      id: "major_update",
      label: "메이저 업데이트",
      releaseName: `${product.name} v${nextLevel}`,
      description: "기존 제품의 핵심 기능과 완성도를 끌어올려 이용자 유지율과 월 매출을 개선합니다.",
      effects: ["제품 레벨 상승", "월 매출 증가", "기존 이용자 유지"],
      risk: "새로움은 낮지만 가장 안정적입니다.",
    },
    {
      id: "renewal_launch",
      label: "리뉴얼 출시",
      releaseName: `${product.name} 리뉴얼`,
      description: "같은 제품을 다시 시장에 내놓듯 포지션, UX, 브랜드를 갈아엎어 리뷰를 재평가받습니다.",
      effects: ["리뷰 재평가", "화제성 회복", "신뢰 보정"],
      risk: "기존 팬이 바뀐 방향을 싫어할 수 있습니다.",
    },
    {
      id: "spin_off",
      label: "파생 제품",
      releaseName: `${product.name} 파생 라인`,
      description: "대표 제품의 기술과 브랜드를 새 고객층에 맞춘 변형 제품으로 뻗어 나갑니다.",
      effects: ["새 시장 진입", "브랜드 확장", "경쟁사 견제"],
      risk: "너무 빨리 벌리면 운영 부담이 커집니다.",
    },
  ];
}
