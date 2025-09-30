import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <h1 className="heroTitle">Projects. Clarity. Mentorship.</h1>
        <p className="heroSub">Explore real projects from IT, CE, CyberSec, AI&DS, EXTC, VLSI, and ACT. Upload yours. Book 1-on-1 mentorship.</p>
        <div className="heroRow">
          <Link className="btnPrimary" href="/explore">Explore Projects</Link>
          <Link className="btnGhost" href="/upload">Upload a Project</Link>
          <Link className="pill" href="/mentors">Find a Mentor</Link>
        </div>
      </section>

      <div className="grid" style={{marginTop:16}}>
        <div className="mainCard">
          <div className="cardTitle">Reproducibility, built-in</div>
          <p className="muted">Bronze, Silver, Gold badges encourage clean READMEs, datasets, and setup steps.</p>
        </div>
        <div className="mainCard">
          <div className="cardTitle">Ideas to kickstart</div>
          <p className="muted">A curated hub of problem statements and scopes to shape your next capstone.</p>
        </div>
        <div className="mainCard">
          <div className="cardTitle">Mentorship that fits</div>
          <p className="muted">Weekly office hours from seniors — book 15-minute slots in a tap.</p>
        </div>
      </div>
    </>
  );
}
