"use client";
import { useEffect, useState } from "react";

const DOMAINS = ["IT","CE","CyberSec","AIDS","EXTC","VLSI","ACT"];

export default function UploadPage() {
  const [me, setMe] = useState(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const [f, setF] = useState({
    title:"", summary:"", description:"",
    domains:[], techStack:"", cohortYear:"",
    repoUrl:"", demoUrl:"", abstractPdfUrl:"", datasetLinks:"",
    license:"", steps:""
  });

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(setMe).catch(()=>setMe(null));
  }, []);

  const toggleDomain = (d) => {
    const s = new Set(f.domains);
    if (s.has(d)) s.delete(d); else s.add(d);
    setF({...f, domains: Array.from(s)});
  };

  const computeScore = () => {
    let score = 0;
    if (f.repoUrl) score += 20;
    if (f.abstractPdfUrl) score += 15;
    if (f.demoUrl) score += 15;
    if (f.datasetLinks.trim()) score += 10;
    if (f.steps.trim().split("\n").filter(Boolean).length >= 3) score += 20;
    if (f.license) score += 10;
    return score;
  };

  const submit = async () => {
    setMsg(""); setErr("");
    const body = {
      title: f.title,
      summary: f.summary,
      description: f.description,
      domains: f.domains,
      techStack: f.techStack ? f.techStack.split(",").map(s => s.trim()).filter(Boolean) : [],
      cohortYear: f.cohortYear,
      repoUrl: f.repoUrl, demoUrl: f.demoUrl, abstractPdfUrl: f.abstractPdfUrl,
      datasetLinks: f.datasetLinks ? f.datasetLinks.split(",").map(s => s.trim()).filter(Boolean) : [],
      steps: f.steps ? f.steps.split("\n").map(s => s.trim()).filter(Boolean) : [],
      license: f.license
    };
    const res = await fetch("/api/projects", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!data.ok) { setErr(data.error || "Failed"); return; }
    setMsg("Project submitted! (status: pending).");
    setF({ title:"", summary:"", description:"", domains:[], techStack:"", cohortYear:"", repoUrl:"", demoUrl:"", abstractPdfUrl:"", datasetLinks:"", license:"", steps:"" });
  };

  // --- CLEAN LOGGED-OUT HEADER ---
  if (!me?.ok) {
    return (
      <section className="hero">
        <div className="row-between">
          <div>
            <h2 className="heroTitle" style={{marginBottom:6}}>Upload a Project</h2>
            <p className="heroSub">Please log in to submit your project or idea.</p>
          </div>
          <a className="btnPrimary" href="/login">Login</a>
        </div>
      </section>
    );
  }

  const score = computeScore();
  const badge = score >= 85 ? "Gold" : score >= 70 ? "Silver" : "Bronze";

  return (
    <>
      <section className="hero">
        <div className="row-between">
          <div>
            <h2 className="heroTitle" style={{marginBottom:6}}>Upload a Project</h2>
            <p className="heroSub">Add links and steps to boost your reproducibility badge.</p>
            <div className="row" style={{marginTop:10}}>
              <span className="badge">Score: <b>{score}</b></span>
              <span className={`badge ${badge.toLowerCase()}`}>{badge}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid" style={{marginTop:16}}>
        <div className="mainCard">
          <div className="form">
            <input className="input" placeholder="Project title" value={f.title} onChange={e=>setF({...f, title:e.target.value})} />
            <input className="input" placeholder="Short summary" value={f.summary} onChange={e=>setF({...f, summary:e.target.value})} />
            <textarea className="textarea" rows={6} placeholder="Detailed description" value={f.description} onChange={e=>setF({...f, description:e.target.value})} />
            <div className="muted">Domains (click to toggle):</div>
            <div className="segmented">
              {DOMAINS.map(d => (
                <button type="button" key={d}
                  className={`seg-btn ${f.domains.includes(d) ? "is-active" : ""}`}
                  onClick={()=>toggleDomain(d)}>{d}</button>
              ))}
            </div>
            <input className="input" placeholder="Tech stack (comma separated)" value={f.techStack} onChange={e=>setF({...f, techStack:e.target.value})} />
            <input className="input" placeholder="Cohort year (e.g., 2025)" value={f.cohortYear} onChange={e=>setF({...f, cohortYear:e.target.value})} />
          </div>
        </div>

        <div className="mainCard">
          <div className="form">
            <input className="input" placeholder="GitHub/Repo URL" value={f.repoUrl} onChange={e=>setF({...f, repoUrl:e.target.value})} />
            <input className="input" placeholder="Demo video URL" value={f.demoUrl} onChange={e=>setF({...f, demoUrl:e.target.value})} />
            <input className="input" placeholder="Abstract PDF URL" value={f.abstractPdfUrl} onChange={e=>setF({...f, abstractPdfUrl:e.target.value})} />
            <input className="input" placeholder="Dataset links (comma separated)" value={f.datasetLinks} onChange={e=>setF({...f, datasetLinks:e.target.value})} />
            <input className="input" placeholder="License (e.g., MIT)" value={f.license} onChange={e=>setF({...f, license:e.target.value})} />
            <textarea className="textarea" rows={6} placeholder={"Setup steps (one per line)\n1) Install Node\n2) npm install\n3) npm run dev"} value={f.steps} onChange={e=>setF({...f, steps:e.target.value})} />

            {err && <div className="badge" style={{borderColor:"#aa4444", background:"rgba(170,68,68,0.12)"}}>{err}</div>}
            {msg && <div className="badge" style={{borderColor:"#2a8f4a", background:"rgba(42,143,74,0.12)"}}>{msg}</div>}
            <button className="btnPrimary" onClick={submit}>Submit Project</button>
          </div>
        </div>
      </div>
    </>
  );
}
