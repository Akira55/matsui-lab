// Prefix an absolute internal path with the deploy `base` (e.g. "/matsui-lab/").
//
// Astro does NOT auto-prefix href/src attributes — only its asset bundling does.
// Use this for every `<a href>` and `<img src>` that starts with "/".
//
// `import.meta.env.BASE_URL` is "/" when no base is set, or "/<repo>/" when set.

export function u(path: string): string {
  const base = import.meta.env.BASE_URL; // always has trailing slash
  const clean = path.startsWith('/') ? path.slice(1) : path;
  return base + clean;
}
