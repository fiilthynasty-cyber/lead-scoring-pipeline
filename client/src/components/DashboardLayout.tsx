/*
 * DashboardLayout — Persistent sidebar navigation for the pipeline dashboard
 * Design: "Warm Precision" — Narrow left nav, warm tones, editorial typography
 */
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Users,
  GitBranch,
  Mail,
  Settings,
  Zap,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Brain,
  Send,
  Bell,
  BarChart3,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";

interface DashboardLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { path: "/leads", label: "Leads", icon: Users },
  { path: "/pipeline", label: "Pipeline", icon: GitBranch },
  { path: "/subscribers", label: "Subscribers", icon: Mail },
  { divider: true, label: "AI & Automation" },
  { path: "/ai-scoring", label: "AI Scoring", icon: Brain },
  { path: "/outreach", label: "Outreach", icon: Send },
  { path: "/notifications", label: "Notifications", icon: Bell },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
  { divider: true, label: "System" },
  { path: "/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { data: unreadCount } = trpc.notifications.unreadCount.useQuery(undefined, {
    refetchInterval: 30000,
  });

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen border-r border-border bg-card flex flex-col transition-all duration-300 z-50 ${
          collapsed ? "w-[68px]" : "w-[240px]"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-terracotta flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="font-display text-lg text-foreground whitespace-nowrap overflow-hidden"
              >
                LeadScore
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item, idx) => {
            if ('divider' in item && item.divider) {
              return (
                <div key={`divider-${idx}`} className="pt-4 pb-1 px-3">
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {collapsed && <div className="w-6 h-px bg-border mx-auto" />}
                </div>
              );
            }

            if (!('path' in item) || !item.path) return null;
            const isActive = location === item.path;
            const Icon = item.icon!;
            const showBadge = item.path === "/notifications" && typeof unreadCount === 'number' && unreadCount > 0;

            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                    isActive
                      ? "bg-terracotta/10 text-terracotta"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <Icon className={`w-5 h-5 ${isActive ? "text-terracotta" : ""}`} />
                    {showBadge && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-terracotta text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </div>
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-sm font-medium whitespace-nowrap flex items-center gap-2"
                      >
                        {item.label}
                        {showBadge && (
                          <span className="text-[10px] bg-terracotta/15 text-terracotta px-1.5 py-0.5 rounded-full font-semibold">
                            {unreadCount}
                          </span>
                        )}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {isActive && !collapsed && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-terracotta" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="px-3 py-4 border-t border-border">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all w-full"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5 flex-shrink-0" />
            ) : (
              <ChevronLeft className="w-5 h-5 flex-shrink-0" />
            )}
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm font-medium"
                >
                  Collapse
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          <Link href="/">
            <div className="flex items-center gap-3 px-3 py-2 mt-1 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm font-medium"
                  >
                    Back to Home
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main
        className={`flex-1 transition-all duration-300 ${
          collapsed ? "ml-[68px]" : "ml-[240px]"
        }`}
      >
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
