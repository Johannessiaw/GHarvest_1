/**
 * URL Inspection and Web Content Extraction Service
 * Allows Kofi to inspect web links, read agricultural policy bulletins, and summarize articles safely.
 * Blocks internal/loopback/link-local addresses by literal hostname AND by resolved DNS address,
 * and re-validates every redirect hop instead of trusting fetch()'s automatic redirect handling.
 */

import { lookup } from 'dns/promises';

export interface UrlInspectionResult {
  url: string;
  title: string;
  description: string;
  extractedText: string;
  isAccessible: boolean;
  status: number;
  error?: string;
}

const MAX_REDIRECTS = 3;

export class UrlInspectorService {
  private static isPrivateOrInternalHost(hostname: string): boolean {
    const lower = hostname.toLowerCase();

    if (
      lower === 'localhost' ||
      lower.endsWith('.localhost') ||
      lower.endsWith('.local') ||
      lower.endsWith('.internal') ||
      lower === '0.0.0.0' ||
      lower === '::1' ||
      lower === '::'
    ) {
      return true;
    }

    // IPv4 literal ranges
    const ipv4Match = lower.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipv4Match) {
      const o1 = parseInt(ipv4Match[1], 10);
      const o2 = parseInt(ipv4Match[2], 10);
      if (o1 === 127) return true; // loopback
      if (o1 === 10) return true; // private
      if (o1 === 172 && o2 >= 16 && o2 <= 31) return true; // private
      if (o1 === 192 && o2 === 168) return true; // private
      if (o1 === 169 && o2 === 254) return true; // link-local / cloud metadata
      if (o1 === 0) return true;
    }

    // IPv6 literal ranges: unique local (fc00::/7) and link-local (fe80::/10)
    if (lower.includes(':')) {
      const stripped = lower.replace(/^\[|\]$/g, '');
      if (/^f[cd][0-9a-f]{0,2}:/.test(stripped)) return true; // fc00::/7
      if (/^fe[89ab][0-9a-f]:/.test(stripped)) return true; // fe80::/10
      if (stripped.startsWith('::ffff:127.')) return true; // IPv4-mapped loopback
    }

    return false;
  }

  /** Resolve a hostname and check every returned address against the private-range list. */
  private static async hasOnlySafeResolvedAddresses(hostname: string): Promise<boolean> {
    // Already a literal IP — nothing to resolve.
    if (this.isPrivateOrInternalHost(hostname)) return false;
    if (/^[\d.]+$/.test(hostname) || hostname.includes(':')) return true;

    try {
      const records = await lookup(hostname, { all: true });
      return records.every(r => !this.isPrivateOrInternalHost(r.address));
    } catch {
      // DNS failure — treat as inaccessible rather than silently allowing it through.
      return false;
    }
  }

  private static validateUrlOrError(targetUrl: string): { parsed?: URL; error?: UrlInspectionResult } {
    let parsed: URL;
    try {
      parsed = new URL(targetUrl);
    } catch {
      return {
        error: {
          url: targetUrl,
          title: 'Invalid URL Format',
          description: 'The provided URL could not be parsed.',
          extractedText: '',
          isAccessible: false,
          status: 400,
          error: 'Malformed URL.',
        },
      };
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return {
        error: {
          url: targetUrl,
          title: 'Unsupported Protocol',
          description: 'Only HTTP and HTTPS URLs are supported.',
          extractedText: '',
          isAccessible: false,
          status: 400,
          error: `Protocol ${parsed.protocol} is not permitted.`,
        },
      };
    }

    if (this.isPrivateOrInternalHost(parsed.hostname)) {
      return {
        error: {
          url: targetUrl,
          title: 'Access Restricted',
          description: 'Access to internal, loopback, or private network addresses is prohibited for security.',
          extractedText: '',
          isAccessible: false,
          status: 403,
          error: 'SSRF protection blocked access to private/internal host.',
        },
      };
    }

    return { parsed };
  }

  public static async inspectUrl(targetUrl: string): Promise<UrlInspectionResult> {
    try {
      let currentUrl = targetUrl;

      for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
        const { parsed, error } = this.validateUrlOrError(currentUrl);
        if (error) return error;

        const dnsSafe = await this.hasOnlySafeResolvedAddresses(parsed!.hostname);
        if (!dnsSafe) {
          return {
            url: currentUrl,
            title: 'Access Restricted',
            description: 'The hostname resolves to an internal or private network address.',
            extractedText: '',
            isAccessible: false,
            status: 403,
            error: 'SSRF protection blocked a DNS-resolved private/internal address.',
          };
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(currentUrl, {
          signal: controller.signal,
          redirect: 'manual', // never let fetch auto-follow into an unvalidated host
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; GHarvest-Kofi-Inspector/1.0)',
            Accept: 'text/html,application/xhtml+xml,text/plain',
          },
        });
        clearTimeout(timeoutId);

        if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
          currentUrl = new URL(res.headers.get('location')!, currentUrl).toString();
          continue; // loop back and re-validate the redirect target
        }

        const html = await res.text();

        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim().slice(0, 150) : parsed!.hostname;

        const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
        const description = descMatch ? descMatch[1].trim().slice(0, 300) : '';

        const text = html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        return {
          url: currentUrl,
          title,
          description,
          extractedText: text.slice(0, 2500),
          isAccessible: true,
          status: res.status,
        };
      }

      return {
        url: targetUrl,
        title: 'Too Many Redirects',
        description: `Exceeded ${MAX_REDIRECTS} redirects while resolving this URL.`,
        extractedText: '',
        isAccessible: false,
        status: 508,
        error: 'redirect_loop_or_too_many_redirects',
      };
    } catch (err: any) {
      return {
        url: targetUrl,
        title: 'Unable to connect to website',
        description: err.message || 'Connection timed out or host unreachable.',
        extractedText: `Could not retrieve live contents for ${targetUrl}. The external server did not respond or blocked access.`,
        isAccessible: false,
        status: 504,
        error: err.message,
      };
    }
  }
}
