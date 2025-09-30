"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [me, setMe] = useState(null);
  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(setMe).catch(() => setMe(null));
  }, []);

  return (
    <nav className="nav">
      <div className="navInner">
        <Link href="/" className="brand">Sakec<span>Experts</span></Link>
        <div className="links">
          <Link className="linkBtn" href="/explore">Explore</Link>
          <Link className="linkBtn" href="/ideas">Ideas</Link>
          <Link className="linkBtn" href="/upload">Upload</Link>
          <Link className="linkBtn" href="/mentors">Mentors</Link>
          {me?.ok ? (
            <>
              <span className="badge">Hi, {me.user.name}</span>
              <form action="/api/auth/logout" method="post">
                <button className="btnGhost" type="submit">Logout</button>
              </form>
            </>
          ) : (
            <Link className="btnPrimary" href="/login">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
