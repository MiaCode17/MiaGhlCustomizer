export type LoginPagePreset = 'split-left' | 'split-right' | 'centered' | 'full-bleed';

export interface CssVariable {
  name: string;
  value: string;
}

export interface LoginPageConfig {
  preset: LoginPagePreset;
  logoUrl?: string;
  backgroundImageUrl?: string;
  cssVariables: CssVariable[];
  customCss: string;
}

export const emptyLoginPageConfig: LoginPageConfig = {
  preset: 'centered',
  logoUrl: undefined,
  backgroundImageUrl: undefined,
  cssVariables: [],
  customCss: '',
};
