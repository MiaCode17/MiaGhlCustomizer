export interface ColorRule {
  name: string;
  selector: string;
  property: string;
  value: string;
}

export type GradientTarget = 'header' | 'sidebar' | 'button';

export interface Gradient {
  target: GradientTarget;
  from: string;
  to: string;
  angle: number;
}

export type ShadowIntensity = 'none' | 'sm' | 'md' | 'lg';

export interface Theme {
  id?: string;
  themeName: string;
  description?: string;
  colorRules: ColorRule[];
  gradients: Gradient[];
  fonts: { heading: string; body: string };
  borderRadius: string;
  shadowIntensity: ShadowIntensity;
  enabled: boolean;
  /** True for a theme a user created for themselves via "Create your own theme" — never shared to other customers. */
  isCustom?: boolean;
}

export const emptyTheme: Theme = {
  themeName: 'My Theme',
  description: '',
  colorRules: [],
  gradients: [],
  fonts: { heading: 'Inter', body: 'Inter' },
  borderRadius: '8px',
  shadowIntensity: 'sm',
  enabled: true,
};
