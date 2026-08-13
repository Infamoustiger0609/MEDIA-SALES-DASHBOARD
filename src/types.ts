export type Grade = "A+" | "A" | "B" | "C";

export interface BusinessPlanning {
  region?: string | null;
  aopTarget: number | null;
  businessConfirmed: number | null;
  actualRevenue: number | null;
  actualPctOfTarget: number | null;
  monthBeginningPct: number | null;
  planningGrade: Grade | null;
  controlGrade: Grade | null;
}

export interface AcBucketEntry {
  division: string | null;
  targetIndex: number | null;
  pctContributionOfAop: number | null;
  ranking: string | null;
  topAccountsValue: number | null;
  achievement: number | null;
}

export interface AcBucket {
  region?: string | null;
  keyGrowth: AcBucketEntry | null;
  rotating: AcBucketEntry | null;
}

export interface PriceControlChannel {
  channel: string;
  lyAvgDiscount: number | null;
  lyClientCount: number | null;
  lyContributionPct: number | null;
  cmAvgDiscount: number | null;
  cmClientCount: number | null;
  cmContributionPct: number | null;
}

export interface PriceControl {
  region?: string | null;
  channels: PriceControlChannel[];
  discountCorrectionOverLY: number | null;
  overallOfferedDiscount: number | null;
  ranking: string | null;
}

export interface Productivity {
  region?: string | null;
  targetPerHead: number | null;
  targetPerHeadNational: number | null;
  actual: number | null;
  nationalActual: number | null;
  actualPct: number | null;
  ranking: string | null;
}

export interface SalesQualityEntry {
  region?: string | null;
  ly: number | null;
  lm: number | null;
  cm: number | null;
  cmPctContribution: number | null;
  ranking: string | null;
}

export const SALES_QUALITY_KEYS = [
  "Off Screen",
  "Innovations",
  "Format Sponsorships",
  "IP sales Deals",
  "Zeouk box deal",
  "Brandscap deal",
] as const;

export type SalesQualityKey = (typeof SALES_QUALITY_KEYS)[number];

export type SalesQuality = Partial<Record<SalesQualityKey, SalesQualityEntry | null>>;

export interface SubRegion {
  regionName: string;
  businessPlanning: BusinessPlanning | null;
  acBucket: AcBucket | null;
  priceControl: PriceControl | null;
  productivity: Productivity | null;
  salesQuality: SalesQuality | null;
}

export interface FinancialControl {
  territory: string | null;
  ytdIncomeBilled: number | null;
  ytdOS: number | null;
  collectionPct: number | null;
  ranking: string | null;
}

export interface BillingChallenges {
  territory: string | null;
  monthlyIncomeBilled: number | null;
  monthlyBillingChallenges: number | null;
  billingChallengesPct: number | null;
  ranking: string | null;
}

export type Manager = "Gaurav" | "Rajesh" | "Shalini" | "Sharda";

export interface Territory {
  manager: Manager;
  territoryLabel: string;
  month: string;
  subRegions: SubRegion[];
  financialControl: FinancialControl | null;
  billingChallenges: BillingChallenges | null;
}

export interface MonthData {
  month: string;
  territories: Territory[];
}

export const MANAGERS: Manager[] = ["Gaurav", "Rajesh", "Shalini", "Sharda"];

export const MANAGER_TERRITORY_LABEL: Record<Manager, string> = {
  Gaurav: "Delhi + East",
  Rajesh: "North + West",
  Shalini: "KA + KL",
  Sharda: "West - Mumbai",
};

export type ComparisonMode = "MoM" | "QoQ" | "YoY" | "None";
