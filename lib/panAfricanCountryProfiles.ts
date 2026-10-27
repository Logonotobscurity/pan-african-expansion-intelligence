export interface CountryProfile {
  iso2: string
  iso3: string
  name: string
  region: string
  authorityAnchors: string[]
  verificationTracks: string[]
}

export const PAN_AFRICAN_COUNTRY_PROFILES: CountryProfile[] = [
  {
    iso2: "NG",
    iso3: "NGA",
    name: "Nigeria",
    region: "West Africa",
    authorityAnchors: ["CBN", "NDPC", "CAC", "PAPSS"],
    verificationTracks: ["payments", "data protection", "entity/tax", "cross-border settlement"],
  },
  {
    iso2: "KE",
    iso3: "KEN",
    name: "Kenya",
    region: "East Africa",
    authorityAnchors: ["CBK", "ODPC", "EAC"],
    verificationTracks: ["payments", "mobile money", "data protection", "EAC corridor"],
  },
  {
    iso2: "GH",
    iso3: "GHA",
    name: "Ghana",
    region: "West Africa",
    authorityAnchors: ["Bank of Ghana", "Data Protection Commission", "GIPC", "GhIPSS"],
    verificationTracks: ["payment licensing", "data protection", "foreign entry", "local partnerships"],
  },
  {
    iso2: "RW",
    iso3: "RWA",
    name: "Rwanda",
    region: "East Africa",
    authorityAnchors: ["BNR", "RDB", "Rwanda Revenue Authority", "EAC"],
    verificationTracks: ["payments", "entity route", "data protection", "regional trade"],
  },
  {
    iso2: "UG",
    iso3: "UGA",
    name: "Uganda",
    region: "East Africa",
    authorityAnchors: ["Bank of Uganda", "Personal Data Protection Office", "URSB", "EAC"],
    verificationTracks: ["financial licensing", "data protection", "entity route", "local support"],
  },
  {
    iso2: "TZ",
    iso3: "TZA",
    name: "Tanzania",
    region: "East Africa",
    authorityAnchors: ["Bank of Tanzania", "Personal Data Protection Commission", "TRA", "EAC"],
    verificationTracks: ["payments", "data protection", "tax", "Swahili operations"],
  },
  {
    iso2: "ZA",
    iso3: "ZAF",
    name: "South Africa",
    region: "Southern Africa",
    authorityAnchors: ["SARB", "Information Regulator", "FSCA"],
    verificationTracks: ["payments", "POPIA/data", "financial services", "enterprise procurement"],
  },
  {
    iso2: "EG",
    iso3: "EGY",
    name: "Egypt",
    region: "North Africa",
    authorityAnchors: ["Central Bank of Egypt", "GAFI", "ITIDA"],
    verificationTracks: ["regulated AI", "entity route", "Arabic/English support", "financial-sector partnerships"],
  },
  {
    iso2: "MA",
    iso3: "MAR",
    name: "Morocco",
    region: "North Africa",
    authorityAnchors: ["Bank Al-Maghrib", "Ministry of Digital Transition", "Tamwilcom"],
    verificationTracks: ["Arabic/French localisation", "payments", "investment ecosystem", "enterprise sales"],
  },
  {
    iso2: "ET",
    iso3: "ETH",
    name: "Ethiopia",
    region: "East Africa",
    authorityAnchors: ["National Bank of Ethiopia", "Ethio telecom", "licensed payment operators"],
    verificationTracks: ["payment licensing", "telecom/payment ecosystem", "local-language support", "foreign entry"],
  },
  {
    iso2: "CI",
    iso3: "CIV",
    name: "Côte d'Ivoire",
    region: "West Africa",
    authorityAnchors: ["BCEAO", "CNDP", "CEPICI", "PAPSS"],
    verificationTracks: ["payments", "data protection", "entity/tax", "French-language support"],
  },
  {
    iso2: "CD",
    iso3: "COD",
    name: "Democratic Republic of the Congo",
    region: "Central Africa",
    authorityAnchors: ["Banque Centrale du Congo", "national payment ecosystem"],
    verificationTracks: ["payments", "FX/settlement", "data protection", "local partner/entity route"],
  },
]

export const COUNTRY_PROFILE_BY_NAME = new Map(
  PAN_AFRICAN_COUNTRY_PROFILES.map((profile) => [profile.name.toLowerCase(), profile]),
)
