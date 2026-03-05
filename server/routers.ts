import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { z } from "zod";
import {
  getLeads, getLeadById, createLead, updateLead, getLeadStats,
  getSubscribers, createSubscriber, getSubscriberStats,
  getOutreachCampaigns, createOutreachCampaign, updateOutreachCampaign, getOutreachStats,
  getNotifications, createNotification, markNotificationRead, markAllNotificationsRead, getUnreadNotificationCount,
  createAnalyticsEvent, getDashboardStats,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Dashboard ───────────────────────────────────────────────────
  dashboard: router({
    stats: publicProcedure.query(async () => {
      return getDashboardStats();
    }),
  }),

  // ─── Leads ───────────────────────────────────────────────────────
  leads: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return getLeads(input ?? {});
      }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getLeadById(input.id);
      }),
    create: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        company: z.string().min(1),
        title: z.string().optional(),
        source: z.enum(["organic", "paid", "referral", "social", "email"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await createLead({
          name: input.name,
          email: input.email,
          company: input.company,
          title: input.title,
          source: input.source ?? "organic",
        });
        await createNotification({
          type: "new_subscriber",
          title: "New Lead Added",
          message: `${input.name} from ${input.company} was added as a new lead.`,
        });
        return result;
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          name: z.string().optional(),
          email: z.string().email().optional(),
          company: z.string().optional(),
          title: z.string().optional(),
          intentScore: z.number().optional(),
          intentLevel: z.enum(["hot", "warm", "cool", "cold"]).optional(),
          status: z.enum(["new", "contacted", "qualified", "proposal", "won", "lost"]).optional(),
          aiScoreSummary: z.string().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        await updateLead(input.id, input.data);
        return { success: true };
      }),
    stats: publicProcedure.query(async () => {
      return getLeadStats();
    }),
  }),

  // ─── AI Scoring ──────────────────────────────────────────────────
  aiScoring: router({
    scoreLead: publicProcedure
      .input(z.object({
        leadId: z.number(),
        name: z.string(),
        email: z.string(),
        company: z.string(),
        title: z.string().optional(),
        signals: z.array(z.object({
          type: z.string(),
          description: z.string(),
          weight: z.number(),
        })).optional(),
        additionalContext: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const signalText = input.signals?.map(s => `- ${s.type}: ${s.description} (weight: ${s.weight})`).join("\n") ?? "No signals recorded yet.";
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are an expert lead scoring AI for B2B sales. Analyze the lead's intent signals and provide a comprehensive score.
              
Return a JSON object with:
- score: number 0-100 (intent score)
- level: "hot" | "warm" | "cool" | "cold"
- summary: string (2-3 sentence analysis)
- recommendations: string[] (3 actionable next steps)
- signals_analysis: string (analysis of each signal)

Scoring criteria:
- 80-100 (Hot): Multiple high-intent signals, pricing page visits, demo requests
- 60-79 (Warm): Moderate engagement, content downloads, repeat visits
- 30-59 (Cool): Some interest, initial visits, social engagement
- 0-29 (Cold): Minimal engagement, single visit, no interaction`
            },
            {
              role: "user",
              content: `Score this lead:
Name: ${input.name}
Email: ${input.email}
Company: ${input.company}
Title: ${input.title ?? "Unknown"}
${input.additionalContext ? `Additional Context: ${input.additionalContext}` : ""}

Intent Signals:
${signalText}`
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "lead_score",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  score: { type: "number", description: "Intent score 0-100" },
                  level: { type: "string", enum: ["hot", "warm", "cool", "cold"] },
                  summary: { type: "string", description: "2-3 sentence analysis" },
                  recommendations: { type: "array", items: { type: "string" }, description: "3 actionable next steps" },
                  signals_analysis: { type: "string", description: "Analysis of each signal" },
                },
                required: ["score", "level", "summary", "recommendations", "signals_analysis"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0]?.message?.content;
        const parsed = JSON.parse(typeof content === "string" ? content : "{}");

        // Update the lead with the AI score
        await updateLead(input.leadId, {
          intentScore: parsed.score,
          intentLevel: parsed.level,
          aiScoreSummary: parsed.summary,
        });

        // Create notification
        await createNotification({
          type: "lead_scored",
          title: `Lead Scored: ${input.name}`,
          message: `AI scored ${input.name} at ${parsed.score}/100 (${parsed.level}). ${parsed.summary}`,
        });

        // Log analytics event
        await createAnalyticsEvent({
          eventType: "ai_score",
          entityType: "lead",
          entityId: input.leadId,
          value: parsed.score,
        });

        return parsed;
      }),

    batchScore: publicProcedure
      .input(z.object({
        leadIds: z.array(z.number()),
      }))
      .mutation(async ({ input }) => {
        const results: Array<{ leadId: number; score: number; level: string }> = [];
        for (const leadId of input.leadIds) {
          const lead = await getLeadById(leadId);
          if (!lead) continue;
          try {
            const response = await invokeLLM({
              messages: [
                { role: "system", content: "You are a lead scoring AI. Return JSON with: score (0-100), level (hot/warm/cool/cold), summary (1 sentence)." },
                { role: "user", content: `Score: ${lead.name} at ${lead.company}, email: ${lead.email}. Current signals: ${JSON.stringify(lead.signals ?? [])}` },
              ],
              response_format: {
                type: "json_schema",
                json_schema: {
                  name: "quick_score",
                  strict: true,
                  schema: {
                    type: "object",
                    properties: {
                      score: { type: "number" },
                      level: { type: "string", enum: ["hot", "warm", "cool", "cold"] },
                      summary: { type: "string" },
                    },
                    required: ["score", "level", "summary"],
                    additionalProperties: false,
                  },
                },
              },
            });
            const parsed = JSON.parse(typeof response.choices[0]?.message?.content === "string" ? response.choices[0].message.content : "{}");
            await updateLead(leadId, { intentScore: parsed.score, intentLevel: parsed.level, aiScoreSummary: parsed.summary });
            results.push({ leadId, score: parsed.score, level: parsed.level });
          } catch (e) {
            results.push({ leadId, score: 0, level: "cold" });
          }
        }
        return results;
      }),
  }),

  // ─── Outreach ────────────────────────────────────────────────────
  outreach: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return getOutreachCampaigns(input ?? {});
      }),
    stats: publicProcedure.query(async () => {
      return getOutreachStats();
    }),
    generateEmail: publicProcedure
      .input(z.object({
        leadName: z.string(),
        leadEmail: z.string(),
        company: z.string(),
        intentScore: z.number().optional(),
        intentLevel: z.string().optional(),
        tone: z.enum(["professional", "friendly", "urgent", "casual"]).optional(),
        context: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const tone = input.tone ?? "professional";
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are an expert B2B sales copywriter. Generate a personalized outreach email.
              
Tone: ${tone}
The email should be concise, compelling, and personalized based on the lead's information.

Return JSON with:
- subject: string (compelling email subject line)
- body: string (full email body with proper formatting, use \\n for line breaks)
- followUpSuggestion: string (suggested follow-up action)`
            },
            {
              role: "user",
              content: `Generate an outreach email for:
Name: ${input.leadName}
Company: ${input.company}
Intent Score: ${input.intentScore ?? "Unknown"}/100
Intent Level: ${input.intentLevel ?? "Unknown"}
${input.context ? `Additional Context: ${input.context}` : ""}`
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "outreach_email",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  subject: { type: "string" },
                  body: { type: "string" },
                  followUpSuggestion: { type: "string" },
                },
                required: ["subject", "body", "followUpSuggestion"],
                additionalProperties: false,
              },
            },
          },
        });

        const parsed = JSON.parse(typeof response.choices[0]?.message?.content === "string" ? response.choices[0].message.content : "{}");
        return parsed;
      }),
    create: publicProcedure
      .input(z.object({
        leadId: z.number().optional(),
        leadName: z.string(),
        leadEmail: z.string(),
        subject: z.string(),
        body: z.string(),
        tone: z.enum(["professional", "friendly", "urgent", "casual"]).optional(),
        generatedByAi: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await createOutreachCampaign({
          leadId: input.leadId,
          leadName: input.leadName,
          leadEmail: input.leadEmail,
          subject: input.subject,
          body: input.body,
          tone: input.tone ?? "professional",
          generatedByAi: input.generatedByAi ?? false,
        });
        await createNotification({
          type: "outreach_sent",
          title: `Outreach Created: ${input.leadName}`,
          message: `New outreach email "${input.subject}" created for ${input.leadName}.`,
        });
        return result;
      }),
    markSent: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await updateOutreachCampaign(input.id, { status: "sent", sentAt: new Date() });
        return { success: true };
      }),
  }),

  // ─── Subscribers ─────────────────────────────────────────────────
  subscribers: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return getSubscribers(input ?? {});
      }),
    create: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        source: z.enum(["organic", "paid", "referral", "social", "email"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await createSubscriber({
          name: input.name,
          email: input.email,
          source: input.source ?? "organic",
        });
        await createNotification({
          type: "new_subscriber",
          title: "New Subscriber",
          message: `${input.name} (${input.email}) subscribed via ${input.source ?? "organic"}.`,
        });
        return result;
      }),
    stats: publicProcedure.query(async () => {
      return getSubscriberStats();
    }),
  }),

  // ─── Notifications ───────────────────────────────────────────────
  notifications: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().optional(), unreadOnly: z.boolean().optional() }).optional())
      .query(async ({ input }) => {
        return getNotifications(input ?? {});
      }),
    unreadCount: publicProcedure.query(async () => {
      return getUnreadNotificationCount();
    }),
    markRead: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await markNotificationRead(input.id);
        return { success: true };
      }),
    markAllRead: publicProcedure.mutation(async () => {
      await markAllNotificationsRead();
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
