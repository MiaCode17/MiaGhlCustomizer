import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BgColorsOutlined, CheckCircleFilled, CrownOutlined, GiftOutlined } from '@ant-design/icons';
import { SpecialThemePage } from '../special-theme/SpecialThemePage';
import { ClassicThemeEditor } from './ClassicThemeEditor';
import { PremiumThemePage } from './PremiumThemePage';

type ThemeType = 'classic' | 'premium' | 'occasional';

const TYPES: { key: ThemeType; title: string; blurb: string; sets: string[]; icon: React.ReactNode; accent: [string, string] }[] = [
  { key: 'classic', title: 'Classic', blurb: 'Your own colours, gradients and fonts, rule by rule.', sets: ['Colours', 'Gradients', 'Fonts'], icon: <BgColorsOutlined />, accent: ['#5b6cf0', '#8b5cf6'] },
  { key: 'premium', title: 'Premium', blurb: 'A full design movement: glass, neon, clay and more.', sets: ['Style', 'Palette', 'Texture', 'Sidebar'], icon: <CrownOutlined />, accent: ['#7c3aed', '#c026d3'] },
  { key: 'occasional', title: 'Occasional', blurb: 'A festive seasonal skin with a popup and page effects.', sets: ['Colours', 'Emoji', 'Particles', 'Popup'], icon: <GiftOutlined />, accent: ['#d90429', '#f59e0b'] },
];

const PAGE_CSS = `
.myo-type:hover { transform: translateY(-4px); }
.myo-type:focus-visible { outline: 2px solid #26201d; outline-offset: 2px; }
@keyframes myo-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
.myo-float { animation: myo-float 3s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .myo-float { animation: none; } }
`;

const FLOATERS: [string, number, number][] = [
  ['❄️', 12, 14],
  ['🎄', 78, 52],
  ['✨', 66, 10],
  ['🎁', 20, 58],
];

/** A small illustration of what each theme type produces. */
function TypeArt({ type, accent }: { type: ThemeType; accent: [string, string] }) {
  const frame: React.CSSProperties = { height: 104, borderRadius: 14, overflow: 'hidden', position: 'relative' };

  if (type === 'classic') {
    return (
      <div style={{ ...frame, background: `linear-gradient(135deg, ${accent[0]}, ${accent[1]})`, padding: 14, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 7 }}>
          {['#ffffff', '#ffffffb0', '#ffffff60', '#0f172a'].map((c, i) => (
            <span key={i} style={{ width: 24, height: 24, borderRadius: 8, background: c, boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }} />
          ))}
        </div>
        <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11.5, color: 'rgba(255,255,255,0.9)' }}>.hl-btn {'{'} background: #6366f1 {'}'}</div>
      </div>
    );
  }

  if (type === 'premium') {
    return (
      <div style={{ ...frame, background: 'linear-gradient(150deg, #1d1a3a, #0b0a1a)', padding: 12 }}>
        <div style={{ position: 'absolute', width: 90, height: 90, borderRadius: '50%', background: accent[1], filter: 'blur(34px)', opacity: 0.55, right: -10, top: -20 }} />
        <div style={{ position: 'relative', height: '100%', borderRadius: 12, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.28)', backdropFilter: 'blur(8px)', padding: 10, display: 'flex', flexDirection: 'column', gap: 7 }}>
          <div style={{ height: 8, width: '55%', borderRadius: 4, background: 'rgba(255,255,255,0.7)' }} />
          <div style={{ height: 8, width: '35%', borderRadius: 4, background: 'rgba(255,255,255,0.35)' }} />
          <div style={{ marginTop: 'auto', height: 20, width: 70, borderRadius: 8, background: `linear-gradient(135deg, ${accent[0]}, ${accent[1]})`, boxShadow: `0 0 16px ${accent[1]}` }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...frame, background: `linear-gradient(135deg, ${accent[0]}, ${accent[1]})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {FLOATERS.map(([glyph, left, top], i) => (
        <span key={i} aria-hidden className="myo-float" style={{ position: 'absolute', left: `${left}%`, top: `${top}%`, fontSize: 18, opacity: 0.7, animationDelay: `${i * 0.5}s` }}>
          {glyph}
        </span>
      ))}
      <span style={{ fontSize: 44, filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.35))' }}>🎅</span>
    </div>
  );
}

export function MakeYourOwnThemePage() {
  const [params, setParams] = useSearchParams();
  const [groupId, setGroupId] = useState<string | undefined>(undefined);

  const requested = params.get('type');
  const type: ThemeType = TYPES.some((t) => t.key === requested) ? (requested as ThemeType) : 'classic';

  const choose = (next: ThemeType) => {
    const copy = new URLSearchParams(params);
    copy.set('type', next);
    setParams(copy, { replace: true });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <style>{PAGE_CSS}</style>

      <div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 750, color: '#1f1914' }}>What do you want to create?</h1>
        <p style={{ margin: '4px 0 0', fontSize: 14, color: '#8a817a' }}>Pick a theme type. Each one has its own set of tools.</p>
      </div>

      <div role="radiogroup" aria-label="Theme type" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
        {TYPES.map((t) => {
          const active = t.key === type;
          return (
            <button
              key={t.key}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => choose(t.key)}
              className="myo-type"
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                padding: 12,
                borderRadius: 22,
                textAlign: 'left',
                font: 'inherit',
                cursor: 'pointer',
                background: '#fff',
                border: `1.5px solid ${active ? t.accent[0] : '#ece7e3'}`,
                boxShadow: active ? `0 0 0 4px ${t.accent[0]}22, 0 18px 36px ${t.accent[0]}2e` : '0 1px 2px rgba(31,25,20,0.04)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
              }}
            >
              <TypeArt type={t.key} accent={t.accent} />
              {active && (
                <span style={{ position: 'absolute', top: 22, right: 22, display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px 3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: '#fff', color: '#26201d', boxShadow: '0 2px 10px rgba(0,0,0,0.25)' }}>
                  <CheckCircleFilled style={{ color: t.accent[0] }} /> Creating
                </span>
              )}
              <div style={{ padding: '0 6px 6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#fff', background: `linear-gradient(135deg, ${t.accent[0]}, ${t.accent[1]})` }}>{t.icon}</span>
                  <span style={{ fontSize: 17, fontWeight: 700, color: '#1f1914' }}>{t.title} theme</span>
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.45, color: '#6b625b', margin: '8px 0 10px' }}>{t.blurb}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {t.sets.map((x) => (
                    <span key={x} style={{ fontSize: 11.5, fontWeight: 600, padding: '2px 9px', borderRadius: 999, background: `${t.accent[0]}14`, color: t.accent[0] }}>
                      {x}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {type === 'classic' && <ClassicThemeEditor groupId={groupId} onGroupChange={setGroupId} />}
      {type === 'premium' && <PremiumThemePage mode="create" groupId={groupId} onGroupChange={setGroupId} />}
      {type === 'occasional' && <SpecialThemePage mode="create" groupId={groupId} onGroupChange={setGroupId} />}
    </div>
  );
}
