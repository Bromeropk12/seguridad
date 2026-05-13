import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

function sanitizeContent(content: string): string {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabase
      .from("publicaciones")
      .select("id, content, created_at, author_id")
      .eq("mode", "seguro")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Seguros messages error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const authorIds = data?.map((d) => d.author_id).filter(Boolean) || [];
    let usernames: Record<string, string> = {};

    if (authorIds.length > 0) {
      // Buscar en AMBAS tablas: UUID compartido entre modos
      const [{ data: profilesSeguro }, { data: profilesVulnerable }] = await Promise.all([
        supabase.from("perfiles_seguros").select("id, username").in("id", authorIds),
        supabase.from("perfiles_vulnerables").select("id, username").in("id", authorIds),
      ]);

      // Merge: perfiles_seguros tiene prioridad (nombre canónico del modo seguro)
      [...(profilesVulnerable || []), ...(profilesSeguro || [])].forEach((p) => {
        usernames[p.id] = p.username;
      });

      console.log("[seguro/messages] UUIDs buscados:", authorIds);
      console.log("[seguro/messages] Resueltos:", Object.keys(usernames).length, "de", authorIds.length);
    }

    const messages = (data || []).map((m) => ({
      ...m,
      content: sanitizeContent(m.content),
      username: usernames[m.author_id] || "Desconocido",
    }));

    return NextResponse.json(messages);
  } catch (err) {
    console.error("Messages catch error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}