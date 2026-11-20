# Legacy code (Taxi Service KSA)

Quarantined here, not deleted. Nothing in this folder is built or served
(`_legacy` is excluded in `tsconfig.json`, and it sits outside `src/app`).

- `lib/`, `api/`, `admin-pages/` come from the old Taxi Service KSA project (`bookings` table, Resend, `/api/*` routes).
- Known issues if you ever revive it: public email-relay routes, unauthenticated booking lookup / quote acceptance, a hardcoded IndexNow key, fail-open cron auth. See the audit notes before porting anything.
- Safe to delete once you're sure you don't need any of it.
