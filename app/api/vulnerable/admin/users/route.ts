import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export async function GET(request: Request) {
  try {
    // MODO VULNERABLE: No se verifica quién lo pide (IDOR / Broken Access Control)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from("perfiles_vulnerables")
      .select("id, username, password, role") // EXPONE CONTRASEÑAS! Vulnerabilidad intencional
      .order("username", { ascending: true });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    // MODO VULNERABLE: No hay verificación de admin
    const { userId, newUsername, newPassword } = await request.json();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const updatesSeguro: any = {};
    const updatesVulnerable: any = {};

    if (newUsername) {
      updatesSeguro.username = newUsername;
      updatesVulnerable.username = newUsername;
    }
    
    if (newPassword) {
      // Incluso si es vulnerable, debemos cumplir con el constraint bcrypt de seguro para no romper la app
      updatesSeguro.password_hash = await bcrypt.hash(newPassword, 10);
      updatesVulnerable.password = newPassword;
    }

    if (Object.keys(updatesSeguro).length === 0) {
      return NextResponse.json({ error: "No hay datos para actualizar" }, { status: 400 });
    }

    // Permite que cualquiera modifique a cualquier usuario (Broken Access Control)
    await supabase.from("perfiles_vulnerables").update(updatesVulnerable).eq("id", userId);
    await supabase.from("perfiles_seguros").update(updatesSeguro).eq("id", userId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    // MODO VULNERABLE: No hay verificación de admin
    const { userId } = await request.json();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Cualquiera puede borrar a cualquiera
    await supabase.from("publicaciones").delete().eq("author_id", userId);
    await supabase.from("sesiones_activas").delete().eq("user_id", userId);
    
    await supabase.from("perfiles_vulnerables").delete().eq("id", userId);
    await supabase.from("perfiles_seguros").delete().eq("id", userId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
