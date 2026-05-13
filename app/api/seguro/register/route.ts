import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { validateCsrf, csrfError } from "@/lib/csrf";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const ADMIN_KEY = process.env.ADMIN_KEY || "";

function safeCompare(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a, "utf8");
  const bBuffer = Buffer.from(b, "utf8");
  if (aBuffer.length !== bBuffer.length) return false;
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

export async function POST(request: Request) {
  if (!validateCsrf(request)) {
    return csrfError();
  }

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
      if (!ADMIN_KEY) {
        return NextResponse.json(
          { error: "Error del servidor: clave de administrador no configurada" },
          { status: 500 }
        );
      }
      if (!adminKey || !safeCompare(adminKey, ADMIN_KEY)) {
        return NextResponse.json(
          { error: "Clave de administrador incorrecta" },
          { status: 403 }
        );
      }
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: existingSeguro } = await supabase
      .from("perfiles_seguros")
      .select("id")
      .eq("username", username)
      .single();

    const { data: existingVulnerable } = await supabase
      .from("perfiles_vulnerables")
      .select("id")
      .eq("username", username)
      .single();

    if (existingSeguro || existingVulnerable) {
      return NextResponse.json(
        { error: "El usuario ya existe" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { data: newUser, error: errorSeguro } = await supabase
      .from("perfiles_seguros")
      .insert({ username, password_hash: passwordHash, role: userRole })
      .select()
      .single();

    if (errorSeguro || !newUser) {
      return NextResponse.json(
        { error: errorSeguro?.message || "Error al crear usuario seguro" },
        { status: 500 }
      );
    }

    const { error: errorVulnerable } = await supabase
      .from("perfiles_vulnerables")
      .insert({ id: newUser.id, username, password, role: userRole });

    if (errorVulnerable) {
      console.error("[seguro/register] Error al sincronizar con perfiles_vulnerables:", errorVulnerable);
    }

    console.log("[seguro/register] Usuario creado con UUID compartido:", newUser.id, username);
    return NextResponse.json({
      user: { id: newUser.id, username: newUser.username, role: userRole },
      message: "Registro exitoso (SEGURO: bcrypt + JWT)",
    });
  } catch (err) {
    console.error("[seguro/register] Error:", err);
    return NextResponse.json(
      { error: "Error del servidor" },
      { status: 500 }
    );
  }
}
