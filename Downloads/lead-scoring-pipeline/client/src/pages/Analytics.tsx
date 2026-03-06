/*
 * Analytics — Advanced analytics dashboard with custom reports
 * Design: "Warm Precision" — Scandinavian editorial, warm tones
 */
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Mail,
  Send,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Brain,
  Bell,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const COLORS = ["#C4704B", "#7A9E7E", "#D4A574", "#6B8E9E", "#B07A8A"];

export default function Analytics() {
  const { data: dashStats, isLoading: dashLoading } = trpc.dashboard.stats.useQuery();
  const { data: leadStats } = trpc.leads.stats.useQuery();
  const { data: subscriberStats } = trpc.subscribers.stats.useQuery();
  const { data: outreachStats } = trpc.outreach.stats.useQuery();
  const { data: allLeads } = trpc.leads.list.useQuery({ limit: 100 });
  const { data: allSubscribers } = trpc.subscribers.list.useQuery({ limit: 100 });
  const { data: allCampaigns } = trpc.outreach.list.useQuery({ limit: 100 });

  // Derived analytics data
  const intentDistribution = useMemo(() => {
    if (!leadStats) return [];
    return [
      { name: "Hot", value: leadStats.hot, color: "#ef4444" },
      { name: "Warm", value: leadStats.warm, color: "#f59e0b" },
      { name: "Cool", value: leadStats.cool, color: "#3b82f6" },
      { name: "Cold", value: leadStats.cold, color: "#94a3b8" },
    ];
  }, [leadStats]);

  const subscriberSourceData = useMemo(() => {
    if (!allSubscribers) return [];
    const counts: Record<string, number> = {};
    allSubscribers.forEach(s => {
      counts[s.source] = (counts[s.source] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [allSubscribers]);

  const leadSourceData = useMemo(() => {
    if (!allLeads) return [];
    const counts: Record<string, number> = {};
    allLeads.forEach(l => {
      counts[l.source] = (counts[l.source] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [allLeads]);

  const pipelineData = useMemo(() => {
    if (!allLeads) return [];
    const statusOrder = ["new", "contacted", "qualified", "proposal", "won", "lost"];
    const counts: Record<string, number> = {};
    allLeads.forEach(l => {
      counts[l.status] = (counts[l.status] || 0) + 1;
    });
    return statusOrder.map(status => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: counts[status] || 0,
    }));
  }, [allLeads]);

  const scoreDistributionData = useMemo(() => {
    if (!allLeads) return [];
    const ranges = [
      { name: "0-20", min: 0, max: 20 },
      { name: "21-40", min: 21, max: 40 },
      { name: "41-60", min: 41, max: 60 },
      { name: "61-80", min: 61, max: 80 },
      { name: "81-100", min: 81, max: 100 },
    ];
    return ranges.map(r => ({
      name: r.name,
      count: allLeads.filter(l => l.intentScore >= r.min && l.intentScore <= r.max).length,
    }));
  }, [allLeads]);

  const outreachConversionRate = useMemo(() => {
    if (!outreachStats || outreachStats.total === 0) return 0;
    return Math.round(((outreachStats.replied ?? 0) / outreachStats.total) * 100);
  }, [outreachStats]);

  const avgLeadScore = useMemo(() => {
    if (!allLeads || allLeads.length === 0) return 0;
    return Math.round(allLeads.reduce((sum, l) => sum + l.intentScore, 0) / allLeads.length);
  }, [allLeads]);

  if (dashLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-display text-foreground">Analytics & Reporting</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Comprehensive insights into your lead pipeline, subscriber growth, and outreach performance
        </p>
      </motion.div>

      {/* Top KPI Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: "Total Leads", value: dashStats?.totalLeads ?? 0, icon: Users, trend: "+12%", up: true },
          { label: "Avg Score", value: avgLeadScore, icon: Brain, trend: avgLeadScore > 50 ? "Good" : "Low", up: avgLeadScore > 50 },
          { label: "Subscribers", value: dashStats?.totalSubscribers ?? 0, icon: Mail, trend: "+8%", up: true },
          { label: "Campaigns", value: dashStats?.totalCampaigns ?? 0, icon: Send, trend: "+5", up: true },
          { label: "Reply Rate", value: `${outreachConversionRate}%`, icon: TrendingUp, trend: outreachConversionRate > 10 ? "Good" : "Low", up: outreachConversionRate > 10 },
          { label: "Notifications", value: dashStats?.unreadNotifications ?? 0, icon: Bell, trend: "Unread", up: false },
        ].map((stat) => (
          <Card key={stat.label} className="border border-border/40">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1">
                <stat.icon className="w-4 h-4 text-terracotta" />
                <span className={`text-[10px] flex items-center gap-0.5 ${stat.up ? "text-green-600" : "text-muted-foreground"}`}>
                  {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.trend}
                </span>
              </div>
              <p className="text-xl font-semibold tabular-nums text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Intent Score Distribution */}
        <motion.div variants={fadeUp}>
          <Card className="border border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-terracotta" />
                Score Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={scoreDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e5e5e5", fontSize: "12px" }}
                  />
                  <Bar dataKey="count" fill="#C4704B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Intent Level Pie */}
        <motion.div variants={fadeUp}>
          <Card className="border border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-terracotta" />
                Intent Level Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              {intentDistribution.some(d => d.value > 0) ? (
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width="50%" height={240}>
                    <PieChart>
                      <Pie
                        data={intentDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {intentDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e5e5", fontSize: "12px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3">
                    {intentDistribution.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-foreground">{item.name}</span>
                        <span className="text-sm font-semibold tabular-nums text-foreground ml-auto">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[240px] text-sm text-muted-foreground">
                  No lead data available yet
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Funnel */}
        <motion.div variants={fadeUp}>
          <Card className="border border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-terracotta" />
                Pipeline Stages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={pipelineData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e5e5", fontSize: "12px" }} />
                  <Bar dataKey="value" fill="#7A9E7E" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Lead Sources */}
        <motion.div variants={fadeUp}>
          <Card className="border border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-terracotta" />
                Lead Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leadSourceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={leadSourceData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {leadSourceData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e5e5", fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
                  No lead data yet
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Subscriber Sources */}
        <motion.div variants={fadeUp}>
          <Card className="border border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Mail className="w-4 h-4 text-terracotta" />
                Subscriber Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subscriberSourceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={subscriberSourceData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {subscriberSourceData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e5e5", fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
                  No subscriber data yet
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Outreach Performance */}
      <motion.div variants={fadeUp}>
        <Card className="border border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <Send className="w-4 h-4 text-terracotta" />
              Outreach Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              {[
                { label: "Total Campaigns", value: outreachStats?.total ?? 0, color: "bg-slate-100 text-slate-700" },
                { label: "Drafts", value: outreachStats?.draft ?? 0, color: "bg-slate-100 text-slate-600" },
                { label: "Sent", value: outreachStats?.sent ?? 0, color: "bg-blue-100 text-blue-700" },
                { label: "Opened", value: outreachStats?.opened ?? 0, color: "bg-amber-100 text-amber-700" },
                { label: "Replied", value: outreachStats?.replied ?? 0, color: "bg-green-100 text-green-700" },
              ].map((stat) => (
                <div key={stat.label} className={`p-4 rounded-xl text-center ${stat.color}`}>
                  <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
                  <p className="text-xs mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
            {outreachStats && outreachStats.total > 0 && (
              <div className="mt-4 flex items-center gap-4">
                <div className="flex-1 bg-muted/30 rounded-full h-3 overflow-hidden">
                  <div className="flex h-full">
                    <div className="bg-blue-500 h-full" style={{ width: `${((outreachStats.sent ?? 0) / outreachStats.total) * 100}%` }} />
                    <div className="bg-amber-500 h-full" style={{ width: `${((outreachStats.opened ?? 0) / outreachStats.total) * 100}%` }} />
                    <div className="bg-green-500 h-full" style={{ width: `${((outreachStats.replied ?? 0) / outreachStats.total) * 100}%` }} />
                  </div>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {outreachConversionRate}% reply rate
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
