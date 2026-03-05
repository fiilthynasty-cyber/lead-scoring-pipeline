/*
 * Leads Page — Full lead table with search, filters, and intent scoring details
 * Design: "Warm Precision" — Clean table design, warm accents, editorial typography
 * Uses real data from database via tRPC
 */
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { getIntentColor, getScoreGrade, getStatusColor } from "@/lib/data";
import {
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  Target,
  Mail,
  Calendar,
  Tag,
  Activity,
  Loader2,
  Brain,
  Users,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function Leads() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [intentFilter, setIntentFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"score" | "name" | "company" | "date">("score");
  const [selectedLead, setSelectedLead] = useState<any | null>(null);

  const { data: leadsData, isLoading } = trpc.leads.list.useQuery({ limit: 50 });
  const { data: leadStats } = trpc.leads.stats.useQuery();

  const filteredLeads = useMemo(() => {
    if (!leadsData || !Array.isArray(leadsData)) return [];
    let result = [...leadsData];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.company.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((l) => l.status === statusFilter);
    }
    if (intentFilter !== "all") {
      result = result.filter((l) => l.intentLevel === intentFilter);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "score": return (b.intentScore ?? 0) - (a.intentScore ?? 0);
        case "name": return a.name.localeCompare(b.name);
        case "company": return a.company.localeCompare(b.company);
        case "date": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default: return 0;
      }
    });

    return result;
  }, [leadsData, searchQuery, statusFilter, intentFilter, sortBy]);

  // Score distribution from real data
  const scoreDistribution = useMemo(() => {
    if (!leadsData || !Array.isArray(leadsData)) return [];
    const ranges = [
      { range: "0-20", min: 0, max: 20 },
      { range: "21-40", min: 21, max: 40 },
      { range: "41-60", min: 41, max: 60 },
      { range: "61-80", min: 61, max: 80 },
      { range: "81-100", min: 81, max: 100 },
    ];
    const total = leadsData.length || 1;
    return ranges.map(r => {
      const count = leadsData.filter(l => (l.intentScore ?? 0) >= r.min && (l.intentScore ?? 0) <= r.max).length;
      return { range: r.range, count, percentage: Math.round((count / total) * 100) };
    });
  }, [leadsData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-display text-foreground">Leads</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {filteredLeads.length} real SaaS company leads with intent scoring
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: leadStats?.total ?? 0, icon: Users, color: "text-foreground" },
          { label: "Hot", value: leadStats?.hot ?? 0, icon: Target, color: "text-red-600" },
          { label: "Warm", value: leadStats?.warm ?? 0, icon: TrendingUp, color: "text-amber-600" },
          { label: "Cool/Cold", value: (leadStats?.cool ?? 0) + (leadStats?.cold ?? 0), icon: Activity, color: "text-blue-500" },
        ].map(stat => (
          <motion.div key={stat.label} variants={itemVariants}>
            <Card className="border border-border/60 bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                </div>
                <p className={`text-2xl font-semibold mt-1 tabular-nums ${stat.color}`}>{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Score Distribution */}
      <motion.div variants={itemVariants}>
        <Card className="border border-border/60 bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-20">
              {scoreDistribution.map((bucket) => (
                <div key={bucket.range} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-sm bg-terracotta/70 transition-all duration-500"
                    style={{ height: `${Math.max(bucket.percentage * 0.8, 4)}px` }}
                  />
                  <span className="text-[10px] text-muted-foreground tabular-nums">{bucket.range}</span>
                  <span className="text-[10px] font-medium text-foreground tabular-nums">{bucket.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search leads by name, email, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card border-border/60"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] bg-card border-border/60">
            <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="proposal">Proposal</SelectItem>
            <SelectItem value="won">Won</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>
        <Select value={intentFilter} onValueChange={setIntentFilter}>
          <SelectTrigger className="w-[140px] bg-card border-border/60">
            <Target className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="Intent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Intent</SelectItem>
            <SelectItem value="hot">Hot</SelectItem>
            <SelectItem value="warm">Warm</SelectItem>
            <SelectItem value="cool">Cool</SelectItem>
            <SelectItem value="cold">Cold</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
          <SelectTrigger className="w-[140px] bg-card border-border/60">
            <ArrowUpDown className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="score">Score (High)</SelectItem>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="company">Company</SelectItem>
            <SelectItem value="date">Newest</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Leads Table */}
      <motion.div variants={itemVariants}>
        <Card className="border border-border/60 shadow-sm bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/20">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Lead</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Company</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Score</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Intent</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Source</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => {
                  const grade = getScoreGrade(lead.intentScore ?? 0);
                  return (
                    <tr
                      key={lead.id}
                      className="border-b border-border/30 hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-foreground">{lead.name}</p>
                          <p className="text-xs text-muted-foreground">{lead.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-foreground">{lead.company}</p>
                        <p className="text-xs text-muted-foreground">{lead.title}</p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-md border text-xs font-bold ${grade.color}`}>
                            {grade.label}
                          </span>
                          <span className="font-semibold tabular-nums text-foreground">{lead.intentScore}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary" className={`text-xs ${getIntentColor(lead.intentLevel as any)}`}>
                          {lead.intentLevel}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={`text-xs capitalize ${getStatusColor(lead.status as any)}`}>
                          {lead.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-xs capitalize">
                          {lead.source}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLead(lead);
                          }}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted-foreground">
                      <p className="text-sm">No leads match your filters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* Lead Detail Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{selectedLead?.name}</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                  <p className="text-xs text-muted-foreground">Company</p>
                  <p className="font-medium text-foreground">{selectedLead.company}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                  <p className="text-xs text-muted-foreground">Title</p>
                  <p className="font-medium text-foreground">{selectedLead.title || "N/A"}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground text-sm">{selectedLead.email}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                  <p className="text-xs text-muted-foreground">Source</p>
                  <p className="font-medium text-foreground capitalize">{selectedLead.source}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 border border-border/30">
                <div>
                  <p className="text-xs text-muted-foreground">Intent Score</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-md border text-sm font-bold ${getScoreGrade(selectedLead.intentScore ?? 0).color}`}>
                      {getScoreGrade(selectedLead.intentScore ?? 0).label}
                    </span>
                    <span className="text-2xl font-bold tabular-nums">{selectedLead.intentScore}</span>
                    <span className="text-sm text-muted-foreground">/ 100</span>
                  </div>
                </div>
                <div className="ml-auto">
                  <Badge variant="secondary" className={`${getIntentColor(selectedLead.intentLevel as any)}`}>
                    {selectedLead.intentLevel}
                  </Badge>
                </div>
              </div>

              {selectedLead.aiScoreSummary && (
                <div className="p-3 rounded-lg bg-terracotta/5 border border-terracotta/20">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Brain className="w-3.5 h-3.5 text-terracotta" />
                    <span className="text-xs font-medium text-terracotta">AI Analysis</span>
                  </div>
                  <p className="text-sm text-foreground">{selectedLead.aiScoreSummary}</p>
                </div>
              )}

              {selectedLead.signals && Array.isArray(selectedLead.signals) && selectedLead.signals.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Intent Signals</p>
                  <div className="space-y-2">
                    {(selectedLead.signals as any[]).map((signal: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-md bg-muted/20 border border-border/20">
                        <div className="flex items-center gap-2">
                          <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                          <div>
                            <p className="text-xs font-medium text-foreground">{signal.type}</p>
                            <p className="text-[11px] text-muted-foreground">{signal.description}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px]">+{signal.weight}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedLead.tags && Array.isArray(selectedLead.tags) && selectedLead.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                  {(selectedLead.tags as string[]).map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
