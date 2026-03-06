/*
 * AI Scoring Engine — Score leads using AI with real-time analysis
 * Design: "Warm Precision" — Scandinavian editorial, warm tones
 */
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import {
  Brain,
  Zap,
  Target,
  TrendingUp,
  Loader2,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Sparkles,
  BarChart3,
  Globe,
  Radar,
  Building2,
  Link2,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

interface Signal {
  type: string;
  description: string;
  weight: number;
}

interface UrlLeadSuggestion {
  name: string | null;
  title: string;
  company: string;
  email: string | null;
  linkedinHint: string;
  confidence: number;
  reason: string;
  outreachAngle: string;
}

interface UrlLeadDiscoveryResult {
  url: string;
  companySummary: string;
  icp: string;
  strategy: string;
  leads: UrlLeadSuggestion[];
}

const signalTypes = [
  "Page Visit",
  "Content Download",
  "Email Open",
  "Demo Request",
  "Pricing Page",
  "Social Engagement",
  "Referral",
  "Form Submission",
  "Webinar Attendance",
  "API Usage",
];

export default function AIScoring() {
  const [showScoreDialog, setShowScoreDialog] = useState(false);
  const [scoringResult, setScoringResult] = useState<{
    score: number;
    level: string;
    summary: string;
    recommendations: string[];
    signals_analysis: string;
  } | null>(null);

  // Form state for manual scoring
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadCompany, setLeadCompany] = useState("");
  const [leadTitle, setLeadTitle] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [signals, setSignals] = useState<Signal[]>([
    { type: "Page Visit", description: "", weight: 5 },
  ]);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [urlLeadResult, setUrlLeadResult] = useState<UrlLeadDiscoveryResult | null>(null);

  // Queries
  const { data: allLeads, isLoading: leadsLoading } = trpc.leads.list.useQuery({ limit: 100 });
  const { data: leadStats } = trpc.leads.stats.useQuery();

  // Mutations
  const scoreLead = trpc.aiScoring.scoreLead.useMutation({
    onSuccess: (data) => {
      setScoringResult(data);
      setShowScoreDialog(true);
      toast.success(`Lead scored: ${data.score}/100 (${data.level})`);
    },
    onError: (err) => {
      toast.error(`Scoring failed: ${err.message}`);
    },
  });

  const batchScore = trpc.aiScoring.batchScore.useMutation({
    onSuccess: (data) => {
      toast.success(`Batch scored ${data.length} leads`);
    },
    onError: (err) => {
      toast.error(`Batch scoring failed: ${err.message}`);
    },
  });

  const findLeadsForUrl = trpc.aiScoring.findLeadsForUrl.useMutation({
    onSuccess: (data) => {
      setUrlLeadResult(data);
      toast.success(`Found ${data.leads.length} lead opportunities`);
    },
    onError: (err) => {
      toast.error(`URL analysis failed: ${err.message}`);
    },
  });

  const addSignal = () => {
    setSignals([...signals, { type: "Page Visit", description: "", weight: 5 }]);
  };

  const removeSignal = (index: number) => {
    setSignals(signals.filter((_, i) => i !== index));
  };

  const updateSignal = (index: number, field: keyof Signal, value: string | number) => {
    const updated = [...signals];
    updated[index] = { ...updated[index], [field]: value };
    setSignals(updated);
  };

  const handleScoreLead = () => {
    if (!leadName || !leadEmail || !leadCompany) {
      toast.error("Please fill in name, email, and company");
      return;
    }
    // For manual scoring, we create a lead first then score it
    scoreLead.mutate({
      leadId: 0, // Will be handled by the backend
      name: leadName,
      email: leadEmail,
      company: leadCompany,
      title: leadTitle || undefined,
      signals: signals.filter(s => s.description),
      additionalContext: additionalContext || undefined,
    });
  };

  const handleBatchScore = () => {
    if (!allLeads || allLeads.length === 0) {
      toast.error("No leads to score");
      return;
    }
    batchScore.mutate({ leadIds: allLeads.map(l => l.id) });
  };

  const handleFindLeadsForUrl = () => {
    if (!websiteUrl.trim()) {
      toast.error("Please enter a website URL");
      return;
    }
    findLeadsForUrl.mutate({ url: websiteUrl.trim() });
  };

  const useSuggestedLead = (lead: UrlLeadSuggestion) => {
    setLeadName(lead.name ?? "Prospect");
    setLeadEmail(lead.email ?? "prospect@example.com");
    setLeadCompany(lead.company);
    setLeadTitle(lead.title);
    setAdditionalContext(`Source URL: ${urlLeadResult?.url ?? "Unknown"}\nReason: ${lead.reason}\nOutreach Angle: ${lead.outreachAngle}`);
    toast.success("Lead details copied into scorer");
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-amber-600 bg-amber-50";
    if (score >= 30) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  const getLevelBadge = (level: string) => {
    const colors: Record<string, string> = {
      hot: "bg-red-100 text-red-700 border-red-200",
      warm: "bg-amber-100 text-amber-700 border-amber-200",
      cool: "bg-blue-100 text-blue-700 border-blue-200",
      cold: "bg-slate-100 text-slate-700 border-slate-200",
    };
    return colors[level] ?? colors.cold;
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display text-foreground">AI Scoring Engine</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Score leads using AI-powered intent analysis with OpenAI
          </p>
        </div>
        <Button
          onClick={handleBatchScore}
          disabled={batchScore.isPending || !allLeads?.length}
          className="bg-terracotta hover:bg-terracotta/90 text-white"
        >
          {batchScore.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          Batch Score All Leads
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Leads", value: leadStats?.total ?? 0, icon: Target, color: "text-terracotta" },
          { label: "Hot Leads", value: leadStats?.hot ?? 0, icon: Zap, color: "text-red-500" },
          { label: "Warm Leads", value: leadStats?.warm ?? 0, icon: TrendingUp, color: "text-amber-500" },
          { label: "Cool/Cold", value: (leadStats?.cool ?? 0) + (leadStats?.cold ?? 0), icon: BarChart3, color: "text-blue-500" },
        ].map((stat) => (
          <Card key={stat.label} className="border border-border/40">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold tabular-nums text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <motion.section variants={fadeUp} className="relative overflow-hidden rounded-2xl border border-terracotta/25 bg-gradient-to-br from-terracotta/10 via-sage/10 to-clay/10 p-5 md:p-6">
        <div className="pointer-events-none absolute -top-20 -right-16 h-52 w-52 rounded-full bg-terracotta/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-12 h-52 w-52 rounded-full bg-sage/20 blur-3xl" />

        <div className="relative space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-card/70 text-foreground border-border/60">
              <Radar className="w-3 h-3 mr-1" />
              URL Lead Radar
            </Badge>
            <Badge variant="outline" className="bg-card/50">
              Futuristic Prospect Discovery
            </Badge>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-display text-foreground">Drop in a URL, get lead targets instantly</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              Paste any company website and AI will infer the ICP, then generate high-probability buyers with outreach angles.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Globe className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://company-site.com"
                className="pl-9 h-11 bg-card/70 border-border/50"
              />
            </div>
            <Button
              onClick={handleFindLeadsForUrl}
              disabled={findLeadsForUrl.isPending}
              className="h-11 px-5 bg-espresso hover:bg-espresso-light text-white"
            >
              {findLeadsForUrl.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scanning Site
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Find Leads For URL
                </>
              )}
            </Button>
          </div>

          {urlLeadResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 rounded-xl border border-border/40 bg-card/65 p-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-lg border border-border/40 bg-background/60 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Company Read</p>
                  <p className="text-sm text-foreground mt-1">{urlLeadResult.companySummary}</p>
                </div>
                <div className="rounded-lg border border-border/40 bg-background/60 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Ideal Buyer Profile</p>
                  <p className="text-sm text-foreground mt-1">{urlLeadResult.icp}</p>
                </div>
                <div className="rounded-lg border border-border/40 bg-background/60 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Strategy</p>
                  <p className="text-sm text-foreground mt-1">{urlLeadResult.strategy}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Lead Opportunities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {urlLeadResult.leads.map((lead, idx) => (
                    <motion.div
                      key={`${lead.company}-${lead.title}-${idx}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="rounded-lg border border-border/40 bg-background/70 p-3 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{lead.name ?? "Potential Contact"}</p>
                          <p className="text-xs text-muted-foreground">{lead.title}</p>
                        </div>
                        <Badge className={getScoreColor(lead.confidence)}>{lead.confidence}%</Badge>
                      </div>

                      <div className="space-y-1 text-xs text-muted-foreground">
                        <p className="flex items-center gap-1.5"><Building2 className="w-3 h-3" />{lead.company}</p>
                        <p className="flex items-center gap-1.5"><Link2 className="w-3 h-3" />{lead.linkedinHint}</p>
                      </div>

                      <p className="text-xs text-foreground/85">{lead.reason}</p>
                      <p className="text-xs text-foreground/75 italic">Angle: {lead.outreachAngle}</p>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => useSuggestedLead(lead)}
                        className="w-full text-xs"
                      >
                        Use In AI Scorer
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manual Scoring Form */}
        <motion.div variants={fadeUp}>
          <Card className="border border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Brain className="w-5 h-5 text-terracotta" />
                Score a Lead
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Name *</label>
                  <Input
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    placeholder="Sarah Chen"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Email *</label>
                  <Input
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder="sarah@company.com"
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Company *</label>
                  <Input
                    value={leadCompany}
                    onChange={(e) => setLeadCompany(e.target.value)}
                    placeholder="Acme Corp"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Title</label>
                  <Input
                    value={leadTitle}
                    onChange={(e) => setLeadTitle(e.target.value)}
                    placeholder="VP of Marketing"
                    className="text-sm"
                  />
                </div>
              </div>

              {/* Intent Signals */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-muted-foreground">Intent Signals</label>
                  <Button variant="ghost" size="sm" onClick={addSignal} className="h-7 text-xs">
                    <Plus className="w-3 h-3 mr-1" /> Add Signal
                  </Button>
                </div>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {signals.map((signal, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Select
                        value={signal.type}
                        onValueChange={(v) => updateSignal(idx, "type", v)}
                      >
                        <SelectTrigger className="w-[140px] text-xs h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {signalTypes.map((t) => (
                            <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        value={signal.description}
                        onChange={(e) => updateSignal(idx, "description", e.target.value)}
                        placeholder="Visited pricing 3 times"
                        className="text-xs h-8 flex-1"
                      />
                      <Input
                        type="number"
                        value={signal.weight}
                        onChange={(e) => updateSignal(idx, "weight", Number(e.target.value))}
                        className="w-16 text-xs h-8"
                        min={1}
                        max={10}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSignal(idx)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Additional Context</label>
                <Textarea
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  placeholder="Any additional context about this lead..."
                  className="text-sm h-20 resize-none"
                />
              </div>

              <Button
                onClick={handleScoreLead}
                disabled={scoreLead.isPending}
                className="w-full bg-terracotta hover:bg-terracotta/90 text-white"
              >
                {scoreLead.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    AI is analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Score with AI
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Scored Leads */}
        <motion.div variants={fadeUp}>
          <Card className="border border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-terracotta" />
                Scored Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leadsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : !allLeads?.length ? (
                <div className="text-center py-12">
                  <Brain className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No leads scored yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Add leads and score them with AI</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {allLeads.filter(l => l.intentScore > 0).map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/20 hover:border-border/40 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${getScoreColor(lead.intentScore)}`}>
                          {lead.intentScore}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{lead.name}</p>
                          <p className="text-xs text-muted-foreground">{lead.company}</p>
                        </div>
                      </div>
                      <Badge className={`text-[10px] ${getLevelBadge(lead.intentLevel)}`}>
                        {lead.intentLevel}
                      </Badge>
                    </div>
                  ))}
                  {allLeads.filter(l => l.intentScore === 0).length > 0 && (
                    <div className="pt-2 border-t border-border/20">
                      <p className="text-xs text-muted-foreground/60 text-center">
                        {allLeads.filter(l => l.intentScore === 0).length} leads not yet scored
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Score Result Dialog */}
      <Dialog open={showScoreDialog} onOpenChange={setShowScoreDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-terracotta" />
              AI Scoring Result
            </DialogTitle>
          </DialogHeader>
          {scoringResult && (
            <div className="space-y-4">
              {/* Score Display */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/20">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold ${getScoreColor(scoringResult.score)}`}>
                  {scoringResult.score}
                </div>
                <div>
                  <Badge className={`text-xs mb-1 ${getLevelBadge(scoringResult.level)}`}>
                    {scoringResult.level.toUpperCase()}
                  </Badge>
                  <p className="text-sm text-foreground">{scoringResult.summary}</p>
                </div>
              </div>

              {/* Signal Analysis */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Signal Analysis</h4>
                <p className="text-sm text-foreground/80 bg-muted/20 p-3 rounded-lg">{scoringResult.signals_analysis}</p>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recommendations</h4>
                <div className="space-y-2">
                  {scoringResult.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-sage-dark flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/80">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
