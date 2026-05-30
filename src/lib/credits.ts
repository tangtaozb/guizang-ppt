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
 * Atomically deduct credits.
 *
 * Uses a conditional UPDATE — PostgreSQL guarantees row-level locking,
 * so concurrent requests don't double-spend. If credits < amount, the
 * UPDATE matches no rows and we return { ok: false, error: "insufficient" }.
 *
 * Also inserts a credit_records row for accounting.
 */
export async function chargeCredits(opts: {
  userId: string;
  amount: number;
  type: "generate" | "edit" | "purchase";
  description: string;
  projectTitle?: string;
}): Promise<ChargeResult> {
  if (opts.amount <= 0) {
    // No-op for free actions — still want a balance read for the response.
    const remaining = await getCreditBalance(opts.userId);
    return { ok: true, remaining };
  }

  // Atomic decrement: only succeed if current credits >= amount.
  const { data: rows, error: updateErr } = await supabase
    .rpc("decrement_credits_if_enough", {
      p_user_id: opts.userId,
      p_amount: opts.amount,
    });

  // Fallback path if the RPC isn't installed: read-then-update with
  // optimistic concurrency. Race window is small in practice.
  if (updateErr) {
    return chargeCreditsOptimistic(opts);
  }

  // RPC returns the new balance as a single row, or null if insufficient.
  const newCredits = Array.isArray(rows) && rows.length > 0 ? Number(rows[0].new_credits ?? rows[0]) : null;
  if (newCredits === null || newCredits === undefined) {
    const current = await getCreditBalance(opts.userId);
    return { ok: false, remaining: current, error: "insufficient" };
  }

  // Insert credit history (fire-and-forget — accounting only)
  supabase
    .from("credit_records")
    .insert({
      user_id: opts.userId,
      type: opts.type,
      amount: -opts.amount,
      description: opts.description,
      project_title: opts.projectTitle || "",
    })
    .then(() => undefined, () => undefined);

  return { ok: true, remaining: newCredits };
}

/**
 * Fallback: read-then-update charge. Used when the RPC isn't installed.
 * Race window: between SELECT and UPDATE another request could spend.
 * Mitigated by re-reading after UPDATE and rejecting if it went negative.
 */
async function chargeCreditsOptimistic(opts: {
  userId: string;
  amount: number;
  type: "generate" | "edit" | "purchase";
  description: string;
  projectTitle?: string;
}): Promise<ChargeResult> {
  const { data: profile, error: readErr } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", opts.userId)
    .single();

  if (readErr || !profile) return { ok: false, remaining: 0, error: "not_found" };
  const current = Number(profile.credits || 0);
  if (current < opts.amount) return { ok: false, remaining: current, error: "insufficient" };

  const target = current - opts.amount;
  // Conditional UPDATE: only proceed if balance still matches what we read.
  const { data: updated, error: updErr } = await supabase
    .from("profiles")
    .update({ credits: target })
    .eq("id", opts.userId)
    .eq("credits", current) // optimistic concurrency
    .select("credits")
    .single();

  if (updErr || !updated) {
    // Lost the race — caller can retry. Return current balance.
    const fresh = await getCreditBalance(opts.userId);
    return { ok: false, remaining: fresh, error: "insufficient" };
  }

  supabase
    .from("credit_records")
    .insert({
      user_id: opts.userId,
      type: opts.type,
      amount: -opts.amount,
      description: opts.description,
      project_title: opts.projectTitle || "",
    })
    .then(() => undefined, () => undefined);

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
  if (opts.amount <= 0) return;
  const { data: profile } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", opts.userId)
    .single();
  if (!profile) return;
  const newCredits = Number(profile.credits || 0) + opts.amount;
  await supabase.from("profiles").update({ credits: newCredits }).eq("id", opts.userId);
  await supabase.from("credit_records").insert({
    user_id: opts.userId,
    type: "purchase", // counted as refund/credit-back
    amount: opts.amount,
    description: opts.reason,
    project_title: "",
  });
}
