import { NextResponse } from "next/server";
import { getProjects } from "@/lib/store";

export async function GET(_, { params }) {
  const { slug } = params;
  const items = await getProjects();
  const p = items.find(x => x.slug === slug);
  if (!p) return NextResponse.json({ ok:false, error:"Not found" }, { status:404 });
  return NextResponse.json({ ok:true, item: p });
}
