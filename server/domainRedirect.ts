export const LEGACY_MANUS_HOST = "vetcarepath-tzppwpga.manus.space";
export const PRIMARY_MANUS_ORIGIN = "https://transition-pathfinder.manus.space";

function normalizeHost(host: string | undefined) {
  return host
    ?.split(",")[0]
    ?.trim()
    .toLowerCase()
    .replace(/:\d+$/, "")
    .replace(/\.$/, "");
}

export function getLegacyDomainRedirectUrl(input: {
  host: string | undefined;
  method: string;
  originalUrl: string;
}) {
  const isBrowserNavigation = input.method === "GET" || input.method === "HEAD";
  const isLegacyDomain = normalizeHost(input.host) === LEGACY_MANUS_HOST;
  const isApiRequest = input.originalUrl.startsWith("/api/");

  if (!isBrowserNavigation || !isLegacyDomain || isApiRequest) {
    return null;
  }

  const pathAndQuery = input.originalUrl.startsWith("/")
    ? input.originalUrl
    : `/${input.originalUrl}`;

  return `${PRIMARY_MANUS_ORIGIN}${pathAndQuery}`;
}
