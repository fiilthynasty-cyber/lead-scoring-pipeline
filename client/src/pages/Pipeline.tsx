/*
 * Pipeline Page — Visual funnel stages with lead cards per stage
 * Design: "Warm Precision" — Horizontal stage columns, warm color coding
 * Uses real data from database via tRPC
 */
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { getScoreGrade } from "@/lib/data";
import { motion } from "framer-motion";
import { ArrowRight, DollarSign, Users, Loader2, Target, TrendingUp } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const STAGE_CONFIG = [
  { id: "new", name: "New Leads", color: "#B8A089", bgClass: "bg-[#B8A089]/10" },
  { id: "contacted", name: "Contacted", color: "#7C9A82", bgClass: "bg-[#7C9A82]/10" },
  { id: "qualified", name: "Qualified", color: "#C4704B", bgClass: "bg-[#C4704B]/10" },
  { id: "proposal", name: "Proposal", color: "#2C1810", bgClass: "bg-[#2C1810]/10" },
  { id: "won", name: "Won", color: "#5A8A64", bgClass: "bg-[#5A8A64]/10" },
  { id: "lost", name: "Lost", color: "#9B2C2C", bgClass: "bg-[#9B2C2C]/10" },
];

export default function Pipeline() {
  const { data: leadsData, isLoading } = trpc.leads.list.useQuery({ limit: 50 });

  const stageLeads = useMemo(() => {
    if (!leadsData || !Array.isArray(leadsData)) return {};
    const grouped: Record<string, typeof leadsData> = {};
    for (const lead of leadsData) {
      if (!grouped[lead.status]) grouped[lead.status] = [];
      grouped[lead.status].push(lead);
    }
    // Sort each group by score descending
    for (const key of Object.keys(grouped)) {
      grouped[key].sort((a, b) => (b.intentScore ?? 0) - (a.intentScore ?? 0));
    }
    return grouped;
  }, [leadsData]);

  const totalLeads = leadsData?.length ?? 0;

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
        <h1 className="text-3xl font-display text-foreground">Pipeline</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Visual funnel with {totalLeads} real SaaS leads across {STAGE_CONFIG.length} stages
        </p>
      </motion.div>

      {/* Funnel Summary */}
      <motion.div variants={itemVariants}>
        <Card className="border border-border/60 bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 overflow-x-auto">
              {STAGE_CONFIG.map((stage, i) => {
                const count = stageLeads[stage.id]?.length ?? 0;
                const pct = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
                return (
                  <div key={stage.id} className="flex items-center gap-2">
                    <div className="text-center min-w-[80px]">
                      <div
                        className="mx-auto rounded-lg flex items-center justify-center"
                        style={{
                          width: `${Math.max(40, pct * 0.8 + 40)}px`,
                          height: `${Math.max(40, pct * 0.8 + 40)}px`,
                          backgroundColor: `${stage.color}20`,
                          border: `2px solid ${stage.color}`,
                        }}
                      >
                        <span className="text-lg font-bold tabular-nums" style={{ color: stage.color }}>{count}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">{stage.name}</p>
                      <p className="text-[10px] font-medium tabular-nums" style={{ color: stage.color }}>{pct}%</p>
                    </div>
                    {i < STAGE_CONFIG.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stage Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {STAGE_CONFIG.map((stage) => {
          const leads = stageLeads[stage.id] ?? [];
          return (
            <motion.div key={stage.id} variants={itemVariants}>
              <Card className="border border-border/60 bg-card h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                      <CardTitle className="text-sm font-display">{stage.name}</CardTitle>
                    </div>
                    <Badge variant="outline" className="text-xs tabular-nums">{leads.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-2 max-h-[400px] overflow-y-auto">
                  {leads.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">No leads in this stage</p>
                  )}
                  {leads.map((lead) => {
                    const grade = getScoreGrade(lead.intentScore ?? 0);
                    return (
                      <div
                        key={lead.id}
                        className="p-3 rounded-lg border border-border/30 bg-background hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="min-w-0">
                            <p className="font-medium text-foreground text-sm truncate">{lead.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{lead.company}</p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-[10px] font-bold border ${grade.color}`}>
                              {grade.label}
                            </span>
                            <span className="text-xs font-semibold tabular-nums">{lead.intentScore}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 mt-2">
                          <Badge variant="outline" className="text-[10px] capitalize">{lead.source}</Badge>
                          <Badge variant="secondary" className="text-[10px] capitalize">{lead.intentLevel}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
