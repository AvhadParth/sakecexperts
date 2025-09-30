export function computeReproducibility(project) {
    let score = 0;
    if (project.repoUrl) score += 20;
    if (project.abstractPdfUrl) score += 15;
    if (project.demoUrl) score += 15;
    if (Array.isArray(project.datasetLinks) && project.datasetLinks.length) score += 10;
    if (Array.isArray(project.steps) && project.steps.length >= 3) score += 20;
    if (project.license) score += 10;
    if (Array.isArray(project.bom) && project.bom.length) score += 10;
    const badge = score >= 85 ? "Gold" : score >= 70 ? "Silver" : "Bronze";
    return { score, badge };
  }
  