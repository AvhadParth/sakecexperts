"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const DOMAINS = ["IT","CE","CyberSec","AIDS","EXTC","VLSI","ACT"];

export default function ExplorePage() {
  const [q, setQ] = useState("");
  const [domain, setDomain] = useState("");
  const [year, setYear] = useState("");
  const [items, setItems] = useState([]);

  const load = async () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (domain) params.set("domain", domain);
    if (year) params.set("cohortYear", year);
    const res = await fetch(`/api/projects?${params.toString()}`);
    const data = await res.json();
    setItems(data.items || []);
  };

  useEffect(() => { load(); }, []); // initial

  return (
    <>
      <section className="hero" style={{paddingBottom:16}}>
        <h2 className="heroTitle" style={{fontSize:28, marginBottom:6}}>Explore Projects</h2>
        <p className="heroSub">Search by title or tech. Filter by domain and cohort year.</p>
        <div className="heroRow">
          <input className="input" style={{minWidth:260}} placeholder="Search by title, tech, tags..." value={q} onChange={e=>setQ(e.target.value)} />
          <select className="select" value={domain} onChange={e=>setDomain(e.target.value)}>
            <option value="">All domains</option>
            {DOMAINS.map(d => <option key={d}>{d}</option>)}
          </select>
          <input className="input" placeholder="Year (e.g., 2025)" value={year} onChange={e=>setYear(e.target.value)} />
          <button className="btnPrimary" onClick={load}>Apply</button>
        </div>
      </section>

      <div className="grid" style={{marginTop:16}}>
        {items.length === 0 && <div className="card">No projects yet. Try clearing filters or upload one.</div>}
        {items.map(p => <ProjectCard key={p.slug} p={p} />)}
      </div>
    </>
  );
}

function ProjectCard({ p }) {
  const badge = (p.reproducibilityBadge || "Bronze").toLowerCase();

  return (
    <article className="projectCard">
      {/* Top row: left content vs right meta */}
      <div className="row-between">
        <div style={{minWidth:0}}>
          <h3 className="projectTitle" style={{margin:0}}>
            <Link href={`/project/${p.slug}`}>{p.title}</Link>
          </h3>

          {/* Domain chips under the title */}
          {(p.domains?.length ? (
            <div className="chipsRow">
              {p.domains.map(d => <span key={d} className="pill">{d}</span>)}
            </div>
          ) : null)}
        </div>

        {/* Right-side meta never overlaps (fixed width, stacked) */}
        <div className="metaRight">
          <span className={`badge ${badge}`}>{p.reproducibilityBadge || "Bronze"}</span>
          <span className="badge">{p.cohortYear || "Year N/A"}</span>
        </div>
      </div>

      {/* Summary */}
      <p className="projectDesc">
        {p.summary || (p.description ? p.description.slice(0,140) : "No summary")}
        {(p.summary || p.description)?.length > 140 ? "…" : ""}
      </p>

      {/* Tech chips */}
      {p.techStack?.length ? (
        <div className="chipsRow" style={{marginTop:6}}>
          {p.techStack.slice(0,6).map((t, i) => <span key={i} className="techChip">{t}</span>)}
        </div>
      ) : null}
    </article>
  );
}
