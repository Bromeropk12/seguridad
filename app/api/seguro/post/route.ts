import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateCsrf, csrfError } from "@/lib/csrf";
import DOMPurify from "isomorphic-dompurify";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function sanitizeContent(content: string): string {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

export async function POST(request: Request) {
  if (!validateCsrf(request)) {
    return csrfError();
  }

  try {
    const { content, authorId, mode } = await request.json();

    console.log("[seguro/post] authorId recibido:", authorId);
    console.log("[seguro/post] mode recibido:", mode);

    if (!content) {
      return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

    if (!authorId) {
      console.error("[seguro/post] ERROR: authorId es undefined/null. El usuario no esta autenticado correctamente.");
      return NextResponse.json(
        { error: "No autenticado: authorId requerido" },
        { status: 401 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from("publicaciones")
      .insert({
        content: sanitizeContent(content),
        mode,
        author_id: authorId,
      })
      .select()
      .single();

    if (error) {
      console.error("[seguro/post] Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("[seguro/post] Publicacion insertada con author_id:", data.author_id);
    return NextResponse.json(data);
  } catch (err) {
    console.error("[seguro/post] Server error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
