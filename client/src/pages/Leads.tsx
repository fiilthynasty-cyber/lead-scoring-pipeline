/*
 * Leads Page — Full lead table with search, filters, and intent scoring details
 * Design: "Warm Precision" — Clean table design, warm accents, editorial typography
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
import {
  recentLeads,
  getIntentColor,
  getScoreGrade,
  getStatusColor,
  scoreDistribution,
  type Lead,
  type IntentLevel,
  type LeadStatus,
} from "@/lib/data";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Eye,
  Zap,
  Clock,
  Tag,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

type SortKey = "intentScore" | "name" | "company" | "lastActivity";
type SortDir = "asc" | "desc";

export default function Leads() {
  const [search, setSearch] = useState("");
  const [intentFilter, setIntentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("intentScore");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const filteredLeads = useMemo(() => {
    let leads = [...recentLeads];
    if (search) {
      const q = search.toLowerCase();
      leads = leads.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.company.toLowerCase().includes(q)
      );
    }
    if (intentFilter !== "all") {
      leads = leads.filter((l) => l.intentLevel === intentFilter);
    }
    if (statusFilter !== "all") {
      leads = leads.filter((l) => l.status === statusFilter);
    }
    leads.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "intentScore") cmp = a.intentScore - b.intentScore;
      else if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "company") cmp = a.company.localeCompare(b.company);
      return sortDir === "desc" ? -cmp : cmp;
    });
    return leads;
  }, [search, intentFilter, statusFilter, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronDown className="w-3 h-3 opacity-30" />;
    return sortDir === "desc" ? (
      <ChevronDown className="w-3 h-3 text-terracotta" />
    ) : (
      <ChevronUp className="w-3 h-3 text-terracotta" />
    );
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display text-foreground">Leads</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {recentLeads.length} total leads in your pipeline. Click any lead for intent signal details.
          </p>
        </div>
        <Button className="bg-terracotta hover:bg-terracotta-dark text-white">
          + Add Lead
        </Button>
      </motion.div>

      {/* Score Distribution */}
      <motion.div variants={itemVariants}>
        <Card className="border border-border/60 shadow-sm bg-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-6 flex-wrap">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Score Distribution</p>
              <div className="flex items-center gap-1 flex-1 min-w-[200px]">
                {scoreDistribution.map((d) => (
                  <div
                    key={d.range}
                    className="h-8 rounded-sm transition-all hover:opacity-80 relative group"
                    style={{
                      width: `${d.percentage}%`,
                      backgroundColor:
                        d.range === "81-100"
                          ? "#5A8A64"
                          : d.range === "61-80"
                          ? "#C4704B"
                          : d.range === "41-60"
                          ? "#B8A089"
                          : d.range === "21-40"
                          ? "#d4c5b0"
                          : "#e8e0d6",
                    }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {d.range}: {d.count} leads
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>0-20</span>
                <span>21-40</span>
                <span>41-60</span>
                <span>61-80</span>
                <span>81-100</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search leads by name, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border/60"
          />
        </div>
        <Select value={intentFilter} onValueChange={setIntentFilter}>
          <SelectTrigger className="w-[150px] bg-card border-border/60">
            <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px] bg-card border-border/60">
            <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
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
      </motion.div>

      {/* Leads Table */}
      <motion.div variants={itemVariants}>
        <Card className="border border-border/60 shadow-sm bg-card overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    <th
                      className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => toggleSort("name")}
                    >
                      <span className="flex items-center gap-1">Lead <SortIcon col="name" /></span>
                    </th>
                    <th
                      className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => toggleSort("company")}
                    >
                      <span className="flex items-center gap-1">Company <SortIcon col="company" /></span>
                    </th>
                    <th
                      className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => toggleSort("intentScore")}
                    >
                      <span className="flex items-center gap-1">Score <SortIcon col="intentScore" /></span>
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Intent</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Source</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Activity</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead) => {
                    const grade = getScoreGrade(lead.intentScore);
                    return (
                      <tr
                        key={lead.id}
                        className="border-b border-border/30 hover:bg-muted/20 transition-colors cursor-pointer"
                        onClick={() => setSelectedLead(lead)}
                      >
                        <td className="py-3.5 px-4">
                          <div>
                            <p className="font-medium text-foreground">{lead.name}</p>
                            <p className="text-xs text-muted-foreground">{lead.email}</p>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="text-foreground">{lead.company}</p>
                          <p className="text-xs text-muted-foreground">{lead.title}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-md border text-xs font-bold ${grade.color}`}>
                              {grade.label}
                            </span>
                            <span className="font-semibold tabular-nums">{lead.intentScore}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant="secondary" className={`text-xs ${getIntentColor(lead.intentLevel)}`}>
                            {lead.intentLevel}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant="outline" className="text-xs capitalize">
                            {lead.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-xs text-muted-foreground capitalize">{lead.source}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-xs text-muted-foreground">{lead.lastActivity}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredLeads.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                <p className="text-sm">No leads match your filters.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Lead Detail Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-lg">
          {selectedLead && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">{selectedLead.name}</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {selectedLead.title} at {selectedLead.company}
                </p>
              </DialogHeader>
              <div className="space-y-5 mt-2">
                {/* Score */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-terracotta" />
                    <span className="text-sm font-medium">Intent Score</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-md border text-sm font-bold ${getScoreGrade(selectedLead.intentScore).color}`}>
                      {getScoreGrade(selectedLead.intentScore).label}
                    </span>
                    <span className="text-2xl font-semibold tabular-nums">{selectedLead.intentScore}</span>
                    <span className="text-sm text-muted-foreground">/ 100</span>
                  </div>
                </div>

                {/* Score bar */}
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-terracotta transition-all"
                    style={{ width: `${selectedLead.intentScore}%` }}
                  />
                </div>

                {/* Intent Signals */}
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-sage" />
                    Intent Signals
                  </h4>
                  <div className="space-y-2.5">
                    {selectedLead.signals.map((signal, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/30"
                      >
                        <div className="w-8 h-8 rounded-md bg-terracotta/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-terracotta">+{signal.weight}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{signal.type}</p>
                          <p className="text-xs text-muted-foreground">{signal.description}</p>
                        </div>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 flex-shrink-0">
                          <Clock className="w-3 h-3" />
                          {signal.timestamp}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-clay" />
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLead.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Meta */}
                <div className="flex gap-4 text-xs text-muted-foreground pt-2 border-t border-border/30">
                  <span>Source: <strong className="text-foreground capitalize">{selectedLead.source}</strong></span>
                  <span>Created: <strong className="text-foreground">{selectedLead.createdAt}</strong></span>
                  <span>Last active: <strong className="text-foreground">{selectedLead.lastActivity}</strong></span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

