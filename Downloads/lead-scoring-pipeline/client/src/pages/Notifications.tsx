/*
 * Notifications — Real-time notification feed for pipeline events
 * Design: "Warm Precision" — Scandinavian editorial, warm tones
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import {
  Bell,
  BellOff,
  CheckCircle,
  CheckCheck,
  Loader2,
  Brain,
  Send,
  Users,
  GitBranch,
  AlertCircle,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

export default function Notifications() {
  const { data: allNotifications, isLoading, refetch } = trpc.notifications.list.useQuery({ limit: 100 });
  const { data: unreadCount } = trpc.notifications.unreadCount.useQuery();

  const markRead = trpc.notifications.markRead.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Notification marked as read");
    },
  });

  const markAllRead = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("All notifications marked as read");
    },
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "lead_scored": return Brain;
      case "lead_progressed": return GitBranch;
      case "new_subscriber": return Users;
      case "outreach_sent": return Send;
      default: return AlertCircle;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "lead_scored": return "bg-purple-100 text-purple-600";
      case "lead_progressed": return "bg-blue-100 text-blue-600";
      case "new_subscriber": return "bg-green-100 text-green-600";
      case "outreach_sent": return "bg-amber-100 text-amber-600";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "lead_scored": return "AI Score";
      case "lead_progressed": return "Pipeline";
      case "new_subscriber": return "Subscriber";
      case "outreach_sent": return "Outreach";
      default: return "System";
    }
  };

  const unread = allNotifications?.filter(n => !n.isRead) ?? [];
  const read = allNotifications?.filter(n => n.isRead) ?? [];

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display text-foreground flex items-center gap-2">
            Notifications
            {typeof unreadCount === 'number' && unreadCount > 0 && (
              <Badge className="bg-terracotta text-white text-xs">{unreadCount} new</Badge>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Stay updated on lead scoring, pipeline changes, and outreach activity
          </p>
        </div>
        {typeof unreadCount === 'number' && unreadCount > 0 ? (
          <Button
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            variant="outline"
            className="text-sm"
          >
            {markAllRead.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCheck className="w-4 h-4 mr-2" />
            )}
            Mark All Read
          </Button>
        ) : null}
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : !allNotifications?.length ? (
        <motion.div variants={fadeUp}>
          <Card className="border border-border/40">
            <CardContent className="py-16 text-center">
              <BellOff className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-lg font-display text-foreground">No notifications yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Notifications will appear here when leads are scored, subscribers join, or outreach is sent.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* Unread Notifications */}
          {unread.length > 0 && (
            <motion.div variants={fadeUp}>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Bell className="w-3.5 h-3.5" />
                Unread ({unread.length})
              </h2>
              <div className="space-y-2">
                {unread.map((notif) => {
                  const Icon = getTypeIcon(notif.type);
                  return (
                    <motion.div
                      key={notif.id}
                      variants={fadeUp}
                      className="flex items-start gap-3 p-4 rounded-xl bg-terracotta/5 border border-terracotta/15 hover:border-terracotta/25 transition-all"
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${getTypeColor(notif.type)}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-medium text-foreground">{notif.title}</p>
                          <Badge className="text-[9px] bg-muted text-muted-foreground">{getTypeBadge(notif.type)}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{notif.message}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs flex-shrink-0"
                        onClick={() => markRead.mutate({ id: notif.id })}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" /> Read
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Read Notifications */}
          {read.length > 0 && (
            <motion.div variants={fadeUp}>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <CheckCheck className="w-3.5 h-3.5" />
                Earlier ({read.length})
              </h2>
              <div className="space-y-1.5">
                {read.map((notif) => {
                  const Icon = getTypeIcon(notif.type);
                  return (
                    <div
                      key={notif.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/10 opacity-70 hover:opacity-100 transition-all"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getTypeColor(notif.type)}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{notif.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{notif.message}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}
