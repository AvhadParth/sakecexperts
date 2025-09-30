"use client";
import { useEffect, useState } from "react";

/* Pretty date like: Sun, 6 Oct, 5:15 PM */
function fmt(dtISO) {
  const d = new Date(dtISO);
  return d.toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function MentorDetail({ params }) {
  const { id } = params;
  const [data, setData] = useState(null);
  const [me, setMe] = useState(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // Load session + mentor detail
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(setMe)
      .catch(() => setMe(null));

    const load = async () => {
      try {
        const res = await fetch(`/api/mentors/${encodeURIComponent(id)}`);
        const d = await res.json();
        if (!d.ok) {
          setErr(d.error || "Mentor not found.");
          setData(null);
        } else {
          setErr("");
          setData(d);
        }
      } catch (e) {
        setErr("Failed to load mentor.");
        setData(null);
      }
    };
    load();
  }, [id]);

  // Book one slot
  const book = async (slot) => {
    setMsg("");
    setErr("");
    try {
      const res = await fetch(`/api/mentors/${encodeURIComponent(id)}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: slot.slotId,
          startISO: slot.startISO,
          endISO: slot.endISO,
        }),
      });
      const d = await res.json();
      if (!d.ok) {
        setErr(d.error || "Booking failed");
        return;
      }
      setMsg("Booked! Check your email/console (dev).");

      // reload slots after booking
      const res2 = await fetch(`/api/mentors/${encodeURIComponent(id)}`);
      const d2 = await res2.json();
      if (d2.ok) setData(d2);
    } catch {
      setErr("Booking failed");
    }
  };

  if (err && !data)
    return (
      <div className="mainCard" style={{ marginTop: 16 }}>
        {err}
      </div>
    );

  if (!data)
    return (
      <div className="mainCard" style={{ marginTop: 16 }}>
        Loading…
      </div>
    );

  const m = data.mentor;
  const slots = (data.slots || []).slice(0, 40); // show first 40 upcoming

  return (
    <div className="mainCard" style={{ marginTop: 16 }}>
      <h2 style={{ marginTop: 0 }}>Mentor: {m.name}</h2>
      <div className="projectDesc">{m.bio || "No bio."}</div>

      <div className="row" style={{ gap: 6, marginTop: 8 }}>
        {(m.expertise || []).map((x) => (
          <span key={x} className="techChip">
            {x}
          </span>
        ))}
      </div>

      <div className="row" style={{ gap: 8, marginTop: 8 }}>
        <span className="badge">{m.department}</span>
        {m.meetingLink ? (
          <a className="btnGhost" href={m.meetingLink} target="_blank">
            Meeting Link
          </a>
        ) : null}
      </div>

      <div className="space" />
      <h3 style={{ margin: "10px 0" }}>Upcoming Slots</h3>

      <div className="grid">
        {slots.length === 0 && (
          <div className="card">No upcoming slots. Check back later.</div>
        )}

        {slots.map((s) => (
          <div
            key={s.slotId}
            className="card"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              justifyContent: "space-between",
            }}
          >
            <div>
              <div>
                <b>{fmt(s.startISO)}</b>
              </div>
              <div className="muted">
                →{" "}
                {new Date(s.endISO).toLocaleTimeString(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </div>
            </div>

            {s.booked ? (
              <span className="badge">Booked</span>
            ) : me?.ok ? (
              <button
                className="btnPrimary"
                style={{ width: "100%" }}
                onClick={() => book(s)}
              >
                Book
              </button>
            ) : (
              <a className="btnGhost" style={{ width: "100%" }} href="/login">
                Login to Book
              </a>
            )}
          </div>
        ))}
      </div>

      {err && (
        <div
          className="badge"
          style={{
            borderColor: "#aa4444",
            background: "rgba(170,68,68,0.12)",
            marginTop: 10,
          }}
        >
          {err}
        </div>
      )}
      {msg && (
        <div
          className="badge"
          style={{
            borderColor: "#2a8f4a",
            background: "rgba(42,143,74,0.12)",
            marginTop: 10,
          }}
        >
          {msg}
        </div>
      )}
    </div>
  );
}
