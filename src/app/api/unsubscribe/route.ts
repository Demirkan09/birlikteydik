import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email")?.toLowerCase().trim();

  if (!email) {
    return new Response(
      `<html><body style="background:#0B0F1A;color:#F0EDE8;font-family:sans-serif;text-align:center;padding:50px;">E-posta adresi belirtilmedi.</body></html>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  try {
    await pool.query(
      "UPDATE users SET marketing_consent = FALSE WHERE email = $1",
      [email]
    );

    // Render a premium styled HTML page
    const html = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Abonelikten Ayrıl — birlikteydik.com</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0B0F1A;
      color: #F0EDE8;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
    }
    .container {
      max-width: 480px;
      width: 100%;
      box-sizing: border-box;
      padding: 40px 24px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(255, 255, 255, 0.02);
      border-radius: 20px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
    }
    h1 {
      font-family: Georgia, serif;
      font-weight: 300;
      font-size: 26px;
      color: #C9A84C;
      margin-bottom: 20px;
    }
    p {
      color: rgba(240, 237, 232, 0.6);
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    .btn {
      display: inline-block;
      padding: 12px 28px;
      background: #C9A84C;
      color: #0B0F1A;
      text-decoration: none;
      border-radius: 30px;
      font-weight: 600;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      transition: opacity 0.2s;
    }
    .btn:hover {
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Aboneliğiniz İptal Edildi</h1>
    <p>
      E-posta adresiniz (<strong>${email}</strong>) bülten ve duyuru listemizden başarıyla çıkarılmıştır.<br>
      Artık bizden pazarlama veya bilgilendirme mailleri almayacaksınız.
    </p>
    <a href="https://birlikteydik.com" class="btn">Ana Sayfaya Dön</a>
  </div>
</body>
</html>
    `;
    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err) {
    console.error("Unsubscribe error:", err);
    return new Response("Bir sunucu hatası oluştu.", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    let email = "";
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await request.json();
      email = body.email;
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      email = formData.get("email") as string;
    }

    const cleanEmail = email?.toLowerCase().trim();
    if (!cleanEmail) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    await pool.query(
      "UPDATE users SET marketing_consent = FALSE WHERE email = $1",
      [cleanEmail]
    );

    return NextResponse.json({ success: true, message: "Unsubscribed successfully." });
  } catch (err: any) {
    console.error("POST unsubscribe error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
