"use client";
import { useEffect, useRef, useState } from "react";

/* === Toast Component === */
function Toast({ toasts }) {
  return (
    <div className="toast-wrap" aria-live="polite" aria-atomic="true">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.kind} ${t.hidden ? "hide" : ""}`}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

export default function LoginPage() {
  const [form, setForm] = useState({
    name:"", email:"", studentId:"", department:"IT", year:"1", role:"explorer"
  });
  const [stage, setStage] = useState("form"); // form | otp
  const [emailSentTo, setEmailSentTo] = useState("");
  const [error, setError] = useState("");

  // toast state
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);
  const showToast = (msg, kind="ok", dur=2800) => {
    const id = ++toastId.current;
    setToasts(ts => [...ts, { id, msg, kind, hidden:false }]);
    setTimeout(() => setToasts(ts => ts.map(t => t.id===id ? { ...t, hidden:true } : t)), dur-200);
    setTimeout(() => setToasts(ts => ts.filter(t => t.id!==id)), dur);
  };

  const onSubmit = async (e) => {
    e.preventDefault(); setError("");
    const res = await fetch("/api/auth/register", {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (!data.ok) { setError(data.error || "Failed"); return; }
    setEmailSentTo(form.email);
    setStage("otp");
    showToast(`OTP sent to ${form.email}`, "ok");
  };

  return (
    <>
      <div className="mainCard">
        <h2 style={{marginTop:0}}>Login / Register</h2>

        {stage === "form" ? (
          <form className="form" onSubmit={onSubmit}>
            <input className="input" placeholder="Full name (as you want it displayed)"
              value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
            <input className="input" placeholder="College email" type="email" required
              value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
            <input className="input" placeholder="Student ID" required
              value={form.studentId} onChange={e=>setForm({...form, studentId:e.target.value})} />
            <div className="row">
              <select className="select" value={form.department} onChange={e=>setForm({...form, department:e.target.value})}>
                <option>IT</option><option>CE</option><option>CyberSec</option>
                <option>AIDS</option><option>EXTC</option><option>VLSI</option><option>ACT</option>
              </select>
              <select className="select" value={form.year} onChange={e=>setForm({...form, year:e.target.value})}>
                <option>1</option><option>2</option><option>3</option><option>4</option><option value="alumni">alumni</option>
              </select>
              <select className="select" value={form.role} onChange={e=>setForm({...form, role:e.target.value})}>
                <option value="explorer">explorer</option>
                <option value="contributor">contributor</option>
              </select>
            </div>
            {error && <div className="badge" style={{borderColor:"#e00", background:"#ffecec"}}>{error}</div>}
            <button className="btnPrimary" type="submit">Send Login Code</button>
          </form>
        ) : (
          <OTPBlock email={emailSentTo} showToast={showToast} />
        )}
      </div>

      <Toast toasts={toasts} />
    </>
  );
}

/* === OTP Step (6 boxes) === */
function OTPBlock({ email, showToast }) {
  const [digits, setDigits] = useState(Array(6).fill(""));
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const inputs = useRef([]);

  // Focus first box on mount
  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const handleChange = (val, i) => {
    if (!/^[0-9]?$/.test(val)) return; // only digits
    const newDigits = [...digits];
    newDigits[i] = val;
    setDigits(newDigits);

    // if user pasted multiple digits, spread them
    if (val.length > 1) {
      const chars = val.slice(0,6).split("");
      const filled = Array(6).fill("");
      for (let j=0; j<chars.length; j++) filled[j] = chars[j];
      setDigits(filled);
      inputs.current[Math.min(chars.length,5)]?.focus();
      return;
    }

    if (val && i < 5) {
      inputs.current[i+1]?.focus();
    }
  };

  const handleKey = (e, i) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i-1]?.focus();
    }
  };

  const otp = digits.join("");

  const verify = async (e) => {
    e.preventDefault(); setError(""); setMsg("");
    if (otp.length < 6) { setError("Enter all 6 digits"); return; }
    const res = await fetch("/api/auth/verify-otp", {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ email, otp })
    });
    const data = await res.json();
    if (!data.ok) { setError(data.error || "Failed"); return; }
    showToast("Verified — welcome!", "ok");
    window.location.href = "/";
  };

  const resend = async () => {
    setError(""); setMsg("");
    const res = await fetch("/api/auth/resend-otp", {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!data.ok) { setError(data.error || "Failed"); return; }
    setMsg("Code resent. Check Gmail.");
    showToast("OTP resent", "ok");
    setCooldown(60);
    const interval = setInterval(() => {
      setCooldown(v => {
        if (v <= 1) { clearInterval(interval); return 0; }
        return v - 1;
      });
    }, 1000);
  };

  return (
    <form className="form" onSubmit={verify}>
      <div className="muted">We emailed a 6-digit code to <b>{email}</b>. It expires in 5 minutes.</div>

      <div className="otp-wrap">
        {digits.map((d,i) => (
          <input
            key={i}
            ref={el => inputs.current[i] = el}
            className="otp-box"
            type="text"
            inputMode="numeric"
            maxLength={6} // allow paste
            value={d}
            onChange={e => handleChange(e.target.value, i)}
            onKeyDown={e => handleKey(e, i)}
          />
        ))}
      </div>

      {error && <div className="badge" style={{borderColor:"#e00", background:"#ffecec"}}>{error}</div>}
      {msg && <div className="badge" style={{borderColor:"#2a8f4a", background:"rgba(42,143,74,0.12)"}}>{msg}</div>}

      <div className="row">
        <button className="btnPrimary" type="submit">Verify & Continue</button>
        <button className="btnGhost" type="button" onClick={resend} disabled={cooldown>0}>
          {cooldown>0 ? `Resend in ${String(cooldown).padStart(2,"0")}s` : "Resend code"}
        </button>
      </div>
    </form>
  );
}
