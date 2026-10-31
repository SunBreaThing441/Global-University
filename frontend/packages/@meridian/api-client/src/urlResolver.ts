export class UrlResolver {
  private static instance: UrlResolver;
  private urlPatterns: Record<string, string> = {};
  private prefix: string = '/';

  private constructor() {
    this.initPatterns();
  }

  public static getInstance(): UrlResolver {
    if (!UrlResolver.instance) {
      UrlResolver.instance = new UrlResolver();
    }
    return UrlResolver.instance;
  }

  private initPatterns(): void {
    if (typeof document === 'undefined') return;

    // Ingest patterns injected by Django's WebpackBundleHook
    const template = document.querySelector('template[data-plugin="kolibri"]');
    if (template) {
      try {
        const domParser = new DOMParser();
        const dom = domParser.parseFromString(template.innerHTML.trim(), 'text/html');
        const text = dom.documentElement.textContent || '{}';
        const data = JSON.parse(text);
        if (data.urls?.urls) {
          this.urlPatterns = data.urls.urls;
          this.prefix = data.urls.prefix || '/';
        }
      } catch (e) {
        // Fallback gracefully
      }
    }
  }

  public resolve(
    actionName: string,
    routeParams?: string | number | Record<string, unknown> | Array<string | number>
  ): string {
    // Standard DRF URL convention fallback: /api/<namespace>/<name>/
    const parts = actionName.split(':');
    const namespace = parts.length > 1 ? parts[1] : 'core';
    const endpointName = parts[parts.length - 1];
    const [baseName, action] = endpointName.split('_');

    const rawId =
      typeof routeParams === 'string' || typeof routeParams === 'number'
        ? String(routeParams)
        : (routeParams as Record<string, string>)?.id;

    if (action === 'detail' && rawId) {
      return `/api/${namespace}/${baseName}/${encodeURIComponent(rawId)}/`;
    }

    if (action === 'list') {
      return `/api/${namespace}/${baseName}/`;
    }

    // Default route structure
    return rawId
      ? `/api/${namespace}/${baseName}/${encodeURIComponent(rawId)}/${action}/`
      : `/api/${namespace}/${baseName}/${action}/`;
  }
}
