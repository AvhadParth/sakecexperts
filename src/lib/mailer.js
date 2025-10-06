// src/lib/mailer.js
import nodemailer from "nodemailer";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  // If port is 465 -> secure true. Allow override with SMTP_SECURE env.
  const secure = (port === 465) || (String(process.env.SMTP_SECURE || "false") === "true");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn("[MAILER] Missing SMTP env vars. Falling back to DEV (console log).");
    return null;
  }

  console.log("[MAILER] Creating transporter", {
    host,
    port,
    secure,
    user: user ? `${user.slice(0,4)}****@` : "none",
    debugMode: !!process.env.SMTP_DEBUG_INSECURE
  });

  const transportOptions = {
    host,
    port,
    secure,
    auth: { user, pass },
  };

  // optional debugging to bypass certificate validation (ONLY for debugging)
  if (String(process.env.SMTP_DEBUG_INSECURE || "false") === "true") {
    transportOptions.tls = { rejectUnauthorized: false };
    console.warn("[MAILER] WARNING: SMTP_DEBUG_INSECURE is enabled — using tls.rejectUnauthorized=false");
  }

  return nodemailer.createTransport(transportOptions);
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
    // verify gives earlier, clearer error messages (auth/conn issues)
    await transporter.verify();
    console.log("[MAILER] Transport verified");
  } catch (verifyErr) {
    console.error("[MAILER] Transport verify failed:", verifyErr && (verifyErr.message || verifyErr));
    // include the real error so the test route can return it
    throw new Error("Transport verify failed: " + (verifyErr && (verifyErr.message || verifyErr)));
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
  } catch (sendErr) {
    console.error("[MAILER] sendMail failed:", sendErr && (sendErr.message || sendErr));
    throw new Error("sendMail failed: " + (sendErr && (sendErr.message || sendErr)));
  }
}
