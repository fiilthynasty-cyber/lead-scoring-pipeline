import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  float,
  json,
  boolean,
} from "drizzle-orm/mysql-core";

// ─── Users ───────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Leads ───────────────────────────────────────────────────────────
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  company: varchar("company", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }),
  intentScore: float("intentScore").default(0).notNull(),
  intentLevel: mysqlEnum("intentLevel", ["hot", "warm", "cool", "cold"]).default("cold").notNull(),
  status: mysqlEnum("status", ["new", "contacted", "qualified", "proposal", "won", "lost"]).default("new").notNull(),
  source: mysqlEnum("source", ["organic", "paid", "referral", "social", "email"]).default("organic").notNull(),
  signals: json("signals").$type<IntentSignalJSON[]>(),
  tags: json("tags").$type<string[]>(),
  aiScoreSummary: text("aiScoreSummary"),
  sourceUrl: varchar("sourceUrl", { length: 1000 }),
  profileUrl: varchar("profileUrl", { length: 1000 }),
  websiteUrl: varchar("websiteUrl", { length: 1000 }),
  lastActivity: timestamp("lastActivity").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

export interface IntentSignalJSON {
  type: string;
  description: string;
  weight: number;
  timestamp: string;
}

// ─── Subscribers ─────────────────────────────────────────────────────
export const subscribers = mysqlTable("subscribers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  source: mysqlEnum("source", ["organic", "paid", "referral", "social", "email"]).default("organic").notNull(),
  status: mysqlEnum("subscriberStatus", ["active", "unsubscribed", "bounced"]).default("active").notNull(),
  leadScore: float("leadScore").default(0).notNull(),
  engagementRate: float("engagementRate").default(0).notNull(),
  subscribedAt: timestamp("subscribedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscriber = typeof subscribers.$inferSelect;
export type InsertSubscriber = typeof subscribers.$inferInsert;

// ─── Outreach Campaigns ─────────────────────────────────────────────
export const outreachCampaigns = mysqlTable("outreach_campaigns", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId"),
  leadName: varchar("leadName", { length: 255 }).notNull(),
  leadEmail: varchar("leadEmail", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  body: text("body").notNull(),
  tone: mysqlEnum("tone", ["professional", "friendly", "urgent", "casual"]).default("professional").notNull(),
  status: mysqlEnum("outreachStatus", ["draft", "sent", "opened", "replied", "bounced"]).default("draft").notNull(),
  generatedByAi: boolean("generatedByAi").default(false).notNull(),
  sentAt: timestamp("sentAt"),
  openedAt: timestamp("openedAt"),
  repliedAt: timestamp("repliedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OutreachCampaign = typeof outreachCampaigns.$inferSelect;
export type InsertOutreachCampaign = typeof outreachCampaigns.$inferInsert;

// ─── Notifications ───────────────────────────────────────────────────
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("notificationType", ["lead_scored", "lead_progressed", "new_subscriber", "outreach_sent", "system"]).default("system").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// ─── Analytics Events ────────────────────────────────────────────────
export const analyticsEvents = mysqlTable("analytics_events", {
  id: int("id").autoincrement().primaryKey(),
  eventType: varchar("eventType", { length: 100 }).notNull(),
  entityType: mysqlEnum("entityType", ["lead", "subscriber", "campaign", "pipeline"]).notNull(),
  entityId: int("entityId"),
  value: float("value").default(0),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert;
