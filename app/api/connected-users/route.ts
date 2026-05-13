import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Considera activa una sesión si tuvo actividad en los últimos 30 segundos
const ACTIVE_THRESHOLD_SECONDS = 30;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vulnerable = searchParams.get("vulnerable");
    const seguro = searchParams.get("seguro");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Limpiar sesiones inactivas > 30s (housekeeping automático)
    const cutoff = new Date(Date.now() - ACTIVE_THRESHOLD_SECONDS * 1000).toISOString();
    await supabase.from("sesiones_activas").delete().lt("last_activity", cutoff);

    let query = supabase
      .from("sesiones_activas")
      .select("user_id, username, modo, last_activity")
      .order("last_activity", { ascending: false })
      .limit(40);

    // Filter if requested, otherwise return all
    if (vulnerable === "true" && seguro !== "true") {
      query = query.eq("modo", "vulnerable");
    } else if (seguro === "true" && vulnerable !== "true") {
      query = query.eq("modo", "seguro");
    }

    const { data, error } = await query;
    if (error) console.error("Sessions error:", error);

    return NextResponse.json({ all: data || [] });
  } catch (err) {
    console.error("Connected users error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}