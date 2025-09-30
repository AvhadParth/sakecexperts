export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { sendOtpEmail } from "@/lib/mailer";

export async function GET() {
  try {
    const res = await sendOtpEmail({
      toEmail: "test@example.com", // any address; Mailtrap sandbox will catch it
      toName: "Mailtrap Test",
      otp: "123456",
    });
    return NextResponse.json({ ok: true, res });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}
