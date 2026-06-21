import nodemailer from "nodemailer";

// ─── Brevo (Sendinblue) SMTP Transporter ───────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "smtp-relay.brevo.com",
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASS ?? "",
  },
});

const FROM = `"birlikteydik.com" <${process.env.SMTP_FROM ?? "noreply@birlikteydik.com"}>`;
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
  });
}

// ─── 3. E-posta Doğrulama Maili ──────────────────────────────────────────
export async function sendVerificationCodeEmail(opts: {
  to: string;
  name: string;
  code: string;
}) {
  const html = baseTemplate(`
    <p style="margin:0 0 8px;font-size:13px;letter-spacing:0.06em;text-transform:uppercase;color:rgba(240,237,232,0.4);">Merhaba, <strong style="color:#F0EDE8;">${opts.name}</strong></p>
    <h2 style="margin:0 0 20px;font-size:24px;font-weight:400;color:#F0EDE8;line-height:1.3;">Hesabını<br/><em style="color:#C9A84C;">Doğrula</em></h2>
    <p style="margin:0 0 28px;font-size:14px;color:rgba(240,237,232,0.55);line-height:1.7;font-weight:300;">
      Aramıza katılmak için son adım! Aşağıdaki 6 haneli onay kodunu kullanarak hesabını doğrulayabilirsin.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <div style="display:inline-block;padding:18px 40px;background:rgba(255,255,255,0.03);border:1px solid rgba(201,168,76,0.3);border-radius:12px;font-size:32px;font-weight:700;letter-spacing:0.2em;color:#C9A84C;text-align:center;">
            ${opts.code}
          </div>
        </td>
      </tr>
    </table>
    <p style="margin:24px 0 0;font-size:11px;color:rgba(240,237,232,0.25);text-align:center;">
      Bu kodu kimseyle paylaşmayın. birlikteydik.com ekibi sizden asla şifre veya kod talep etmez.
    </p>
  `);

  await transporter.sendMail({
    from: FROM,
    to: opts.to,
    subject: "E-posta Doğrulama Kodu — birlikteydik.com",
    html,
  });
}

// ─── 4. Özel / Toplu E-posta Gönderimi ──────────────────────────────────────
export async function sendCustomEmail(opts: {
  to: string;
  subject: string;
  html: string;
}) {
  const formattedHtml = baseTemplate(opts.html);

  await transporter.sendMail({
    from: FROM,
    to: opts.to,
    subject: opts.subject,
    html: formattedHtml,
  });
}

