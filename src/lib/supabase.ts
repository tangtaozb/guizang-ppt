import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side client with service_role key (used in API routes only)
export const supabase = createClient(supabaseUrl, serviceRoleKey);

// Fixed dev user ID (until real auth is implemented)
export const DEV_USER_ID = "00000000-0000-0000-0000-000000000001";
