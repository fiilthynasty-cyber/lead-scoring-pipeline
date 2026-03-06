/*
 * Subscribers Page — Subscriber acquisition, management, and engagement tracking
 * Design: "Warm Precision" — Clean forms, warm accents, editorial typography
 * Uses real data from database via tRPC
 */
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import {
  Search,
  UserPlus,
  Mail,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Loader2,
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

export default function Subscribers() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newSource, setNewSource] = useState<string>("organic");

  const { data: subscribersData, isLoading, refetch } = trpc.subscribers.list.useQuery({ limit: 50 });
  const { data: subStats } = trpc.subscribers.stats.useQuery();
  const createSubscriber = trpc.subscribers.create.useMutation({
    onSuccess: () => {
      toast.success(`Subscriber "${newName}" added successfully`);
      setAddOpen(false);
      setNewName("");
      setNewEmail("");
      setNewSource("organic");
      refetch();
    },
    onError: (err) => {
      toast.error(`Failed to add subscriber: ${err.message}`);
    },
  });

  const filtered = useMemo(() => {
    if (!subscribersData || !Array.isArray(subscribersData)) return [];
    let subs = [...subscribersData];
    if (search) {
      const q = search.toLowerCase();
      subs = subs.filter(
        (s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") subs = subs.filter((s) => s.status === statusFilter);
    if (sourceFilter !== "all") subs = subs.filter((s) => s.source === sourceFilter);
    return subs;
  }, [subscribersData, search, statusFilter, sourceFilter]);

  const handleAddSubscriber = () => {
    if (!newName || !newEmail) {
      toast.error("Please fill in all fields");
      return;
    }
    createSubscriber.mutate({
      name: newName,
      email: newEmail,
      source: newSource as "organic" | "paid" | "referral" | "social" | "email",
    });
  };

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
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display text-foreground">Subscribers</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your subscriber base and track acquisition channels. {subStats?.total ?? 0} total subscribers.
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-terracotta hover:bg-terracotta-dark text-white">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Subscriber
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Add New Subscriber</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Jane Smith"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g. jane@company.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Acquisition Source</Label>
                <Select value={newSource} onValueChange={setNewSource}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="organic">Organic</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleAddSubscriber}
                className="w-full bg-terracotta hover:bg-terracotta-dark text-white"
                disabled={createSubscriber.isPending}
              >
                {createSubscriber.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Add Subscriber
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <Card className="border border-border/60 shadow-sm bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-sage/10 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-sage-dark" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Active</p>
                  <p className="text-xl font-semibold tabular-nums text-foreground">{subStats?.active ?? 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="border border-border/60 shadow-sm bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                  <XCircle className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Unsubscribed</p>
                  <p className="text-xl font-semibold tabular-nums text-foreground">{subStats?.unsubscribed ?? 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="border border-border/60 shadow-sm bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Bounced</p>
                  <p className="text-xl font-semibold tabular-nums text-foreground">{subStats?.bounced ?? 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="border border-border/60 shadow-sm bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-terracotta/10 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-terracotta" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-xl font-semibold tabular-nums text-foreground">{subStats?.total ?? 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search subscribers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border/60"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px] bg-card border-border/60">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
            <SelectItem value="bounced">Bounced</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-[150px] bg-card border-border/60">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="organic">Organic</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="referral">Referral</SelectItem>
            <SelectItem value="social">Social</SelectItem>
            <SelectItem value="email">Email</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Subscriber Table */}
      <motion.div variants={itemVariants}>
        <Card className="border border-border/60 shadow-sm bg-card overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Subscriber</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Source</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Lead Score</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Engagement</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Subscribed</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((sub) => (
                    <tr key={sub.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-foreground">{sub.name}</p>
                          <p className="text-xs text-muted-foreground">{sub.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-xs capitalize">{sub.source}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="secondary"
                          className={`text-xs capitalize ${
                            sub.status === "active"
                              ? "bg-sage/10 text-sage-dark"
                              : sub.status === "unsubscribed"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {sub.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-terracotta"
                              style={{ width: `${sub.leadScore ?? 0}%` }}
                            />
                          </div>
                          <span className="text-xs tabular-nums font-medium">{sub.leadScore ?? 0}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-sage"
                              style={{ width: `${sub.engagementRate ?? 0}%` }}
                            />
                          </div>
                          <span className="text-xs tabular-nums font-medium">{sub.engagementRate ?? 0}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(sub.createdAt), { addSuffix: true })}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-muted-foreground">
                        <p className="text-sm">No subscribers match your filters.</p>
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
