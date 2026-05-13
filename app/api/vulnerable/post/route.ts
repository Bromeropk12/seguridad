import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export async function POST(request: Request) {
  try {
    const { content, authorId, mode } = await request.json();

    // LOG DE DIAGNÓSTICO
    console.log("[vulnerable/post] authorId recibido:", authorId);
    console.log("[vulnerable/post] mode recibido:", mode);

    if (!content) {
      return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

    if (!authorId) {
      console.error("[vulnerable/post] ERROR: authorId es undefined/null.");
      return NextResponse.json(
        { error: "No autenticado: authorId requerido" },
        { status: 401 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabase
      .from("publicaciones")
      .insert({
        content,
        mode,
        author_id: authorId, // Sin fallback silencioso
      })
      .select()
      .single();

    if (error) {
      console.error("[vulnerable/post] Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("[vulnerable/post] Publicación insertada con author_id:", data.author_id);
    return NextResponse.json(data);
  } catch (err) {
    console.error("[vulnerable/post] Server error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}