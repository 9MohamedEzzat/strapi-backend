const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || 'ehgeztabibak@outlook.com';
const SITE_ORIGIN = process.env.SITE_ORIGIN || 'https://appointmentapp-rust.vercel.app';

function escapeHtml(value: unknown): string {
  const s = value === undefined || value === null ? '' : String(value);
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function row(label: string, value: unknown): string {
  return `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#6b7280;white-space:nowrap;">${escapeHtml(
    label
  )}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#111827;font-weight:600;">${escapeHtml(
    value || '—'
  )}</td></tr>`;
}

function isSmtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USERNAME && process.env.SMTP_PASSWORD);
}

async function sendViaSmtp(subject: string, rows: [string, unknown][]): Promise<void> {
  const html = `
    <div style="font-family:system-ui,Segoe UI,Tahoma,sans-serif;background:#f9fafb;padding:24px;">
      <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
        <div style="background:#65a30d;padding:18px 24px;color:#fff;font-size:18px;font-weight:700;">
          ${escapeHtml(subject)}
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          ${rows.map(([label, value]) => row(label, value)).join('')}
        </table>
        <div style="padding:14px 24px;color:#9ca3af;font-size:12px;">
          إرسال تلقائي من احجز طبيبك — Ehgez Tabibak
        </div>
      </div>
    </div>
  `;
  await strapi.plugin('email').service('email').send({
    to: NOTIFY_EMAIL,
    subject,
    html,
    text: rows.map(([label, value]) => `${label}: ${value ?? '—'}`).join('\n'),
  });
}

async function sendViaFormSubmit(subject: string, rows: [string, unknown][]): Promise<void> {
  const payload: Record<string, string> = {
    _subject: subject,
    _template: 'table',
    _captcha: 'false',
    _replyto: process.env.EMAIL_REPLY_TO || NOTIFY_EMAIL,
  };
  for (const [label, value] of rows) {
    payload[label] = value === undefined || value === null ? '—' : String(value);
  }

  const response = await fetch(
    `https://formsubmit.co/ajax/${encodeURIComponent(NOTIFY_EMAIL)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Origin: SITE_ORIGIN,
        Referer: `${SITE_ORIGIN}/`,
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      },
      body: JSON.stringify(payload),
    }
  );

  const json = (await response.json().catch(() => ({}))) as {
    success?: string | boolean;
    message?: string;
  };
  if (!response.ok || json.success === 'false' || json.success === false) {
    throw new Error(json.message || `FormSubmit HTTP ${response.status}`);
  }
}

export async function sendNotification(
  subject: string,
  rows: [string, unknown][]
): Promise<boolean> {
  try {
    if (isSmtpConfigured()) {
      await sendViaSmtp(subject, rows);
    } else {
      await sendViaFormSubmit(subject, rows);
    }
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    strapi.log.error(`[mailer] failed to send "${subject}": ${message}`);
    return false;
  }
}
