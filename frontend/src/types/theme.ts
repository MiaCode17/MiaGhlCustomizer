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

export type ThemeCategory =
  | 'cyberpunk'
  | 'synthwave'
  | 'vaporwave'
  | 'y2k'
  | 'glitchcore'
  | 'futuristic-techcore'
  | 'spacecore'
  | 'retro-futurism'
  | 'naturecore'
  | 'goblincore';

export type SidebarHoverEffect = 'none' | 'slide' | 'fade' | 'scale' | 'glow';
export type SidebarIconStyle = 'outline' | 'bold' | 'line' | 'duotone';

export interface SidebarStyle {
  fontFamily: string;
  fontColor: string;
  fontSize: number;
  iconColor: string;
  iconStyle: SidebarIconStyle;
  iconSize: number;
  boldIcons: boolean;
  itemSpacing: number;
  itemPadding: number;
  iconLabelGap: number;
  cornerRadius: number;
  hoverEffect: SidebarHoverEffect;
  hoverTextColor: string;
  hoverBackgroundColor: string;
  scrollbarColor: string;
  locationSwitcherColor: string;
}

export const defaultSidebarStyle: SidebarStyle = {
  fontFamily: 'Default',
  fontColor: '',
  fontSize: 14,
  iconColor: '',
  iconStyle: 'bold',
  iconSize: 20,
  boldIcons: false,
  itemSpacing: 10,
  itemPadding: 8,
  iconLabelGap: 8,
  cornerRadius: 6,
  hoverEffect: 'none',
  hoverTextColor: '',
  hoverBackgroundColor: '',
  scrollbarColor: '',
  locationSwitcherColor: '',
};

export interface Theme {
  id?: string;
  themeName: string;
  description?: string;
  colorRules: ColorRule[];
  gradients: Gradient[];
  fonts: { heading: string; body: string };
  borderRadius: string;
  shadowIntensity: ShadowIntensity;
  sidebarStyle: SidebarStyle;
  enabled: boolean;
  /** True for a theme a user created for themselves via "Create your own theme" — never shared to other customers. */
  isCustom?: boolean;
  /** True for the built-in "Default" theme (deep red wine) — the app's out-of-the-box identity. */
  isDefault?: boolean;
  /** Aesthetic category tag for browsing under Theme Categories — undefined for the classic/uncategorized presets. */
  category?: ThemeCategory;
}

export const emptyTheme: Theme = {
  themeName: 'My Theme',
  description: '',
  colorRules: [],
  gradients: [],
  fonts: { heading: 'Inter', body: 'Inter' },
  borderRadius: '8px',
  shadowIntensity: 'sm',
  sidebarStyle: defaultSidebarStyle,
  enabled: true,
};
