import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

export async function checkRateLimit(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  const since = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();

  await supabase.from("intentos_fallidos")
    .delete()
    .eq("ip_address", ip)
    .lt("attempted_at", since);

  const { count } = await supabase
    .from("intentos_fallidos")
    .select("*", { count: "exact", head: true })
    .eq("ip_address", ip)
    .gte("attempted_at", since);

  const attemptCount = count ?? 0;
  return {
    allowed: attemptCount < MAX_ATTEMPTS,
    remaining: Math.max(0, MAX_ATTEMPTS - attemptCount),
  };
}

export async function recordFailedAttempt(ip: string, username: string): Promise<void> {
  await supabase.from("intentos_fallidos").insert({ ip_address: ip, username });
}

export async function resetRateLimit(ip: string): Promise<void> {
  await supabase.from("intentos_fallidos").delete().eq("ip_address", ip);
}
