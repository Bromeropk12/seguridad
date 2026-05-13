import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const ADMIN_KEY = "Segurid@dsoftware";

export async function POST(request: Request) {
  try {
    const { username, password, role, adminKey } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Usuario y contrasena requeridos" },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: "El usuario debe tener al menos 3 caracteres" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contrasena debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    const userRole = role === "admin" ? "admin" : "user";

    if (userRole === "admin") {
      if (!adminKey || adminKey !== ADMIN_KEY) {
        return NextResponse.json(
          { error: "Clave de administrador incorrecta" },
          { status: 403 }
        );
      }
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar que el usuario no exista en ninguna de las dos tablas
    const { data: existingVulnerable } = await supabase
      .from("perfiles_vulnerables")
      .select("id")
      .eq("username", username)
      .single();

    const { data: existingSeguro } = await supabase
      .from("perfiles_seguros")
      .select("id")
      .eq("username", username)
      .single();

    if (existingVulnerable || existingSeguro) {
      return NextResponse.json(
        { error: "El usuario ya existe" },
        { status: 409 }
      );
    }

    // Insertar en perfiles_vulnerables (INSEGURO: contraseña en texto plano)
    const { data: newUser, error: errorVulnerable } = await supabase
      .from("perfiles_vulnerables")
      .insert({ username, password, role: userRole })
      .select()
      .single();

    if (errorVulnerable || !newUser) {
      return NextResponse.json(
        { error: errorVulnerable?.message || "Error al crear usuario" },
        { status: 500 }
      );
    }

    // Sincronizar en perfiles_seguros con el MISMO UUID y hash bcrypt
    const passwordHash = await bcrypt.hash(password, 10);
    const { error: errorSeguro } = await supabase
      .from("perfiles_seguros")
      .insert({ id: newUser.id, username, password_hash: passwordHash, role: userRole });

    if (errorSeguro) {
      console.error("[vulnerable/register] Error al sincronizar con perfiles_seguros:", errorSeguro);
      // No es crítico para el modo vulnerable, continuar
    }

    console.log("[vulnerable/register] Usuario creado con UUID compartido:", newUser.id, username);
    return NextResponse.json({
      user: { id: newUser.id, username: newUser.username, role: userRole },
      message: "Registro exitoso (VULNERABLE: contrasena en texto plano)",
    });
  } catch (err) {
    console.error("[vulnerable/register] Error:", err);
    return NextResponse.json(
      { error: "Error del servidor" },
      { status: 500 }
    );
  }
}