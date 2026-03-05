/*
 * Pipeline Page — Visual funnel stages with lead cards per stage
 * Design: "Warm Precision" — Horizontal stage columns, warm color coding
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { pipelineStages, recentLeads, getScoreGrade } from "@/lib/data";
import { motion } from "framer-motion";
import { ArrowRight, DollarSign, Users } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const stageLeadMap: Record<string, typeof recentLeads> = {
  new: recentLeads.filter((l) => l.status === "new"),
  contacted: recentLeads.filter((l) => l.status === "contacted"),
  qualified: recentLeads.filter((l) => l.status === "qualified"),
  proposal: recentLeads.filter((l) => l.status === "proposal"),
  won: recentLeads.filter((l) => l.status === "won"),
};

export default function Pipeline() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-display text-foreground">Pipeline</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Visualize your lead conversion funnel. Leads flow from left to right through each stage.
        </p>
      </motion.div>

      {/* Funnel Visual */}
      <motion.div variants={itemVariants}>
        <Card className="border border-border/60 shadow-sm bg-card overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-end gap-1 h-32">
              {pipelineStages.map((stage, i) => (
                <div key={stage.id} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground tabular-nums">{stage.count}</span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${stage.percentage}%` }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className="w-full rounded-t-md min-h-[8px]"
                    style={{ backgroundColor: stage.color }}
                  />
                  <span className="text-[10px] text-muted-foreground text-center leading-tight">{stage.name}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>Total: <strong className="text-foreground">2,178</strong> leads in pipeline</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                <span>Value: <strong className="text-foreground">$1.38M</strong></span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pipeline Columns */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {pipelineStages.map((stage) => {
          const leads = stageLeadMap[stage.id] || [];
          return (
            <div key={stage.id} className="space-y-3">
              {/* Stage Header */}
              <div className="flex items-center gap-2 px-1">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: stage.color }}
                />
                <h3 className="text-sm font-semibold text-foreground">{stage.name}</h3>
                <Badge variant="secondary" className="text-[10px] ml-auto">
                  {stage.count}
                </Badge>
              </div>

              {/* Lead Cards */}
              <div className="space-y-2">
                {leads.length > 0 ? (
                  leads.map((lead) => {
                    const grade = getScoreGrade(lead.intentScore);
                    return (
                      <Card
                        key={lead.id}
                        className="border border-border/40 shadow-sm hover:shadow-md transition-shadow bg-card cursor-pointer"
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{lead.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{lead.company}</p>
                            </div>
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-[10px] font-bold flex-shrink-0 ${grade.color}`}>
                              {grade.label}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">{lead.lastActivity}</span>
                            <span className="text-xs font-semibold tabular-nums text-foreground">{lead.intentScore}</span>
                          </div>
                          {/* Score bar */}
                          <div className="h-1 bg-muted rounded-full overflow-hidden mt-2">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${lead.intentScore}%`,
                                backgroundColor: stage.color,
                              }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-xs text-muted-foreground">No leads in this stage</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Conversion Rates */}
      <motion.div variants={itemVariants}>
        <Card className="border border-border/60 shadow-sm bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-display">Stage Conversion Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 flex-wrap">
              {pipelineStages.map((stage, i) => (
                <div key={stage.id} className="flex items-center gap-2">
                  <div className="text-center">
                    <p className="text-lg font-semibold tabular-nums text-foreground">{stage.count}</p>
                    <p className="text-[10px] text-muted-foreground">{stage.name}</p>
                  </div>
                  {i < pipelineStages.length - 1 && (
                    <div className="flex flex-col items-center px-2">
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      <span className="text-[10px] text-terracotta font-medium tabular-nums">
                        {Math.round((pipelineStages[i + 1].count / stage.count) * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
