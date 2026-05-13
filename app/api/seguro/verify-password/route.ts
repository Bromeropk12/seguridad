import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// POST /api/seguro/verify-password
export async function POST(request: Request) {
  try {
    const { userId, password } = await request.json();

    if (!userId || !password) {
      return NextResponse.json(
        { error: "userId y password son requeridos" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: profile, error } = await supabase
      .from("perfiles_seguros")
      .select("password_hash")
      .eq("id", userId)
      .maybeSingle();

    if (error || !profile) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const isValid = await bcrypt.compare(password, profile.password_hash);

    if (!isValid) {
      return NextResponse.json(
        { error: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    return NextResponse.json({ valid: true });
  } catch (err) {
    console.error("verify-password POST error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
