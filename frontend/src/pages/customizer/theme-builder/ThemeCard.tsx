import { useState } from 'react';
import { Tag, Typography } from 'antd';
import { Theme } from '../../../types/theme';
import { useBrandTheme } from '../../../context/BrandThemeContext';
import { withAlpha } from '../../../utils/colorUtils';

interface ThemeCardProps {
  theme: Theme;
  active: boolean;
  onClick: () => void;
}

function lighten(hex: string, amount: number): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return hex;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const mix = (v: number) => Math.round(v + (255 - v) * amount);
  return `#${[mix(r), mix(g), mix(b)].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function Chip({ color, size }: { color: string; size: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size / 3.5,
        background: color,
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
        flexShrink: 0,
      }}
    />
  );
}

export function ThemeCard({ theme, active, onClick }: ThemeCardProps) {
  const [hovered, setHovered] = useState(false);
  const { palette } = useBrandTheme();

  const headerGradient = theme.gradients.find((g) => g.target === 'header');
  const mainColor = theme.colorRules[0]?.value ?? headerGradient?.from ?? '#c9c2ba';
  const mainBackground = headerGradient
    ? `linear-gradient(${headerGradient.angle}deg, ${headerGradient.from}, ${headerGradient.to})`
    : mainColor;

  const sideChips = [theme.colorRules[1]?.value ?? lighten(mainColor, 0.25), theme.colorRules[2]?.value ?? lighten(mainColor, 0.45)];
  const bottomChips = [
    theme.colorRules[3]?.value ?? lighten(mainColor, 0.6),
    lighten(mainColor, 0.75),
    lighten(mainColor, 0.87),
  ];

  const lifted = hovered || active;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
      style={{
        width: 280,
        cursor: 'pointer',
        borderRadius: 18,
        border: active ? `2px solid ${palette.primary}` : '1px solid #e5e7eb',
        background: '#fff',
        padding: 20,
        transform: lifted ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: active
          ? `0 5px 0 0 ${palette.tintBorder}, 0 ${lifted ? 18 : 12}px 24px ${withAlpha(palette.primary, 0.22)}`
          : `0 4px 0 0 #e5e1dc, 0 ${lifted ? 14 : 6}px 18px rgba(31,25,20,0.12)`,
        transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.15s ease',
      }}
    >
      <div
        style={{
          position: 'relative',
          height: 208,
          background: '#f4f2f0',
          borderRadius: 16,
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.08)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 16,
            background: mainBackground,
            boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.35), inset 0 -10px 16px rgba(0,0,0,0.18)',
            WebkitMaskImage: 'radial-gradient(circle 50px at 100% 100%, transparent 99%, black 100%)',
            maskImage: 'radial-gradient(circle 50px at 100% 100%, transparent 99%, black 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 16,
            background: 'linear-gradient(160deg, rgba(255,255,255,0.35), rgba(255,255,255,0) 45%)',
            WebkitMaskImage: 'radial-gradient(circle 50px at 100% 100%, transparent 99%, black 100%)',
            maskImage: 'radial-gradient(circle 50px at 100% 100%, transparent 99%, black 100%)',
            pointerEvents: 'none',
          }}
        />
        {theme.isCustom && (
          <Tag color={palette.primary} style={{ position: 'absolute', top: 12, left: 12, marginRight: 0, fontSize: 12 }}>
            Yours
          </Tag>
        )}
        {theme.isDefault && (
          <Tag style={{ position: 'absolute', top: 12, left: 12, marginRight: 0, fontSize: 12 }}>Default</Tag>
        )}
        <div
          style={{
            position: 'absolute',
            right: 10,
            bottom: 56,
            display: 'flex',
            flexDirection: 'column',
            gap: 7,
          }}
        >
          {sideChips.map((c, i) => (
            <Chip key={i} color={c} size={36} />
          ))}
        </div>
        <div style={{ position: 'absolute', left: 10, bottom: 10, display: 'flex', gap: 7 }}>
          {bottomChips.map((c, i) => (
            <Chip key={i} color={c} size={26} />
          ))}
        </div>
      </div>

      <div style={{ paddingTop: 14 }}>
        <Typography.Text strong style={{ fontSize: 16, display: 'block' }}>
          {theme.themeName}
        </Typography.Text>
        {theme.description && (
          <Typography.Paragraph
            type="secondary"
            style={{ fontSize: 13, marginTop: 4, marginBottom: 0 }}
            ellipsis={{ rows: 2 }}
          >
            {theme.description}
          </Typography.Paragraph>
        )}
      </div>
    </div>
  );
}
