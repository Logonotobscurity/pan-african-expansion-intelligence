import { PanAfricanExpansionDashboard } from "@/components/pan-african-expansion-dashboard"
import { PAN_AFRICAN_TEST_SIGNALS } from "@/lib/panAfricanExpansionFixtures"
import {
  isExpansionPersistenceConfigured,
  loadPersistedExpansionSignals,
} from "@/lib/panAfricanExpansionRepository"
import { buildExpansionQueue } from "@/lib/panAfricanExpansionService"

export const dynamic = "force-dynamic"

export default async function PanAfricanExpansionPage() {
  let signals = PAN_AFRICAN_TEST_SIGNALS
  let dataSource = "development fixtures"

  if (isExpansionPersistenceConfigured()) {
    try {
      const persisted = await loadPersistedExpansionSignals()
      if (persisted.length) {
        signals = persisted
        dataSource = "Supabase persisted signals"
      }
    } catch (error) {
      console.error("Failed to read persisted expansion signals:", error)
    }
  }

  const queue = buildExpansionQueue(signals)
  return <PanAfricanExpansionDashboard queue={queue} dataSource={dataSource} />
}
