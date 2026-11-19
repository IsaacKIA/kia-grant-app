import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

interface ReminderTarget {
  caseId: string;
  clientName: string;
  contactName?: string;
  email?: string;
  whatsappPhone?: string;
  reason: 'missing_documents' | 'expiring_upload_link';
  missingCount?: number;
  uploadUrl?: string;
  expiresAt?: string;
}

function normalizeGhanaPhone(phone?: string): string | null {
  if (!phone) return null;
  const digits = phone.replace(/[^\d+]/g, '');
  if (!digits) return null;
  if (digits.startsWith('+')) return digits.slice(1);
  if (digits.startsWith('0') && digits.length === 10) return `233${digits.slice(1)}`;
  return digits;
}

function buildReminderMessage(item: ReminderTarget): { subject: string; text: string; html: string } {
  const greeting = item.contactName ? `Hello ${item.contactName},` : `Hello ${item.clientName} Team,`;
  const linkLine = item.uploadUrl
    ? `Use your secure upload link here: ${item.uploadUrl}`
    : 'Please contact your KIA-Start Up Consult grant officer for your upload link.';

  if (item.reason === 'expiring_upload_link') {
    const expiryNote = item.expiresAt ? ` (expires ${new Date(item.expiresAt).toLocaleString('en-GB', { timeZone: 'Africa/Accra' })})` : '';
    const subject = `Action Needed: Your KIA Grant Upload Link Expires Soon (${item.clientName})`;
    const text = `${greeting}\n\nYour secure document upload link for ${item.clientName} is expiring soon${expiryNote}. Please upload any remaining documents before it expires.\n\n${linkLine}\n\n— KIA-START UP CONSULT`;
    const html = `<p>${greeting}</p><p>Your secure document upload link for <strong>${item.clientName}</strong> is expiring soon${expiryNote}. Please upload any remaining documents before it expires.</p><p><a href="${item.uploadUrl || '#'}">Open Secure Upload Portal</a></p><p>— KIA-START UP CONSULT</p>`;
    return { subject, text, html };
  }

  const countLabel = item.missingCount ? `${item.missingCount} required document(s)` : 'required documents';
  const subject = `Reminder: ${countLabel} pending for ${item.clientName}`;
  const text = `${greeting}\n\nWe still need ${countLabel} to move your grant application forward for ${item.clientName}.\n\n${linkLine}\n\n— KIA-START UP CONSULT`;
  const html = `<p>${greeting}</p><p>We still need <strong>${countLabel}</strong> to move your grant application forward for <strong>${item.clientName}</strong>.</p><p><a href="${item.uploadUrl || '#'}">Upload Your Documents Now</a></p><p>— KIA-START UP CONSULT</p>`;
  return { subject, text, html };
}

async function sendEmailViaResend(to: string, subject: string, text: string, html: string) {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'KIA-Start Up Consult <notifications@kiastartupconsult.com>';

  if (!apiKey) {
    return { status: 'skipped_no_provider_key', provider: 'resend' };
  }

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ from: fromEmail, to: [to], subject, text, html })
  });

  const data = await resp.json();
  if (!resp.ok) {
    return { status: 'failed', provider: 'resend', error: data?.message || resp.statusText };
  }
  return { status: 'sent', provider: 'resend', messageId: data?.id };
}

async function sendWhatsAppMessage(phone: string, text: string) {
  const token = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
  const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
  const normalized = normalizeGhanaPhone(phone);

  if (!token || !phoneNumberId || !normalized) {
    return { status: 'skipped_no_provider_key', provider: 'whatsapp_cloud' };
  }

  const resp = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: normalized,
      type: 'text',
      text: { body: text }
    })
  });

  const data = await resp.json();
  if (!resp.ok) {
    return { status: 'failed', provider: 'whatsapp_cloud', error: data?.error?.message || resp.statusText };
  }
  return { status: 'sent', provider: 'whatsapp_cloud', messageId: data?.messages?.[0]?.id };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const channels: string[] = Array.isArray(body.channels) ? body.channels : ['email', 'whatsapp'];
    let reminders: ReminderTarget[] = Array.isArray(body.reminders) ? body.reminders : [];

    // Optional scheduled scan mode directly against Supabase tables
    if (body.mode === 'scheduled_scan' && reminders.length === 0) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      if (supabaseUrl && serviceRoleKey) {
        const adminClient = createClient(supabaseUrl, serviceRoleKey);
        const { data: openCases } = await adminClient
          .from('cases')
          .select('id, case_number, status, organizations(legal_name), contacts(full_name, email, phone_whatsapp, phone_primary)')
          .not('status', 'in', '(closed,withdrawn)');

        for (const c of openCases || []) {
          const contact = Array.isArray(c.contacts) ? c.contacts[0] : c.contacts;
          const org = Array.isArray(c.organizations) ? c.organizations[0] : c.organizations;
          if (contact?.email || contact?.phone_whatsapp || contact?.phone_primary) {
            reminders.push({
              caseId: c.id,
              clientName: org?.legal_name || c.case_number,
              contactName: contact?.full_name,
              email: contact?.email || undefined,
              whatsappPhone: contact?.phone_whatsapp || contact?.phone_primary || undefined,
              reason: 'missing_documents'
            });
          }
        }
      }
    }

    const results = [];
    let sentEmailCount = 0;
    let sentWhatsappCount = 0;

    for (const item of reminders) {
      const msg = buildReminderMessage(item);
      const delivery: Record<string, unknown> = {
        caseId: item.caseId,
        clientName: item.clientName,
        reason: item.reason
      };

      if (channels.includes('email') && item.email) {
        const emailRes = await sendEmailViaResend(item.email, msg.subject, msg.text, msg.html);
        if (emailRes.status === 'sent') sentEmailCount++;
        delivery.email = emailRes;
      }

      if (channels.includes('whatsapp') && item.whatsappPhone) {
        const waRes = await sendWhatsAppMessage(item.whatsappPhone, msg.text);
        if (waRes.status === 'sent') sentWhatsappCount++;
        delivery.whatsapp = waRes;
      }

      results.push(delivery);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        processed: reminders.length,
        sentEmailCount,
        sentWhatsappCount,
        results
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ ok: false, error: (error as Error).message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
