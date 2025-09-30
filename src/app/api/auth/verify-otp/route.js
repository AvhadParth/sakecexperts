import { NextResponse } from "next/server";
import { getUsers, saveUsers } from "@/lib/store";
import { setSession } from "@/lib/auth";

export async function POST(req) {
  const { email, otp } = await req.json();
  if (!email || !otp) return NextResponse.json({ ok:false, error:"Missing email or otp" }, { status:400 });

  const users = await getUsers();
  const user = users.find(u => u.email === email);
  if (!user) return NextResponse.json({ ok:false, error:"User not found" }, { status:404 });

  if (!user.otp || user.otp !== otp) return NextResponse.json({ ok:false, error:"Invalid code" }, { status:401 });
  if (user.otpExpiresAt && Date.now() > user.otpExpiresAt) {
    return NextResponse.json({ ok:false, error:"Code expired. Request a new one." }, { status:401 });
  }

  user.verified = true;
  user.otp = undefined;
  user.otpExpiresAt = undefined;
  await saveUsers(users);

  setSession({ id: user.id, name: user.name, role: user.role, dept: user.department });
  return NextResponse.json({ ok:true, user: { id:user.id, name:user.name, department:user.department, role:user.role } });
}
