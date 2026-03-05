import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database module
vi.mock("./db", () => ({
  getLeads: vi.fn().mockResolvedValue([]),
  getLeadById: vi.fn().mockResolvedValue(undefined),
  createLead: vi.fn().mockResolvedValue({ id: 1 }),
  updateLead: vi.fn().mockResolvedValue(undefined),
  getLeadStats: vi.fn().mockResolvedValue({ total: 5, hot: 1, warm: 2, cool: 1, cold: 1 }),
  getSubscribers: vi.fn().mockResolvedValue([]),
  createSubscriber: vi.fn().mockResolvedValue({ id: 1 }),
  getSubscriberStats: vi.fn().mockResolvedValue({ total: 10, active: 8, unsubscribed: 1, bounced: 1 }),
  getOutreachCampaigns: vi.fn().mockResolvedValue([]),
  createOutreachCampaign: vi.fn().mockResolvedValue({ id: 1 }),
  updateOutreachCampaign: vi.fn().mockResolvedValue(undefined),
  getOutreachStats: vi.fn().mockResolvedValue({ total: 3, sent: 1, opened: 1, replied: 0, draft: 1 }),
  getNotifications: vi.fn().mockResolvedValue([]),
  createNotification: vi.fn().mockResolvedValue({ id: 1 }),
  markNotificationRead: vi.fn().mockResolvedValue(undefined),
  markAllNotificationsRead: vi.fn().mockResolvedValue(undefined),
  getUnreadNotificationCount: vi.fn().mockResolvedValue(3),
  createAnalyticsEvent: vi.fn().mockResolvedValue({ id: 1 }),
  getDashboardStats: vi.fn().mockResolvedValue({
    totalLeads: 5,
    totalSubscribers: 10,
    totalCampaigns: 3,
    unreadNotifications: 3,
  }),
}));

function createTestContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("dashboard router", () => {
  it("returns dashboard stats", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    const stats = await caller.dashboard.stats();
    expect(stats).toHaveProperty("totalLeads");
    expect(stats).toHaveProperty("totalSubscribers");
    expect(stats).toHaveProperty("totalCampaigns");
    expect(stats).toHaveProperty("unreadNotifications");
    expect(stats.totalLeads).toBe(5);
  });
});

describe("leads router", () => {
  it("returns lead list", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    const leads = await caller.leads.list();
    expect(Array.isArray(leads)).toBe(true);
  });

  it("returns lead stats", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    const stats = await caller.leads.stats();
    expect(stats).toHaveProperty("total");
    expect(stats).toHaveProperty("hot");
    expect(stats).toHaveProperty("warm");
    expect(stats.total).toBe(5);
  });

  it("creates a lead with valid input", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.leads.create({
      name: "Test Lead",
      email: "lead@test.com",
      company: "Test Corp",
    });
    expect(result).toHaveProperty("id");
  });
});

describe("subscribers router", () => {
  it("returns subscriber list", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    const subs = await caller.subscribers.list();
    expect(Array.isArray(subs)).toBe(true);
  });

  it("returns subscriber stats", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    const stats = await caller.subscribers.stats();
    expect(stats).toHaveProperty("total");
    expect(stats.total).toBe(10);
    expect(stats.active).toBe(8);
  });

  it("creates a subscriber", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.subscribers.create({
      name: "New Sub",
      email: "sub@test.com",
      source: "organic",
    });
    expect(result).toHaveProperty("id");
  });
});

describe("notifications router", () => {
  it("returns notification list", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    const notifs = await caller.notifications.list();
    expect(Array.isArray(notifs)).toBe(true);
  });

  it("returns unread count", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    const count = await caller.notifications.unreadCount();
    expect(count).toBe(3);
  });

  it("marks all notifications as read", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.notifications.markAllRead();
    expect(result).toEqual({ success: true });
  });
});

describe("outreach router", () => {
  it("returns outreach campaign list", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    const campaigns = await caller.outreach.list();
    expect(Array.isArray(campaigns)).toBe(true);
  });

  it("returns outreach stats", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    const stats = await caller.outreach.stats();
    expect(stats).toHaveProperty("total");
    expect(stats.total).toBe(3);
  });

  it("creates an outreach campaign", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.outreach.create({
      leadName: "Test Lead",
      leadEmail: "lead@test.com",
      subject: "Hello from LeadScore",
      body: "This is a test outreach email.",
      tone: "professional",
      generatedByAi: true,
    });
    expect(result).toHaveProperty("id");
  });
});
