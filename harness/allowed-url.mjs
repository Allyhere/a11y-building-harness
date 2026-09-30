const LOOPBACK_HOSTS = new Set(["localhost", "::1"]);

export class UrlNotAllowedError extends Error {
  constructor(message) {
    super(message);
    this.name = "UrlNotAllowedError";
    this.code = "ERR_A11Y_URL";
  }
}

function fail(message) {
  throw new UrlNotAllowedError(message);
}

function stripBrackets(host) {
  return host.startsWith("[") && host.endsWith("]")
    ? host.slice(1, -1)
    : host;
}

function ipv4Parts(host) {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (!m) return null;
  const parts = [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])];
  if (parts.some((n) => n > 255)) return null;
  return parts;
}

function v4MappedParts(host) {
  const dotted = /^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/i.exec(host);
  if (dotted) return ipv4Parts(dotted[1]);
  return null;
}

function v4FromHost(host) {
  return v4MappedParts(host) ?? ipv4Parts(host);
}

function isLoopbackHost(hostname) {
  const host = stripBrackets(hostname).toLowerCase();
  if (LOOPBACK_HOSTS.has(host) || host.endsWith(".localhost")) return true;
  const v4 = v4FromHost(host);
  return v4 !== null && v4[0] === 127;
}

function isBlockedEvenRemote(hostname) {
  const host = stripBrackets(hostname).toLowerCase();
  if (host === "metadata.google.internal") return true;
  if (host.startsWith("fe80:")) return true;
  const v4 = v4FromHost(host);
  return v4 !== null && v4[0] === 169 && v4[1] === 254;
}

/**
 * Default: loopback http(s) only.
 * `{ allowRemote: true }`: any http(s) except file:, link-local, and cloud metadata hosts.
 */
export function assertAllowedUrl(urlString, { allowRemote = false } = {}) {
  let parsed;
  try {
    parsed = new URL(urlString);
  } catch {
    fail(`Invalid URL: ${urlString}`);
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    fail(
      `URL scheme not allowed (${parsed.protocol}). Use http(s). Pass --allow-remote for non-loopback hosts.`,
    );
  }

  const host = parsed.hostname;
  if (!host) {
    fail(`URL has no hostname: ${urlString}`);
  }

  if (isBlockedEvenRemote(host)) {
    fail(`Refusing to open link-local or metadata host: ${host}`);
  }

  if (!allowRemote && !isLoopbackHost(host)) {
    fail(
      `Refusing non-loopback URL (${host}). Re-run with --allow-remote for http(s) on other hosts.`,
    );
  }
}
