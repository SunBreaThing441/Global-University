import { AxiosInstance, AxiosResponse } from 'axios';
import { defaultHttpClient } from './httpClient';
import { UrlResolver } from './urlResolver';

export interface ResourceOptions {
  name: string;
  namespace?: string;
  idKey?: string;
}

export interface ListQueryParams {
  page?: number;
  page_size?: number;
  more?: string;
  [key: string]: unknown;
}

export interface PaginatedResponse<T> {
  results: T[];
  count?: number;
  more?: string;
  page?: number;
  total_pages?: number;
}

export class Resource<T = Record<string, unknown>> {
  readonly fullName: string;
  readonly idKey: string;
  private readonly client: AxiosInstance;
  private readonly urlResolver: UrlResolver;
  private readonly inFlightGetRequests = new Map<string, Promise<AxiosResponse<unknown>>>();

  constructor({ name, namespace = 'core', idKey = 'id' }: ResourceOptions) {
    this.fullName = `kolibri:${namespace}:${name}`;
    this.idKey = idKey;
    this.client = defaultHttpClient;
    this.urlResolver = UrlResolver.getInstance();
  }

  /**
   * Request Coalescing: Concurrent GET requests with identical URLs and parameters
   * share a single in-flight promise, avoiding duplicate queries to the database.
   */
  async request<R = unknown>(options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    action?: string;
    routeParams?: string | number | Record<string, unknown>;
    params?: Record<string, unknown>;
    data?: unknown;
  }): Promise<R> {
    const { method = 'GET', action = 'list', routeParams, params, data } = options;
    const url = this.urlResolver.resolve(`${this.fullName}_${action}`, routeParams);

    if (method.toUpperCase() !== 'GET') {
      const response = await this.client.request<R>({ url, method, params, data });
      return response.data;
    }

    // Stable query cache key for GET request coalescing
    const paramKey = params ? JSON.stringify(Object.keys(params).sort().map(k => [k, params[k]])) : '';
    const cacheKey = `${url}?${paramKey}`;

    const existing = this.inFlightGetRequests.get(cacheKey);
    if (existing) {
      const res = await existing;
      return (typeof structuredClone === 'function' ? structuredClone(res.data) : JSON.parse(JSON.stringify(res.data))) as R;
    }

    const promise = this.client.request<R>({ url, method, params });
    this.inFlightGetRequests.set(cacheKey, promise);

    try {
      const response = await promise;
      return response.data;
    } finally {
      this.inFlightGetRequests.delete(cacheKey);
    }
  }

  // --- Core CRUD Primitives matching ValuesViewset contracts ---

  async list(params?: ListQueryParams): Promise<T[] | PaginatedResponse<T>> {
    return this.request<T[] | PaginatedResponse<T>>({ action: 'list', params });
  }

  async retrieve(id: string | number, params?: Record<string, unknown>): Promise<T> {
    return this.request<T>({ action: 'detail', routeParams: id, params });
  }

  async create(data: Partial<T>): Promise<T> {
    return this.request<T>({ method: 'POST', action: 'list', data });
  }

  /**
   * Smart Delta-Patching: When baseline is provided, sends only modified fields.
   */
  async update(id: string | number, data: Partial<T>, baseline?: Partial<T>): Promise<T> {
    let payload = data;
    if (baseline) {
      payload = Object.keys(data).reduce((acc, key) => {
        if (JSON.stringify(data[key]) !== JSON.stringify(baseline[key])) {
          acc[key] = data[key];
        }
        return acc;
      }, {} as Partial<T>);

      if (Object.keys(payload).length === 0) {
        return (typeof structuredClone === 'function' ? structuredClone(baseline) : JSON.parse(JSON.stringify(baseline))) as T;
      }
    }

    return this.request<T>({
      method: 'PATCH',
      action: 'detail',
      routeParams: id,
      data: payload,
    });
  }

  async delete(id: string | number): Promise<void> {
    await this.request({ method: 'DELETE', action: 'detail', routeParams: id });
  }
}
