export type LoaderType =
  | 'spinner'
  | 'dots'
  | 'bar'
  | 'pulse'
  | 'bars'
  | 'ring'
  | 'wave'
  | 'orbit'
  | 'grid'
  | 'custom-image';

export type LoaderSize = 'small' | 'medium' | 'large';

export interface SavedLoaderImage {
  name: string;
  url: string;
}

export interface LoaderConfig {
  enabled: boolean;
  loaderType: LoaderType;
  customImageUrl?: string;
  color: string;
  size: LoaderSize;
  library: SavedLoaderImage[];
}

export const emptyLoaderConfig: LoaderConfig = {
  enabled: false,
  loaderType: 'spinner',
  customImageUrl: undefined,
  color: '#4f46e5',
  size: 'medium',
  library: [],
};

export function normalizeLoaderConfig(c: Partial<LoaderConfig> | null | undefined): LoaderConfig {
  return { ...emptyLoaderConfig, ...(c ?? {}), library: c?.library ?? [] };
}
