"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const DOMAINS = ["IT","CE","CyberSec","AIDS","EXTC","VLSI","ACT"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function MentorsPage() {
  const [me, setMe] = useState(null);
  const [items, setItems] = useState([]);
  const [domain, setDomain] = useState("");   // "" = All
  const [openForm, setOpenForm] = useState(false);

  // mentor form
  const [bio, setBio] = useState("");
  const [expertise, setExpertise] = useState([]);
  const [meetingLink, setMeetingLink] = useState("");
  const [hours, setHours] = useState([]); // {day,start,end,slotMinutes}

  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(setMe).catch(()=>setMe(null));
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = async () => {
    const params = new URLSearchParams();
    if (domain) params.set("domain", domain);
    const res = await fetch(`/api/mentors?${params.toString()}`);
    const data = await res.json();
    setItems((data.items || []).map(m => ({
      ...m,
      // guarantee a clean id for links
      userId: String(m.userId || m.id || "").trim(),
    })));
  };

  const chooseDomain = (d) => {
    setDomain(d);
    setTimeout(load, 0);
  };

  const toggleExpertise = (d) => {
    const s = new Set(expertise);
    if (s.has(d)) s.delete(d); else s.add(d);
    setExpertise(Array.from(s));
  };

  const addHour = () => setHours(h => [...h, { day: 5, start:"17:00", end:"18:00", slotMinutes:15 }]);
  const updateHour = (i, key, val) => setHours(h => h.map((x,idx) => idx===i ? { ...x, [key]: val } : x));
  const removeHour = (i) => setHours(h => h.filter((_,idx)=>idx!==i));

  const saveMentor = async () => {
    setErr(""); setMsg("");
    if (!bio.trim() || expertise.length===0 || hours.length===0) {
      setErr("Please add bio, at least one expertise and one office hour.");
      return;
    }
    const res = await fetch("/api/mentors", {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ bio, expertise, meetingLink, officeHours: hours })
    });
    const data = await res.json();
    if (!data.ok) { setErr(data.error || "Failed"); return; }
    setMsg("Mentor profile saved!");
    setOpenForm(false);
    load();
  };

  return (
    <>
      <section className="hero">
        <h2 className="heroTitle" style={{marginBottom:6}}>Mentors</h2>
        <p className="heroSub">Book a 15-minute slot with seniors. Or become a mentor and publish weekly office hours.</p>

        {/* simple filter (keep your segmented version if you prefer) */}
        <div className="heroRow" style={{marginTop:16}}>
          <select className="select" value={domain} onChange={e=>chooseDomain(e.target.value)}>
            <option value="">All domains</option>
            {DOMAINS.map(d => <option key={d}>{d}</option>)}
          </select>
          {me?.ok ? (
            <button className="btnGhost" onClick={()=>setOpenForm(v=>!v)}>
              {openForm ? "Close Mentor Form" : "Become a Mentor"}
            </button>
          ) : (
            <Link className="btnPrimary" href="/login">Login</Link>
          )}
        </div>
      </section>

      {openForm && me?.ok && (
        <div className="mainCard" style={{marginTop:16}}>
          <h3 style={{marginTop:0}}>Your Mentor Profile</h3>
          <div className="form">
            <textarea className="textarea" rows={4} placeholder="Short bio (who you are, what you can help with)"
              value={bio} onChange={e=>setBio(e.target.value)} />
            <div className="muted">Expertise (toggle):</div>
            <div className="row">
              {DOMAINS.map(d => (
                <button type="button" key={d}
                  className={`pill ${expertise.includes(d) ? "" : ""}`}
                  onClick={()=>toggleExpertise(d)}>
                  {expertise.includes(d) ? `✓ ${d}` : d}
                </button>
              ))}
            </div>
            <input className="input" placeholder="Meeting link (Google Meet/Zoom) — optional"
              value={meetingLink} onChange={e=>setMeetingLink(e.target.value)} />

            <div className="row" style={{justifyContent:"space-between"}}>
              <div><b>Office Hours (weekly)</b></div>
              <button className="btnGhost" type="button" onClick={addHour}>+ Add</button>
            </div>

            {hours.length === 0 && <div className="muted">No hours yet. Click “+ Add”.</div>}
            {hours.map((h, i) => (
              <div key={i} className="row" style={{gap:8}}>
                <select className="select" value={h.day} onChange={e=>updateHour(i,"day", Number(e.target.value))}>
                  {DAYS.map((d, idx) => <option key={d} value={idx}>{d}</option>)}
                </select>
                <input className="input" style={{maxWidth:140}} type="time" value={h.start} onChange={e=>updateHour(i,"start", e.target.value)} />
                <input className="input" style={{maxWidth:140}} type="time" value={h.end} onChange={e=>updateHour(i,"end", e.target.value)} />
                <input className="input" style={{maxWidth:140}} type="number" min="10" step="5" value={h.slotMinutes}
                  onChange={e=>updateHour(i,"slotMinutes", Number(e.target.value))} />
                <button className="btnGhost" type="button" onClick={()=>removeHour(i)}>Remove</button>
              </div>
            ))}

            {err && <div className="badge" style={{borderColor:"#aa4444", background:"rgba(170,68,68,0.12)"}}>{err}</div>}
            {msg && <div className="badge" style={{borderColor:"#2a8f4a", background:"rgba(42,143,74,0.12)"}}>{msg}</div>}
            <button className="btnPrimary" onClick={saveMentor}>Save Mentor Profile</button>
          </div>
        </div>
      )}

      <div className="grid" style={{marginTop:16}}>
        {items.length === 0 && <div className="card">No mentors yet. Be the first!</div>}
        {items.map(m => <MentorCard key={m.userId || m.id} m={m} />)}
      </div>
    </>
  );
}

function MentorCard({ m }) {
  const router = useRouter();
  const viewId = (m?.userId || "").trim();

  const go = () => {
    if (!viewId) return;
    const href = `/mentors/${encodeURIComponent(viewId)}`;
    router.push(href);
  };

  return (
    <div className="projectCard">
      <div className="row" style={{justifyContent:"space-between"}}>
        <div className="projectTitle">{m.name}</div>
        <span className="badge">{m.department}</span>
      </div>
      <div className="projectDesc">{m.bio || "No bio."}</div>
      <div className="row" style={{gap:6}}>
        {(m.expertise||[]).map(x => <span key={x} className="techChip">{x}</span>)}
      </div>
      <div className="row" style={{justifyContent:"space-between", marginTop:8}}>
        <span className="badge">{m.availableCount || 0} upcoming slots</span>
        <button type="button" className="btnPrimary" onClick={go}>
          View &amp; Book
        </button>
      </div>
    </div>
  );
}
