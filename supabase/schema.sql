-- =============================================================
-- LeadScore Pipeline — Supabase Database Schema
-- =============================================================
-- Run this in your Supabase SQL Editor to set up all tables.
-- Includes: leads, subscribers, pipeline_stages, intent_signals,
--           scoring_rules, and audit logging.
-- =============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================
-- ENUM TYPES
-- =============================================================

CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'proposal', 'won', 'lost');
CREATE TYPE intent_level AS ENUM ('hot', 'warm', 'cool', 'cold');
CREATE TYPE subscriber_status AS ENUM ('active', 'unsubscribed', 'bounced');
CREATE TYPE acquisition_source AS ENUM ('organic', 'paid', 'referral', 'social', 'email');

-- =============================================================
-- LEADS TABLE
-- =============================================================

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  company TEXT,
  title TEXT,
  intent_score INTEGER DEFAULT 0 CHECK (intent_score >= 0 AND intent_score <= 100),
  intent_level intent_level DEFAULT 'cold',
  status lead_status DEFAULT 'new',
  source acquisition_source DEFAULT 'organic',
  tags TEXT[] DEFAULT '{}',
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_leads_intent_score ON leads(intent_score DESC);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_intent_level ON leads(intent_level);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);

-- =============================================================
-- INTENT SIGNALS TABLE
-- =============================================================

CREATE TABLE intent_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL,
  description TEXT,
  weight INTEGER DEFAULT 0 CHECK (weight >= 0 AND weight <= 100),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_signals_lead_id ON intent_signals(lead_id);
CREATE INDEX idx_signals_type ON intent_signals(signal_type);
CREATE INDEX idx_signals_created_at ON intent_signals(created_at DESC);

-- =============================================================
-- SUBSCRIBERS TABLE
-- =============================================================

CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  source acquisition_source DEFAULT 'organic',
  status subscriber_status DEFAULT 'active',
  lead_score INTEGER DEFAULT 0,
  engagement_rate NUMERIC(5,2) DEFAULT 0.00,
  metadata JSONB DEFAULT '{}',
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscribers_status ON subscribers(status);
CREATE INDEX idx_subscribers_source ON subscribers(source);
CREATE INDEX idx_subscribers_lead_score ON subscribers(lead_score DESC);

-- =============================================================
-- PIPELINE STAGES TABLE
-- =============================================================

CREATE TABLE pipeline_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL,
  color TEXT DEFAULT '#B8A089',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default pipeline stages
INSERT INTO pipeline_stages (name, slug, sort_order, color) VALUES
  ('New Leads', 'new', 1, '#B8A089'),
  ('Contacted', 'contacted', 2, '#7C9A82'),
  ('Qualified', 'qualified', 3, '#C4704B'),
  ('Proposal', 'proposal', 4, '#2C1810'),
  ('Won', 'won', 5, '#5A8A64');

-- =============================================================
-- SCORING RULES TABLE
-- =============================================================

CREATE TABLE scoring_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  signal_type TEXT NOT NULL UNIQUE,
  weight INTEGER DEFAULT 10 CHECK (weight >= 0 AND weight <= 100),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default scoring rules
INSERT INTO scoring_rules (signal_type, weight, description) VALUES
  ('page_visit_pricing', 25, 'Visited pricing page'),
  ('demo_request', 30, 'Requested a product demo'),
  ('content_download', 20, 'Downloaded content (whitepaper, guide, etc.)'),
  ('email_engagement', 15, 'Opened or clicked email'),
  ('social_interaction', 8, 'Engaged on social media'),
  ('webinar_signup', 15, 'Signed up for a webinar'),
  ('product_trial', 35, 'Started or completed a product trial');

-- =============================================================
-- ACTIVITY LOG TABLE
-- =============================================================

CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL, -- 'lead', 'subscriber', 'pipeline'
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_created_at ON activity_log(created_at DESC);

-- =============================================================
-- FUNCTIONS
-- =============================================================

-- Auto-update intent_level based on intent_score
CREATE OR REPLACE FUNCTION update_intent_level()
RETURNS TRIGGER AS $$
BEGIN
  NEW.intent_level := CASE
    WHEN NEW.intent_score >= 80 THEN 'hot'::intent_level
    WHEN NEW.intent_score >= 60 THEN 'warm'::intent_level
    WHEN NEW.intent_score >= 40 THEN 'cool'::intent_level
    ELSE 'cold'::intent_level
  END;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_intent_level
  BEFORE UPDATE OF intent_score ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_intent_level();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_subscribers_updated_at
  BEFORE UPDATE ON subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE intent_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoring_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access (adjust for your needs)
CREATE POLICY "Authenticated users can manage leads"
  ON leads FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage signals"
  ON intent_signals FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage subscribers"
  ON subscribers FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can read pipeline stages"
  ON pipeline_stages FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage scoring rules"
  ON scoring_rules FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read activity log"
  ON activity_log FOR SELECT
  USING (auth.role() = 'authenticated');
