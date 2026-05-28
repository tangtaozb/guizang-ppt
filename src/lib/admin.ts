// Admin access control — env-driven email allowlist
// Operator emails are configured in Vercel as ADMIN_EMAILS (comma-separated).
// Used by both the /admin/metrics page and the /api/admin/metrics route.

export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
}
