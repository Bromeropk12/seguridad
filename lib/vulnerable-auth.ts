import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function findUserByUsername(username: string) {
  const { data, error } = await supabase
    .from("perfiles_vulnerables")
    .select("id, username, password, role")
    .eq("username", username)
    .single();

  if (error || !data) return null;
  return data;
}

export async function createUser(username: string, password: string, role: string = "user") {
  const { data, error } = await supabase
    .from("perfiles_vulnerables")
    .insert({ username, password, role })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function checkUserExists(username: string) {
  const { data } = await supabase
    .from("perfiles_vulnerables")
    .select("id")
    .eq("username", username)
    .single();

  return !!data;
}