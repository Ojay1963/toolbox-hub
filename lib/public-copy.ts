export function normalizePublicCopy(text: string): string {
  return text
    .replace(/browser-first workflows?/gi, "simple workflows")
    .replace(/browser-side workflows?/gi, "simple workflows")
    .replace(/browser-based workflows?/gi, "simple workflows")
    .replace(/browser-only workflows?/gi, "simple workflows")
    .replace(/browser-first/gi, "online")
    .replace(/browser-side/gi, "online")
    .replace(/browser-based/gi, "online")
    .replace(/browser-only/gi, "online")
    .replace(/server-assisted workflows?/gi, "guided workflows")
    .replace(/backend-assisted workflows?/gi, "guided workflows")
    .replace(/server-assisted/gi, "guided")
    .replace(/backend-assisted/gi, "guided")
    .replace(/server-side/gi, "guided")
    .replace(/backend route/gi, "tool")
    .replace(/server route/gi, "tool")
    .replace(/configured service/gi, "feature")
    .replace(/current deployment/gi, "site")
    .replace(/deployment requirements/gi, "availability")
    .replace(/current implementation/gi, "tool")
    .replace(/intended implementation/gi, "tool")
    .replace(/planned implementation/gi, "tool")
    .replace(/future client component/gi, "tool")
    .replace(/future local implementation/gi, "tool")
    .replace(/future implementation/gi, "tool")
    .replace(/placeholder-only/gi, "preview")
    .replace(/reduced-scope/gi, "limited")
    .replace(/browser-visible/gi, "available")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function normalizePublicList(items: string[]): string[] {
  return items.map((item) => normalizePublicCopy(item));
}
