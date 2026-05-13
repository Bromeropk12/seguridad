import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Usuario y contrasena requerido" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: user, error } = await supabase
      .from("perfiles_vulnerables")
      .select("id, username, password, role")
      .eq("username", username)
      .eq("password", password)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: "Credenciales invalidas" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: { 
        username: user.username, 
        role: user.role,
        id: user.id
      },
      message: "Login exitoso (VULNERABLE: contrasena en texto plano)",
    });
  } catch {
    return NextResponse.json(
      { error: "Error del servidor" },
      { status: 500 }
    );
  }
}