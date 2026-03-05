/**
 * LeadScore Pipeline — Backend API (Render)
 * 
 * Express server with Supabase integration for:
 * - Lead CRUD + intent scoring
 * - Subscriber management
 * - Pipeline stage tracking
 * - Scoring rule configuration
 * - Activity logging
 * 
 * Deploy to Render as a Web Service.
 * Environment variables required:
 *   SUPABASE_URL, SUPABASE_SERVICE_KEY, PORT (optional, defaults to 3001)
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// --- Supabase Client ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✓ Supabase client initialized');
} else {
  console.warn('⚠ Supabase credentials not set — running in demo mode');
}

// --- Middleware ---
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan('combined'));
app.use(express.json());

// --- Health Check ---
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'lead-scoring-api',
    version: '1.0.0',
    supabase: supabase ? 'connected' : 'demo-mode',
    timestamp: new Date().toISOString(),
  });
});

// =====================================================
// LEADS ROUTES
// =====================================================

// GET /api/leads — List all leads with optional filters
app.get('/api/leads', async (req, res) => {
  try {
    if (!supabase) return res.json({ data: [], message: 'Demo mode' });

    const { status, intent_level, source, search, sort, order, limit } = req.query;
    let query = supabase.from('leads').select('*');

    if (status) query = query.eq('status', status);
    if (intent_level) query = query.eq('intent_level', intent_level);
    if (source) query = query.eq('source', source);
    if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`);
    
    const sortCol = sort || 'intent_score';
    const sortOrder = order === 'asc' ? true : false;
    query = query.order(sortCol, { ascending: sortOrder });
    query = query.limit(parseInt(limit) || 50);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/leads/:id — Get single lead with signals
app.get('/api/leads/:id', async (req, res) => {
  try {
    if (!supabase) return res.json({ data: null, message: 'Demo mode' });

    const { data: lead, error } = await supabase
      .from('leads')
      .select('*, intent_signals(*)')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json({ data: lead });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/leads — Create a new lead
app.post('/api/leads', async (req, res) => {
  try {
    if (!supabase) return res.json({ data: null, message: 'Demo mode' });

    const { name, email, company, title, source, tags } = req.body;
    const { data, error } = await supabase
      .from('leads')
      .insert({ name, email, company, title, source, tags })
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from('activity_log').insert({
      entity_type: 'lead',
      entity_id: data.id,
      action: 'created',
      details: { name, email, company },
    });

    res.status(201).json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/leads/:id — Update a lead
app.patch('/api/leads/:id', async (req, res) => {
  try {
    if (!supabase) return res.json({ data: null, message: 'Demo mode' });

    const { data, error } = await supabase
      .from('leads')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/leads/:id — Delete a lead
app.delete('/api/leads/:id', async (req, res) => {
  try {
    if (!supabase) return res.json({ message: 'Demo mode' });

    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Lead deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// INTENT SIGNALS ROUTES
// =====================================================

// POST /api/leads/:id/signals — Add an intent signal to a lead
app.post('/api/leads/:id/signals', async (req, res) => {
  try {
    if (!supabase) return res.json({ data: null, message: 'Demo mode' });

    const { signal_type, description, weight, metadata } = req.body;
    const leadId = req.params.id;

    // Insert signal
    const { data: signal, error: signalError } = await supabase
      .from('intent_signals')
      .insert({ lead_id: leadId, signal_type, description, weight, metadata })
      .select()
      .single();

    if (signalError) throw signalError;

    // Recalculate intent score (sum of all signal weights, capped at 100)
    const { data: signals } = await supabase
      .from('intent_signals')
      .select('weight')
      .eq('lead_id', leadId);

    const totalScore = Math.min(100, signals.reduce((sum, s) => sum + s.weight, 0));

    // Update lead score and last activity
    await supabase
      .from('leads')
      .update({ intent_score: totalScore, last_activity_at: new Date().toISOString() })
      .eq('id', leadId);

    res.status(201).json({ data: signal, newScore: totalScore });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// SUBSCRIBERS ROUTES
// =====================================================

// GET /api/subscribers — List subscribers
app.get('/api/subscribers', async (req, res) => {
  try {
    if (!supabase) return res.json({ data: [], message: 'Demo mode' });

    const { status, source, search, limit } = req.query;
    let query = supabase.from('subscribers').select('*');

    if (status) query = query.eq('status', status);
    if (source) query = query.eq('source', source);
    if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    query = query.order('subscribed_at', { ascending: false });
    query = query.limit(parseInt(limit) || 50);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/subscribers — Add a new subscriber
app.post('/api/subscribers', async (req, res) => {
  try {
    if (!supabase) return res.json({ data: null, message: 'Demo mode' });

    const { email, name, source } = req.body;
    const { data, error } = await supabase
      .from('subscribers')
      .insert({ email, name, source })
      .select()
      .single();

    if (error) throw error;

    await supabase.from('activity_log').insert({
      entity_type: 'subscriber',
      entity_id: data.id,
      action: 'subscribed',
      details: { email, name, source },
    });

    res.status(201).json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/subscribers/:id — Update subscriber
app.patch('/api/subscribers/:id', async (req, res) => {
  try {
    if (!supabase) return res.json({ data: null, message: 'Demo mode' });

    const { data, error } = await supabase
      .from('subscribers')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// PIPELINE ROUTES
// =====================================================

// GET /api/pipeline — Get pipeline stages with lead counts
app.get('/api/pipeline', async (req, res) => {
  try {
    if (!supabase) return res.json({ data: [], message: 'Demo mode' });

    const { data: stages, error } = await supabase
      .from('pipeline_stages')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) throw error;

    // Get lead counts per stage
    const stagesWithCounts = await Promise.all(
      stages.map(async (stage) => {
        const { count } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('status', stage.slug);
        return { ...stage, lead_count: count || 0 };
      })
    );

    res.json({ data: stagesWithCounts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// SCORING RULES ROUTES
// =====================================================

// GET /api/scoring-rules — Get all scoring rules
app.get('/api/scoring-rules', async (req, res) => {
  try {
    if (!supabase) return res.json({ data: [], message: 'Demo mode' });

    const { data, error } = await supabase
      .from('scoring_rules')
      .select('*')
      .order('weight', { ascending: false });

    if (error) throw error;
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/scoring-rules/:id — Update a scoring rule
app.patch('/api/scoring-rules/:id', async (req, res) => {
  try {
    if (!supabase) return res.json({ data: null, message: 'Demo mode' });

    const { data, error } = await supabase
      .from('scoring_rules')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// ANALYTICS / DASHBOARD ROUTES
// =====================================================

// GET /api/analytics/overview — Dashboard metrics
app.get('/api/analytics/overview', async (req, res) => {
  try {
    if (!supabase) return res.json({ data: {}, message: 'Demo mode' });

    const [
      { count: totalLeads },
      { count: activeSubscribers },
      { data: leads },
      { count: wonLeads },
    ] = await Promise.all([
      supabase.from('leads').select('*', { count: 'exact', head: true }),
      supabase.from('subscribers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('leads').select('intent_score'),
      supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'won'),
    ]);

    const avgScore = leads?.length
      ? Math.round(leads.reduce((sum, l) => sum + l.intent_score, 0) / leads.length)
      : 0;

    const conversionRate = totalLeads > 0
      ? ((wonLeads / totalLeads) * 100).toFixed(1)
      : '0.0';

    res.json({
      data: {
        totalLeads: totalLeads || 0,
        activeSubscribers: activeSubscribers || 0,
        avgIntentScore: avgScore,
        conversionRate: parseFloat(conversionRate),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║  LeadScore Pipeline API                  ║
║  Running on port ${PORT}                    ║
║  Supabase: ${supabase ? 'Connected' : 'Demo Mode'}              ║
╚══════════════════════════════════════════╝
  `);
});
