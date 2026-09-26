import { apiClient } from './apiClient';
import { RuntimeConfig } from '../types/runtime';

/** Origin of the API server, which also serves the embed script under /cdn. */
export const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1').replace(
  /\/api\/v1\/?$/,
  '',
);

export function embedScriptUrl(companyId: string, feature = 'customizer'): string {
  return `${API_ORIGIN}/cdn/${companyId}/${feature}.js`;
}

export const runtimeService = {
  /**
   * Calls the same public endpoint the embed script uses, so admins can see
   * exactly what a given location will receive. The endpoint is open-CORS and
   * cookie-less, so credentials must be off.
   */
  async resolve(companyId: string, locationId?: string, planId?: string): Promise<RuntimeConfig> {
    const { data } = await apiClient.get<RuntimeConfig>('/runtime/config', {
      params: { company_id: companyId, locationId: locationId || undefined, planId: planId || undefined },
      withCredentials: false,
    });
    return data;
  },
};
