import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { validateCsrf, csrfError } from "@/lib/csrf";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

async function isAdmin(supabase: any, adminId: string) {
  if (!adminId) return false;
  const { data, error } = await supabase
    .from("perfiles_seguros")
    .select("role")
    .eq("id", adminId)
    .maybeSingle();
  if (error) console.error("isAdmin error:", error);
  return data?.role === "admin";
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get("adminId");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (!(await isAdmin(supabase, adminId as string))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("perfiles_seguros")
      .select("id, username, role")
      .order("username", { ascending: true });

    if (error) {
      console.error("Supabase GET users error:", error);
      throw error;
    }
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("GET users Server error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!validateCsrf(request)) {
    return csrfError();
  }

  try {
    const { adminId, userId, newUsername, newPassword } = await request.json();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (!(await isAdmin(supabase, adminId))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const updatesSeguro: any = {};
    const updatesVulnerable: any = {};

    if (newUsername) {
      updatesSeguro.username = newUsername;
      updatesVulnerable.username = newUsername;
    }

    if (newPassword) {
      updatesSeguro.password_hash = await bcrypt.hash(newPassword, 10);
      updatesVulnerable.password = newPassword;
    }

    if (Object.keys(updatesSeguro).length === 0) {
      return NextResponse.json({ error: "No hay datos para actualizar" }, { status: 400 });
    }

    const { error: err1 } = await supabase.from("perfiles_seguros").update(updatesSeguro).eq("id", userId);
    if (err1) throw err1;

    const { error: err2 } = await supabase.from("perfiles_vulnerables").update(updatesVulnerable).eq("id", userId);
    if (err2) throw err2;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!validateCsrf(request)) {
    return csrfError();
  }

  try {
    const { adminId, userId } = await request.json();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (!(await isAdmin(supabase, adminId))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    await supabase.from("publicaciones").delete().eq("author_id", userId);
    await supabase.from("sesiones_activas").delete().eq("user_id", userId);

    await supabase.from("perfiles_vulnerables").delete().eq("id", userId);
    await supabase.from("perfiles_seguros").delete().eq("id", userId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
