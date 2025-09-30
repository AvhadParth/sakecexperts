import nodemailer from "nodemailer";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || "false") === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn("[MAILER] Missing SMTP env. Using DEV fallback (console log).");
    return null;
  }

  console.log("[MAILER] Creating transporter", {
    host, port, secure, user: user ? user.slice(0, 4) + "****" : "none"
  });

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

export async function sendOtpEmail({ toEmail, toName, otp }) {
  const from = process.env.SMTP_FROM || "SakecExperts <no-reply@sakecexperts.local>";
  const appUrl = process.env.APP_URL || "http://localhost:3000";

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial;color:#111">
      <h2>SakecExperts Login</h2>
      <p>Hi ${toName || "there"},</p>
      <p>Your one-time code is:</p>
      <div style="font-size:28px;font-weight:800;letter-spacing:6px;padding:12px 16px;border:1px solid #eee;border-radius:12px;display:inline-block;">
        ${otp}
      </div>
      <p style="color:#555">This code expires in <b>5 minutes</b>.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:16px 0;" />
      <p><a href="${appUrl}" style="color:#0a84ff;text-decoration:none;">Open SakecExperts</a></p>
    </div>
  `;

  const transporter = getTransporter();
  if (!transporter) {
    // Dev fallback (no SMTP configured)
    console.log("\n--- DEV EMAIL (no SMTP configured) ---");
    console.log("To:", toEmail);
    console.log("Name:", toName);
    console.log("OTP:", otp);
    console.log("--------------------------------------\n");
    return { dev: true };
  }

  try {
    await transporter.verify();
    console.log("[MAILER] Transport verified");
  } catch (e) {
    console.error("[MAILER] Transport verify failed:", e?.message || e);
    throw e;
  }

  try {
    const info = await transporter.sendMail({
      from,
      to: toName ? `"${toName}" <${toEmail}>` : toEmail,
      subject: "Your SakecExperts login code",
      html,
    });
    console.log("[MAILER] Sent:", info.messageId);
    return { dev: false, id: info.messageId };
  } catch (e) {
    console.error("[MAILER] sendMail failed:", e?.message || e);
    throw e;
  }
}
