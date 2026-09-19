export type LoaderType = 'spinner' | 'dots' | 'bar' | 'custom-image';

export interface LoaderConfig {
  enabled: boolean;
  loaderType: LoaderType;
  customImageUrl?: string;
}

export const emptyLoaderConfig: LoaderConfig = {
  enabled: false,
  loaderType: 'spinner',
  customImageUrl: undefined,
};
