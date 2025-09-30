import { NextResponse } from "next/server";
import { getProjects, saveProjects } from "@/lib/store";
import { getSession } from "@/lib/auth";
import { computeReproducibility } from "@/lib/repro";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").toLowerCase();
  const domain = searchParams.get("domain") || "";
  const year = searchParams.get("cohortYear") || "";

  let items = await getProjects();
  items = items.filter(p => p.status === "approved" || p.status === "pending"); // show pending in MVP

  if (q) items = items.filter(p =>
    (p.title||"").toLowerCase().includes(q) ||
    (p.summary||"").toLowerCase().includes(q) ||
    (p.techStack||[]).join(" ").toLowerCase().includes(q)
  );
  if (domain) items = items.filter(p => (p.domains||[]).includes(domain));
  if (year) items = items.filter(p => String(p.cohortYear||"") === String(year));

  items.sort((a,b) => (b.featured?1:0) - (a.featured?1:0) || new Date(b.createdAt) - new Date(a.createdAt));
  return NextResponse.json({ items });
}

export async function POST(req) {
  const sess = getSession();
  if (!sess) return NextResponse.json({ ok:false, error:"Not logged in" }, { status:401 });

  const body = await req.json();
  const required = ["title","domains","description"];
  for (const k of required) if (!body[k] || (Array.isArray(body[k]) && !body[k].length)) {
    return NextResponse.json({ ok:false, error:`Missing ${k}` }, { status:400 });
  }

  const now = new Date().toISOString();
  const slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"") + "-" + Date.now();

  const { score, badge } = computeReproducibility(body);
  const project = {
    id: String(Date.now()),
    slug,
    title: body.title,
    summary: body.summary || "",
    description: body.description || "",
    domains: body.domains || [],
    techStack: body.techStack || [],
    skills: body.skills || [],
    difficulty: body.difficulty || "Intermediate",
    cohortYear: Number(body.cohortYear) || new Date().getFullYear(),
    teamMembers: body.teamMembers || [],
    guide: body.guide || null,
    repoUrl: body.repoUrl || "",
    demoUrl: body.demoUrl || "",
    abstractPdfUrl: body.abstractPdfUrl || "",
    posterUrl: body.posterUrl || "",
    datasetLinks: body.datasetLinks || [],
    bom: body.bom || [],
    steps: body.steps || [],
    license: body.license || "",
    reproducibilityScore: score,
    reproducibilityBadge: badge,
    ethicsChecklist: body.ethicsChecklist || { privacy:false, licenseOK:false, dataProvenance:false },
    tags: body.tags || [],
    status: "pending",
    views: 0,
    bookmarksCount: 0,
    upvotes: 0,
    featured: false,
    createdBy: sess.id,
    createdAt: now, updatedAt: now
  };

  const projects = await getProjects();
  projects.push(project);
  await saveProjects(projects);

  return NextResponse.json({ ok:true, project });
}
