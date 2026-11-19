# Supabase Edge Functions & Vercel Deployment Guide

## 1. Vercel Environment Variables
In **Vercel Dashboard → Project Settings → Environment Variables**, add:
- `VITE_SUPABASE_URL` = `https://algmrisihtwnmwjxwfqh.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = `sb_publishable_Yt459jQOzlurDJnZ3SCFSw_kZrPEOED`

Redeploy on Vercel after adding those variables. (`vercel.json` is already included for SPA routing.)

---

## 2. Deploy the Client Reminder Edge Function
Run from the project root using the Supabase CLI:

```bash
supabase link --project-ref algmrisihtwnmwjxwfqh
supabase functions deploy send-client-reminders
```

---

## 3. Configure Email (Resend) & WhatsApp Business Secrets
Set these secrets in Supabase (only the channels you want to activate):

```bash
# Transactional Email (Resend)
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
supabase secrets set RESEND_FROM_EMAIL="KIA-Start Up Consult <notifications@kiastartupconsult.com>"

# Optional WhatsApp Business Cloud API
supabase secrets set WHATSAPP_ACCESS_TOKEN=EAAGxxxxxxxxxxxxx
supabase secrets set WHATSAPP_PHONE_NUMBER_ID=123456789012345
```

---

## 4. Optional Daily Scheduled Trigger (Supabase Cron)
In **Supabase → Database → Extensions**, enable `pg_cron` and `pg_net`, then schedule daily reminders at 08:00 GMT:

```sql
SELECT cron.schedule(
  'kia-daily-client-reminders',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url := 'https://algmrisihtwnmwjxwfqh.supabase.co/functions/v1/send-client-reminders',
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body := '{"mode":"scheduled_scan","channels":["email","whatsapp"]}'::jsonb
  );
  $$
);
```
