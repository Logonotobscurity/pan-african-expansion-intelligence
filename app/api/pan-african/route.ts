import { NextResponse } from "next/server"
import { buildExpansionQueue } from "@/lib/panAfricanExpansionService"
import { PAN_AFRICAN_TEST_SIGNALS } from "@/lib/panAfricanExpansionFixtures"
import {
  isExpansionPersistenceConfigured,
  persistExpansionSignals,
} from "@/lib/panAfricanExpansionRepository"
import { validateSignal, type ExpansionSignal } from "@/lib/panAfricanExpansionIntelligence"

export const dynamic = "force-dynamic"

function authorised(request: Request): boolean {
  const configured = process.env.EXPANSION_INGEST_SECRET
  if (!configured) return false
  return request.headers.get("authorization") === `Bearer ${configured}`
}

export async function GET() {
  const queue = buildExpansionQueue(PAN_AFRICAN_TEST_SIGNALS)
  return NextResponse.json({
    mode: isExpansionPersistenceConfigured() ? "fixture+persisted-runtime" : "fixture",
    generatedAt: new Date().toISOString(),
    persistenceConfigured: isExpansionPersistenceConfigured(),
    signals: queue,
  })
}

export async function POST(request: Request) {
  if (!authorised(request)) {
    return NextResponse.json(
      {
        error: "Expansion ingestion is protected. Configure EXPANSION_INGEST_SECRET and send Authorization: Bearer <secret>.",
      },
      { status: 401 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 })
  }

  const signals: ExpansionSignal[] = Array.isArray(body)
    ? (body as ExpansionSignal[])
    : typeof body === "object" && body !== null && Array.isArray((body as { signals?: unknown }).signals)
      ? ((body as { signals: ExpansionSignal[] }).signals)
      : []

  if (!signals.length) {
    return NextResponse.json({ error: "Provide a non-empty signals array." }, { status: 400 })
  }

  const rejected = signals.flatMap((signal, index) =>
    validateSignal(signal).map((error) => ({ index, error, signalId: signal.signalId })),
  )
  if (rejected.length) {
    return NextResponse.json({ error: "Validation failed.", rejected }, { status: 422 })
  }

  let persistence
  try {
    persistence = await persistExpansionSignals(signals)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Persistence configuration error." },
      { status: 503 },
    )
  }

  const failed = persistence.filter((item) => item.status === "failed")
  return NextResponse.json(
    {
      accepted: signals.length - failed.length,
      failed: failed.length,
      persistence,
      queue: buildExpansionQueue(signals),
    },
    { status: failed.length ? 207 : 200 },
  )
}
