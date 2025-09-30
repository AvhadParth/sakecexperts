export function deriveNameFromEmail(email = "") {
    const local = email.split("@")[0] || "";
    if (!local) return "Student";
    const pretty = local
      .replace(/[._-]+/g, " ")
      .replace(/(\d+)/g, " ")
      .trim()
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return pretty || "Student";
  }
  