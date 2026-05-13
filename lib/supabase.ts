const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export async function insertVulnerableProfile(
  username: string,
  password: string,
  role: string,
  adminKey?: string
) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/perfiles_vulnerables`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY}`,
      "Prefer": "return=representation",
    },
    body: JSON.stringify({
      username,
      password,
      role,
      admin_key: adminKey || null,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error inserting vulnerable profile");
  }

  return response.json();
}

export async function insertSecureProfile(
  username: string,
  passwordHash: string,
  role: string,
  adminKeyHash?: string
) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/perfiles_seguros`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY}`,
      "Prefer": "return=representation",
    },
    body: JSON.stringify({
      username,
      password_hash: passwordHash,
      role,
      admin_key_hash: adminKeyHash || null,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error inserting secure profile");
  }

  return response.json();
}

export async function checkUsernameExists(username: string, table: "vulnerable" | "secure") {
  const tableName = table === "vulnerable" ? "perfiles_vulnerables" : "perfiles_seguros";
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/${tableName}?username=eq.${encodeURIComponent(username)}&select=id`,
    {
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
    }
  );

  const data = await response.json();
  return data && data.length > 0;
}