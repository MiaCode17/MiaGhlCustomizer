/** Resolves a relative /uploads/... path returned by the backend into a full URL. */
export function assetUrl(pathOrUrl: string | undefined | null): string | undefined {
  if (!pathOrUrl) return undefined;
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  const backendOrigin = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/api\/v1\/?$/, '');
  return `${backendOrigin}${pathOrUrl}`;
}
