import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabase
      .from("publicaciones")
      .select("id, content, created_at, author_id")
      .eq("mode", "vulnerable")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Vulnerable messages error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const authorIds = data?.map((d) => d.author_id).filter(Boolean) || [];
    let usernames: Record<string, string> = {};

    if (authorIds.length > 0) {
      // Buscar en AMBAS tablas: UUID compartido entre modos
      const [{ data: profilesVulnerable }, { data: profilesSeguro }] = await Promise.all([
        supabase.from("perfiles_vulnerables").select("id, username").in("id", authorIds),
        supabase.from("perfiles_seguros").select("id, username").in("id", authorIds),
      ]);

      // Merge: perfiles_vulnerables tiene prioridad en el feed vulnerable
      [...(profilesSeguro || []), ...(profilesVulnerable || [])].forEach((p) => {
        usernames[p.id] = p.username;
      });
    }

    const messages = (data || []).map((m) => ({
      ...m,
      username: usernames[m.author_id] || "Desconocido",
    }));

    return NextResponse.json(messages);
  } catch (err) {
    console.error("Messages catch error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}