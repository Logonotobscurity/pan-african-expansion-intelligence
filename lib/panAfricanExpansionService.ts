import { PAN_AFRICAN_COUNTRY_PROFILES, COUNTRY_PROFILE_BY_NAME, type CountryProfile } from "@/lib/panAfricanCountryProfiles"
import {
  computeExpansionComposite,
  dedupeKey,
  evidenceConfidence,
  inferExpansionIntent,
  LOGON_CAPABILITY_MAP,
  type ExpansionSignal,
  type ExpansionScores,
  type LogonOpportunity,
} from "@/lib/panAfricanExpansionIntelligence"

const severityValue: Record<string, number> = { high: 3, medium: 2, low: 1, unknown: 0 }

function commercialRelevance(signal: ExpansionSignal): number {
  const byType: Record<string, number> = {
    ACQUISITION: 96,
    MARKET_ENTRY_ANNOUNCEMENT: 94,
    COUNTRY_LAUNCH: 94,
    PARTNERSHIP: 90,
    PAYMENT_RAIL_EXPANSION: 90,
    CROSS_BORDER_INFRASTRUCTURE: 92,
    CLOUD_OR_DATA_INFRASTRUCTURE: 88,
    PROCUREMENT_OR_RFP: 100,
    HIRING_EXPANSION: 82,
    FUNDING_ROUND: 76,
    DEBT_FACILITY: 82,
    GRANT_OR_PRIZE: 58,
    ACCELERATOR_OR_ECOSYSTEM_PROGRAMME: 60,
    LICENCE_OR_REGULATION: 70,
    PRODUCT_LOCALISATION: 84,
    TRADE_OR_DISTRIBUTION_EXPANSION: 86,
    COMPETITOR_MOVE: 68,
  }

  const capitalBonus = signal.capitalOrContractValue
    ? Math.min(10, Math.log10(signal.capitalOrContractValue) * 1.2)
    : 0

  return Math.min(100, (byType[signal.signalType] ?? 60) + capitalBonus)
}

function urgency(signal: ExpansionSignal): number {
  const ageDays = Math.max(
    0,
    (Date.now() - Date.parse(signal.lastMaterialUpdateAt ?? signal.observedAt)) / 86_400_000,
  )
  return Math.max(15, Math.min(100, 100 - ageDays * 2.2))
}

function contactability(signal: ExpansionSignal): number {
  if (signal.relationships.length === 0) return 25
  const confidence = signal.relationships.map((item) => item.confidence)
  const directContact = signal.relationships.some((item) => Boolean(item.contactUrl))
  const average = confidence.reduce((sum, value) => sum + value, 0) / confidence.length
  return Math.min(100, average + (directContact ? 10 : 0))
}

function scoreSignal(signal: ExpansionSignal): ExpansionScores {
  const scores: ExpansionScores = {
    evidenceConfidence: evidenceConfidence(signal.evidence),
    expansionIntent: inferExpansionIntent(signal),
    commercialRelevance: commercialRelevance(signal),
    urgency: urgency(signal),
    contactability: contactability(signal),
  }

  return scores
}

function opportunityFor(signal: ExpansionSignal): LogonOpportunity {
  const highestSeverity = [...signal.constraints].sort(
    (a, b) => severityValue[b.severity] - severityValue[a.severity],
  )[0]

  const constraintType = highestSeverity?.type
  const capability =
    signal.signalType === "ACQUISITION"
      ? LOGON_CAPABILITY_MAP.acquisition
      : constraintType
        ? LOGON_CAPABILITY_MAP[constraintType] ?? LOGON_CAPABILITY_MAP.partner
        : signal.signalType === "HIRING_EXPANSION"
          ? LOGON_CAPABILITY_MAP.hiring
          : LOGON_CAPABILITY_MAP.partner

  const target = signal.markets.find((market) => market.role === "target")
  const targetCountry = target?.country ?? signal.markets.find((market) => market.role === "origin")?.country ?? "target market"

  return {
    capability,
    problem:
      highestSeverity?.requirement ??
      "Turn the observed expansion signal into a verified market-entry workstream.",
    deliverable:
      signal.signalType === "ACQUISITION"
        ? "Post-acquisition integration map covering local operations, data flows, support and partner dependencies."
        : `Market-entry readiness brief for ${targetCountry}: evidence, constraints, partners, payments/data and implementation path.`,
    likelyBuyer:
      signal.signalType === "ACQUISITION"
        ? "COO / Integration Lead / Country Lead"
        : "Founder / COO / Head of Partnerships / Country Lead",
    timeToValue:
      signal.signalType === "ACQUISITION" || signal.signalType === "CROSS_BORDER_INFRASTRUCTURE"
        ? "weeks"
        : "days",
    nextBestAction:
      signal.relationships.length > 0
        ? `Validate the highest-confidence public relationship, then propose a scoped ${capability.toLowerCase()} work package.`
        : "Verify the target-market requirements with primary regulators and identify a local implementation/referral route.",
    scores: scoreSignal(signal),
    status: "new",
  }
}

export interface ScoredExpansionSignal {
  signal: ExpansionSignal
  scores: ExpansionScores
  compositeScore: number
  opportunities: LogonOpportunity[]
}

export function scoreExpansionSignal(signal: ExpansionSignal): ScoredExpansionSignal {
  const scores = scoreSignal(signal)
  return {
    signal,
    scores,
    compositeScore: computeExpansionComposite(scores),
    opportunities: [opportunityFor(signal)],
  }
}

export function buildExpansionQueue(signals: ExpansionSignal[]): ScoredExpansionSignal[] {
  const seen = new Set<string>()

  return signals
    .filter((signal) => {
      const key = dedupeKey({
        company: signal.company,
        signalType: signal.signalType,
        markets: signal.markets,
        lastMaterialUpdateAt: signal.lastMaterialUpdateAt,
      })
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .map(scoreExpansionSignal)
    .sort((a, b) => b.compositeScore - a.compositeScore)
}

export interface CountryRadarItem {
  country: string
  region: string
  signalCount: number
  highConstraints: number
  topConstraintTypes: string[]
  authorityAnchors: string[]
  verificationTracks: string[]
}

export function buildCountryRadar(queue: ScoredExpansionSignal[]): CountryRadarItem[] {
  const byCountry = new Map<string, ScoredExpansionSignal[]>()

  for (const item of queue) {
    for (const market of item.signal.markets.filter((entry) => entry.role === "target")) {
      const key = market.country.toLowerCase()
      const existing = byCountry.get(key) ?? []
      existing.push(item)
      byCountry.set(key, existing)
    }
  }

  return [...byCountry.entries()]
    .map(([key, items]) => {
      const profile: CountryProfile =
        COUNTRY_PROFILE_BY_NAME.get(key) ??
        PAN_AFRICAN_COUNTRY_PROFILES.find((item) => item.name.toLowerCase().includes(key)) ?? {
          iso2: "XX",
          name: items[0]?.signal.markets.find((market) => market.role === "target")?.country ?? key,
          region: "Unknown",
          authorityAnchors: [],
          verificationTracks: [],
        }

      const constraints = items.flatMap((item) =>
        item.signal.constraints.filter(
          (constraint) => constraint.country.toLowerCase() === key,
        ),
      )

      const topConstraintTypes = [...new Set(
        [...constraints]
          .sort((a, b) => severityValue[b.severity] - severityValue[a.severity])
          .map((constraint) => constraint.type),
      )].slice(0, 3)

      return {
        country: profile.name,
        region: profile.region,
        signalCount: items.length,
        highConstraints: constraints.filter((constraint) => constraint.severity === "high").length,
        topConstraintTypes,
        authorityAnchors: profile.authorityAnchors,
        verificationTracks: profile.verificationTracks,
      }
    })
    .sort((a, b) => b.signalCount - a.signalCount || b.highConstraints - a.highConstraints)
}

export function buildExpansionSummary(queue: ScoredExpansionSignal[]) {
  const allConstraints = queue.flatMap((item) => item.signal.constraints)
  const countries = new Set(
    queue.flatMap((item) =>
      item.signal.markets.filter((market) => market.role === "target").map((market) => market.country),
    ),
  )
  const highConstraints = allConstraints.filter((item) => item.severity === "high").length
  const contactable = queue.filter((item) => item.scores.contactability >= 70).length

  return {
    signals: queue.length,
    targetMarkets: countries.size,
    highConstraints,
    contactableSignals: contactable,
    averageScore: queue.length
      ? Number((queue.reduce((sum, item) => sum + item.compositeScore, 0) / queue.length).toFixed(1))
      : 0,
  }
}
