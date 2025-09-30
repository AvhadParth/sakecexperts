async function fetchProject(slug) {
  const res = await fetch(`${process.env.APP_URL || "http://localhost:3000"}/api/projects/${slug}`, { cache: "no-store" });
  return res.json();
}

export default async function ProjectPage({ params }) {
  const data = await fetchProject(params.slug);
  if (!data.ok) return <div className="mainCard"><b>Not found</b></div>;
  const p = data.item;

  return (
    <div className="mainCard" style={{marginTop:16}}>
      <h2 style={{marginTop:0}}>{p.title}</h2>
      <div className="row">
        <span className={`badge ${p.reproducibilityBadge?.toLowerCase() || "bronze"}`}>{p.reproducibilityBadge || "Bronze"}</span>
        <span className="badge">{p.cohortYear}</span>
        {(p.domains||[]).map(d => <span key={d} className="pill">{d}</span>)}
      </div>

      <div className="space" />
      <p className="muted">{p.summary || "No summary provided."}</p>
      <div className="space" />
      <div dangerouslySetInnerHTML={{ __html: (p.description || "").replace(/\n/g, "<br/>") }} />

      {p.techStack?.length ? (
        <>
          <div className="space" />
          <div><b>Tech</b></div>
          <div className="row" style={{marginTop:6}}>
            {p.techStack.map((t, i) => <span key={i} className="techChip">{t}</span>)}
          </div>
        </>
      ) : null}

      <div className="row" style={{marginTop:14}}>
        {p.repoUrl ? <a className="btnGhost" href={p.repoUrl} target="_blank">Repo</a> : null}
        {p.demoUrl ? <a className="btnGhost" href={p.demoUrl} target="_blank">Demo</a> : null}
        {p.abstractPdfUrl ? <a className="btnGhost" href={p.abstractPdfUrl} target="_blank">Abstract PDF</a> : null}
      </div>
    </div>
  );
}
