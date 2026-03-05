/*
 * Settings Page — Configuration for Supabase, Vercel, Render, and scoring rules
 * Design: "Warm Precision" — Clean form layout, warm accents
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  Database,
  Cloud,
  Server,
  Sliders,
  Shield,
  Bell,
  Save,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function Settings() {
  const [supabaseUrl, setSupabaseUrl] = useState("https://your-project.supabase.co");
  const [supabaseKey, setSupabaseKey] = useState("eyJhbGciOiJIUzI1NiIs...");
  const [renderUrl, setRenderUrl] = useState("https://your-api.onrender.com");
  const [hotThreshold, setHotThreshold] = useState([80]);
  const [warmThreshold, setWarmThreshold] = useState([60]);
  const [coolThreshold, setCoolThreshold] = useState([40]);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [slackNotifs, setSlackNotifs] = useState(false);
  const [autoScore, setAutoScore] = useState(true);

  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-display text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Configure your pipeline integrations, scoring rules, and notification preferences.
        </p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Tabs defaultValue="integrations" className="space-y-6">
          <TabsList className="bg-muted/50 border border-border/40">
            <TabsTrigger value="integrations" className="text-xs">Integrations</TabsTrigger>
            <TabsTrigger value="scoring" className="text-xs">Scoring Rules</TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs">Notifications</TabsTrigger>
          </TabsList>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            {/* Supabase */}
            <Card className="border border-border/60 shadow-sm bg-card">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-sage/10 flex items-center justify-center">
                    <Database className="w-5 h-5 text-sage-dark" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-display">Supabase</CardTitle>
                    <CardDescription className="text-xs">Database and authentication provider</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Project URL</Label>
                  <Input
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://your-project.supabase.co"
                    className="bg-background border-border/60 font-mono text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Anon Key</Label>
                  <Input
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    type="password"
                    className="bg-background border-border/60 font-mono text-xs"
                  />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-sage" />
                    <span className="text-xs text-muted-foreground">Connected</span>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs">Test Connection</Button>
                </div>
              </CardContent>
            </Card>

            {/* Vercel */}
            <Card className="border border-border/60 shadow-sm bg-card">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center">
                    <Cloud className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-display">Vercel</CardTitle>
                    <CardDescription className="text-xs">Frontend deployment platform</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Project Name</Label>
                  <Input
                    defaultValue="lead-scoring-pipeline"
                    className="bg-background border-border/60 font-mono text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Deploy Hook URL</Label>
                  <Input
                    defaultValue="https://api.vercel.com/v1/integrations/deploy/..."
                    type="password"
                    className="bg-background border-border/60 font-mono text-xs"
                  />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-sage" />
                    <span className="text-xs text-muted-foreground">Deployed</span>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs">Trigger Deploy</Button>
                </div>
              </CardContent>
            </Card>

            {/* Render */}
            <Card className="border border-border/60 shadow-sm bg-card">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-terracotta/10 flex items-center justify-center">
                    <Server className="w-5 h-5 text-terracotta" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-display">Render</CardTitle>
                    <CardDescription className="text-xs">Backend API hosting platform</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">API Base URL</Label>
                  <Input
                    value={renderUrl}
                    onChange={(e) => setRenderUrl(e.target.value)}
                    placeholder="https://your-api.onrender.com"
                    className="bg-background border-border/60 font-mono text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">API Key</Label>
                  <Input
                    defaultValue="rnd_..."
                    type="password"
                    className="bg-background border-border/60 font-mono text-xs"
                  />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-sage" />
                    <span className="text-xs text-muted-foreground">Healthy</span>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs">Health Check</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scoring Rules Tab */}
          <TabsContent value="scoring" className="space-y-6">
            <Card className="border border-border/60 shadow-sm bg-card">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-terracotta/10 flex items-center justify-center">
                    <Sliders className="w-5 h-5 text-terracotta" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-display">Intent Score Thresholds</CardTitle>
                    <CardDescription className="text-xs">Define the boundaries for each intent level</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      Hot Lead Threshold
                    </Label>
                    <span className="text-sm font-semibold tabular-nums text-foreground">{hotThreshold[0]}+</span>
                  </div>
                  <Slider value={hotThreshold} onValueChange={setHotThreshold} max={100} min={50} step={5} />
                </div>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      Warm Lead Threshold
                    </Label>
                    <span className="text-sm font-semibold tabular-nums text-foreground">{warmThreshold[0]}+</span>
                  </div>
                  <Slider value={warmThreshold} onValueChange={setWarmThreshold} max={80} min={30} step={5} />
                </div>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-400" />
                      Cool Lead Threshold
                    </Label>
                    <span className="text-sm font-semibold tabular-nums text-foreground">{coolThreshold[0]}+</span>
                  </div>
                  <Slider value={coolThreshold} onValueChange={setCoolThreshold} max={60} min={10} step={5} />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/30">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Auto-Score New Leads</Label>
                    <p className="text-xs text-muted-foreground">Automatically calculate intent scores for new leads</p>
                  </div>
                  <Switch checked={autoScore} onCheckedChange={setAutoScore} />
                </div>
              </CardContent>
            </Card>

            {/* Signal Weights */}
            <Card className="border border-border/60 shadow-sm bg-card">
              <CardHeader>
                <CardTitle className="text-base font-display">Signal Weights</CardTitle>
                <CardDescription className="text-xs">Adjust how much each signal type contributes to the intent score</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { signal: "Page Visit (Pricing)", weight: 25 },
                    { signal: "Demo Request", weight: 30 },
                    { signal: "Content Download", weight: 20 },
                    { signal: "Email Engagement", weight: 15 },
                    { signal: "Social Interaction", weight: 8 },
                    { signal: "Webinar Signup", weight: 15 },
                    { signal: "Product Trial", weight: 35 },
                  ].map((item) => (
                    <div key={item.signal} className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{item.signal}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-terracotta"
                            style={{ width: `${(item.weight / 35) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium tabular-nums text-muted-foreground w-8 text-right">+{item.weight}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="border border-border/60 shadow-sm bg-card">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-terracotta/10 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-terracotta" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-display">Notification Preferences</CardTitle>
                    <CardDescription className="text-xs">Choose how you want to be notified about pipeline events</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Email Notifications</Label>
                    <p className="text-xs text-muted-foreground">Receive email alerts for hot leads and conversions</p>
                  </div>
                  <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Slack Integration</Label>
                    <p className="text-xs text-muted-foreground">Post lead updates to a Slack channel</p>
                  </div>
                  <Switch checked={slackNotifs} onCheckedChange={setSlackNotifs} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Daily Digest</Label>
                    <p className="text-xs text-muted-foreground">Get a daily summary of pipeline activity</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Hot Lead Alerts</Label>
                    <p className="text-xs text-muted-foreground">Instant notification when a lead reaches hot status</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Save Button */}
      <motion.div variants={itemVariants} className="flex justify-end">
        <Button onClick={handleSave} className="bg-terracotta hover:bg-terracotta-dark text-white">
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </motion.div>
    </motion.div>
  );
}
