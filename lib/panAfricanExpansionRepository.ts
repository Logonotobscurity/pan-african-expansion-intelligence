import { COUNTRY_PROFILE_BY_NAME } from "@/lib/panAfricanCountryProfiles"
import { buildExpansionQueue } from "@/lib/panAfricanExpansionService"
import { validateSignal, type ExpansionSignal } from "@/lib/panAfricanExpansionIntelligence"

interface SupabaseRow {
  id: string
  name?: string
  iso2?: string
}

function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "")
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error("Supabase persistence is not configured.")
  }

  return { url, key }
}

export function isExpansionPersistenceConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

async function supabaseRequest<T = unknown>(resource: string, init: RequestInit = {}): Promise<T> {
  const { url, key } = config()
  const response = await fetch(`${url}/rest/v1/${resource}`, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`Supabase request failed (${response.status}): ${detail.slice(0, 500)}`)
  }

  const text = await response.text()
  return text ? (JSON.parse(text) as T) : (undefined as T)
}

async function upsert<T extends SupabaseRow>(
  table: string,
  row: Record<string, unknown>,
  conflict: string,
): Promise<T> {
  const result = await supabaseRequest<T[]>(
    `${table}?on_conflict=${encodeURIComponent(conflict)}`,
    {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(row),
    },
  )

  const first = result?.[0]
  if (!first?.id) throw new Error(`Supabase did not return an id for ${table}.`)
  return first
}

async function countryId(countryName: string): Promise<string> {
  const profile = COUNTRY_PROFILE_BY_NAME.get(countryName.trim().toLowerCase())
  if (!profile) {
    throw new Error(`No country profile exists for "${countryName}". Add the market profile before ingestion.`)
  }

  const row = await upsert<SupabaseRow>(
    "expansion_countries",
    {
      iso2: profile.iso2,
      iso3: profile.iso3,
      name: profile.name,
      region: profile.region,
      profile: {
        authorityAnchors: profile.authorityAnchors,
        verificationTracks: profile.verificationTracks,
      },
    },
    "iso2",
  )
  return row.id
}

async function optionalCountryId(countryName?: string): Promise<string | null> {
  if (!countryName) return null
  if (!COUNTRY_PROFILE_BY_NAME.has(countryName.trim().toLowerCase())) return null
  return countryId(countryName)
}

async function entityId(
  name: string,
  entityType: string,
  country?: string,
  metadata: Record<string, unknown> = {},
): Promise<string> {
  const resolvedCountryId = await optionalCountryId(country)
  const row = await upsert<SupabaseRow>(
    "expansion_entities",
    {
      name,
      entity_type: entityType,
      country_id: resolvedCountryId,
      metadata,
    },
    "name,entity_type",
  )
  return row.id
}

async function replaceChildren(
  signalId: string,
  rows: {
    table: string
    rows: Record<string, unknown>[]
    queryKey?: string
  }[],
) {
  for (const item of rows) {
    const queryKey = item.queryKey ?? "signal_id"
    await supabaseRequest(
      `${item.table}?${queryKey}=eq.${encodeURIComponent(signalId)}`,
      { method: "DELETE" },
    )
    if (item.rows.length === 0) continue
    await supabaseRequest(item.table, {
      method: "POST",
      body: JSON.stringify(item.rows),
    })
  }
}

async function persistOne(signal: ExpansionSignal) {
  const company = await entityId(
    signal.company.name,
    "company",
    signal.company.hqCountry,
    {
      sector: signal.company.sector,
      subsector: signal.company.subsector,
      stage: signal.company.stage,
      website: signal.company.website,
    },
  )

  const stableKey = [
    signal.company.name.trim().toLowerCase(),
    signal.signalType,
    signal.markets
      .filter((market) => market.role === "target")
      .map((market) => market.country.trim().toLowerCase())
      .sort()
      .join(",") || "unspecified-target",
  ].join("|")

  const storedSignal = await upsert<SupabaseRow>(
    "expansion_signals",
    {
      signal_key: stableKey,
      signal_type: signal.signalType,
      entity_id: company,
      observed_at: signal.observedAt,
      published_at: signal.publishedAt ?? null,
      last_material_update_at: signal.lastMaterialUpdateAt ?? null,
      headline: `${signal.company.name}: ${signal.signalType.replaceAll("_", " ")}`,
      what_changed: signal.whatChanged,
      why_now: signal.whyNow ?? null,
      capital_or_contract_value: signal.capitalOrContractValue ?? null,
      capital_currency: signal.capitalCurrency ?? null,
      expansion_intent_notes: signal.growthIntent ?? null,
      entry_status: signal.entryStatus,
      confidence: Math.round(signal.evidence.reduce((max, item) => Math.max(max, item.reliability), 0)),
      raw_payload: signal,
    },
    "signal_key",
  )

  const marketRows: Record<string, unknown>[] = []
  for (const market of signal.markets) {
    try {
      marketRows.push({
        signal_id: storedSignal.id,
        country_id: await countryId(market.country),
        role: market.role,
        city: market.city ?? null,
        explicitness: market.explicitness,
        entry_status: market.entryStatus ?? null,
      })
    } catch (error) {
      if (market.role === "target" || market.role === "origin") throw error
    }
  }

  const constraintRows: Record<string, unknown>[] = []
  for (const constraint of signal.constraints) {
    const resolvedCountryId = await countryId(constraint.country)
    constraintRows.push({
      signal_id: storedSignal.id,
      country_id: resolvedCountryId,
      constraint_type: constraint.type,
      severity: constraint.severity,
      requirement: constraint.requirement,
      evidence_status: constraint.evidenceUrl ? "sourced" : "verification_required",
      source_evidence: constraint.evidenceUrl ? { url: constraint.evidenceUrl } : {},
      last_verified_at: constraint.lastVerifiedAt ?? null,
    })
  }

  const evidenceRows = signal.evidence.map((evidence) => ({
    signal_id: storedSignal.id,
    source_name: evidence.sourceName,
    source_type: evidence.sourceType,
    url: evidence.url,
    published_at: evidence.publishedAt ?? null,
    retrieved_at: evidence.retrievedAt,
    reliability: evidence.reliability,
    supports: evidence.supports,
    excerpt: evidence.excerpt ?? null,
  }))

  const relationshipRows: Record<string, unknown>[] = []
  for (const relationship of signal.relationships) {
    const relatedEntity = await entityId(
      relationship.organization,
      relationship.relationshipType,
      relationship.country,
    )
    relationshipRows.push({
      from_entity_id: company,
      to_entity_id: relatedEntity,
      relationship_type: relationship.relationshipType,
      country_id: await optionalCountryId(relationship.country),
      source_evidence: {
        source: relationship.source ?? null,
        contactUrl: relationship.contactUrl ?? null,
      },
      confidence: relationship.confidence,
    })
  }

  const scored = buildExpansionQueue([signal])[0]
  const opportunityRows = (scored?.opportunities ?? []).map((opportunity) => ({
    signal_id: storedSignal.id,
    country_id: signal.markets.find((market) => market.role === "target")
      ? null
      : null,
    logon_capability: opportunity.capability,
    problem: opportunity.problem,
    deliverable: opportunity.deliverable,
    likely_buyer: opportunity.likelyBuyer ?? null,
    time_to_value: opportunity.timeToValue,
    next_best_action: opportunity.nextBestAction,
    deadline: opportunity.deadline ?? null,
    status: opportunity.status,
    evidence_confidence: Math.round(opportunity.scores.evidenceConfidence),
    expansion_intent: Math.round(opportunity.scores.expansionIntent),
    commercial_relevance: Math.round(opportunity.scores.commercialRelevance),
    urgency: Math.round(opportunity.scores.urgency),
    contactability: Math.round(opportunity.scores.contactability),
  }))

  const target = signal.markets.find((market) => market.role === "target")
  if (target && opportunityRows.length) {
    const targetId = await countryId(target.country)
    opportunityRows.forEach((row) => { row.country_id = targetId })
  }

  await replaceChildren(storedSignal.id, [
    { table: "signal_markets", rows: marketRows },
    { table: "market_constraints", rows: constraintRows },
    { table: "expansion_evidence", rows: evidenceRows },
    { table: "expansion_opportunities", rows: opportunityRows },
  ])

  if (relationshipRows.length) {
    await supabaseRequest("expansion_relationships", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify(relationshipRows),
    })
  }

  return storedSignal.id
}

export async function persistExpansionSignals(signals: ExpansionSignal[]) {
  if (!isExpansionPersistenceConfigured()) {
    throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before using persistent ingestion.")
  }

  const results: { signalId: string; status: "persisted" | "failed"; error?: string }[] = []

  for (const signal of signals) {
    try {
      await persistOne(signal)
      results.push({ signalId: signal.signalId, status: "persisted" })
    } catch (error) {
      results.push({
        signalId: signal.signalId,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown persistence error",
      })
    }
  }

  return results
}


export async function loadPersistedExpansionSignals(limit = 100): Promise<ExpansionSignal[]> {
  if (!isExpansionPersistenceConfigured()) return []

  const rows = await supabaseRequest<Array<{ raw_payload?: unknown }>>(
    `expansion_signals?select=raw_payload&order=last_material_update_at.desc&limit=${Math.min(Math.max(limit, 1), 200)}`,
  )

  const signals: ExpansionSignal[] = []
  for (const row of rows ?? []) {
    if (!row.raw_payload || typeof row.raw_payload !== "object") continue
    const candidate = row.raw_payload as ExpansionSignal
    if (validateSignal(candidate).length === 0) signals.push(candidate)
  }

  return signals
}
