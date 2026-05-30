// Server-side credit logic — atomic check + deduct.
// All paid actions MUST go through here, not the frontend.
//
// Costs (must match what i18n / pricing page advertises):
//   generate = 25 credits ($0.025: AI $0.015 + image $0.010)
//   edit     = 18 credits ($0.018: full HTML round-trip)
//   chat     = 0 credits (Agent routing is ~$0.0004, absorbed)

import { supabase } from "@/lib/supabase";

export const CREDIT_COST = {
  generate: 25,
  edit: 18,
  chat: 0,
} as const;

export type CreditActionType = "generate" | "edit" | "chat";

export interface ChargeResult {
  ok: boolean;
  remaining: number;
  error?: "insufficient" | "not_found" | "db_error";
}

/**
 * Read current credit balance. Returns 0 if user not found.
 */
export async function getCreditBalance(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", userId)
    .single();
  if (error || !data) return 0;
  return Number(data.credits || 0);
}

/**
 * Atomically deduct credits via optimistic-concurrency conditional UPDATE.
 *
 * The `.eq("credits", current)` clause ensures the row only updates if the
 * balance still matches what we read — PostgreSQL row locking prevents two
 * concurrent requests from both succeeding (double-spend). On a lost race the
 * UPDATE matches no row and we report insufficient so the caller can reject.
 */
export async function chargeCredits(opts: {
  userId: string;
  amount: number;
  type: "generate" | "edit" | "purchase";
  description: string;
  projectTitle?: string;
}): Promise<ChargeResult> {
  const userId = opts.userId;
  const amount = opts.amount;
  const type = opts.type;
  const description = opts.description;
  const projectTitle = opts.projectTitle || "";

  // Free actions: no charge, just report balance.
  if (amount <= 0) {
    const remaining = await getCreditBalance(userId);
    return { ok: true, remaining };
  }

  // 1. Read current balance.
  const { data: profile, error: readErr } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", userId)
    .single();
  if (readErr || !profile) {
    return { ok: false, remaining: 0, error: "not_found" };
  }

  const current = Number(profile.credits || 0);
  if (current < amount) {
    return { ok: false, remaining: current, error: "insufficient" };
  }

  // 2. Conditional UPDATE — only succeeds if balance is unchanged.
  const { data: updated, error: updErr } = await supabase
    .from("profiles")
    .update({ credits: current - amount })
    .eq("id", userId)
    .eq("credits", current)
    .select("credits")
    .single();

  if (updErr || !updated) {
    // Lost the race or row vanished — re-read and reject.
    const fresh = await getCreditBalance(userId);
    return { ok: false, remaining: fresh, error: "insufficient" };
  }

  // 3. Record the deduction for the user's credit history.
  await supabase.from("credit_records").insert({
    user_id: userId,
    type,
    amount: -amount,
    description,
    project_title: projectTitle,
  });

  return { ok: true, remaining: Number(updated.credits || 0) };
}

/**
 * Refund credits (server-side). Used when a generation fails after charge.
 */
export async function refundCredits(opts: {
  userId: string;
  amount: number;
  reason: string;
}): Promise<void> {
  const userId = opts.userId;
  const amount = opts.amount;
  const reason = opts.reason;
  if (amount <= 0) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", userId)
    .single();
  if (!profile) return;

  const newCredits = Number(profile.credits || 0) + amount;
  await supabase.from("profiles").update({ credits: newCredits }).eq("id", userId);
  await supabase.from("credit_records").insert({
    user_id: userId,
    type: "purchase", // counted as refund / credit-back
    amount: amount,
    description: reason,
    project_title: "",
  });
}
