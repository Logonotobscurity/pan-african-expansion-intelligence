-- LOG_ON Pan-African Expansion Intelligence schema
-- PostgreSQL / Supabase compatible
-- Intended as an additive migration to the existing discovery schema.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS expansion_countries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    iso2 CHAR(2) NOT NULL UNIQUE,
    iso3 CHAR(3) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL UNIQUE,
    region VARCHAR(40) NOT NULL,
    market_version DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    profile JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS expansion_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    entity_type VARCHAR(40) NOT NULL,
    website_url TEXT,
    country_id UUID REFERENCES expansion_countries(id) ON DELETE SET NULL,
    sector VARCHAR(120),
    subsector VARCHAR(120),
    stage VARCHAR(40),
    description TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(name, entity_type)
);

CREATE TABLE IF NOT EXISTS expansion_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    signal_key VARCHAR(180) NOT NULL UNIQUE,
    signal_type VARCHAR(60) NOT NULL,
    entity_id UUID REFERENCES expansion_entities(id) ON DELETE SET NULL,
    observed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    published_at TIMESTAMPTZ,
    last_material_update_at TIMESTAMPTZ,
    headline TEXT NOT NULL,
    what_changed TEXT NOT NULL,
    why_now TEXT,
    capital_or_contract_value NUMERIC(20,2),
    capital_currency CHAR(3),
    expansion_intent_notes TEXT,
    entry_status VARCHAR(40),
    confidence SMALLINT NOT NULL DEFAULT 0 CHECK (confidence BETWEEN 0 AND 100),
    raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS signal_markets (
    signal_id UUID NOT NULL REFERENCES expansion_signals(id) ON DELETE CASCADE,
    country_id UUID NOT NULL REFERENCES expansion_countries(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('origin','target','corridor','regional')),
    city VARCHAR(120),
    explicitness VARCHAR(20) NOT NULL DEFAULT 'explicit',
    entry_status VARCHAR(40),
    PRIMARY KEY(signal_id, country_id, role)
);

CREATE TABLE IF NOT EXISTS market_constraints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    signal_id UUID NOT NULL REFERENCES expansion_signals(id) ON DELETE CASCADE,
    country_id UUID NOT NULL REFERENCES expansion_countries(id) ON DELETE CASCADE,
    constraint_type VARCHAR(40) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'unknown',
    requirement TEXT NOT NULL,
    evidence_status VARCHAR(20) NOT NULL DEFAULT 'unverified',
    source_evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
    last_verified_at TIMESTAMPTZ,
    UNIQUE(signal_id, country_id, constraint_type, requirement)
);

CREATE TABLE IF NOT EXISTS expansion_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    signal_id UUID NOT NULL REFERENCES expansion_signals(id) ON DELETE CASCADE,
    source_name VARCHAR(255) NOT NULL,
    source_type VARCHAR(40) NOT NULL,
    url TEXT NOT NULL,
    published_at TIMESTAMPTZ,
    retrieved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reliability SMALLINT NOT NULL DEFAULT 50 CHECK (reliability BETWEEN 0 AND 100),
    supports TEXT[] NOT NULL DEFAULT '{}',
    excerpt TEXT,
    UNIQUE(signal_id, url)
);

CREATE TABLE IF NOT EXISTS expansion_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_entity_id UUID NOT NULL REFERENCES expansion_entities(id) ON DELETE CASCADE,
    to_entity_id UUID NOT NULL REFERENCES expansion_entities(id) ON DELETE CASCADE,
    relationship_type VARCHAR(60) NOT NULL,
    country_id UUID REFERENCES expansion_countries(id) ON DELETE SET NULL,
    source_evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
    confidence SMALLINT NOT NULL DEFAULT 50 CHECK (confidence BETWEEN 0 AND 100),
    last_verified_at TIMESTAMPTZ,
    UNIQUE(from_entity_id, to_entity_id, relationship_type, country_id)
);

CREATE TABLE IF NOT EXISTS public_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID REFERENCES expansion_entities(id) ON DELETE CASCADE,
    name VARCHAR(255),
    public_role VARCHAR(120),
    contact_type VARCHAR(40) NOT NULL,
    url TEXT NOT NULL,
    country_id UUID REFERENCES expansion_countries(id) ON DELETE SET NULL,
    verification_source TEXT,
    last_verified_at TIMESTAMPTZ,
    confidence SMALLINT NOT NULL DEFAULT 50 CHECK (confidence BETWEEN 0 AND 100)
);

CREATE TABLE IF NOT EXISTS expansion_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    signal_id UUID NOT NULL REFERENCES expansion_signals(id) ON DELETE CASCADE,
    country_id UUID REFERENCES expansion_countries(id) ON DELETE SET NULL,
    logon_capability VARCHAR(100) NOT NULL,
    problem TEXT NOT NULL,
    deliverable TEXT NOT NULL,
    likely_buyer VARCHAR(160),
    time_to_value VARCHAR(30),
    next_best_action TEXT,
    deadline TIMESTAMPTZ,
    status VARCHAR(30) NOT NULL DEFAULT 'new',
    evidence_confidence SMALLINT NOT NULL DEFAULT 0 CHECK (evidence_confidence BETWEEN 0 AND 100),
    expansion_intent SMALLINT NOT NULL DEFAULT 0 CHECK (expansion_intent BETWEEN 0 AND 100),
    commercial_relevance SMALLINT NOT NULL DEFAULT 0 CHECK (commercial_relevance BETWEEN 0 AND 100),
    urgency SMALLINT NOT NULL DEFAULT 0 CHECK (urgency BETWEEN 0 AND 100),
    contactability SMALLINT NOT NULL DEFAULT 0 CHECK (contactability BETWEEN 0 AND 100),
    composite_score NUMERIC(5,2) GENERATED ALWAYS AS (
        0.25 * evidence_confidence +
        0.20 * expansion_intent +
        0.30 * commercial_relevance +
        0.15 * urgency +
        0.10 * contactability
    ) STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expansion_signals_type ON expansion_signals(signal_type);
CREATE INDEX IF NOT EXISTS idx_expansion_signals_entity ON expansion_signals(entity_id);
CREATE INDEX IF NOT EXISTS idx_expansion_signals_published ON expansion_signals(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_expansion_signals_updated ON expansion_signals(last_material_update_at DESC);
CREATE INDEX IF NOT EXISTS idx_signal_markets_country ON signal_markets(country_id);
CREATE INDEX IF NOT EXISTS idx_constraints_country_type ON market_constraints(country_id, constraint_type);
CREATE INDEX IF NOT EXISTS idx_evidence_signal ON expansion_evidence(signal_id);
CREATE INDEX IF NOT EXISTS idx_relationships_from ON expansion_relationships(from_entity_id);
CREATE INDEX IF NOT EXISTS idx_relationships_to ON expansion_relationships(to_entity_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_country ON expansion_opportunities(country_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_score ON expansion_opportunities(composite_score DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON expansion_opportunities(status);

CREATE VIEW expansion_intelligence_queue AS
SELECT
    o.id,
    s.signal_key,
    s.headline,
    s.signal_type,
    e.name AS company_name,
    c.name AS target_country,
    o.logon_capability,
    o.deliverable,
    o.next_best_action,
    o.composite_score,
    o.status,
    s.last_material_update_at
FROM expansion_opportunities o
JOIN expansion_signals s ON s.id = o.signal_id
LEFT JOIN expansion_entities e ON e.id = s.entity_id
LEFT JOIN expansion_countries c ON c.id = o.country_id
WHERE o.status IN ('new','researching','contacted','watch')
ORDER BY o.composite_score DESC, s.last_material_update_at DESC;

-- Seed the first priority African markets. Detailed profiles belong in the application/knowledge layer.
INSERT INTO expansion_countries (iso2, iso3, name, region)
VALUES
('NG','NGA','Nigeria','West Africa'),
('KE','KEN','Kenya','East Africa'),
('GH','GHA','Ghana','West Africa'),
('RW','RWA','Rwanda','East Africa'),
('UG','UGA','Uganda','East Africa'),
('TZ','TZA','Tanzania','East Africa'),
('ZA','ZAF','South Africa','Southern Africa'),
('EG','EGY','Egypt','North Africa'),
('MA','MAR','Morocco','North Africa'),
('ET','ETH','Ethiopia','East Africa'),
('CD','COD','Democratic Republic of the Congo','Central Africa'),
('CI','CIV','Côte d'Ivoire','West Africa')
ON CONFLICT (iso2) DO NOTHING;
