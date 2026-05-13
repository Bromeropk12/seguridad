import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from "@/lib/rate-limiter";
import { validateCsrf, csrfError } from "@/lib/csrf";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const jwtSecret = new TextEncoder().encode(
  process.env.JWT_SECRET || "cyber-lab-secret-key-change-in-production"
);

export async function POST(request: Request) {
  if (!validateCsrf(request)) {
    return csrfError();
  }

  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "unknown";

    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Usuario y contrasena requerido" },
        { status: 400 }
      );
    }

    const { allowed, remaining } = await checkRateLimit(ip);

    if (!allowed) {
      const response = NextResponse.json(
        { error: "Demasiados intentos. Intenta de nuevo en 15 minutos.", remaining },
        { status: 429 }
      );
      response.headers.set("Retry-After", "900");
      return response;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: user, error } = await supabase
      .from("perfiles_seguros")
      .select("id, username, password_hash, role")
      .eq("username", username)
      .single();

    if (error || !user) {
      await recordFailedAttempt(ip, username);
      return NextResponse.json(
        { error: "Credenciales invalidas", remaining: remaining - 1 },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      await recordFailedAttempt(ip, username);
      return NextResponse.json(
        { error: "Credenciales invalidas", remaining: remaining - 1 },
        { status: 401 }
      );
    }

    await resetRateLimit(ip);

    const token = await new SignJWT({
      username: user.username,
      role: user.role,
      sub: user.id
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(jwtSecret);

    const response = NextResponse.json({
      user: {
        username: user.username,
        role: user.role,
        id: user.id
      },
      message: "Login exitoso (SEGURO: bcrypt + JWT)",
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Error del servidor" },
      { status: 500 }
    );
  }
}
