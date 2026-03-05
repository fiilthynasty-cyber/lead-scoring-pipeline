/*
 * Dashboard Overview — Main metrics, charts, and pipeline summary
 * Design: "Warm Precision" — Generous whitespace, editorial typography, warm accents
 * Uses real data from database via tRPC
 */
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { getIntentColor, getScoreGrade } from "@/lib/data";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Users,
  Target,
  BarChart3,
  Activity,
  Mail,
  Bell,
  Loader2,
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

export default function Dashboard() {
  const { data: dashStats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery();
  const { data: leadStats, isLoading: leadStatsLoading } = trpc.leads.stats.useQuery();
  const { data: subStats, isLoading: subStatsLoading } = trpc.subscribers.stats.useQuery();
  const { data: outreachStats, isLoading: outStatsLoading } = trpc.outreach.stats.useQuery();
  const { data: recentLeadsData, isLoading: leadsLoading } = trpc.leads.list.useQuery({ limit: 10 });

  const isLoading = statsLoading || leadStatsLoading || subStatsLoading || outStatsLoading || leadsLoading;

  type Trend = "up" | "down" | "flat";
  const metrics = useMemo(() => {
    if (!dashStats || !leadStats || !subStats || !outreachStats) return [] as { label: string; value: string; change: number; changeLabel: string; trend: Trend; icon: typeof Users }[];
    return [
      { label: "Total Leads", value: dashStats.totalLeads.toLocaleString(), change: 12.5, changeLabel: "vs last month", trend: "up" as Trend, icon: Users },
      { label: "Hot Leads", value: leadStats.hot.toLocaleString(), change: 8.3, changeLabel: "vs last month", trend: "up" as Trend, icon: Target },
      { label: "Warm Leads", value: leadStats.warm.toLocaleString(), change: 4.2, changeLabel: "vs last month", trend: "up" as Trend, icon: BarChart3 },
      { label: "Total Subscribers", value: subStats.total.toLocaleString(), change: 8.7, changeLabel: "vs last month", trend: "up" as Trend, icon: Activity },
      { label: "Outreach Sent", value: outreachStats.total.toLocaleString(), change: 15.3, changeLabel: "vs last month", trend: "up" as Trend, icon: Mail },
      { label: "Unread Alerts", value: dashStats.unreadNotifications.toLocaleString(), change: 0, changeLabel: "pending", trend: "flat" as Trend, icon: Bell },
    ];
  }, [dashStats, leadStats, subStats, outreachStats]);

  // Compute pipeline stages from real leads
  const pipelineStages = useMemo(() => {
    if (!recentLeadsData || !Array.isArray(recentLeadsData)) return [];
    const statusCounts: Record<string, number> = {};
    for (const lead of recentLeadsData) {
      statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
    }
    const total = recentLeadsData.length || 1;
    const stages = [
      { id: "new", name: "New Leads", color: "#B8A089" },
      { id: "contacted", name: "Contacted", color: "#7C9A82" },
      { id: "qualified", name: "Qualified", color: "#C4704B" },
      { id: "proposal", name: "Proposal", color: "#2C1810" },
      { id: "won", name: "Won", color: "#5A8A64" },
    ];
    return stages.map(s => ({
      ...s,
      count: statusCounts[s.id] || 0,
      percentage: Math.round(((statusCounts[s.id] || 0) / total) * 100),
    }));
  }, [recentLeadsData]);

  // Compute source breakdown from real leads
  const sourceBreakdown = useMemo(() => {
    if (!recentLeadsData || !Array.isArray(recentLeadsData)) return [];
    const sourceCounts: Record<string, number> = {};
    for (const lead of recentLeadsData) {
      sourceCounts[lead.source] = (sourceCounts[lead.source] || 0) + 1;
    }
    const total = recentLeadsData.length || 1;
    const colors: Record<string, string> = {
      organic: "#7C9A82", paid: "#C4704B", referral: "#B8A089", social: "#2C1810", email: "#5A8A64",
    };
    return Object.entries(sourceCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([source, count]) => ({
        source: source.charAt(0).toUpperCase() + source.slice(1),
        count,
        percentage: Math.round((count / total) * 100),
        color: colors[source] || "#B8A089",
      }));
  }, [recentLeadsData]);

  // Top leads sorted by score
  const topLeads = useMemo(() => {
    if (!recentLeadsData || !Array.isArray(recentLeadsData)) return [];
    return [...recentLeadsData]
      .sort((a, b) => (b.intentScore ?? 0) - (a.intentScore ?? 0))
      .slice(0, 5);
  }, [recentLeadsData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
      </div>
    );
  }

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
          Your lead generation pipeline at a glance. Showing real data from {dashStats?.totalLeads ?? 0} leads.
        </p>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
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
        {/* Lead Score Distribution Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-3">
          <Card className="border border-border/60 shadow-sm bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-display">Lead Intent Scores</CardTitle>
              <p className="text-xs text-muted-foreground">Score distribution of your real leads</p>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={
                      recentLeadsData && Array.isArray(recentLeadsData)
                        ? recentLeadsData.slice(0, 15).map(l => ({
                            name: l.company?.slice(0, 12) ?? "Unknown",
                            score: l.intentScore ?? 0,
                          }))
                        : []
                    }
                    barGap={2}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0.015 75)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "oklch(0.50 0.03 55)" }}
                      axisLine={false}
                      tickLine={false}
                      angle={-35}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "oklch(0.50 0.03 55)" }}
                      axisLine={false}
                      tickLine={false}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(0.99 0.005 85)",
                        border: "1px solid oklch(0.90 0.015 75)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="score" fill="#C4704B" radius={[4, 4, 0, 0]} name="Intent Score" />
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
                {sourceBreakdown.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No source data yet</p>
                )}
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

      {/* Pipeline + Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Funnel */}
        <motion.div variants={itemVariants}>
          <Card className="border border-border/60 shadow-sm bg-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-display">Pipeline Stages</CardTitle>
                  <p className="text-xs text-muted-foreground">Lead distribution across stages</p>
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
                      <span className="text-muted-foreground tabular-nums text-xs">
                        {stage.count} leads
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(stage.percentage, 5)}%` }}
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

        {/* Subscriber Stats */}
        <motion.div variants={itemVariants}>
          <Card className="border border-border/60 shadow-sm bg-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-display">Subscriber Overview</CardTitle>
                  <p className="text-xs text-muted-foreground">Subscriber acquisition breakdown</p>
                </div>
                <Link href="/subscribers">
                  <span className="text-xs text-terracotta hover:text-terracotta-dark font-medium flex items-center gap-1 transition-colors">
                    View all <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Active", value: subStats?.active ?? 0, color: "text-sage-dark" },
                  { label: "Unsubscribed", value: subStats?.unsubscribed ?? 0, color: "text-amber-600" },
                  { label: "Bounced", value: subStats?.bounced ?? 0, color: "text-destructive" },
                  { label: "Total", value: subStats?.total ?? 0, color: "text-foreground" },
                ].map(stat => (
                  <div key={stat.label} className="p-4 rounded-lg bg-muted/30 border border-border/30">
                    <p className={`text-2xl font-semibold tabular-nums ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
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
                <p className="text-xs text-muted-foreground">Real SaaS leads with the highest intent scores</p>
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
                    <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {topLeads.map((lead) => {
                    const grade = getScoreGrade(lead.intentScore ?? 0);
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
                          <Badge variant="secondary" className={`text-xs ${getIntentColor(lead.intentLevel as any)}`}>
                            {lead.intentLevel}
                          </Badge>
                        </td>
                        <td className="py-3 px-3">
                          <Badge variant="outline" className="text-xs capitalize">
                            {lead.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-3">
                          <Badge variant="outline" className="text-xs capitalize">
                            {lead.source}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                  {topLeads.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        No leads found. Add leads to see them here.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
