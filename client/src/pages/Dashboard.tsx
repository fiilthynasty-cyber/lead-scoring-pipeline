/*
 * Dashboard Overview — Main metrics, charts, and pipeline summary
 * Design: "Warm Precision" — Generous whitespace, editorial typography, warm accents
 * Uses DM Serif Display for headings, terracotta/sage/clay palette
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  dashboardMetrics,
  weeklyLeadData,
  monthlyTrendData,
  sourceBreakdown,
  pipelineStages,
  recentLeads,
  getIntentColor,
  getScoreGrade,
} from "@/lib/data";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Users,
  Target,
  BarChart3,
  Activity,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import { Link } from "wouter";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0, 0, 0.2, 1] as const } },
};

const metricIcons = [Users, Target, BarChart3, Activity, TrendingUp, TrendingUp];

export default function Dashboard() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-display text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Your lead generation pipeline at a glance. Data refreshes every 15 minutes.
        </p>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {dashboardMetrics.map((metric, i) => {
          const Icon = metricIcons[i];
          return (
            <motion.div key={metric.label} variants={itemVariants}>
              <Card className="border border-border/60 shadow-sm hover:shadow-md transition-shadow duration-300 bg-card">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {metric.label}
                      </p>
                      <p className="text-2xl font-semibold text-foreground mt-1.5 font-sans tabular-nums">
                        {metric.value}
                      </p>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-3">
                    {metric.trend === "up" ? (
                      <TrendingUp className="w-3.5 h-3.5 text-sage-dark" />
                    ) : metric.trend === "down" ? (
                      <TrendingDown className="w-3.5 h-3.5 text-destructive" />
                    ) : (
                      <Minus className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        metric.trend === "up"
                          ? "text-sage-dark"
                          : metric.trend === "down"
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }`}
                    >
                      {metric.change > 0 ? "+" : ""}
                      {metric.change}%
                    </span>
                    <span className="text-xs text-muted-foreground">{metric.changeLabel}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Weekly Leads Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-3">
          <Card className="border border-border/60 shadow-sm bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-display">Weekly Lead Activity</CardTitle>
              <p className="text-xs text-muted-foreground">Leads generated, qualified, and converted this week</p>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyLeadData} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0.015 75)" vertical={false} />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 12, fill: "oklch(0.50 0.03 55)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "oklch(0.50 0.03 55)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(0.99 0.005 85)",
                        border: "1px solid oklch(0.90 0.015 75)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="leads" fill="#B8A089" radius={[4, 4, 0, 0]} name="Leads" />
                    <Bar dataKey="qualified" fill="#C4704B" radius={[4, 4, 0, 0]} name="Qualified" />
                    <Bar dataKey="converted" fill="#7C9A82" radius={[4, 4, 0, 0]} name="Converted" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Source Breakdown */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="border border-border/60 shadow-sm bg-card h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-display">Lead Sources</CardTitle>
              <p className="text-xs text-muted-foreground">Where your leads are coming from</p>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-3">
                {sourceBreakdown.map((source) => (
                  <div key={source.source} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{source.source}</span>
                      <span className="text-muted-foreground tabular-nums">
                        {source.count} ({source.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${source.percentage}%` }}
                        transition={{ duration: 0.8, ease: [0, 0, 0.2, 1] as const, delay: 0.2 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: source.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Monthly Trend + Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <motion.div variants={itemVariants}>
          <Card className="border border-border/60 shadow-sm bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-display">Growth Trend</CardTitle>
              <p className="text-xs text-muted-foreground">6-month lead and subscriber growth</p>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrendData}>
                    <defs>
                      <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C4704B" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#C4704B" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="subGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7C9A82" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#7C9A82" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0.015 75)" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12, fill: "oklch(0.50 0.03 55)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "oklch(0.50 0.03 55)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(0.99 0.005 85)",
                        border: "1px solid oklch(0.90 0.015 75)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="leads"
                      stroke="#C4704B"
                      strokeWidth={2}
                      fill="url(#leadGradient)"
                      name="Leads"
                    />
                    <Area
                      type="monotone"
                      dataKey="subscribers"
                      stroke="#7C9A82"
                      strokeWidth={2}
                      fill="url(#subGradient)"
                      name="Subscribers"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pipeline Funnel */}
        <motion.div variants={itemVariants}>
          <Card className="border border-border/60 shadow-sm bg-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-display">Pipeline Stages</CardTitle>
                  <p className="text-xs text-muted-foreground">Current funnel distribution</p>
                </div>
                <Link href="/pipeline">
                  <span className="text-xs text-terracotta hover:text-terracotta-dark font-medium flex items-center gap-1 transition-colors">
                    View all <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-3">
                {pipelineStages.map((stage, i) => (
                  <div key={stage.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: stage.color }}
                        />
                        <span className="font-medium text-foreground">{stage.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground tabular-nums text-xs">
                          {stage.count} leads
                        </span>
                        <span className="font-medium text-foreground tabular-nums text-xs">
                          ${(stage.value / 1000).toFixed(0)}k
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stage.percentage}%` }}
                        transition={{ duration: 0.8, ease: [0, 0, 0.2, 1] as const, delay: i * 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: stage.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Hot Leads */}
      <motion.div variants={itemVariants}>
        <Card className="border border-border/60 shadow-sm bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-display">Recent High-Intent Leads</CardTitle>
                <p className="text-xs text-muted-foreground">Leads with the highest intent scores this week</p>
              </div>
              <Link href="/leads">
                <span className="text-xs text-terracotta hover:text-terracotta-dark font-medium flex items-center gap-1 transition-colors">
                  View all leads <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60">
                    <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Lead</th>
                    <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Company</th>
                    <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Score</th>
                    <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Intent</th>
                    <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeads
                    .sort((a, b) => b.intentScore - a.intentScore)
                    .slice(0, 5)
                    .map((lead) => {
                      const grade = getScoreGrade(lead.intentScore);
                      return (
                        <tr key={lead.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-3">
                            <div>
                              <p className="font-medium text-foreground">{lead.name}</p>
                              <p className="text-xs text-muted-foreground">{lead.email}</p>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <p className="text-foreground">{lead.company}</p>
                            <p className="text-xs text-muted-foreground">{lead.title}</p>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-md border text-xs font-bold ${grade.color}`}>
                                {grade.label}
                              </span>
                              <span className="font-semibold tabular-nums text-foreground">{lead.intentScore}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <Badge variant="secondary" className={`text-xs ${getIntentColor(lead.intentLevel)}`}>
                              {lead.intentLevel}
                            </Badge>
                          </td>
                          <td className="py-3 px-3">
                            <Badge variant="outline" className="text-xs capitalize">
                              {lead.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-3 text-muted-foreground text-xs">
                            {lead.lastActivity}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
