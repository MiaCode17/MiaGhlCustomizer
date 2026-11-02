import { CheckCircleFilled } from '@ant-design/icons';
import { Theme } from '../../../types/theme';
import { useBrandTheme } from '../../../context/BrandThemeContext';
import { withAlpha } from '../../../utils/colorUtils';

function lighten(hex: string, amount: number): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return hex;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const mix = (v: number) => Math.round(v + (255 - v) * amount);
  return `#${[mix(r), mix(g), mix(b)].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function gradientCss(g: { from: string; to: string; angle: number }): string {
  return `linear-gradient(${g.angle}deg, ${g.from}, ${g.to})`;
}

/** Pulls a small, display-ready set of colours out of a theme. */
export function themeSwatches(theme: Theme): string[] {
  const header = theme.gradients.find((g) => g.target === 'header');
  const main = theme.colorRules[0]?.value ?? header?.from ?? '#c9c2ba';
  const fromRules = theme.colorRules.map((r) => r.value).filter(Boolean);
  const out = [...fromRules];
  if (header) out.unshift(header.from, header.to);
  while (out.length < 5) out.push(lighten(main, 0.3 + out.length * 0.12));
  return Array.from(new Set(out)).slice(0, 5);
}

/** Miniature GHL-style screen (sidebar, header, content) painted with the theme's colours. */
export function ThemePreview({ theme, height = 150 }: { theme: Theme; height?: number }) {
  const header = theme.gradients.find((g) => g.target === 'header');
  const sidebar = theme.gradients.find((g) => g.target === 'sidebar');
  const button = theme.gradients.find((g) => g.target === 'button');
  const [c0, c1, c2] = themeSwatches(theme);
  const headerBg = header ? gradientCss(header) : c0;
  const sidebarBg = sidebar ? gradientCss(sidebar) : (header ? gradientCss(header) : c0);
  const buttonBg = button ? gradientCss(button) : (c1 ?? c0);
  const radius = Math.min(parseInt(theme.borderRadius, 10) || 8, 14);

  return (
    <div
      aria-hidden
      style={{
        display: 'flex',
        height,
        borderRadius: 12,
        overflow: 'hidden',
        background: '#f6f5f4',
        border: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ width: '22%', background: sidebarBg, padding: '10px 7px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ height: 8, width: '60%', borderRadius: 4, background: 'rgba(255,255,255,0.85)' }} />
        {[0.55, 0.3, 0.3, 0.3].map((o, i) => (
          <div key={i} style={{ height: 6, borderRadius: 3, background: `rgba(255,255,255,${o})` }} />
        ))}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ height: '20%', background: headerBg, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 8px', gap: 5 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.8)' }} />
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }} />
        </div>
        <div style={{ flex: 1, padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {[c0, c1, c2].map((c, i) => (
              <div key={i} style={{ flex: 1, height: 26, borderRadius: radius / 2, background: withAlpha(c, 0.18), borderLeft: `3px solid ${c}` }} />
            ))}
          </div>
          <div style={{ flex: 1, borderRadius: radius / 2, background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.06)', padding: 7, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ height: 5, width: '70%', borderRadius: 3, background: '#e6e2de' }} />
            <div style={{ height: 5, width: '45%', borderRadius: 3, background: '#eeebe8' }} />
            <div style={{ marginTop: 'auto', height: 14, width: 44, borderRadius: radius / 2, background: buttonBg }} />
          </div>
        </div>
      </div>
    </div>
  );
}

interface ThemeCardProps {
  theme: Theme;
  active: boolean;
  categoryLabel?: string;
  categoryAccent?: string;
  disabled?: boolean;
  onClick: () => void;
}

export function ThemeCard({ theme, active, categoryLabel, categoryAccent, disabled, onClick }: ThemeCardProps) {
  const { palette } = useBrandTheme();
  const swatches = themeSwatches(theme);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className="theme-card"
      style={{
        textAlign: 'left',
        font: 'inherit',
        cursor: disabled ? 'progress' : 'pointer',
        borderRadius: 16,
        padding: 12,
        background: '#fff',
        border: `1.5px solid ${active ? palette.primary : '#ece7e3'}`,
        boxShadow: active ? `0 0 0 4px ${withAlpha(palette.primary, 0.14)}` : '0 1px 2px rgba(31,25,20,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        position: 'relative',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
      }}
    >
      <ThemePreview theme={theme} />

      {active && (
        <span
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 9px 3px 7px',
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 600,
            background: '#fff',
            color: palette.primary,
            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
          }}
        >
          <CheckCircleFilled /> Applied
        </span>
      )}

      <div style={{ padding: '0 4px 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 650, color: '#26201d' }}>{theme.themeName}</span>
          <span style={{ display: 'flex', gap: 3 }}>
            {swatches.map((c, i) => (
              <span key={i} style={{ width: 14, height: 14, borderRadius: '50%', background: c, border: '1px solid rgba(0,0,0,0.1)', marginLeft: i ? -5 : 0 }} />
            ))}
          </span>
        </div>
        <div
          style={{
            marginTop: 4,
            fontSize: 12.5,
            lineHeight: 1.45,
            color: '#8a817a',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: 36,
          }}
        >
          {theme.description || 'A polished look for your whole portal.'}
        </div>
        <div style={{ marginTop: 8, display: 'flex', gap: 6, alignItems: 'center', fontSize: 11.5, fontWeight: 500 }}>
          {theme.isDefault && <Badge>Default</Badge>}
          {theme.isCustom && <Badge>Yours</Badge>}
          {categoryLabel && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#6b625b' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: categoryAccent }} />
              {categoryLabel}
            </span>
          )}
          <span className="theme-card-apply" style={{ marginLeft: 'auto', color: palette.primary, fontWeight: 600 }}>
            {active ? '' : 'Apply →'}
          </span>
        </div>
      </div>
    </button>
  );
}

function Badge({ children }: { children: string }) {
  return (
    <span style={{ padding: '1px 8px', borderRadius: 999, background: '#f1ede9', color: '#4b4440', fontSize: 11 }}>
      {children}
    </span>
  );
}
