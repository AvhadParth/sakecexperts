export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getUsers, saveUsers } from "@/lib/store";
import { sendOtpEmail } from "@/lib/mailer";
import { deriveNameFromEmail } from "@/lib/name";

export async function POST(req) {
  console.log("[REGISTER] POST hit");
  const body = await req.json();
  const required = ["email","studentId","department","year","role"];
  for (const k of required) if (!body[k]) {
    return NextResponse.json({ ok:false, error:`Missing ${k}` }, { status:400 });
  }

  const departments = ["IT","CE","CyberSec","AIDS","EXTC","VLSI","ACT"];
  const years = ["1","2","3","4","alumni"];
  const roles = ["explorer","contributor","admin"];
  if (!departments.includes(body.department)) return NextResponse.json({ ok:false, error:"Invalid department" }, { status:400 });
  if (!years.includes(body.year)) return NextResponse.json({ ok:false, error:"Invalid year" }, { status:400 });
  if (!roles.includes(body.role)) return NextResponse.json({ ok:false, error:"Invalid role" }, { status:400 });

  const users = await getUsers();
  let user = users.find(u => u.email === body.email);

  const safeName = (body.name && body.name.trim())
    ? body.name.trim()
    : deriveNameFromEmail(body.email);

  const now = Date.now();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = now + 5 * 60 * 1000; // 5 minutes
  const canSend = (u) => !u?.lastOtpSentAt || (now - u.lastOtpSentAt) > 60 * 1000;

  if (user) {
    if (!canSend(user)) {
      return NextResponse.json({ ok:false, error:"Please wait a minute before requesting another code." }, { status:429 });
    }
    Object.assign(user, {
      ...body,
      name: safeName,
      verified: false,
      otp,
      otpExpiresAt: expiresAt,
      lastOtpSentAt: now,
    });
  } else {
    user = {
      id: String(Date.now()),
      name: safeName,
      email: body.email,
      studentId: body.studentId,
      department: body.department,
      year: body.year,
      role: body.role,
      verified: false,
      otp,
      otpExpiresAt: expiresAt,
      lastOtpSentAt: now,
    };
    users.push(user);
  }

  await saveUsers(users);

  const res = await sendOtpEmail({ toEmail: user.email, toName: user.name, otp });
  return NextResponse.json({ ok: true, message: "OTP sent", dev: res.dev });
}
