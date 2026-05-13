import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// GET /api/seguro/check-mode-access?userId=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId requerido" }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from("perfiles_seguros")
      .select("password_changed")
      .eq("id", userId)
      .maybeSingle();

    if (error || !data) {
      // Si no existe en perfiles_seguros, requiere reauth para entrar
      return NextResponse.json({ requiresReauth: true });
    }

    return NextResponse.json({
      requiresReauth: data.password_changed === true,
    });
  } catch (err) {
    console.error("check-mode-access GET error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
