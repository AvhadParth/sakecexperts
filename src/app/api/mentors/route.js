import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getMentors, saveMentors, getUsers, getBookings } from "@/lib/store";
import { generateUpcomingSlots } from "@/lib/slots";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get("domain") || "";
  const mentors = await getMentors();
  const bookings = await getBookings();

  // Augment with upcoming slot counts (available)
  const enhanced = mentors.map(m => {
    const upcoming = generateUpcomingSlots(m.officeHours || []);
    const taken = new Set(
      bookings.filter(b => b.mentorId === m.userId && b.status !== "cancelled").map(b => b.slotId)
    );
    const available = upcoming.filter(s => !taken.has(s.slotId));
    return { ...m, availableCount: available.length };
  });

  const filtered = domain ? enhanced.filter(m => (m.expertise || []).includes(domain)) : enhanced;
  // Sort by available slots desc
  filtered.sort((a, b) => (b.availableCount || 0) - (a.availableCount || 0));
  return NextResponse.json({ items: filtered });
}

export async function POST(req) {
  const sess = getSession();
  if (!sess) return NextResponse.json({ ok:false, error:"Not logged in" }, { status:401 });

  const body = await req.json();
  // expected fields: bio, expertise (array of strings), meetingLink (optional), officeHours (array)
  if (!body.bio || !Array.isArray(body.expertise) || !Array.isArray(body.officeHours)) {
    return NextResponse.json({ ok:false, error:"Missing bio, expertise, or officeHours" }, { status:400 });
  }

  const mentors = await getMentors();
  const users = await getUsers();
  const me = users.find(u => u.id === sess.id);

  if (!me) return NextResponse.json({ ok:false, error:"User not found" }, { status:404 });

  let m = mentors.find(x => x.userId === me.id);
  const now = new Date().toISOString();
  if (m) {
    m.bio = body.bio;
    m.expertise = body.expertise;
    m.meetingLink = body.meetingLink || "";
    m.officeHours = body.officeHours;
    m.updatedAt = now;
  } else {
    m = {
      id: String(Date.now()),
      userId: me.id,
      name: me.name,
      department: me.department,
      bio: body.bio,
      expertise: body.expertise,
      meetingLink: body.meetingLink || "",
      officeHours: body.officeHours,
      createdAt: now, updatedAt: now
    };
    mentors.push(m);
  }

  await saveMentors(mentors);
  return NextResponse.json({ ok:true, mentor: m });
}
