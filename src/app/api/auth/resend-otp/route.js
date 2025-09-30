export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getUsers, saveUsers } from "@/lib/store";
import { sendOtpEmail } from "@/lib/mailer";

export async function POST(req) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ ok:false, error:"Missing email" }, { status:400 });

  const users = await getUsers();
  const user = users.find(u => u.email === email);
  if (!user) return NextResponse.json({ ok:false, error:"User not found" }, { status:404 });

  const now = Date.now();
  if (user.lastOtpSentAt && (now - user.lastOtpSentAt) < 60*1000) {
    return NextResponse.json({ ok:false, error:"Please wait before resending." }, { status:429 });
  }

  const otp = Math.floor(100000 + Math.random()*900000).toString();
  user.otp = otp;
  user.otpExpiresAt = now + 5*60*1000;
  user.lastOtpSentAt = now;
  await saveUsers(users);

  const res = await sendOtpEmail({ toEmail: user.email, toName: user.name, otp });
  return NextResponse.json({ ok:true, message:"OTP resent", dev: res.dev });
}
