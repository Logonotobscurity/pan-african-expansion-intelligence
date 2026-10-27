export type ExpansionSignalType =
  | 'FUNDING_ROUND'
  | 'DEBT_FACILITY'
  | 'GRANT_OR_PRIZE'
  | 'MARKET_ENTRY_ANNOUNCEMENT'
  | 'COUNTRY_LAUNCH'
  | 'PARTNERSHIP'
  | 'ACQUISITION'
  | 'LICENCE_OR_REGULATION'
  | 'PAYMENT_RAIL_EXPANSION'
  | 'CROSS_BORDER_INFRASTRUCTURE'
  | 'HIRING_EXPANSION'
  | 'PROCUREMENT_OR_RFP'
  | 'ACCELERATOR_OR_ECOSYSTEM_PROGRAMME'
  | 'PRODUCT_LOCALISATION'
  | 'CLOUD_OR_DATA_INFRASTRUCTURE'
  | 'TRADE_OR_DISTRIBUTION_EXPANSION'
  | 'COMPETITOR_MOVE';

export type SourceTier = 'official' | 'company' | 'regulator' | 'investor' | 'reputable_media' | 'social_discovery';
export type EvidenceSupport = 'funding' | 'entry' | 'regulation' | 'partner' | 'payment' | 'data' | 'localisation' | 'hiring';
export type ExpansionStatus = 'announced' | 'active' | 'pilot' | 'partnered' | 'acquired' | 'licensed' | 'unknown';
export type OpportunityStatus = 'new' | 'researching' | 'contacted' | 'partnered' | 'watch' | 'closed';

export interface CompanyIdentity {
  name: string;
  hqCountry?: string;
  sector?: string;
  subsector?: string;
  stage?: string;
  website?: string;
}

export interface MarketRef {
  country: string;
  city?: string;
  role: 'origin' | 'target' | 'corridor' | 'regional';
  region?: string;
  entryStatus?: ExpansionStatus;
  explicitness: 'explicit' | 'inferred' | 'unknown';
}

export interface EvidenceRecord {
  sourceName: string;
  sourceType: SourceTier;
  url: string;
  publishedAt?: string;
  retrievedAt: string;
  reliability: number;
  supports: EvidenceSupport[];
  excerpt?: string;
}

export interface RelationshipNode {
  organization: string;
  roleOrContact: string;
  relationshipType: 'referral' | 'implementation' | 'licensing' | 'payments' | 'distribution' | 'data' | 'ecosystem' | 'capital';
  country?: string;
  contactUrl?: string;
  source?: string;
  confidence: number;
}

export interface ConstraintRecord {
  country: string;
  type: 'partner' | 'regulatory' | 'support' | 'language' | 'payment' | 'fx' | 'data' | 'tax' | 'entity' | 'infrastructure';
  severity: 'low' | 'medium' | 'high' | 'unknown';
  requirement: string;
  evidenceUrl?: string;
  lastVerifiedAt?: string;
}

export interface ExpansionSignal {
  signalId: string;
  observedAt: string;
  publishedAt?: string;
  lastMaterialUpdateAt?: string;
  signalType: ExpansionSignalType;
  company: CompanyIdentity;
  markets: MarketRef[];
  whatChanged: string;
  whyNow?: string;
  capitalOrContractValue?: number;
  capitalCurrency?: string;
  growthIntent?: string;
  entryStatus: ExpansionStatus;
  constraints: ConstraintRecord[];
  evidence: EvidenceRecord[];
  relationships: RelationshipNode[];
}

export interface ExpansionScores {
  evidenceConfidence: number;
  expansionIntent: number;
  commercialRelevance: number;
  urgency: number;
  contactability: number;
}

export interface LogonOpportunity {
  capability: string;
  problem: string;
  deliverable: string;
  likelyBuyer?: string;
  timeToValue: 'days' | 'weeks' | 'months';
  nextBestAction: string;
  deadline?: string;
  scores: ExpansionScores;
  status: OpportunityStatus;
}

const clamp = (value: number): number => Math.max(0, Math.min(100, value));

/**
 * Computes the internal prioritisation score used for the expansion queue.
 * This is intentionally not a prediction and should always be shown with its
 * component scores and evidence.
 */
export function computeExpansionComposite(scores: ExpansionScores): number {
  return Number((
    0.25 * clamp(scores.evidenceConfidence) +
    0.20 * clamp(scores.expansionIntent) +
    0.30 * clamp(scores.commercialRelevance) +
    0.15 * clamp(scores.urgency) +
    0.10 * clamp(scores.contactability)
  ).toFixed(2));
}

export function inferExpansionIntent(signal: ExpansionSignal): number {
  const explicitTargets = signal.markets.filter(
    (m) => m.role === 'target' && m.explicitness === 'explicit',
  ).length;
  const targetStatuses = signal.markets.filter(
    (m) => m.role === 'target' && ['active', 'acquired', 'licensed', 'partnered'].includes(m.entryStatus ?? ''),
  ).length;
  const localPartnerEvidence = signal.constraints.filter((c) => c.type === 'partner').length;
  const hiringSignal = signal.signalType === 'HIRING_EXPANSION' ? 15 : 0;

  let score = 25;
  score += Math.min(35, explicitTargets * 15);
  score += Math.min(30, targetStatuses * 15);
  score += Math.min(10, localPartnerEvidence * 5);
  score += hiringSignal;

  if (signal.signalType === 'FUNDING_ROUND' && explicitTargets === 0) score -= 15;
  return clamp(score);
}

export function evidenceConfidence(evidence: EvidenceRecord[]): number {
  if (evidence.length === 0) return 0;
  const strongest = Math.max(...evidence.map((e) => e.reliability));
  const verifiedMaterialClaims = evidence.filter((e) => e.reliability >= 80).length;
  return clamp(strongest + Math.min(10, verifiedMaterialClaims * 2));
}

export function stableSignalKey(signal: Pick<ExpansionSignal, 'company' | 'signalType' | 'markets'>): string {
  const targets = signal.markets
    .filter((m) => m.role === 'target')
    .map((m) => m.country.trim().toLowerCase())
    .sort()
    .join(',');

  return [
    signal.company.name.trim().toLowerCase(),
    signal.signalType,
    targets || 'unspecified-target',
  ].join('|');
}

export function signalVersionKey(
  signal: Pick<ExpansionSignal, 'company' | 'signalType' | 'markets' | 'lastMaterialUpdateAt'>,
): string {
  return [
    stableSignalKey(signal),
    signal.lastMaterialUpdateAt ?? 'unknown-update',
  ].join('|');
}

/**
 * Stable key for persistent deduplication. Material updates should update the
 * existing signal record rather than create a second active queue item.
 */
export function dedupeKey(signal: Pick<ExpansionSignal, 'company' | 'signalType' | 'markets'>): string {
  return stableSignalKey(signal);
}

export function validateSignal(signal: ExpansionSignal): string[] {
  const errors: string[] = [];
  const candidate = signal as Partial<ExpansionSignal> | null;

  if (!candidate || typeof candidate !== 'object') {
    return ['signal must be a JSON object'];
  }
  if (!candidate.signalId) errors.push('signalId is required');
  if (!candidate.company || typeof candidate.company !== 'object' || !candidate.company.name) {
    errors.push('company.name is required');
  }
  if (!candidate.signalType) errors.push('signalType is required');
  if (!candidate.markets || !Array.isArray(candidate.markets) || candidate.markets.length === 0) {
    errors.push('at least one market reference is required');
  }
  if (!candidate.whatChanged) errors.push('whatChanged is required');
  if (!candidate.evidence || !Array.isArray(candidate.evidence) || candidate.evidence.length === 0) {
    errors.push('at least one evidence record is required');
  }
  if (!candidate.relationships || !Array.isArray(candidate.relationships)) {
    errors.push('relationships must be an array');
  }
  if (!candidate.constraints || !Array.isArray(candidate.constraints)) {
    errors.push('constraints must be an array');
  }

  for (const evidence of candidate.evidence ?? []) {
    if (!evidence || typeof evidence !== 'object') {
      errors.push('evidence records must be objects');
      continue;
    }
    if (!evidence.url) errors.push('evidence.url is required');
    if (evidence.sourceType === 'regulator' && evidence.reliability < 80) {
      errors.push(`regulatory evidence has unexpectedly low reliability: ${evidence.url}`);
    }
  }

  return errors;
}

export const DEFAULT_COUNTRY_ANCHORS: Record<string, string[]> = {
  NG: ['CBN', 'NDPC', 'CAC', 'PAPSS'],
  KE: ['CBK', 'ODPC', 'EAC'],
  GH: ['Bank of Ghana', 'Data Protection Commission', 'GIPC', 'GhIPSS'],
  RW: ['BNR', 'RDB', 'Rwanda Revenue Authority', 'EAC'],
  UG: ['Bank of Uganda', 'Personal Data Protection Office', 'URSB', 'EAC'],
  TZ: ['Bank of Tanzania', 'Personal Data Protection Commission', 'TRA', 'EAC'],
  ZA: ['SARB', 'Information Regulator', 'FSCA'],
  EG: ['Central Bank of Egypt', 'GAFI', 'ITIDA'],
  MA: ['Bank Al-Maghrib', 'Ministry of Digital Transition', 'Tamwilcom'],
  ET: ['National Bank of Ethiopia', 'Ethio telecom', 'licensed payment operators'],
};

export const LOGON_CAPABILITY_MAP: Record<string, string> = {
  regulatory: 'AI governance and market-entry compliance intelligence',
  partner: 'Pan-African partner and referral intelligence',
  payment: 'Payments/API integration and workflow automation',
  data: 'Data governance, privacy and AI assurance',
  support: 'WhatsApp and customer-service automation',
  language: 'Local-language GEO/SEO and conversational support',
  acquisition: 'Post-acquisition integration and operational intelligence',
  hiring: 'Implementation-vendor and capability gap intelligence',
};
