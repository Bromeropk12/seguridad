import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// POST /api/heartbeat
// Body: { userId, username, modo }
// El frontend llama esto cada 10s para mantener la sesión activa en la tabla sesiones_activas
export async function POST(request: Request) {
  try {
    const { userId, username, modo } = await request.json();

    if (!userId || !username || !modo) {
      return NextResponse.json({ error: "userId, username y modo requeridos" }, { status: 400 });
    }

    if (modo !== "seguro" && modo !== "vulnerable") {
      return NextResponse.json({ error: "modo invalido" }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Upsert por user_id + modo: actualiza last_activity si ya existe, inserta si no
    const { error } = await supabase
      .from("sesiones_activas")
      .upsert(
        {
          user_id: userId,
          username,
          modo,
          last_activity: new Date().toISOString(),
        },
        { onConflict: "user_id,modo" }
      );

    if (error) {
      // Si falla el upsert por constraint, intentar insert directo
      const { error: insertError } = await supabase
        .from("sesiones_activas")
        .insert({ user_id: userId, username, modo, last_activity: new Date().toISOString() });

      if (insertError) {
        console.error("[heartbeat] Error:", insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[heartbeat] Server error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/heartbeat
// Body: { userId, modo }
// El frontend llama esto al cerrar sesión para limpiar inmediatamente
export async function DELETE(request: Request) {
  try {
    const { userId, modo } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "userId requerido" }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const query = supabase.from("sesiones_activas").delete().eq("user_id", userId);
    if (modo) query.eq("modo", modo);

    await query;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[heartbeat] DELETE error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
