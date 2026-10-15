// ERP Intelligence Shared AI Gateway — disabled-by-default, server-to-server only.
// No secret values, real customer payloads, or existing app settings are committed here.
import postgres from "npm:postgres@3.4.5";

type ClientRules = { token_sha256: string; daily_limit: number };
type ClientMap = Record<string, ClientRules>;

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
};
function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}
function validProject(v: string): boolean {
  return /^[a-z0-9][a-z0-9_-]{2,63}$/.test(v);
}
function fixedEqualHex(a: string, b: string): boolean {
  if (!/^[0-9a-f]{64}$/.test(a) || !/^[0-9a-f]{64}$/.test(b)) return false;
  let mismatch = 0;
  for (let i = 0; i < 64; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}
async function hashToken(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), x => x.toString(16).padStart(2, "0")).join("");
}
function getClients(): ClientMap | null {
  const raw = Deno.env.get("AI_GATEWAY_CLIENTS_JSON");
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return parsed as ClientMap;
  } catch { return null; }
}

Deno.serve(async (req: Request): Promise<Response> => {
  // This deployment cannot incur model charges or use Vault until explicitly enabled.
  if (req.method === "GET") {
    return json(200, { name: "ai-gateway", active: false, version: "0.1.0", mode: "disabled-by-default" });
  }
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });
  if (Deno.env.get("AI_GATEWAY_ENABLED") !== "true") {
    return json(503, { error: "gateway_not_activated" });
  }

  // Never allow direct browser invocation or pass third-party credentials to clients.
  if (req.headers.has("origin")) return json(403, { error: "server_to_server_only" });
  const project = req.headers.get("x-gateway-project") || "";
  const auth = req.headers.get("authorization") || "";
  const match = /^Bearer ([A-Za-z0-9._~-]{32,256})$/.exec(auth);
  const clients = getClients();
  const rule = validProject(project) ? clients?.[project] : undefined;
  if (!match || !rule || typeof rule.token_sha256 !== "string") {
    return json(401, { error: "not_authorized" });
  }
  const actualHash = await hashToken(match[1]);
  if (!fixedEqualHex(actualHash, rule.token_sha256)) return json(401, { error: "not_authorized" });

  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > 8192) return json(413, { error: "request_too_large" });
  let input: unknown;
  try {
    const body = await req.text();
    if (body.length > 8192) return json(413, { error: "request_too_large" });
    input = JSON.parse(body);
  } catch { return json(400, { error: "invalid_json" }); }
  if (!input || typeof input !== "object" || Array.isArray(input)) return json(400, { error: "invalid_body" });
  const payload = input as Record<string, unknown>;
  const prompt = payload.prompt;
  // Synthetic-only until project-specific compliance and data processing approval.
  if (payload.classification !== "synthetic" || payload.model !== "deepseek-v4-flash" ||
      typeof prompt !== "string" || prompt.trim().length < 1 || prompt.length > 4000 ||
      /sk-[A-Za-z0-9]{16,}|-----BEGIN [A-Z ]+PRIVATE KEY-----/i.test(prompt)) {
    return json(400, { error: "unsupported_model_or_data_classification" });
  }
  const dbUrl = Deno.env.get("SUPABASE_DB_URL");
  if (!dbUrl) return json(503, { error: "gateway_not_configured" });

  const dailyLimit = Math.max(1, Math.min(100, Math.floor(Number(rule.daily_limit) || 0)));
  if (!Number.isInteger(Number(rule.daily_limit)) || Number(rule.daily_limit) < 1) {
    return json(503, { error: "client_quota_not_configured" });
  }
  // Encrypted DeepSeek secret is obtained server-side, never in an HTTP response or logs.
  const sql = postgres(dbUrl, { max: 1, prepare: false, connect_timeout: 5, ssl: "require" });
  let key: string | undefined;
  try {
    const result = await sql`SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'deepseek_api_key' LIMIT 1`;
    key = typeof result[0]?.decrypted_secret === "string" ? result[0].decrypted_secret : undefined;
    if (!key) return json(503, { error: "provider_key_not_configured" });

    const quota = await sql`
      INSERT INTO ai_gateway.daily_request_budget (project_id, utc_day, requests_used, last_request_at)
      VALUES (${project}, (timezone('UTC', now())::date), 1, now())
      ON CONFLICT (project_id, utc_day)
      DO UPDATE SET requests_used = ai_gateway.daily_request_budget.requests_used + 1,
                    last_request_at = now()
      WHERE ai_gateway.daily_request_budget.requests_used < ${dailyLimit}
      RETURNING requests_used
    `;
    if (quota.length === 0) return json(429, { error: "daily_project_limit_reached" });
  } catch {
    return json(503, { error: "gateway_database_unavailable" });
  } finally {
    await sql.end({ timeout: 1 }).catch(() => {});
  }

  try {
    const upstream = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { "authorization": "Bearer " + key, "content-type": "application/json" },
      body: JSON.stringify({
        model: "deepseek-v4-flash",
        messages: [
          { role: "system", content: "Answer the synthetic test query accurately and concisely. Do not assume any real company records are available." },
          { role: "user", content: prompt },
        ],
        max_tokens: 256,
        stream: false,
      }),
      signal: AbortSignal.timeout(25000),
    });
    if (!upstream.ok) return json(502, { error: "provider_unavailable" });
    const result: unknown = await upstream.json();
    const data = result && typeof result === "object" ? result as Record<string, unknown> : {};
    const choice = Array.isArray(data.choices) ? data.choices[0] : null;
    const message = choice && typeof choice === "object" ? choice.message : null;
    const text = message && typeof message === "object" ? message.content : null;
    const usage = data.usage && typeof data.usage === "object" ? data.usage as Record<string, unknown> : {};
    return json(200, {
      project,
      model: "deepseek-v4-flash",
      content: typeof text === "string" ? text.slice(0, 12000) : "",
      usage: {
        prompt_tokens: Number(usage.prompt_tokens) || 0,
        completion_tokens: Number(usage.completion_tokens) || 0,
        total_tokens: Number(usage.total_tokens) || 0,
      },
      classification: "synthetic",
    });
  } catch { return json(502, { error: "provider_unavailable" }); }
});
