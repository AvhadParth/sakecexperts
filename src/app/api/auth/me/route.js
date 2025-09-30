import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUsers } from "@/lib/store";

export async function GET() {
  const sess = getSession();
  if (!sess) return NextResponse.json({ ok:false });
  const users = await getUsers();
  const user = users.find(u => u.id === sess.id);
  if (!user) return NextResponse.json({ ok:false });
  return NextResponse.json({ ok:true, user: { id:user.id, name:user.name, department:user.department, role:user.role } });
}
