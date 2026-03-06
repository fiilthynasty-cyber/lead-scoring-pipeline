/*
 * LeadFinder — URL-based AI lead discovery engine
 * User pastes their business URL → AI audits it → Discovers real leads with intent signals
 */
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Globe,
  Zap,
  Target,
  ExternalLink,
  Loader2,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Users,
  TrendingUp,
  MessageSquare,
  Save,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

type BusinessAudit = {
  businessName: string;
  offering: string;
  targetAudience: string;
  industry: string;
  valuePropositions: string[];
  problemsSolved: string[];
  keywords: string[];
};

type DiscoveredLead = {
  name: string;
  title: string;
  company: string;
  email: string;
  intentScore: number;
  intentLevel: "hot" | "warm" | "cool" | "cold";
  intentSignal: string;
  sourceUrl: string;
  sourcePlatform: string;
  profileUrl: string;
  confidence: "high" | "medium" | "low";
};

const intentColors: Record<string, string> = {
  hot: "bg-red-500/20 text-red-400 border-red-500/30",
  warm: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  cool: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  cold: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

const confidenceColors: Record<string, string> = {
  high: "bg-neon-green/20 text-neon-green border-neon-green/30",
  medium: "bg-neon-yellow/20 text-neon-yellow border-neon-yellow/30",
  low: "bg-neon-orange/20 text-neon-orange border-neon-orange/30",
};

const platformIcons: Record<string, string> = {
  Reddit: "🔴",
  Twitter: "🐦",
  LinkedIn: "💼",
  "Product Hunt": "🚀",
  Quora: "❓",
  GitHub: "🐙",
  Forum: "💬",
  HackerNews: "🟠",
};

export default function LeadFinder() {
  const [url, setUrl] = useState("");
  const [step, setStep] = useState<"input" | "auditing" | "audit-done" | "discovering" | "results">("input");
  const [audit, setAudit] = useState<BusinessAudit | null>(null);
  const [leads, setLeads] = useState<DiscoveredLead[]>([]);
  const [searchStrategy, setSearchStrategy] = useState("");
  const [selectedLeads, setSelectedLeads] = useState<Set<number>>(new Set());

  const auditMutation = trpc.leadFinder.auditUrl.useMutation({
    onSuccess: (data) => {
      setAudit(data as BusinessAudit);
      setStep("audit-done");
    },
    onError: (err) => {
      toast.error("Failed to audit URL: " + err.message);
      setStep("input");
    },
  });

  const discoverMutation = trpc.leadFinder.discoverLeads.useMutation({
    onSuccess: (data: { leads: DiscoveredLead[]; searchStrategy: string }) => {
      setLeads(data.leads);
      setSearchStrategy(data.searchStrategy);
      setSelectedLeads(new Set(data.leads.map((_, i) => i)));
      setStep("results");
    },
    onError: (err) => {
      toast.error("Failed to discover leads: " + err.message);
      setStep("audit-done");
    },
  });

  const saveMutation = trpc.leadFinder.saveDiscoveredLeads.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.savedCount} leads saved to your pipeline!`);
    },
    onError: (err) => {
      toast.error("Failed to save leads: " + err.message);
    },
  });

  const handleAudit = () => {
    if (!url.trim()) {
      toast.error("Please enter a URL");
      return;
    }
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith("http")) cleanUrl = "https://" + cleanUrl;
    setStep("auditing");
    auditMutation.mutate({ url: cleanUrl });
  };

  const handleDiscover = () => {
    if (!audit) return;
    setStep("discovering");
    discoverMutation.mutate({
      url: url.startsWith("http") ? url : "https://" + url,
      businessName: audit.businessName,
      offering: audit.offering,
      targetAudience: audit.targetAudience,
      industry: audit.industry,
      keywords: audit.keywords,
      problemsSolved: audit.problemsSolved,
    });
  };

  const handleSaveLeads = () => {
    const leadsToSave = leads.filter((_, i) => selectedLeads.has(i));
    if (leadsToSave.length === 0) {
      toast.error("Select at least one lead to save");
      return;
    }
    saveMutation.mutate({ leads: leadsToSave });
  };

  const toggleLead = (idx: number) => {
    setSelectedLeads((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const selectAll = () => setSelectedLeads(new Set(leads.map((_, i) => i)));
  const deselectAll = () => setSelectedLeads(new Set());

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-gradient-cyan">Lead Finder</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Paste your URL. AI audits your business and discovers real leads with buying intent.
          </p>
        </div>

        {/* URL Input Section */}
        <Card className="border-border/60 bg-card overflow-hidden">
          <div className="relative">
            {/* Glow effect behind input */}
            <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/5 via-neon-blue/5 to-neon-purple/5 pointer-events-none" />
            <CardContent className="relative p-6 lg:p-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-neon-cyan/15 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-neon-cyan" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Enter Your Business URL</h2>
                  <p className="text-sm text-muted-foreground">We'll analyze what you sell and find people looking for it</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://your-business.com"
                    className="pl-10 h-12 text-base bg-secondary/50 border-border/60 focus:border-neon-cyan/50 focus:ring-neon-cyan/20"
                    onKeyDown={(e) => e.key === "Enter" && handleAudit()}
                    disabled={step !== "input" && step !== "results"}
                  />
                </div>
                <Button
                  onClick={handleAudit}
                  disabled={step === "auditing" || step === "discovering" || !url.trim()}
                  className="h-12 px-6 bg-neon-cyan text-deep-navy font-semibold hover:bg-neon-cyan/90"
                >
                  {step === "auditing" ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Auditing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Audit & Find Leads
                    </>
                  )}
                </Button>
              </div>

              {/* Step indicator */}
              {step !== "input" && (
                <div className="flex items-center gap-4 mt-6">
                  <StepIndicator
                    step={1}
                    label="Audit URL"
                    active={step === "auditing"}
                    done={["audit-done", "discovering", "results"].includes(step)}
                  />
                  <div className="w-8 h-px bg-border/60" />
                  <StepIndicator
                    step={2}
                    label="Analyze Business"
                    active={step === "audit-done"}
                    done={step === "discovering" || step === "results"}
                  />
                  <div className="w-8 h-px bg-border/60" />
                  <StepIndicator
                    step={3}
                    label="Discover Leads"
                    active={step === "discovering"}
                    done={step === "results"}
                  />
                </div>
              )}
            </CardContent>
          </div>
        </Card>

        {/* Business Audit Results */}
        <AnimatePresence>
          {audit && (step === "audit-done" || step === "discovering" || step === "results") && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-border/60 bg-card">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-neon-blue/15 flex items-center justify-center">
                        <Target className="w-5 h-5 text-neon-blue" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Business Audit: {audit.businessName}</CardTitle>
                        <p className="text-sm text-muted-foreground">{audit.industry}</p>
                      </div>
                    </div>
                    {step === "audit-done" && (
                      <Button
                        onClick={handleDiscover}
                        className="bg-neon-cyan text-deep-navy font-semibold hover:bg-neon-cyan/90"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Find Leads Now
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                    {step === "discovering" && (
                      <div className="flex items-center gap-2 text-neon-cyan">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm font-medium">Discovering leads...</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">What You Offer</h4>
                      <p className="text-sm text-muted-foreground">{audit.offering}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Target Audience</h4>
                      <p className="text-sm text-muted-foreground">{audit.targetAudience}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Value Propositions</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {audit.valuePropositions.map((vp, i) => (
                          <Badge key={i} variant="outline" className="text-xs border-neon-cyan/30 text-neon-cyan/80">
                            {vp}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Search Keywords</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {audit.keywords.map((kw, i) => (
                          <Badge key={i} variant="outline" className="text-xs border-neon-purple/30 text-neon-purple/80">
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Discovered Leads */}
        <AnimatePresence>
          {step === "results" && leads.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Results header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neon-green/15 flex items-center justify-center">
                    <Users className="w-5 h-5 text-neon-green" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      {leads.length} Leads Discovered
                    </h2>
                    <p className="text-sm text-muted-foreground">{searchStrategy}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={selectAll} className="border-border/60">
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={deselectAll} className="border-border/60">
                    Deselect All
                  </Button>
                  <Button
                    onClick={handleSaveLeads}
                    disabled={selectedLeads.size === 0 || saveMutation.isPending}
                    className="bg-neon-cyan text-deep-navy font-semibold hover:bg-neon-cyan/90"
                  >
                    {saveMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save {selectedLeads.size} Lead{selectedLeads.size !== 1 ? "s" : ""} to Pipeline
                  </Button>
                </div>
              </div>

              {/* Lead cards */}
              <div className="grid gap-3">
                {leads.map((lead, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card
                      className={`border-border/60 bg-card transition-all cursor-pointer ${
                        selectedLeads.has(idx)
                          ? "ring-1 ring-neon-cyan/40 border-neon-cyan/30"
                          : "hover:border-border"
                      }`}
                      onClick={() => toggleLead(idx)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          {/* Checkbox */}
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 flex-shrink-0 transition-colors ${
                            selectedLeads.has(idx)
                              ? "bg-neon-cyan border-neon-cyan"
                              : "border-border/60"
                          }`}>
                            {selectedLeads.has(idx) && <CheckCircle className="w-3.5 h-3.5 text-deep-navy" />}
                          </div>

                          {/* Lead info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-foreground">{lead.name}</h3>
                              <Badge variant="outline" className={`text-[10px] ${intentColors[lead.intentLevel]}`}>
                                {lead.intentLevel.toUpperCase()} — {lead.intentScore}/100
                              </Badge>
                              <Badge variant="outline" className={`text-[10px] ${confidenceColors[lead.confidence]}`}>
                                {lead.confidence} confidence
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {lead.title} at <span className="text-foreground">{lead.company}</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">{lead.email}</p>

                            {/* Intent signal */}
                            <div className="mt-2 p-2.5 rounded-lg bg-secondary/50 border border-border/40">
                              <div className="flex items-center gap-1.5 mb-1">
                                <MessageSquare className="w-3.5 h-3.5 text-neon-cyan" />
                                <span className="text-xs font-medium text-neon-cyan">
                                  {platformIcons[lead.sourcePlatform] ?? "🌐"} Intent Signal — {lead.sourcePlatform}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                "{lead.intentSignal}"
                              </p>
                            </div>
                          </div>

                          {/* Action links */}
                          <div className="flex flex-col gap-1.5 flex-shrink-0">
                            <a
                              href={lead.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neon-cyan/10 text-neon-cyan text-xs font-medium hover:bg-neon-cyan/20 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              View Source
                            </a>
                            <a
                              href={lead.profileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neon-blue/10 text-neon-blue text-xs font-medium hover:bg-neon-blue/20 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              View Profile
                            </a>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Score distribution summary */}
              <Card className="border-border/60 bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-neon-cyan" />
                      <span className="text-sm font-medium text-foreground">Score Distribution:</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs">
                        <span className="inline-block w-2 h-2 rounded-full bg-red-400 mr-1" />
                        Hot: {leads.filter((l) => l.intentLevel === "hot").length}
                      </span>
                      <span className="text-xs">
                        <span className="inline-block w-2 h-2 rounded-full bg-orange-400 mr-1" />
                        Warm: {leads.filter((l) => l.intentLevel === "warm").length}
                      </span>
                      <span className="text-xs">
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-400 mr-1" />
                        Cool: {leads.filter((l) => l.intentLevel === "cool").length}
                      </span>
                      <span className="text-xs">
                        <span className="inline-block w-2 h-2 rounded-full bg-slate-400 mr-1" />
                        Cold: {leads.filter((l) => l.intentLevel === "cold").length}
                      </span>
                    </div>
                    <div className="ml-auto text-xs text-muted-foreground">
                      Avg Score: {Math.round(leads.reduce((a, l) => a + l.intentScore, 0) / leads.length)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state when no results yet */}
        {step === "input" && (
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: Globe, title: "1. Paste Your URL", desc: "Enter your business website and we'll analyze what you sell, your niche, and target audience." },
              { icon: Sparkles, title: "2. AI Audits Your Business", desc: "Our AI reads your site, identifies your value props, and builds a prospect profile." },
              { icon: Target, title: "3. Real Leads Found", desc: "We find people actively posting they need what you offer — with clickable links to reach them." },
            ].map((item) => (
              <Card key={item.title} className="border-border/60 bg-card">
                <CardContent className="p-5">
                  <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 flex items-center justify-center mb-3">
                    <item.icon className="w-5 h-5 text-neon-cyan" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function StepIndicator({ step, label, active, done }: { step: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
          done
            ? "bg-neon-green/20 text-neon-green"
            : active
            ? "bg-neon-cyan/20 text-neon-cyan"
            : "bg-secondary text-muted-foreground"
        }`}
      >
        {done ? <CheckCircle className="w-3.5 h-3.5" /> : step}
      </div>
      <span className={`text-xs font-medium ${done ? "text-neon-green" : active ? "text-neon-cyan" : "text-muted-foreground"}`}>
        {label}
      </span>
    </div>
  );
}
