import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { sendCustomEmail } from "@/lib/email";

// Helper function to create an async delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adminEmail, subject, body: emailBody } = body as {
      adminEmail?: string;
      subject?: string;
      body?: string;
    };

    // 1. Verify admin privilege
    if (!adminEmail) {
      return NextResponse.json({ error: "Admin yetkilendirmesi eksik." }, { status: 401 });
    }

    const adminCheck = await pool.query(
      "SELECT id, role FROM users WHERE email = $1 AND role = 'admin'",
      [adminEmail.toLowerCase().trim()]
    );

    if ((adminCheck.rowCount ?? 0) === 0) {
      return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });
    }

    // 2. Validate input fields
    if (!subject || !subject.trim()) {
      return NextResponse.json({ error: "E-posta konusu gereklidir." }, { status: 400 });
    }
    if (!emailBody || !emailBody.trim()) {
      return NextResponse.json({ error: "E-posta içeriği gereklidir." }, { status: 400 });
    }

    // 3. Fetch marketing-consented users
    const userRes = await pool.query(
      "SELECT name, email FROM users WHERE marketing_consent = TRUE"
    );

    const recipients = userRes.rows;
    if (recipients.length === 0) {
      return NextResponse.json({
        message: "Pazarlama bültenine kayıtlı kullanıcı bulunamadı.",
        sentCount: 0,
      });
    }

    // 4. Send emails sequentially with a 1-second delay (throttled)
    console.log(`[Marketing Mailer] Starting bulk email delivery to ${recipients.length} recipients...`);
    
    // We run the delivery in the background/async so the API response doesn't time out if there are many users,
    // but we can also await it if the count is small or just response immediately and do it in background.
    // However, since it is a small VDS project, we can do it in a background process loop so the admin client
    // receives an instant success signal that the dispatch task was started.
    // Let's execute the sending loop asynchronously in the background.
    deliverEmailsInBackground(recipients, subject, emailBody);

    return NextResponse.json({
      message: `${recipients.length} kullanıcıya toplu e-posta gönderim işlemi arka planda başlatıldı.`,
      recipientCount: recipients.length,
    });
  } catch (err) {
    console.error("[POST /api/admin/send-marketing] Hata:", err);
    return NextResponse.json(
      { error: "Sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}

async function deliverEmailsInBackground(
  recipients: Array<{ name: string; email: string }>,
  subject: string,
  emailBody: string
) {
  let successCount = 0;
  for (let i = 0; i < recipients.length; i++) {
    const r = recipients[i];
    try {
      // Replace placeholder {name} with user's name
      const customizedBody = emailBody.replace(/{name}/g, r.name || "Kullanıcımız");
      
      await sendCustomEmail({
        to: r.email,
        subject: subject,
        html: customizedBody,
      });
      successCount++;
      console.log(`[Marketing Mailer] [${i + 1}/${recipients.length}] Sent to ${r.email}`);
    } catch (err) {
      console.error(`[Marketing Mailer] [${i + 1}/${recipients.length}] Failed for ${r.email}:`, err);
    }
    
    // Throttling: saniyede 1 mail gönderecek şekilde 1 saniye bekle
    if (i < recipients.length - 1) {
      await delay(1000);
    }
  }
  console.log(`[Marketing Mailer] Finished! Successfully sent ${successCount}/${recipients.length} emails.`);
}
