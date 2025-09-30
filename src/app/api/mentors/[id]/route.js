import { NextResponse } from "next/server";
import { getMentors, getBookings } from "@/lib/store";
import { generateUpcomingSlots } from "@/lib/slots";

export async function GET(_, { params }) {
  const { id } = params; // mentor.userId
  const mentors = await getMentors();
  const m = mentors.find(x => x.userId === id || x.id === id);
  if (!m) return NextResponse.json({ ok:false, error:"Not found" }, { status:404 });

  const bookings = await getBookings();
  const upcoming = generateUpcomingSlots(m.officeHours || [], 4);
  const taken = new Set(bookings.filter(b => b.mentorId === m.userId && b.status !== "cancelled").map(b => b.slotId));

  const slots = upcoming.map(s => ({ ...s, booked: taken.has(s.slotId) }));
  return NextResponse.json({ ok:true, mentor: m, slots });
}
