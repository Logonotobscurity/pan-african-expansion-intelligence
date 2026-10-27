import type { ExpansionSignal } from "@/lib/panAfricanExpansionIntelligence"

const retrievedAt = "2026-09-19T00:00:00.000Z"

export const PAN_AFRICAN_TEST_SIGNALS: ExpansionSignal[] = [
  {
    signalId: "flowcart-mastercard-kenya-east-africa-2026-09",
    observedAt: retrievedAt,
    publishedAt: "2026-09-07T00:00:00.000Z",
    lastMaterialUpdateAt: "2026-09-07T00:00:00.000Z",
    signalType: "PARTNERSHIP",
    company: {
      name: "Flowcart",
      hqCountry: "Kenya",
      sector: "Fintech",
      subsector: "Conversational commerce and payments",
      stage: "Scale-up",
    },
    markets: [
      { country: "Kenya", role: "origin", region: "East Africa", entryStatus: "active", explicitness: "explicit" },
      { country: "Kenya", role: "target", region: "East Africa", entryStatus: "active", explicitness: "explicit" },
      { country: "Uganda", role: "regional", region: "East Africa", entryStatus: "announced", explicitness: "explicit" },
      { country: "Tanzania", role: "regional", region: "East Africa", entryStatus: "announced", explicitness: "explicit" },
      { country: "South Africa", role: "target", region: "Southern Africa", entryStatus: "announced", explicitness: "explicit" },
      { country: "Nigeria", role: "target", region: "West Africa", entryStatus: "announced", explicitness: "explicit" },
      { country: "Côte d'Ivoire", role: "target", region: "West Africa", entryStatus: "announced", explicitness: "explicit" },
    ],
    whatChanged:
      "Mastercard announced a strategic collaboration with Flowcart to support secure card payments inside social and conversational commerce journeys, beginning in Kenya.",
    whyNow: "The partnership provides a concrete route from conversational commerce to payment acceptance across additional African markets.",
    growthIntent: "Scale chat-to-pay across East Africa and additional high-growth African markets.",
    entryStatus: "partnered",
    constraints: [
      {
        country: "Kenya",
        type: "payment",
        severity: "medium",
        requirement: "Map acquiring, checkout, QR/link and merchant integration requirements for the Kenyan launch.",
        evidenceUrl:
          "https://www.mastercard.com/news/eemea/en/newsroom/press-releases/en/2026/september/mastercard-and-flowcart-join-forces-to-power-secure-card-payments-into-social-commerce-in-east-africa/",
        lastVerifiedAt: retrievedAt,
      },
      {
        country: "Nigeria",
        type: "payment",
        severity: "high",
        requirement: "Validate local payment/acquiring and settlement requirements before market launch.",
        lastVerifiedAt: retrievedAt,
      },
      {
        country: "Côte d'Ivoire",
        type: "localisation",
        severity: "medium",
        requirement: "Validate French-language merchant and customer support flows and local checkout expectations.",
        lastVerifiedAt: retrievedAt,
      },
    ],
    evidence: [
      {
        sourceName: "Mastercard Newsroom",
        sourceType: "official",
        url:
          "https://www.mastercard.com/news/eemea/en/newsroom/press-releases/en/2026/september/mastercard-and-flowcart-join-forces-to-power-secure-card-payments-into-social-commerce-in-east-africa/",
        publishedAt: "2026-09-07T00:00:00.000Z",
        retrievedAt,
        reliability: 98,
        supports: ["funding", "entry", "partner", "payment"],
        excerpt: "The collaboration initially launches in Kenya and is planned to expand across East Africa and into South Africa, Nigeria and Côte d’Ivoire.",
      },
    ],
    relationships: [
      {
        organization: "Mastercard",
        roleOrContact: "East Africa and Indian Ocean Islands business team",
        relationshipType: "payments",
        country: "Kenya",
        contactUrl: "https://www.mastercard.com/news/eemea/",
        source: "Mastercard Newsroom",
        confidence: 88,
      },
    ],
  },
  {
    signalId: "creditchek-algosys-uganda-2026-09",
    observedAt: retrievedAt,
    publishedAt: "2026-09-10T00:00:00.000Z",
    lastMaterialUpdateAt: "2026-09-10T00:00:00.000Z",
    signalType: "ACQUISITION",
    company: {
      name: "CreditChek",
      hqCountry: "Nigeria",
      sector: "Fintech",
      subsector: "Credit and lending infrastructure",
      stage: "Growth",
    },
    markets: [
      { country: "Nigeria", role: "origin", region: "West Africa", entryStatus: "active", explicitness: "explicit" },
      { country: "Uganda", role: "target", region: "East Africa", entryStatus: "acquired", explicitness: "explicit" },
    ],
    whatChanged:
      "CreditChek acquired Ugandan core-banking software company Algosys, creating a direct operating foothold in Uganda.",
    whyNow: "The acquisition combines local core-banking distribution with CreditChek's credit, income and identity infrastructure.",
    growthIntent: "Build more localized lending infrastructure and expand the addressable African market.",
    entryStatus: "acquired",
    constraints: [
      {
        country: "Uganda",
        type: "partner",
        severity: "high",
        requirement: "Preserve and expand local institutional relationships while integrating the acquired operation.",
        evidenceUrl: "https://blog.creditchek.africa/",
        lastVerifiedAt: retrievedAt,
      },
      {
        country: "Uganda",
        type: "data",
        severity: "high",
        requirement: "Review data-sharing, privacy and cross-border data implications for a combined lending-data stack.",
        lastVerifiedAt: retrievedAt,
      },
      {
        country: "Uganda",
        type: "support",
        severity: "medium",
        requirement: "Retain local customer support and implementation knowledge during post-acquisition integration.",
        lastVerifiedAt: retrievedAt,
      },
    ],
    evidence: [
      {
        sourceName: "CreditChek",
        sourceType: "company",
        url: "https://blog.creditchek.africa/",
        publishedAt: "2026-09-10T00:00:00.000Z",
        retrievedAt,
        reliability: 96,
        supports: ["entry", "partner", "data", "localisation"],
        excerpt: "CreditChek says the acquisition marks its formal entry into Uganda and is part of a broader African expansion strategy.",
      },
    ],
    relationships: [
      {
        organization: "Algosys",
        roleOrContact: "Founding team and existing financial-institution network",
        relationshipType: "referral",
        country: "Uganda",
        contactUrl: "https://blog.creditchek.africa/",
        source: "CreditChek",
        confidence: 90,
      },
    ],
  },
  {
    signalId: "nomba-drc-cross-border-payments-2026-09",
    observedAt: retrievedAt,
    publishedAt: "2026-09-03T00:00:00.000Z",
    lastMaterialUpdateAt: "2026-09-03T00:00:00.000Z",
    signalType: "DEBT_FACILITY",
    company: {
      name: "Nomba",
      hqCountry: "Nigeria",
      sector: "Fintech",
      subsector: "Cross-border payments",
      stage: "Growth",
    },
    markets: [
      { country: "Nigeria", role: "origin", region: "West Africa", entryStatus: "active", explicitness: "explicit" },
      { country: "Democratic Republic of the Congo", role: "target", region: "Central Africa", entryStatus: "active", explicitness: "explicit" },
      { country: "Singapore", role: "corridor", region: "Asia", entryStatus: "active", explicitness: "explicit" },
      { country: "Hong Kong", role: "corridor", region: "Asia", entryStatus: "active", explicitness: "explicit" },
    ],
    whatChanged:
      "Nomba announced a $3 million debt facility to scale its cross-border payments infrastructure, with its DRC operations positioned as a settlement hub for Africa-Asia trade.",
    whyNow: "The transaction signals investment in settlement, liquidity and cross-border trade infrastructure rather than a single-country payment product.",
    capitalOrContractValue: 3000000,
    capitalCurrency: "USD",
    growthIntent: "Scale cross-border payments and settlement capacity.",
    entryStatus: "active",
    constraints: [
      {
        country: "Democratic Republic of the Congo",
        type: "payment",
        severity: "high",
        requirement: "Map licensed payment partners, settlement routes, FX handling and local operating requirements.",
        evidenceUrl:
          "https://nairametrics.com/2026/09/03/nomba-raises-3-million-debt-facility-to-scale-africa-asia-cross-border-payments/",
        lastVerifiedAt: retrievedAt,
      },
      {
        country: "Democratic Republic of the Congo",
        type: "regulatory",
        severity: "high",
        requirement: "Verify local payment, foreign-exchange and data obligations with primary regulators before implementation.",
        lastVerifiedAt: retrievedAt,
      },
      {
        country: "Singapore",
        type: "partner",
        severity: "medium",
        requirement: "Map banking and settlement counterparties supporting the Africa-Asia corridor.",
        lastVerifiedAt: retrievedAt,
      },
    ],
    evidence: [
      {
        sourceName: "Nairametrics",
        sourceType: "reputable_media",
        url:
          "https://nairametrics.com/2026/09/03/nomba-raises-3-million-debt-facility-to-scale-africa-asia-cross-border-payments/",
        publishedAt: "2026-09-03T00:00:00.000Z",
        retrievedAt,
        reliability: 88,
        supports: ["funding", "entry", "payment", "partner"],
        excerpt: "Nomba announced a $3 million debt facility for cross-border payments infrastructure and described DRC as a settlement hub.",
      },
    ],
    relationships: [
      {
        organization: "CardinalStone Finance Company",
        roleOrContact: "Financing counterparty",
        relationshipType: "capital",
        country: "Nigeria",
        contactUrl: "https://www.cardinalstone.com/",
        source: "Nairametrics",
        confidence: 86,
      },
    ],
  },
  {
    signalId: "chipmango-africa-edge-ai-2026-09",
    observedAt: retrievedAt,
    publishedAt: "2026-09-03T00:00:00.000Z",
    lastMaterialUpdateAt: "2026-09-03T00:00:00.000Z",
    signalType: "FUNDING_ROUND",
    company: {
      name: "ChipMango",
      hqCountry: "United States",
      sector: "AI / Semiconductors",
      subsector: "Edge AI and semiconductor engineering",
      stage: "Seed",
    },
    markets: [
      { country: "Rwanda", role: "target", region: "East Africa", entryStatus: "announced", explicitness: "inferred" },
      { country: "United States", role: "origin", region: "North America", entryStatus: "active", explicitness: "explicit" },
      { country: "Europe", role: "regional", entryStatus: "announced", explicitness: "explicit" },
      { country: "Africa", role: "regional", entryStatus: "announced", explicitness: "explicit" },
    ],
    whatChanged:
      "ChipMango announced a $1.9 million funding round to expand engineering talent, commercial design services and edge-AI development across the United States, Africa and Europe.",
    whyNow: "The funding supports delivery capacity, talent and new commercial engineering engagements across multiple regions.",
    capitalOrContractValue: 1900000,
    capitalCurrency: "USD",
    growthIntent: "Expand engineering capacity and commercial engagements across Africa and other regions.",
    entryStatus: "announced",
    constraints: [
      {
        country: "Rwanda",
        type: "partner",
        severity: "medium",
        requirement: "Identify local engineering, training, education and commercial partners before treating Rwanda as a country-specific launch.",
        lastVerifiedAt: retrievedAt,
      },
      {
        country: "Rwanda",
        type: "support",
        severity: "medium",
        requirement: "Localize technical enablement, training and client-success workflows for African delivery teams.",
        lastVerifiedAt: retrievedAt,
      },
    ],
    evidence: [
      {
        sourceName: "PR Newswire / PRWeb",
        sourceType: "company",
        url:
          "https://www.prweb.com/releases/chipmango-raises-1-9-million-to-expand-semiconductor-talent-and-design-capability-302868680.html",
        publishedAt: "2026-09-03T00:00:00.000Z",
        retrievedAt,
        reliability: 84,
        supports: ["funding", "entry", "hiring", "partner"],
        excerpt:
          "ChipMango says the round will expand engineering and product-development capacity across the United States, Africa and Europe.",
      },
    ],
    relationships: [
      {
        organization: "Atlantica Ventures",
        roleOrContact: "Lead investor",
        relationshipType: "capital",
        country: "Africa",
        contactUrl: "https://www.atlanticaventures.com/",
        source: "PRWeb company release",
        confidence: 78,
      },
    ],
  },
]
