"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { ArrowUpRight, Building2, ChevronDown, CircleAlert, Globe2, Handshake, ShieldCheck, WalletCards } from "lucide-react"
import type { ScoredExpansionSignal } from "@/lib/panAfricanExpansionService"
import { buildCountryRadar, buildExpansionSummary } from "@/lib/panAfricanExpansionService"

type Filter = "all" | "Nigeria" | "Kenya" | "Uganda" | "Rwanda" | "DRC" | "South Africa" | "Côte d'Ivoire"

function normaliseCountry(country: string) {
  if (country === "Democratic Republic of the Congo") return "DRC"
  return country
}

export function PanAfricanExpansionDashboard({
  queue,
  dataSource,
}: {
  queue: ScoredExpansionSignal[]
  dataSource: string
}) {
  const [filter, setFilter] = useState<Filter>("all")
  const [expanded, setExpanded] = useState<string | null>(null)

  const summary = useMemo(() => buildExpansionSummary(queue), [queue])
  const countryRadar = useMemo(() => buildCountryRadar(queue), [queue])
  const visible = useMemo(() => {
    if (filter === "all") return queue
    return queue.filter((item) =>
      item.signal.markets.some(
        (market) => market.role === "target" && normaliseCountry(market.country) === filter,
      ),
    )
  }, [filter, queue])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="border-b bg-white/90 backdrop-blur">
        <div className="container mx-auto flex flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-purple-700">
              <Globe2 className="h-4 w-4" />
              LOG_ON Intelligence
            </div>
            <h1 className="mt-2 font-playfair text-3xl font-bold text-slate-950 md:text-4xl">
              Pan-African Expansion Watch
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <p className="max-w-2xl text-sm text-slate-600">
                Signal → evidence → country → constraint → partner → LOG_ON service → action.
              </p>
              <span className="rounded-full border bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                {dataSource}
              </span>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Back to analytics
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <main className="container mx-auto space-y-8 px-4 py-8">
        <section className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {[
            { label: "Signals", value: summary.signals, icon: Globe2 },
            { label: "Target markets", value: summary.targetMarkets, icon: Building2 },
            { label: "High constraints", value: summary.highConstraints, icon: CircleAlert },
            { label: "Contactable", value: summary.contactableSignals, icon: Handshake },
            { label: "Avg. queue score", value: summary.averageScore, icon: ShieldCheck },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-2xl border bg-white p-5 shadow-sm">
              <Icon className="h-5 w-5 text-purple-600" />
              <div className="mt-4 text-2xl font-semibold text-slate-950">{value}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </div>
          ))}
        </section>

        <section className="flex flex-wrap gap-2">
          {(["all", "Nigeria", "Kenya", "Uganda", "Rwanda", "DRC", "South Africa", "Côte d'Ivoire"] as Filter[]).map(
            (item) => (
              <button
                type="button"
                key={item}
                onClick={() => setFilter(item)}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${filter === item ? "border-slate-950 bg-slate-950 text-white" : "bg-white hover:bg-slate-50"}`}
              >
                {item === "all" ? "All markets" : item}
              </button>
            ),
          )}
        </section>

        <section className="space-y-4">
          <div>
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Country radar</h2>
                <p className="mt-1 text-sm text-slate-600">What the signal set says to verify locally before outreach or implementation.</p>
              </div>
              <span className="text-xs text-slate-500">{countryRadar.length} target markets</span>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {countryRadar.map((country) => (
                <div key={country.country} className="rounded-2xl border bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-950">{country.country}</div>
                      <div className="text-xs text-slate-500">{country.region}</div>
                    </div>
                    <div className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {country.signalCount} signal{country.signalCount === 1 ? "" : "s"}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {country.authorityAnchors.slice(0, 4).map((anchor) => (
                      <span key={anchor} className="rounded-full bg-slate-50 px-2 py-1 text-[11px] text-slate-600">
                        {anchor}
                      </span>
                    ))}
                  </div>
                  {country.topConstraintTypes.length > 0 && (
                    <div className="mt-4">
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Current verification flags</div>
                      <div className="mt-1 text-sm text-slate-700">{country.topConstraintTypes.join(" · ")}</div>
                    </div>
                  )}
                  <div className="mt-4 border-t pt-3 text-xs leading-5 text-slate-500">
                    Verify: {country.verificationTracks.join(" · ")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          {visible.map((item) => {
            const targetMarkets = item.signal.markets.filter((market) => market.role === "target")
            const primaryOpportunity = item.opportunities[0]
            const isExpanded = expanded === item.signal.signalId

            return (
              <article key={item.signal.signalId} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => setExpanded(isExpanded ? null : item.signal.signalId)}
                  className="w-full p-5 text-left md:p-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                        <span className="rounded-full bg-slate-100 px-2 py-1">{item.signal.signalType.replaceAll("_", " ")}</span>
                        <span>{item.signal.company.sector}</span>
                        {targetMarkets.map((market) => (
                          <span key={market.country} className="rounded-full bg-purple-50 px-2 py-1 text-purple-700">
                            {normaliseCountry(market.country)}
                          </span>
                        ))}
                      </div>
                      <h2 className="mt-3 text-xl font-semibold text-slate-950">{item.signal.company.name}</h2>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{item.signal.whatChanged}</p>
                    </div>

                    <div className="flex shrink-0 items-center gap-4">
                      <div className="rounded-xl bg-slate-950 px-4 py-3 text-white">
                        <div className="text-2xl font-semibold">{item.compositeScore}</div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-300">queue score</div>
                      </div>
                      <ChevronDown className={`h-5 w-5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                  </div>
                </button>

                <div className="grid border-t bg-slate-50 md:grid-cols-5">
                  {[
                    ["Evidence", item.scores.evidenceConfidence],
                    ["Intent", item.scores.expansionIntent],
                    ["Commercial", item.scores.commercialRelevance],
                    ["Urgency", item.scores.urgency],
                    ["Contactability", item.scores.contactability],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="border-b p-4 md:border-b-0 md:border-r">
                      <div className="text-[11px] uppercase tracking-wide text-slate-500">{String(label)}</div>
                      <div className="mt-1 text-lg font-semibold text-slate-900">{String(value)}</div>
                    </div>
                  ))}
                </div>

                {isExpanded && (
                  <div className="space-y-6 border-t p-5 md:p-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                      <div className="lg:col-span-2">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Market-entry workstream</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-700">{primaryOpportunity.problem}</p>
                        <div className="mt-4 rounded-xl border bg-slate-50 p-4">
                          <div className="flex items-center gap-2 text-sm font-semibold">
                            <WalletCards className="h-4 w-4" />
                            Recommended LOG_ON deliverable
                          </div>
                          <p className="mt-2 text-sm text-slate-700">{primaryOpportunity.deliverable}</p>
                          <p className="mt-3 text-xs font-medium text-slate-500">
                            Likely buyer: {primaryOpportunity.likelyBuyer} · Time to value: {primaryOpportunity.timeToValue}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Next action</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-700">{primaryOpportunity.nextBestAction}</p>
                        <p className="mt-4 rounded-lg bg-purple-50 p-3 text-xs leading-5 text-purple-900">
                          This queue is a prioritisation aid, not a claim that an expansion will occur. Verify material regulatory and payment requirements from primary sources before outreach.
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Constraints & evidence</h3>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        {item.signal.constraints.map((constraint) => (
                          <div key={`${constraint.country}-${constraint.type}-${constraint.requirement}`} className="rounded-xl border p-4">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-sm font-semibold">{normaliseCountry(constraint.country)}</span>
                              <span className="text-[10px] font-semibold uppercase text-slate-500">{constraint.severity}</span>
                            </div>
                            <p className="mt-2 text-sm leading-5 text-slate-600">{constraint.requirement}</p>
                            {constraint.evidenceUrl && (
                              <a
                                href={constraint.evidenceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-purple-700 hover:underline"
                                onClick={(event) => event.stopPropagation()}
                              >
                                Evidence <ArrowUpRight className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Potential referral / partner paths</h3>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        {item.signal.relationships.map((relationship) => (
                          <div key={`${relationship.organization}-${relationship.roleOrContact}`} className="rounded-xl border p-4">
                            <div className="text-sm font-semibold">{relationship.organization}</div>
                            <div className="mt-1 text-sm text-slate-600">{relationship.roleOrContact}</div>
                            <div className="mt-2 text-xs text-slate-500">{relationship.relationshipType} · confidence {relationship.confidence}</div>
                            {relationship.contactUrl && (
                              <a
                                href={relationship.contactUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-purple-700 hover:underline"
                                onClick={(event) => event.stopPropagation()}
                              >
                                Public contact path <ArrowUpRight className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Evidence ledger</h3>
                      <div className="mt-3 space-y-2">
                        {item.signal.evidence.map((evidence) => (
                          <div key={evidence.url} className="rounded-lg bg-slate-50 p-3 text-xs">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-semibold text-slate-800">{evidence.sourceName}</span>
                              <span className="text-slate-500">reliability {evidence.reliability}/100</span>
                            </div>
                            <a href={evidence.url} target="_blank" rel="noreferrer" className="mt-1 block break-all text-purple-700 hover:underline" onClick={(event) => event.stopPropagation()}>
                              {evidence.url}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </article>
            )
          })}
        </section>
      </main>
    </div>
  )
}
