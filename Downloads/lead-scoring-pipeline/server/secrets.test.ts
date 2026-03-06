import { describe, expect, it } from "vitest";

describe("External service credentials", () => {
  it("SUPABASE_URL is set and looks like a valid URL", () => {
    const url = process.env.SUPABASE_URL;
    expect(url).toBeDefined();
    expect(url).toMatch(/^https:\/\/.*\.supabase\.co$/);
  });

  it("SUPABASE_ANON_KEY is set and looks like a JWT", () => {
    const key = process.env.SUPABASE_ANON_KEY;
    expect(key).toBeDefined();
    expect(key!.split(".").length).toBe(3);
  });

  it("OPENAI_API_KEY is set and starts with sk-", () => {
    const key = process.env.OPENAI_API_KEY;
    expect(key).toBeDefined();
    expect(key).toMatch(/^sk-/);
  });

  it("can reach Supabase REST API", async () => {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    const res = await fetch(`${url}/rest/v1/`, {
      headers: {
        apikey: key!,
        Authorization: `Bearer ${key}`,
      },
    });
    // 200 means the project is reachable (even if no tables exist yet)
    expect(res.status).toBe(200);
  });
});
