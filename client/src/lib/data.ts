/*
 * Lead Scoring Pipeline — Mock Data & Types
 * Design: "Warm Precision" Scandinavian Data Design
 * This file provides all the data structures and mock data for the pipeline.
 * In production, these would be fetched from Supabase via the Render backend API.
 */

export type LeadStatus = "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
export type IntentLevel = "hot" | "warm" | "cool" | "cold";
export type SubscriberSource = "organic" | "paid" | "referral" | "social" | "email";

export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  title: string;
  intentScore: number;
  intentLevel: IntentLevel;
  status: LeadStatus;
  source: SubscriberSource;
  lastActivity: string;
  createdAt: string;
  signals: IntentSignal[];
  tags: string[];
}

export interface IntentSignal {
  type: string;
  description: string;
  weight: number;
  timestamp: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  count: number;
  value: number;
  color: string;
  percentage: number;
}

export interface Subscriber {
  id: string;
  email: string;
  name: string;
  source: SubscriberSource;
  status: "active" | "unsubscribed" | "bounced";
  subscribedAt: string;
  leadScore: number;
  engagementRate: number;
}

export interface DashboardMetric {
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  trend: "up" | "down" | "flat";
}

export interface ScoreDistribution {
  range: string;
  count: number;
  percentage: number;
}

// --- Mock Data ---

export const dashboardMetrics: DashboardMetric[] = [
  { label: "Total Leads", value: "2,847", change: 12.5, changeLabel: "vs last month", trend: "up" },
  { label: "Avg. Intent Score", value: "68.3", change: 4.2, changeLabel: "vs last month", trend: "up" },
  { label: "Conversion Rate", value: "23.8%", change: -1.4, changeLabel: "vs last month", trend: "down" },
  { label: "Active Subscribers", value: "14,392", change: 8.7, changeLabel: "vs last month", trend: "up" },
  { label: "MQL Rate", value: "34.2%", change: 2.1, changeLabel: "vs last month", trend: "up" },
  { label: "Pipeline Value", value: "$1.2M", change: 15.3, changeLabel: "vs last month", trend: "up" },
];

export const pipelineStages: PipelineStage[] = [
  { id: "new", name: "New Leads", count: 842, value: 420000, color: "#B8A089", percentage: 100 },
  { id: "contacted", name: "Contacted", count: 634, value: 380000, color: "#7C9A82", percentage: 75 },
  { id: "qualified", name: "Qualified", count: 421, value: 295000, color: "#C4704B", percentage: 50 },
  { id: "proposal", name: "Proposal", count: 187, value: 168000, color: "#2C1810", percentage: 22 },
  { id: "won", name: "Won", count: 94, value: 112000, color: "#5A8A64", percentage: 11 },
];

export const scoreDistribution: ScoreDistribution[] = [
  { range: "0-20", count: 312, percentage: 11 },
  { range: "21-40", count: 487, percentage: 17 },
  { range: "41-60", count: 724, percentage: 25 },
  { range: "61-80", count: 856, percentage: 30 },
  { range: "81-100", count: 468, percentage: 17 },
];

export const recentLeads: Lead[] = [
  {
    id: "L001",
    name: "Sarah Chen",
    email: "sarah.chen@techcorp.io",
    company: "TechCorp",
    title: "VP of Marketing",
    intentScore: 92,
    intentLevel: "hot",
    status: "qualified",
    source: "organic",
    lastActivity: "2 hours ago",
    createdAt: "2026-02-15",
    signals: [
      { type: "Page Visit", description: "Viewed pricing page 5 times", weight: 25, timestamp: "2h ago" },
      { type: "Content", description: "Downloaded ROI calculator", weight: 20, timestamp: "1d ago" },
      { type: "Email", description: "Opened 8 of last 10 emails", weight: 15, timestamp: "3d ago" },
    ],
    tags: ["enterprise", "high-value", "marketing"],
  },
  {
    id: "L002",
    name: "Marcus Johnson",
    email: "m.johnson@growthly.com",
    company: "Growthly",
    title: "Head of Sales",
    intentScore: 85,
    intentLevel: "hot",
    status: "proposal",
    source: "referral",
    lastActivity: "5 hours ago",
    createdAt: "2026-02-10",
    signals: [
      { type: "Demo", description: "Requested product demo", weight: 30, timestamp: "5h ago" },
      { type: "Page Visit", description: "Visited case studies", weight: 15, timestamp: "1d ago" },
    ],
    tags: ["mid-market", "sales"],
  },
  {
    id: "L003",
    name: "Elena Rodriguez",
    email: "elena@startupx.co",
    company: "StartupX",
    title: "CEO",
    intentScore: 74,
    intentLevel: "warm",
    status: "contacted",
    source: "paid",
    lastActivity: "1 day ago",
    createdAt: "2026-02-20",
    signals: [
      { type: "Content", description: "Read 3 blog posts", weight: 10, timestamp: "1d ago" },
      { type: "Social", description: "Engaged on LinkedIn post", weight: 8, timestamp: "2d ago" },
      { type: "Email", description: "Clicked CTA in newsletter", weight: 12, timestamp: "3d ago" },
    ],
    tags: ["startup", "founder"],
  },
  {
    id: "L004",
    name: "David Kim",
    email: "d.kim@enterprise.co",
    company: "Enterprise Co",
    title: "Director of Operations",
    intentScore: 61,
    intentLevel: "warm",
    status: "new",
    source: "organic",
    lastActivity: "2 days ago",
    createdAt: "2026-02-25",
    signals: [
      { type: "Page Visit", description: "Browsed features page", weight: 10, timestamp: "2d ago" },
      { type: "Content", description: "Signed up for webinar", weight: 15, timestamp: "4d ago" },
    ],
    tags: ["enterprise", "operations"],
  },
  {
    id: "L005",
    name: "Amira Patel",
    email: "amira@digitalfirst.io",
    company: "DigitalFirst",
    title: "Growth Manager",
    intentScore: 48,
    intentLevel: "cool",
    status: "contacted",
    source: "social",
    lastActivity: "3 days ago",
    createdAt: "2026-02-18",
    signals: [
      { type: "Social", description: "Followed company page", weight: 5, timestamp: "3d ago" },
      { type: "Email", description: "Opened welcome email", weight: 8, timestamp: "5d ago" },
    ],
    tags: ["smb", "growth"],
  },
  {
    id: "L006",
    name: "James Wright",
    email: "j.wright@scaleup.com",
    company: "ScaleUp Inc",
    title: "CTO",
    intentScore: 33,
    intentLevel: "cold",
    status: "new",
    source: "email",
    lastActivity: "5 days ago",
    createdAt: "2026-03-01",
    signals: [
      { type: "Email", description: "Opened 1 email", weight: 3, timestamp: "5d ago" },
    ],
    tags: ["tech", "startup"],
  },
  {
    id: "L007",
    name: "Lisa Nakamura",
    email: "l.nakamura@bigco.jp",
    company: "BigCo Japan",
    title: "VP Engineering",
    intentScore: 88,
    intentLevel: "hot",
    status: "qualified",
    source: "referral",
    lastActivity: "30 min ago",
    createdAt: "2026-02-08",
    signals: [
      { type: "Demo", description: "Completed product trial", weight: 35, timestamp: "30m ago" },
      { type: "Page Visit", description: "Viewed API docs extensively", weight: 20, timestamp: "1d ago" },
      { type: "Content", description: "Downloaded integration guide", weight: 15, timestamp: "2d ago" },
    ],
    tags: ["enterprise", "international", "technical"],
  },
  {
    id: "L008",
    name: "Carlos Mendez",
    email: "carlos@latamgrowth.co",
    company: "LATAM Growth",
    title: "Marketing Director",
    intentScore: 56,
    intentLevel: "cool",
    status: "contacted",
    source: "paid",
    lastActivity: "4 days ago",
    createdAt: "2026-02-22",
    signals: [
      { type: "Page Visit", description: "Visited homepage twice", weight: 5, timestamp: "4d ago" },
      { type: "Content", description: "Read comparison article", weight: 10, timestamp: "5d ago" },
    ],
    tags: ["mid-market", "international"],
  },
];

export const subscribers: Subscriber[] = [
  { id: "S001", email: "sarah.chen@techcorp.io", name: "Sarah Chen", source: "organic", status: "active", subscribedAt: "2026-01-15", leadScore: 92, engagementRate: 87 },
  { id: "S002", email: "m.johnson@growthly.com", name: "Marcus Johnson", source: "referral", status: "active", subscribedAt: "2026-01-20", leadScore: 85, engagementRate: 72 },
  { id: "S003", email: "elena@startupx.co", name: "Elena Rodriguez", source: "paid", status: "active", subscribedAt: "2026-02-01", leadScore: 74, engagementRate: 65 },
  { id: "S004", email: "d.kim@enterprise.co", name: "David Kim", source: "organic", status: "active", subscribedAt: "2026-02-05", leadScore: 61, engagementRate: 54 },
  { id: "S005", email: "amira@digitalfirst.io", name: "Amira Patel", source: "social", status: "active", subscribedAt: "2026-02-10", leadScore: 48, engagementRate: 41 },
  { id: "S006", email: "j.wright@scaleup.com", name: "James Wright", source: "email", status: "unsubscribed", subscribedAt: "2026-01-25", leadScore: 33, engagementRate: 12 },
  { id: "S007", email: "l.nakamura@bigco.jp", name: "Lisa Nakamura", source: "referral", status: "active", subscribedAt: "2026-01-10", leadScore: 88, engagementRate: 91 },
  { id: "S008", email: "carlos@latamgrowth.co", name: "Carlos Mendez", source: "paid", status: "active", subscribedAt: "2026-02-15", leadScore: 56, engagementRate: 38 },
  { id: "S009", email: "info@bounced.com", name: "Test Bounce", source: "email", status: "bounced", subscribedAt: "2026-02-20", leadScore: 0, engagementRate: 0 },
  { id: "S010", email: "alex@newco.io", name: "Alex Turner", source: "organic", status: "active", subscribedAt: "2026-03-01", leadScore: 42, engagementRate: 35 },
];

export const weeklyLeadData = [
  { day: "Mon", leads: 42, qualified: 18, converted: 8 },
  { day: "Tue", leads: 56, qualified: 24, converted: 11 },
  { day: "Wed", leads: 38, qualified: 15, converted: 6 },
  { day: "Thu", leads: 67, qualified: 31, converted: 14 },
  { day: "Fri", leads: 52, qualified: 22, converted: 10 },
  { day: "Sat", leads: 23, qualified: 9, converted: 4 },
  { day: "Sun", leads: 18, qualified: 7, converted: 3 },
];

export const monthlyTrendData = [
  { month: "Sep", leads: 1820, subscribers: 9200, score: 58 },
  { month: "Oct", leads: 2100, subscribers: 10400, score: 61 },
  { month: "Nov", leads: 1950, subscribers: 11100, score: 63 },
  { month: "Dec", leads: 2340, subscribers: 12300, score: 65 },
  { month: "Jan", leads: 2580, subscribers: 13100, score: 66 },
  { month: "Feb", leads: 2847, subscribers: 14392, score: 68 },
];

export const sourceBreakdown = [
  { source: "Organic", count: 1024, percentage: 36, color: "#7C9A82" },
  { source: "Paid", count: 712, percentage: 25, color: "#C4704B" },
  { source: "Referral", count: 542, percentage: 19, color: "#B8A089" },
  { source: "Social", count: 341, percentage: 12, color: "#2C1810" },
  { source: "Email", count: 228, percentage: 8, color: "#5A8A64" },
];

export function getIntentColor(level: IntentLevel): string {
  switch (level) {
    case "hot": return "text-red-600 bg-red-50";
    case "warm": return "text-amber-600 bg-amber-50";
    case "cool": return "text-blue-500 bg-blue-50";
    case "cold": return "text-slate-500 bg-slate-100";
  }
}

export function getStatusColor(status: LeadStatus): string {
  switch (status) {
    case "new": return "text-slate-600 bg-slate-100";
    case "contacted": return "text-blue-600 bg-blue-50";
    case "qualified": return "text-terracotta bg-orange-50";
    case "proposal": return "text-amber-700 bg-amber-50";
    case "won": return "text-sage-dark bg-green-50";
    case "lost": return "text-red-600 bg-red-50";
  }
}

export function getScoreGrade(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "A", color: "text-sage-dark bg-green-50 border-sage/30" };
  if (score >= 60) return { label: "B", color: "text-terracotta bg-orange-50 border-terracotta/30" };
  if (score >= 40) return { label: "C", color: "text-amber-700 bg-amber-50 border-amber-300/30" };
  if (score >= 20) return { label: "D", color: "text-blue-600 bg-blue-50 border-blue-300/30" };
  return { label: "F", color: "text-slate-500 bg-slate-100 border-slate-300/30" };
}
