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

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// --- Supabase Client ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log("✓ Supabase client initialized");
} else {
  console.warn("⚠ Supabase credentials not set — running in demo mode");
}

// --- Middleware ---
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(morgan("combined"));
app.use(express.json());

// -----------------------------------------------------
// Root routes (fix Render probes hitting "/" with 404)
// -----------------------------------------------------
app.get("/", (_req, res) => res.status(200).send("OK"));
app.head("/", (_req, res) => res.sendStatus(200));

// --- Health Check ---
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "lead-scoring-api",
    version: "1.0.0",
    supabase: supabase ? "connected" : "demo-mode",
    timestamp: new Date().toISOString(),
  });
});

// =====================================================
// LEADS ROUTES
// =====================================================

// GET /api/leads — List all leads with optional filters
app.get("/api/leads", async (req, res) => {
  try {
    if (!supabase) return res.json({ data: [], message: "Demo mode" });

    const { status, intent_level, source, search, sort, order, limit } = req.query;
    let query = supabase.from("leads").select("*");

    if (status) query = query.eq("status", status);
    if (intent_level) query = query.eq("intent_level", intent_level);
    if (source) query = query.eq("source", source);
    if (search)
      query = query.or(
        `name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`
      );

    const sortCol = sort || "intent_score";
    const sortOrder = order === "asc" ? true : false;
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
app.get("/api/leads/:id", async (req, res) => {
  try {
    if (!supabase) return res.json({ data: null, message: "Demo mode" });

    const { data: lead, error } = await supabase
      .from("leads")
      .select("*, intent_signals(*)")
      .eq("id", req.params.id)
      .single();

    if (error) throw error;
    res.json({ data: lead });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/leads — Create a new lead
app.post("/api/leads", async (req, res) => {
  try {
    if (!supabase) return res.json({ data: null, message: "Demo mode" });

    const { name, email, company, title, source, tags } = req.body;
    const { data, error } = await supabase
      .from("leads")
      .insert({ name, email, company, title, source, tags })
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from("activity_log").insert({
      entity_type: "lead",
      entity_id: data.id,
      action: "created",
      details: { name, email, company },
    });

    res.status(201).json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/leads/:id — Update a lead
app.patch("/api/leads/:id", async (req, res) => {
  try {
    if (!supabase) return res.json({ data: null, message: "Demo mode" });

    const { data, error } = await supabase
      .from("leads")
      .update(req.body)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/leads/:id — Delete a lead
app.delete("/api/leads/:id", async (req, res) => {
  try {
    if (!supabase) return res.json({ message: "Demo mode" });

    const { error } = await supabase.from("leads").delete().eq("id", req.params.id);

    if (error) throw error;
    res.json({ message: "Lead deleted" });
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
║  Supabase: ${supabase ? "Connected" : "Demo Mode"}              ║
╚══════════════════════════════════════════╝
  `);
});
