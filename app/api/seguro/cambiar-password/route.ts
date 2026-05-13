import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// PUT /api/seguro/cambiar-password
export async function PUT(request: Request) {
  try {
    const { userId, currentPassword, newPassword } = await request.json();

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "La nueva contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar al usuario en perfiles_seguros
    const { data: profile, error: fetchError } = await supabase
      .from("perfiles_seguros")
      .select("id, password_hash")
      .eq("id", userId)
      .maybeSingle();

    if (fetchError || !profile) {
      return NextResponse.json(
        { error: "Usuario no encontrado en el modo seguro" },
        { status: 404 }
      );
    }

    // Verificar contraseña actual con bcrypt
    const isValid = await bcrypt.compare(currentPassword, profile.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: "La contraseña actual es incorrecta" },
        { status: 401 }
      );
    }

    // Hashear la nueva contraseña
    const newHash = await bcrypt.hash(newPassword, 10);

    // Actualizar SOLO en perfiles_seguros y activar el flag
    const { error: updateError } = await supabase
      .from("perfiles_seguros")
      .update({
        password_hash: newHash,
        password_changed: true,
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Error al actualizar contraseña:", updateError);
      return NextResponse.json(
        { error: "Error al actualizar la contraseña" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message:
        "Contraseña actualizada exitosamente. Tu contraseña del modo vulnerable no ha cambiado.",
    });
  } catch (err) {
    console.error("cambiar-password PUT error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
