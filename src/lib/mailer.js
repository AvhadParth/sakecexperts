// src/lib/mailer.js
import SibApiV3Sdk from "@sendinblue/client";

const client = new SibApiV3Sdk.TransactionalEmailsApi();

// Initialize Brevo API key
if (process.env.BREVO_API_KEY) {
  client.setApiKey(
    SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
  );
}

/**
 * sendOtpEmail - send one-time code via Brevo
 * @param {Object} opts
 * @param {string} opts.toEmail
 * @param {string} [opts.toName]
 * @param {string} opts.otp
 */
export async function sendOtpEmail({ toEmail, toName, otp }) {
  // Fallback if no API key (for local dev)
  if (!process.env.BREVO_API_KEY) {
    console.warn("[BREVO] API key missing — falling back to console log (dev)");
    console.log("DEV OTP →", { toEmail, toName, otp });
    return { dev: true };
  }

  const fromEmail = process.env.SEND_FROM_EMAIL;
  const fromName = process.env.SEND_FROM_NAME || "SakecExperts";
  const appUrl = process.env.APP_URL || "http://localhost:3000";

  // Email body HTML
  const html = `
    <div style="font-family:Inter,system-ui,Arial;color:#0f1720;">
      <h2 style="margin:0 0 .25rem 0">SakecExperts Login</h2>
      <p style="margin:0 0 .5rem 0">Hi ${toName || "there"},</p>
      <p style="margin:0 0 .5rem 0">Your one-time code is:</p>
      <div style="font-size:28px;font-weight:800;letter-spacing:6px;padding:12px 16px;border-radius:12px;background:#f7faf9;border:1px solid #e6e6e6;display:inline-block;">
        ${otp}
      </div>
      <p style="color:#6b7280;margin-top:.6rem">This code expires in <strong>5 minutes</strong>.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:16px 0" />
      <p><a href="${appUrl}" style="color:#0f766e;text-decoration:none">Open SakecExperts</a></p>
    </div>
  `;

  const payload = {
    sender: { email: fromEmail, name: fromName },
    to: [{ email: toEmail, name: toName || "" }],
    subject: "Your SakecExperts login code",
    htmlContent: html,
  };

  try {
    const resp = await client.sendTransacEmail(payload);
    console.log("[BREVO] Sent OTP to", toEmail, "response:", resp);
    return { dev: false, resp };
  } catch (err) {
    console.error("[BREVO] sendTransacEmail error:", err && (err.body || err.message || err));
    throw err;
  }
}
