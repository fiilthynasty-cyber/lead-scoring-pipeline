import { eq, desc, sql, and, like, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  leads, InsertLead, Lead,
  subscribers, InsertSubscriber, Subscriber,
  outreachCampaigns, InsertOutreachCampaign, OutreachCampaign,
  notifications, InsertNotification, Notification,
  analyticsEvents, InsertAnalyticsEvent,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ───────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot get user: database not available"); return undefined; }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Leads ───────────────────────────────────────────────────────────
export async function getLeads(opts?: { search?: string; status?: string; limit?: number; offset?: number }) {
  const db = await getDb();
  if (!db) return [];
  const limit = opts?.limit ?? 50;
  const offset = opts?.offset ?? 0;
  let query = db.select().from(leads).orderBy(desc(leads.createdAt)).limit(limit).offset(offset);
  return query;
}

export async function getLeadById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  return result[0];
}

export async function createLead(lead: InsertLead) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(leads).values(lead);
  return { id: result[0].insertId };
}

export async function updateLead(id: number, data: Partial<InsertLead>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(leads).set(data).where(eq(leads.id, id));
}

export async function getLeadStats() {
  const db = await getDb();
  if (!db) return { total: 0, hot: 0, warm: 0, cool: 0, cold: 0, byStatus: [], bySource: [] };
  const total = await db.select({ count: count() }).from(leads);
  const hot = await db.select({ count: count() }).from(leads).where(eq(leads.intentLevel, "hot"));
  const warm = await db.select({ count: count() }).from(leads).where(eq(leads.intentLevel, "warm"));
  const cool = await db.select({ count: count() }).from(leads).where(eq(leads.intentLevel, "cool"));
  const cold = await db.select({ count: count() }).from(leads).where(eq(leads.intentLevel, "cold"));
  return {
    total: total[0]?.count ?? 0,
    hot: hot[0]?.count ?? 0,
    warm: warm[0]?.count ?? 0,
    cool: cool[0]?.count ?? 0,
    cold: cold[0]?.count ?? 0,
  };
}

// ─── Subscribers ─────────────────────────────────────────────────────
export async function getSubscribers(opts?: { limit?: number; offset?: number }) {
  const db = await getDb();
  if (!db) return [];
  const limit = opts?.limit ?? 50;
  const offset = opts?.offset ?? 0;
  return db.select().from(subscribers).orderBy(desc(subscribers.createdAt)).limit(limit).offset(offset);
}

export async function createSubscriber(sub: InsertSubscriber) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(subscribers).values(sub);
  return { id: result[0].insertId };
}

export async function getSubscriberStats() {
  const db = await getDb();
  if (!db) return { total: 0, active: 0, unsubscribed: 0, bounced: 0 };
  const total = await db.select({ count: count() }).from(subscribers);
  const active = await db.select({ count: count() }).from(subscribers).where(eq(subscribers.status, "active"));
  const unsub = await db.select({ count: count() }).from(subscribers).where(eq(subscribers.status, "unsubscribed"));
  const bounced = await db.select({ count: count() }).from(subscribers).where(eq(subscribers.status, "bounced"));
  return {
    total: total[0]?.count ?? 0,
    active: active[0]?.count ?? 0,
    unsubscribed: unsub[0]?.count ?? 0,
    bounced: bounced[0]?.count ?? 0,
  };
}

// ─── Outreach Campaigns ─────────────────────────────────────────────
export async function getOutreachCampaigns(opts?: { limit?: number; offset?: number }) {
  const db = await getDb();
  if (!db) return [];
  const limit = opts?.limit ?? 50;
  const offset = opts?.offset ?? 0;
  return db.select().from(outreachCampaigns).orderBy(desc(outreachCampaigns.createdAt)).limit(limit).offset(offset);
}

export async function createOutreachCampaign(campaign: InsertOutreachCampaign) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(outreachCampaigns).values(campaign);
  return { id: result[0].insertId };
}

export async function updateOutreachCampaign(id: number, data: Partial<InsertOutreachCampaign>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(outreachCampaigns).set(data).where(eq(outreachCampaigns.id, id));
}

export async function getOutreachStats() {
  const db = await getDb();
  if (!db) return { total: 0, sent: 0, opened: 0, replied: 0, draft: 0 };
  const total = await db.select({ count: count() }).from(outreachCampaigns);
  const sent = await db.select({ count: count() }).from(outreachCampaigns).where(eq(outreachCampaigns.status, "sent"));
  const opened = await db.select({ count: count() }).from(outreachCampaigns).where(eq(outreachCampaigns.status, "opened"));
  const replied = await db.select({ count: count() }).from(outreachCampaigns).where(eq(outreachCampaigns.status, "replied"));
  const draft = await db.select({ count: count() }).from(outreachCampaigns).where(eq(outreachCampaigns.status, "draft"));
  return {
    total: total[0]?.count ?? 0,
    sent: sent[0]?.count ?? 0,
    opened: opened[0]?.count ?? 0,
    replied: replied[0]?.count ?? 0,
    draft: draft[0]?.count ?? 0,
  };
}

// ─── Notifications ───────────────────────────────────────────────────
export async function getNotifications(opts?: { limit?: number; unreadOnly?: boolean }) {
  const db = await getDb();
  if (!db) return [];
  const limit = opts?.limit ?? 50;
  if (opts?.unreadOnly) {
    return db.select().from(notifications).where(eq(notifications.isRead, false)).orderBy(desc(notifications.createdAt)).limit(limit);
  }
  return db.select().from(notifications).orderBy(desc(notifications.createdAt)).limit(limit);
}

export async function createNotification(notif: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(notifications).values(notif);
  return { id: result[0].insertId };
}

export async function markNotificationRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
}

export async function markAllNotificationsRead() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.isRead, false));
}

export async function getUnreadNotificationCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: count() }).from(notifications).where(eq(notifications.isRead, false));
  return result[0]?.count ?? 0;
}

// ─── Analytics Events ────────────────────────────────────────────────
export async function createAnalyticsEvent(event: InsertAnalyticsEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(analyticsEvents).values(event);
  return { id: result[0].insertId };
}

export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return { totalLeads: 0, totalSubscribers: 0, totalCampaigns: 0, unreadNotifications: 0 };
  const totalLeads = await db.select({ count: count() }).from(leads);
  const totalSubscribers = await db.select({ count: count() }).from(subscribers);
  const totalCampaigns = await db.select({ count: count() }).from(outreachCampaigns);
  const unreadNotifications = await db.select({ count: count() }).from(notifications).where(eq(notifications.isRead, false));
  return {
    totalLeads: totalLeads[0]?.count ?? 0,
    totalSubscribers: totalSubscribers[0]?.count ?? 0,
    totalCampaigns: totalCampaigns[0]?.count ?? 0,
    unreadNotifications: unreadNotifications[0]?.count ?? 0,
  };
}
