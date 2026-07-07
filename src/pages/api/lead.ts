import type { APIRoute } from 'astro';

// Runs as a Vercel serverless function (not prerendered).
export const prerender = false;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();

  // Honeypot: bots fill this hidden field. Silently accept, do nothing.
  if (form.get('company_website')) return json({ ok: true });

  const name = String(form.get('name') || '').trim();
  const email = String(form.get('email') || '').trim();
  const company = String(form.get('company') || '').trim();
  const team = String(form.get('team') || '').trim();
  const message = String(form.get('message') || '').trim();

  if (!name || !email) return json({ ok: false, error: 'Name and email are required.' }, 400);

  const SUPABASE_URL = import.meta.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
  const LEAD_NOTIFY_TO = import.meta.env.LEAD_NOTIFY_TO;
  const LEAD_NOTIFY_FROM = import.meta.env.LEAD_NOTIFY_FROM || 'leads@scottsdalesalestraining.com';

  // 1. Store in Supabase (if configured).
  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ name, email, company, team, message }),
      });
      if (!res.ok) console.error('Supabase insert failed', res.status, await res.text());
    } catch (err) {
      console.error('Supabase insert error', err);
    }
  }

  // 2. Notify the client by email (if configured).
  if (RESEND_API_KEY && LEAD_NOTIFY_TO) {
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(RESEND_API_KEY);
      await resend.emails.send({
        from: LEAD_NOTIFY_FROM,
        to: LEAD_NOTIFY_TO,
        subject: `New lead: ${name}${company ? ` (${company})` : ''}`,
        html: `
          <h2>New enquiry from the website</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Company:</strong> ${escapeHtml(company) || '—'}</p>
          <p><strong>Team size:</strong> ${escapeHtml(team) || '—'}</p>
          <p><strong>Wants to improve:</strong><br>${escapeHtml(message) || '—'}</p>
        `,
        replyTo: email,
      });
    } catch (err) {
      console.error('Resend email error', err);
    }
  }

  return json({ ok: true });
};

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string)
  );
}
