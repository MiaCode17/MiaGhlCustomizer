import type { ConversationStyleDoc } from '../models/ConversationStyle';
import type { LoginPageConfigDoc } from '../models/LoginPageConfig';
import type { ThemeDoc } from '../models/Theme';
import { expandSelector, GHL_SELECTORS } from './ghlSelectors';

/**
 * Pure builders that turn stored customizer config into CSS strings. The embed
 * script injects the result as a single <style> tag (more robust against GHL
 * re-renders than per-element inline styles).
 */

const SHADOWS: Record<ThemeDoc['shadowIntensity'], string> = {
  none: 'none',
  sm: '0 1px 3px rgba(0,0,0,0.12)',
  md: '0 6px 16px rgba(0,0,0,0.16)',
  lg: '0 14px 32px rgba(0,0,0,0.22)',
};

const SYSTEM_FONTS = new Set(['', 'default', 'inherit', 'system-ui']);

/** Strips characters that would let one value escape its declaration. */
function cssValue(value: string | undefined | null): string {
  return String(value ?? '')
    .replace(/[{}<>;]/g, '')
    .trim();
}

function cssSelector(selector: string): string {
  return selector.replace(/[{}<>]/g, '').trim();
}

function cssString(value: string): string {
  return `"${value.replace(/["\\\n\r]/g, '')}"`;
}

function cssUrl(url: string | undefined): string | undefined {
  const safe = cssValue(url);
  return safe ? `url(${cssString(safe)})` : undefined;
}

function px(n: number | undefined): string | undefined {
  return typeof n === 'number' && Number.isFinite(n) ? `${n}px` : undefined;
}

function rule(selector: string, decls: Record<string, string | undefined>): string {
  const body = Object.entries(decls)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([prop, v]) => `  ${prop}: ${v} !important;`)
    .join('\n');
  return body ? `${cssSelector(selector)} {\n${body}\n}` : '';
}

function fontStack(font: string): string | undefined {
  return SYSTEM_FONTS.has(font.trim().toLowerCase())
    ? undefined
    : `${cssString(cssValue(font))}, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
}

/** Google Fonts stylesheet URLs for every non-system font a theme uses. */
export function themeFontUrls(theme: Pick<ThemeDoc, 'fonts' | 'sidebarStyle'>): string[] {
  const fonts = new Set(
    [theme.fonts?.heading, theme.fonts?.body, theme.sidebarStyle?.fontFamily]
      .filter((f): f is string => !!f && !SYSTEM_FONTS.has(f.trim().toLowerCase()))
      .map((f) => f.trim()),
  );
  return [...fonts].map(
    (f) =>
      `https://fonts.googleapis.com/css2?family=${encodeURIComponent(f).replace(/%20/g, '+')}:wght@400;500;600;700&display=swap`,
  );
}

const GRADIENT_TARGETS: Record<ThemeDoc['gradients'][number]['target'], string> = {
  header: GHL_SELECTORS.header,
  sidebar: GHL_SELECTORS.sidebar,
  button: GHL_SELECTORS.primaryButton,
};

function hoverEffectCss(effect: ThemeDoc['sidebarStyle']['hoverEffect']): Record<string, string> {
  switch (effect) {
    case 'slide':
      return { transform: 'translateX(4px)' };
    case 'fade':
      return { opacity: '0.8' };
    case 'scale':
      return { transform: 'scale(1.03)' };
    case 'glow':
      return { 'box-shadow': '0 0 12px rgba(255,255,255,0.35)' };
    default:
      return {};
  }
}

function sidebarCss(s: Partial<ThemeDoc['sidebarStyle']> | undefined): string[] {
  if (!s) return [];
  const link = GHL_SELECTORS.sidebarLink;
  const linkHover = link
    .split(',')
    .map((sel) => `${sel.trim()}:hover`)
    .join(', ');
  const iconStroke =
    s.boldIcons || s.iconStyle === 'bold' ? '2.4' : s.iconStyle === 'line' ? '1.25' : undefined;

  return [
    rule(link, {
      'font-family': s.fontFamily ? fontStack(s.fontFamily) : undefined,
      color: cssValue(s.fontColor),
      'font-size': px(s.fontSize),
      'margin-bottom': px(s.itemSpacing),
      padding: px(s.itemPadding),
      gap: px(s.iconLabelGap),
      'border-radius': px(s.cornerRadius),
      transition: s.hoverEffect && s.hoverEffect !== 'none' ? 'all 0.18s ease' : undefined,
    }),
    rule(linkHover, {
      color: cssValue(s.hoverTextColor),
      'background-color': cssValue(s.hoverBackgroundColor),
      ...hoverEffectCss(s.hoverEffect ?? 'none'),
    }),
    rule(GHL_SELECTORS.sidebarIcon, {
      color: cssValue(s.iconColor),
      width: px(s.iconSize),
      height: px(s.iconSize),
      'stroke-width': iconStroke,
      opacity: s.iconStyle === 'duotone' ? '0.85' : undefined,
    }),
    rule(GHL_SELECTORS.sidebarScroll, {
      'scrollbar-color': s.scrollbarColor ? `${cssValue(s.scrollbarColor)} transparent` : undefined,
    }),
    rule(GHL_SELECTORS.locationSwitcher, {
      'background-color': cssValue(s.locationSwitcherColor),
    }),
  ];
}

export function buildThemeCss(
  theme: Pick<
    ThemeDoc,
    'colorRules' | 'gradients' | 'fonts' | 'borderRadius' | 'shadowIntensity' | 'sidebarStyle'
  >,
): string {
  const blocks: string[] = [];

  for (const r of theme.colorRules ?? []) {
    const property = r.property.replace(/[^a-z-]/gi, '');
    if (!property) continue;
    blocks.push(rule(expandSelector(r.selector), { [property]: cssValue(r.value) }));
  }

  for (const g of theme.gradients ?? []) {
    const target = GRADIENT_TARGETS[g.target];
    if (!target) continue;
    const angle = Number.isFinite(g.angle) ? g.angle : 90;
    blocks.push(
      rule(target, {
        'background-image': `linear-gradient(${angle}deg, ${cssValue(g.from)}, ${cssValue(g.to)})`,
      }),
    );
  }

  const bodyFont = theme.fonts?.body ? fontStack(theme.fonts.body) : undefined;
  const headingFont = theme.fonts?.heading ? fontStack(theme.fonts.heading) : undefined;
  blocks.push(rule('body, #app', { 'font-family': bodyFont }));
  blocks.push(rule('#app h1, #app h2, #app h3, #app h4, #app h5, #app h6', { 'font-family': headingFont }));

  blocks.push(rule(GHL_SELECTORS.primaryButton, { 'border-radius': cssValue(theme.borderRadius) }));
  blocks.push(
    rule('#app .card, #app .hl-card, #app .n-card', {
      'border-radius': cssValue(theme.borderRadius),
      'box-shadow': SHADOWS[theme.shadowIntensity],
    }),
  );

  blocks.push(...sidebarCss(theme.sidebarStyle));

  return blocks.filter(Boolean).join('\n\n');
}

export function buildConversationCss(
  style: Pick<
    ConversationStyleDoc,
    | 'agentBubbleColor'
    | 'agentTextColor'
    | 'contactBubbleColor'
    | 'contactTextColor'
    | 'fontFamily'
    | 'bubbleRadius'
    | 'showTimestamps'
    | 'showAvatars'
  >,
): string {
  const radius = px(style.bubbleRadius);
  return [
    rule(GHL_SELECTORS.messageOutbound, {
      'background-color': cssValue(style.agentBubbleColor),
      color: cssValue(style.agentTextColor),
      'border-radius': radius,
    }),
    rule(GHL_SELECTORS.messageInbound, {
      'background-color': cssValue(style.contactBubbleColor),
      color: cssValue(style.contactTextColor),
      'border-radius': radius,
    }),
    rule(GHL_SELECTORS.messageThread, { 'font-family': fontStack(style.fontFamily ?? '') }),
    style.showTimestamps ? '' : rule(GHL_SELECTORS.messageTimestamp, { display: 'none' }),
    style.showAvatars ? '' : rule(GHL_SELECTORS.messageAvatar, { display: 'none' }),
  ]
    .filter(Boolean)
    .join('\n\n');
}

const LOGIN_LAYOUTS: Record<LoginPageConfigDoc['preset'], (s: typeof GHL_SELECTORS) => string[]> = {
  centered: (s) => [
    rule(s.loginRoot, { display: 'flex', 'align-items': 'center', 'justify-content': 'center' }),
    rule(s.loginBody, { margin: '0 auto' }),
  ],
  'split-left': (s) => [
    rule(s.loginRoot, { display: 'grid', 'grid-template-columns': 'minmax(360px, 1fr) 1fr' }),
    rule(s.loginBody, { 'grid-column': '1', 'align-self': 'center', 'justify-self': 'center' }),
  ],
  'split-right': (s) => [
    rule(s.loginRoot, { display: 'grid', 'grid-template-columns': '1fr minmax(360px, 1fr)' }),
    rule(s.loginBody, { 'grid-column': '2', 'align-self': 'center', 'justify-self': 'center' }),
  ],
  'full-bleed': (s) => [
    rule(s.loginRoot, { display: 'flex', 'align-items': 'center', 'justify-content': 'center' }),
    rule(s.loginBody, {
      background: 'rgba(255,255,255,0.86)',
      'backdrop-filter': 'blur(12px)',
    }),
  ],
};

/**
 * Builds the stylesheet served to GHL's login page. Admin-defined CSS variables
 * are declared on the login root, then consumed by the structural rules with
 * sensible fallbacks, and the admin's raw custom CSS is appended last so it can
 * override anything.
 */
export function buildLoginCss(
  config: Pick<
    LoginPageConfigDoc,
    'preset' | 'logoUrl' | 'backgroundImageUrl' | 'cssVariables' | 'customCss'
  >,
): string {
  const s = GHL_SELECTORS;
  const vars: Record<string, string | undefined> = {};
  for (const v of config.cssVariables ?? []) {
    const name = v.name.trim();
    if (/^--[a-z0-9-]+$/i.test(name)) vars[name] = cssValue(v.value);
  }
  vars['--login-logo'] ??= cssUrl(config.logoUrl);
  vars['--login-bg-image'] ??= cssUrl(config.backgroundImageUrl);

  const declared = Object.entries(vars)
    .filter(([, v]) => v)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n');

  const blocks = [
    declared ? `${cssSelector(s.loginRoot)} {\n${declared}\n}` : '',
    rule(s.loginRoot, {
      'min-height': '100vh',
      'background-color': 'var(--login-bg-color, #f8fafc)',
      'background-image': config.backgroundImageUrl ? 'var(--login-bg-image)' : undefined,
      'background-size': 'cover',
      'background-position': 'center',
      'font-family': "var(--login-font, 'Inter', sans-serif)",
    }),
    ...LOGIN_LAYOUTS[config.preset ?? 'centered'](s),
    rule(s.loginBody, {
      'border-radius': 'var(--login-card-radius, 16px)',
      'box-shadow': 'var(--login-card-shadow, 0 20px 50px rgba(15,23,42,0.18))',
      'background-color': config.preset === 'full-bleed' ? undefined : 'var(--login-card-bg, #ffffff)',
      padding: 'var(--login-card-padding, 32px)',
      'max-width': 'var(--login-card-width, 420px)',
      width: '100%',
    }),
    config.logoUrl
      ? rule(s.loginLogo, {
          content: 'var(--login-logo)',
          'max-height': 'var(--login-logo-height, 56px)',
          width: 'auto',
        })
      : '',
    rule(s.loginInput, {
      'border-radius': 'var(--login-input-radius, 10px)',
      'border-color': 'var(--login-input-border, #cbd5e1)',
    }),
    rule(s.loginButton, {
      'background-color': 'var(--primary-color, #4f46e5)',
      'border-color': 'var(--primary-color, #4f46e5)',
      color: 'var(--button-text-color, #ffffff)',
      'border-radius': 'var(--login-button-radius, 10px)',
    }),
    rule(s.loginLink, { color: 'var(--link-color, var(--primary-color, #4f46e5))' }),
    config.customCss?.trim() ? `/* custom */\n${config.customCss.trim()}` : '',
  ];

  return blocks.filter(Boolean).join('\n\n');
}
