import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

function loadEnvFile() {
  if (!fs.existsSync(".env")) return;

  const env = fs.readFileSync(".env", "utf8");
  for (const line of env.split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key]) continue;
    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

loadEnvFile();

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
const email = process.env.SEED_USER_EMAIL || "test.passenger@example.com";
const password = process.env.SEED_USER_PASSWORD || "SourceAsia123!";

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (error && !error.message.toLowerCase().includes("already")) {
  console.error(error.message);
  process.exit(1);
}

console.log(`Seed user ready: ${data.user?.email ?? email}`);
console.log(`Password: ${password}`);
