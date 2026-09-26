export interface RuntimeFeatureConfig {
  enabled: boolean;
  [key: string]: unknown;
}

/** Response of the public GET /runtime/config endpoint the embed script polls. */
export interface RuntimeConfig {
  groupId: string;
  features: Record<string, RuntimeFeatureConfig>;
}
