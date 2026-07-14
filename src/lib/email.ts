import nodemailer from "nodemailer";

// ─── Mailcow SMTP Transporter ───────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "157.90.173.248",
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: Number(process.env.SMTP_PORT ?? 587) === 465,
  auth: {
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASS ?? "",
  },
  tls: {
    rejectUnauthorized: false, // TLS sertifika doğrulama hatası alınmasını önler
  },
  connectionTimeout: 5000, // 5 saniye
  greetingTimeout: 5000,   // 5 saniye
  socketTimeout: 10000,    // 10 saniye
});

const FROM = process.env.SMTP_FROM || '"birlikteydik.com" <info@birlikteydik.com>';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://birlikteydik.com";

// ─── Ortak HTML Şablonu ────────────────────────────────────────────────────
function baseTemplate(content: string) {
  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>birlikteydik.com</title>
</head>
<body style="margin:0;padding:0;background:#0B0F1A;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0B0F1A;min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="100%" style="max-width:520px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:20px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.06);">
              <p style="margin:0;font-size:11px;letter-spacing:0.4em;text-transform:uppercase;color:#C9A84C;font-weight:500;">birlikteydik.com</p>
              <p style="margin:6px 0 0;font-size:9px;letter-spacing:0.2em;color:rgba(240,237,232,0.3);text-transform:uppercase;">Anılarını Sonsuza Taşı</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:36px 40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 28px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
              <p style="margin:0;font-size:11px;color:rgba(240,237,232,0.2);letter-spacing:0.06em;">
                © ${new Date().getFullYear()} birlikteydik.com — Bu e-postayı siz talep etmezseniz lütfen dikkate almayın.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── 1. Hesap Şifre Sıfırlama Maili ──────────────────────────────────────
// Helper to convert HTML email template to plain text alternative
function stripHtml(html: string): string {
  return html
    .replace(/<style([\s\S]*?)<\/style>/gi, "")
    .replace(/<script([\s\S]*?)<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Helper to generate RFC-compliant list unsubscription headers
const getUnsubscribeHeaders = (toEmail: string) => {
  const encEmail = encodeURIComponent(toEmail);
  return {
    "List-Unsubscribe": `<${SITE_URL}/api/unsubscribe?email=${encEmail}>, <mailto:info@birlikteydik.com?subject=unsubscribe&email=${encEmail}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click"
  };
};

// ─── 1. Hesap Şifre Sıfırlama Maili ──────────────────────────────────────
export async function sendAccountPasswordReset(opts: {
  to: string;
  name: string;
  token: string;
}) {
  const resetUrl = `${SITE_URL}/reset-password?token=${opts.token}&type=account`;
  const html = baseTemplate(`
    <p style="margin:0 0 8px;font-size:13px;letter-spacing:0.06em;text-transform:uppercase;color:rgba(240,237,232,0.4);">Merhaba, <strong style="color:#F0EDE8;">${opts.name}</strong></p>
    <h2 style="margin:0 0 20px;font-size:24px;font-weight:400;color:#F0EDE8;line-height:1.3;">Hesap Şifreni<br/><em style="color:#C9A84C;">Sıfırla</em></h2>
    <p style="margin:0 0 28px;font-size:14px;color:rgba(240,237,232,0.55);line-height:1.7;font-weight:300;">
      Hesabın için şifre sıfırlama talebinde bulundun. Aşağıdaki butona tıklayarak yeni şifreni oluşturabilirsin.<br/>
      <strong style="color:rgba(240,237,232,0.7);">Bu link 1 saat içinde geçersiz olacak.</strong>
    </p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${resetUrl}" style="display:inline-block;padding:15px 36px;background:#C9A84C;color:#0B0F1A;text-decoration:none;border-radius:30px;font-size:13px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;">
            Şifremi Sıfırla
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:24px 0 0;font-size:11px;color:rgba(240,237,232,0.25);text-align:center;">
      Butona tıklayamıyorsan şu linki kopyala:<br/>
      <span style="color:rgba(201,168,76,0.6);word-break:break-all;">${resetUrl}</span>
    </p>
  `);

  await transporter.sendMail({
    from: FROM,
    to: opts.to,
    subject: "Şifre Sıfırlama — birlikteydik.com",
    html,
    text: stripHtml(html),
    headers: getUnsubscribeHeaders(opts.to),
  });
}

// ─── 2. Sayfa Şifre Sıfırlama Maili ──────────────────────────────────────
export async function sendPagePasswordReset(opts: {
  to: string;
  name: string;
  token: string;
  pageSlug: string;
}) {
  const resetUrl = `${SITE_URL}/reset-password?token=${opts.token}&type=page&slug=${opts.pageSlug}`;
  const html = baseTemplate(`
    <p style="margin:0 0 8px;font-size:13px;letter-spacing:0.06em;text-transform:uppercase;color:rgba(240,237,232,0.4);">Merhaba, <strong style="color:#F0EDE8;">${opts.name}</strong></p>
    <h2 style="margin:0 0 20px;font-size:24px;font-weight:400;color:#F0EDE8;line-height:1.3;">Sayfa Şifreni<br/><em style="color:#C9A84C;">Sıfırla</em></h2>
    <p style="margin:0 0 12px;font-size:13px;color:rgba(240,237,232,0.4);letter-spacing:0.06em;">
      Sayfa: <strong style="color:rgba(201,168,76,0.8);">birlikteydik.com/${opts.pageSlug}</strong>
    </p>
    <p style="margin:0 0 28px;font-size:14px;color:rgba(240,237,232,0.55);line-height:1.7;font-weight:300;">
      Bu sayfana koyduğun şifreyi sıfırlamak için aşağıdaki butona tıkla.<br/>
      <strong style="color:rgba(240,237,232,0.7);">Bu link 1 saat içinde geçersiz olacak.</strong>
    </p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${resetUrl}" style="display:inline-block;padding:15px 36px;background:#C9A84C;color:#0B0F1A;text-decoration:none;border-radius:30px;font-size:13px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;">
            Sayfa Şifremi Sıfırla
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:24px 0 0;font-size:11px;color:rgba(240,237,232,0.25);text-align:center;">
      Butona tıklayamıyorsan:<br/>
      <span style="color:rgba(201,168,76,0.6);word-break:break-all;">${resetUrl}</span>
    </p>
  `);

  await transporter.sendMail({
    from: FROM,
    to: opts.to,
    subject: `Sayfa Şifre Sıfırlama (/${opts.pageSlug}) — birlikteydik.com`,
    html,
    text: stripHtml(html),
    headers: getUnsubscribeHeaders(opts.to),
  });
}

// ─── 3. E-posta Onay Kodu Maili ──────────────────────────────────────────
export async function sendVerificationCodeEmail(opts: {
  to: string;
  name: string;
  code: string;
}) {
  const html = baseTemplate(`
    <p style="margin:0 0 8px;font-size:13px;letter-spacing:0.06em;text-transform:uppercase;color:rgba(240,237,232,0.4);">Merhaba, <strong style="color:#F0EDE8;">${opts.name}</strong></p>
    <h2 style="margin:0 0 20px;font-size:24px;font-weight:400;color:#F0EDE8;line-height:1.3;">Hesap Doğrulama<br/><em style="color:#C9A84C;">Kodu</em></h2>
    <p style="margin:0 0 28px;font-size:14px;color:rgba(240,237,232,0.55);line-height:1.7;font-weight:300;">
      birlikteydik.com'a hoş geldin! Hesabını doğrulamak ve kullanmaya başlamak için aşağıdaki 6 haneli onay kodunu kullanabilirsin.
    </p>
    <div style="background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.2);border-radius:12px;padding:16px 24px;margin-bottom:28px;text-align:center;">
      <span style="font-family:'Courier New',Courier,monospace;font-size:32px;font-weight:bold;color:#C9A84C;letter-spacing:0.25em;">${opts.code}</span>
    </div>
    <p style="margin:0;font-size:12px;color:rgba(240,237,232,0.3);text-align:center;">
      Bu kod güvenlik nedeniyle 15 dakika geçerlidir.
    </p>
  `);

  await transporter.sendMail({
    from: FROM,
    to: opts.to,
    subject: "E-posta Onay Kodu — birlikteydik.com",
    html,
    text: stripHtml(html),
    headers: getUnsubscribeHeaders(opts.to),
  });
}

// ─── 4. Özel Toplu/Pazarlama E-posta Gönderimi ─────────────────────────────
export async function sendCustomEmail(opts: {
  to: string;
  subject: string;
  html: string;
}) {
  await transporter.sendMail({
    from: FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: stripHtml(opts.html),
    headers: getUnsubscribeHeaders(opts.to),
  });
}

// ─── 5. Müşteri Portal Davet Maili ──────────────────────────────────────────
export async function sendClientPortalInvite(opts: {
  to: string;
  name: string;
  pageSlug: string;
  portalUrl: string;
  expiresAt: Date;
}) {
  const expiryStr = new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Istanbul",
  }).format(opts.expiresAt);

  const html = baseTemplate(`
    <p style="margin:0 0 8px;font-size:13px;letter-spacing:0.06em;text-transform:uppercase;color:rgba(240,237,232,0.4);">Merhaba, <strong style="color:#F0EDE8;">${opts.name}</strong></p>
    <h2 style="margin:0 0 16px;font-size:24px;font-weight:400;color:#F0EDE8;line-height:1.3;">Anılarınızı<br/><em style="color:#C9A84C;">Yükleyin</em></h2>
    <p style="margin:0 0 24px;font-size:14px;color:rgba(240,237,232,0.55);line-height:1.7;font-weight:300;">
      Siteniz hazır! Şimdi sıra sizin fotoğraflarınızı, yazılarınızı ve şarkı linkinizi yüklemenizde.<br/>
      Aşağıdaki butona tıklayarak özel içerik formunuza ulaşabilirsiniz.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td align="center">
          <a href="${opts.portalUrl}" style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#C9A84C,#e0c068);color:#0B0F1A;text-decoration:none;border-radius:30px;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;box-shadow:0 4px 20px rgba(201,168,76,0.3);">
            📸 &nbsp;Fotoğraflarımı Yükle
          </a>
        </td>
      </tr>
    </table>
    <div style="background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.15);border-radius:12px;padding:14px 20px;margin-bottom:20px;">
      <p style="margin:0;font-size:12px;color:rgba(240,237,232,0.5);line-height:1.6;">
        <strong style="color:rgba(201,168,76,0.8);">⏱ Son kullanma tarihi:</strong><br/>
        Bu link <strong style="color:#F0EDE8;">${expiryStr}</strong> tarihine kadar geçerlidir.
      </p>
    </div>
    <p style="margin:0;font-size:12px;color:rgba(240,237,232,0.3);line-height:1.6;">
      Butona tıklayamıyorsanız şu linki kopyalayın:<br/>
      <span style="color:rgba(201,168,76,0.5);word-break:break-all;font-size:11px;">${opts.portalUrl}</span>
    </p>
  `);

  await transporter.sendMail({
    from: FROM,
    to: opts.to,
    subject: "Fotoğraflarınızı Yükleyin — birlikteydik.com",
    html,
    text: stripHtml(html),
    headers: getUnsubscribeHeaders(opts.to),
  });
}
