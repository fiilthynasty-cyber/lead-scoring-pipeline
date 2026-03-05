/*
 * Home Landing Page — Hero, features, pipeline visual, and CTA
 * Design: "Warm Precision" — Scandinavian editorial, warm tones, generous whitespace
 * Uses generated images for hero and feature sections
 */
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import {
  Zap,
  Target,
  BarChart3,
  Users,
  GitBranch,
  Mail,
  ArrowRight,
  CheckCircle,
  Database,
  Cloud,
  Server,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-terracotta flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-lg text-foreground">LeadScore</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pipeline" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pipeline</a>
            <a href="#stack" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Tech Stack</a>
          </div>
          <Link href="/dashboard">
            <Button className="bg-terracotta hover:bg-terracotta-dark text-white text-sm">
              Open Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="space-y-6"
            >
              <motion.div variants={fadeUp}>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta/10 text-terracotta text-xs font-medium">
                  <Zap className="w-3 h-3" />
                  Intent Scoring Pipeline
                </span>
              </motion.div>
              <motion.h1 variants={fadeUp} className="text-4xl lg:text-5xl xl:text-6xl font-display text-foreground leading-tight">
                Turn visitor signals into{" "}
                <span className="text-terracotta">qualified leads</span>
              </motion.h1>
              <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                A complete lead generation pipeline that scores intent signals, manages subscriber acquisition, and visualizes your conversion funnel in real time.
              </motion.p>
              <motion.div variants={fadeUp} className="flex items-center gap-3 pt-2">
                <Link href="/dashboard">
                  <Button size="lg" className="bg-terracotta hover:bg-terracotta-dark text-white">
                    View Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/leads">
                  <Button size="lg" variant="outline" className="border-border/60">
                    Browse Leads
                  </Button>
                </Link>
              </motion.div>
              <motion.div variants={fadeUp} className="flex items-center gap-6 pt-4">
                {[
                  { label: "Leads Scored", value: "2,847" },
                  { label: "Conversion Rate", value: "23.8%" },
                  { label: "Pipeline Value", value: "$1.2M" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-xl font-semibold tabular-nums text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="relative"
            >
              <div className="rounded-2xl overflow-hidden shadow-xl border border-border/30">
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663404136543/JhbpQq73m6yNTXPUtViPh3/hero-dashboard-jqWWiSZk9QgmGFtxBEKrZT.webp"
                  alt="Lead scoring pipeline visualization"
                  className="w-full h-auto"
                />
              </div>
              {/* Floating card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="absolute -bottom-6 -left-6 bg-card rounded-xl shadow-lg border border-border/40 p-4 max-w-[200px]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-md bg-sage/20 flex items-center justify-center">
                    <Target className="w-3 h-3 text-sage-dark" />
                  </div>
                  <span className="text-xs font-medium text-foreground">Hot Lead Detected</span>
                </div>
                <p className="text-[11px] text-muted-foreground">Sarah Chen scored 92 — pricing page visited 5 times</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.h2 variants={fadeUp} className="text-3xl lg:text-4xl font-display text-foreground">
              Everything you need to convert
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground mt-3 max-w-xl mx-auto">
              From capturing intent signals to closing deals, our pipeline covers every stage of the lead lifecycle.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              {
                icon: Target,
                title: "Intent Scoring",
                description: "Automatically score leads based on page visits, content downloads, email engagement, and social signals.",
                color: "bg-terracotta/10 text-terracotta",
              },
              {
                icon: GitBranch,
                title: "Pipeline Management",
                description: "Visual funnel with drag-and-drop stages. Track leads from first touch to closed deal.",
                color: "bg-sage/10 text-sage-dark",
              },
              {
                icon: Mail,
                title: "Subscriber Acquisition",
                description: "Capture and manage subscribers across organic, paid, referral, social, and email channels.",
                color: "bg-clay/10 text-espresso",
              },
              {
                icon: BarChart3,
                title: "Analytics Dashboard",
                description: "Real-time metrics on conversion rates, pipeline value, lead sources, and engagement trends.",
                color: "bg-terracotta/10 text-terracotta",
              },
              {
                icon: Zap,
                title: "Signal Detection",
                description: "Track pricing page visits, demo requests, content downloads, and email opens as intent signals.",
                color: "bg-sage/10 text-sage-dark",
              },
              {
                icon: Users,
                title: "Lead Profiles",
                description: "Rich lead profiles with company info, engagement history, tags, and complete signal timelines.",
                color: "bg-clay/10 text-espresso",
              },
            ].map((feature) => (
              <motion.div key={feature.title} variants={fadeUp}>
                <Card className="border border-border/40 shadow-sm hover:shadow-md transition-all duration-300 bg-card h-full">
                  <CardContent className="p-6">
                    <div className={`w-10 h-10 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                      <feature.icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-display text-lg text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pipeline Visual Section */}
      <section id="pipeline" className="py-20">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="rounded-2xl overflow-hidden shadow-lg border border-border/30">
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663404136543/JhbpQq73m6yNTXPUtViPh3/pipeline-visual-9RxJGeLCgBhPxZRo3tCazD.webp"
                  alt="Pipeline funnel visualization"
                  className="w-full h-auto"
                />
              </div>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="space-y-6"
            >
              <motion.h2 variants={fadeUp} className="text-3xl lg:text-4xl font-display text-foreground">
                Visualize your entire funnel
              </motion.h2>
              <motion.p variants={fadeUp} className="text-muted-foreground leading-relaxed">
                See exactly where leads are in your pipeline. Track conversion rates between stages and identify bottlenecks before they impact revenue.
              </motion.p>
              <motion.div variants={fadeUp} className="space-y-3">
                {[
                  "Real-time pipeline stage tracking",
                  "Conversion rate analysis between stages",
                  "Revenue attribution per pipeline stage",
                  "Automated lead progression rules",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-sage-dark flex-shrink-0" />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </motion.div>
              <motion.div variants={fadeUp}>
                <Link href="/pipeline">
                  <Button className="bg-terracotta hover:bg-terracotta-dark text-white mt-2">
                    View Pipeline
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Subscriber Acquisition Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="space-y-6 order-2 lg:order-1"
            >
              <motion.h2 variants={fadeUp} className="text-3xl lg:text-4xl font-display text-foreground">
                Grow your subscriber base
              </motion.h2>
              <motion.p variants={fadeUp} className="text-muted-foreground leading-relaxed">
                Track subscriber acquisition across every channel. Understand which sources drive the highest-quality leads and optimize your spend accordingly.
              </motion.p>
              <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4 pt-2">
                {[
                  { label: "Active Subscribers", value: "14,392" },
                  { label: "Avg. Engagement", value: "58%" },
                  { label: "Growth Rate", value: "+8.7%" },
                  { label: "Channels Tracked", value: "5" },
                ].map((stat) => (
                  <div key={stat.label} className="p-4 rounded-lg bg-card border border-border/30">
                    <p className="text-xl font-semibold tabular-nums text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
              <motion.div variants={fadeUp}>
                <Link href="/subscribers">
                  <Button className="bg-terracotta hover:bg-terracotta-dark text-white mt-2">
                    Manage Subscribers
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-1 lg:order-2"
            >
              <div className="rounded-2xl overflow-hidden shadow-lg border border-border/30">
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663404136543/JhbpQq73m6yNTXPUtViPh3/subscriber-visual-bH4NZ4jBqswvpkvgG8rKKW.webp"
                  alt="Subscriber growth visualization"
                  className="w-full h-auto"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="stack" className="py-20">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.h2 variants={fadeUp} className="text-3xl lg:text-4xl font-display text-foreground">
              Built on modern infrastructure
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Deployed across best-in-class platforms for reliability, performance, and developer experience.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto"
          >
            {[
              {
                icon: Cloud,
                name: "Vercel",
                role: "Frontend Hosting",
                description: "React frontend deployed to Vercel's edge network for instant global access.",
                color: "bg-foreground/5 text-foreground",
              },
              {
                icon: Server,
                name: "Render",
                role: "Backend API",
                description: "Node.js/Express API hosted on Render with auto-scaling and zero-downtime deploys.",
                color: "bg-terracotta/10 text-terracotta",
              },
              {
                icon: Database,
                name: "Supabase",
                role: "Database & Auth",
                description: "PostgreSQL database with real-time subscriptions, auth, and row-level security.",
                color: "bg-sage/10 text-sage-dark",
              },
            ].map((platform) => (
              <motion.div key={platform.name} variants={fadeUp}>
                <Card className="border border-border/40 shadow-sm bg-card text-center h-full">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl ${platform.color} flex items-center justify-center mx-auto mb-4`}>
                      <platform.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-display text-lg text-foreground">{platform.name}</h3>
                    <p className="text-xs text-terracotta font-medium mt-0.5">{platform.role}</p>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{platform.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center max-w-2xl mx-auto"
          >
            <motion.div variants={fadeUp}>
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663404136543/JhbpQq73m6yNTXPUtViPh3/scoring-abstract-WBdKiHqfyXZ5o7sqRVm6pW.webp"
                alt="Abstract scoring visualization"
                className="w-24 h-24 rounded-2xl mx-auto mb-6 shadow-md"
              />
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl lg:text-4xl font-display text-foreground">
              Ready to score your leads?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground mt-3 max-w-md mx-auto">
              Explore the dashboard, configure your scoring rules, and start converting visitors into customers.
            </motion.p>
            <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 mt-8">
              <Link href="/dashboard">
                <Button size="lg" className="bg-terracotta hover:bg-terracotta-dark text-white">
                  Open Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/settings">
                <Button size="lg" variant="outline" className="border-border/60">
                  Configure Settings
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/40">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-terracotta flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-display text-foreground">LeadScore Pipeline</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Built with React, Tailwind CSS, Recharts. Deploys to Vercel, Render, and Supabase.
          </p>
        </div>
      </footer>
    </div>
  );
}
