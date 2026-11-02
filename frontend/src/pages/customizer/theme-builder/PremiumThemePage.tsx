import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Collapse, Drawer, Empty, Input, InputNumber, Select, Slider, Space, Switch, Tabs, Typography, message } from 'antd';
import { CheckCircleFilled, CrownOutlined, SearchOutlined, SlidersOutlined } from '@ant-design/icons';
import { GroupSelector } from '../../../components/GroupSelector';
import { premiumThemeService } from '../../../services/premiumThemeService';
import {
  BorderRadiusStyle,
  DEFAULT_SIDEBAR_EFFECT,
  DEFAULT_TEXTURE,
  DESIGN_STYLE_META,
  DesignStyle,
  GHL_ELEMENTS,
  InterfaceColors,
  normalizeSidebarEffect,
  normalizeTexture,
  PremiumTheme,
  SIDEBAR_EFFECT_META,
  SidebarEffectStyle,
} from '../../../utils/premiumTheme';
import { deriveInterfaceColors, PREMIUM_STARTERS, PremiumStarter, readableOn, themeFromStarter } from '../../../utils/premiumStarters';
import type { EditorGroupProps } from './editorTypes';

/** "dashboardBg" → "Dashboard bg" for fields the GHL element list does not describe. */
function humanize(key: string): string {
  const spaced = key.replace(/([A-Z])/g, ' $1').toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function ColorField({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const hex6 = /^#[0-9a-f]{6}$/i.test(value) ? value : /^#[0-9a-f]{3}$/i.test(value) ? '#' + value.slice(1).split('').map((c) => c + c).join('') : '#000000';
  return (
    <Space size={6} align="center">
      <input type="color" aria-label={label} value={hex6} onChange={(e) => onChange(e.target.value)} />
      <Input size="small" style={{ width: 120 }} value={value} aria-label={`${label} value`} onChange={(e) => onChange(e.target.value)} />
    </Space>
  );
}

function Row({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '4px 0' }}>
      <div style={{ minWidth: 0 }}>
        <div>{label}</div>
        {hint ? <div style={{ fontSize: 11, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 360 }}>{hint}</div> : null}
      </div>
      {children}
    </div>
  );
}

/** A rough sketch of GHL drawn from the theme's palette. */
function Preview({ theme }: { theme: PremiumTheme }) {
  const c = theme.interfaceColors;
  return (
    <div style={{ display: 'flex', height: 220, borderRadius: 10, overflow: 'hidden', border: `1px solid ${theme.border}`, background: c.dashboardBg }}>
      <div style={{ width: 70, background: c.sidebarBg, padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {['Dashboard', 'Contacts', 'Calendar'].map((t, i) => (
          <div key={t} style={{ fontSize: 10, padding: '4px 6px', borderRadius: 6, color: i === 0 ? readableOn(c.sidebarActive) : c.sidebarText, background: i === 0 ? c.sidebarActive : 'transparent' }}>
            {t}
          </div>
        ))}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 26, background: c.headerBg, borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 8px' }}>
          <div style={{ width: 10, height: 10, borderRadius: 5, background: c.headerIcon }} />
        </div>
        <div style={{ padding: 10, display: 'flex', gap: 8 }}>
          {[0, 1].map((n) => (
            <div key={n} style={{ flex: 1, borderRadius: 8, background: c.cardContentBg, border: `1px solid ${c.statTileBorder}`, padding: 8 }}>
              <div style={{ fontSize: 9, color: c.statTileLabelText }}>Leads</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: c.statTileValueText }}>{n ? '128' : '42'}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: '0 10px 6px', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {[0.8, 0.55].map((w, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 6px', borderRadius: 5, background: c.cardContentBg, border: `1px solid ${c.statTileBorder}` }}>
              <span style={{ width: 7, height: 7, borderRadius: 4, background: c.sidebarActive }} />
              <span style={{ height: 4, width: `${w * 100}%`, borderRadius: 2, background: c.statTileLabelText, opacity: 0.5 }} />
            </div>
          ))}
        </div>
        <div style={{ padding: '0 10px' }}>
          <span style={{ display: 'inline-block', fontSize: 10, padding: '4px 10px', borderRadius: 6, background: c.primaryButtonBg, color: readableOn(c.primaryButtonBg) }}>Primary action</span>
        </div>
      </div>
    </div>
  );
}

/** Per-movement surface treatment so each starter card shows its real look, not just its colours. */
function starterFx(s: PremiumStarter): { panel: React.CSSProperties; pill: React.CSSProperties; button: React.CSSProperties; stage: React.CSSProperties } {
  const hard = '#0b0b0b';
  switch (s.style) {
    case 'brutalist':
      return {
        stage: {},
        panel: { background: s.bg, border: `2px solid ${hard}`, borderRadius: 0, boxShadow: `3px 3px 0 ${hard}` },
        pill: { borderRadius: 0, border: `2px solid ${hard}`, background: s.primary },
        button: { borderRadius: 0, border: `2px solid ${hard}`, boxShadow: `3px 3px 0 ${hard}`, background: s.accent },
      };
    case 'maximalist':
      return {
        stage: {},
        panel: { background: '#fff', border: `2px solid ${s.text}`, borderRadius: 10, boxShadow: `4px 4px 0 ${s.accent}` },
        pill: { borderRadius: 8, background: s.accent },
        button: { borderRadius: 10, border: `2px solid ${s.text}`, background: s.primary, boxShadow: `3px 3px 0 ${s.text}` },
      };
    case 'clay':
      return {
        stage: {},
        panel: { background: s.bg, borderRadius: 16, boxShadow: `inset 3px 3px 6px rgba(255,255,255,0.8), inset -4px -4px 8px ${s.border}, 5px 7px 14px ${s.border}` },
        pill: { borderRadius: 999, background: s.primary, boxShadow: `inset 2px 2px 4px rgba(255,255,255,0.5), 2px 3px 6px ${s.border}` },
        button: { borderRadius: 999, background: s.primary, boxShadow: `inset 3px 3px 5px rgba(255,255,255,0.45), inset -3px -3px 6px rgba(0,0,0,0.12), 3px 5px 10px ${s.border}` },
      };
    case 'neumorphic':
      return {
        stage: {},
        panel: { background: s.bg, borderRadius: 14, boxShadow: `6px 6px 12px ${s.border}, -6px -6px 12px rgba(255,255,255,0.9)` },
        pill: { borderRadius: 10, background: s.bg, boxShadow: `inset 3px 3px 6px ${s.border}, inset -3px -3px 6px rgba(255,255,255,0.9)` },
        button: { borderRadius: 12, background: s.bg, boxShadow: `4px 4px 8px ${s.border}, -4px -4px 8px rgba(255,255,255,0.9)` },
      };
    case 'glass':
    case 'liquidGlass':
      return {
        stage: { backgroundImage: `radial-gradient(circle at 18% 22%, ${s.primary}99, transparent 45%), radial-gradient(circle at 85% 80%, ${s.accent}88, transparent 50%)` },
        panel: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.28)', borderRadius: 14, backdropFilter: 'blur(10px)', boxShadow: '0 8px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.35)' },
        pill: { borderRadius: 10, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)' },
        button: { borderRadius: 12, background: `linear-gradient(135deg, ${s.primary}, ${s.accent})`, border: '1px solid rgba(255,255,255,0.4)', boxShadow: `0 6px 16px ${s.primary}66` },
      };
    case 'cyberpunk':
      return {
        stage: { backgroundImage: `linear-gradient(${s.primary}14 1px, transparent 1px), linear-gradient(90deg, ${s.primary}14 1px, transparent 1px)`, backgroundSize: '16px 16px' },
        panel: { background: 'rgba(0,0,0,0.35)', border: `1px solid ${s.primary}`, borderRadius: 4, boxShadow: `0 0 12px ${s.primary}66, inset 0 0 10px ${s.primary}22` },
        pill: { borderRadius: 3, background: s.primary, boxShadow: `0 0 10px ${s.primary}` },
        button: { borderRadius: 3, background: s.accent, boxShadow: `0 0 14px ${s.accent}, 0 0 28px ${s.accent}66` },
      };
    case 'vaporwave':
      return {
        stage: { backgroundImage: `linear-gradient(180deg, transparent 55%, ${s.accent}33)` },
        panel: { background: 'rgba(255,255,255,0.07)', border: `1px solid ${s.primary}aa`, borderRadius: 10, boxShadow: `0 0 14px ${s.primary}55` },
        pill: { borderRadius: 8, background: `linear-gradient(90deg, ${s.primary}, ${s.accent})` },
        button: { borderRadius: 8, background: `linear-gradient(135deg, ${s.primary}, ${s.accent})`, boxShadow: `0 6px 18px ${s.primary}88` },
      };
    case 'artdeco':
      return {
        stage: {},
        panel: { background: 'rgba(255,255,255,0.03)', border: `1px solid ${s.primary}`, borderRadius: 2, boxShadow: `inset 0 0 0 3px ${s.bg}, inset 0 0 0 4px ${s.primary}88` },
        pill: { borderRadius: 1, background: s.primary },
        button: { borderRadius: 1, background: `linear-gradient(180deg, ${s.accent}, ${s.primary})`, border: `1px solid ${s.accent}` },
      };
    case 'skeuomorphic':
      return {
        stage: { backgroundImage: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.04) 0 2px, transparent 2px 7px)' },
        panel: { background: `linear-gradient(180deg, #ffffff30, ${s.border}55)`, border: `1px solid ${s.border}`, borderRadius: 8, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7), 0 2px 4px rgba(0,0,0,0.25)' },
        pill: { borderRadius: 6, background: `linear-gradient(180deg, ${s.accent}, ${s.primary})`, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 1px 2px rgba(0,0,0,0.3)' },
        button: { borderRadius: 8, background: `linear-gradient(180deg, ${s.accent}, ${s.primary})`, border: `1px solid ${s.border}`, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7), 0 3px 5px rgba(0,0,0,0.3)' },
      };
    default:
      return {
        stage: {},
        panel: { background: 'rgba(255,255,255,0.05)', border: `1px solid ${s.border}`, borderRadius: 12 },
        pill: { borderRadius: 8, background: s.primary },
        button: { borderRadius: 10, background: s.primary, boxShadow: `0 6px 14px ${s.primary}55` },
      };
  }
}

function StarterArt({ s, height = 168 }: { s: PremiumStarter; height?: number }) {
  const fx = starterFx(s);
  return (
    <div style={{ height, borderRadius: 14, background: s.bg, border: `1px solid ${s.border}`, display: 'flex', overflow: 'hidden', position: 'relative', ...fx.stage }}>
      <div style={{ width: '27%', background: s.secondary, padding: '12px 9px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ height: 8, width: '55%', borderRadius: 4, background: s.text, opacity: 0.55, marginBottom: 4 }} />
        <div style={{ height: 14, ...fx.pill }} />
        {[0.5, 0.4].map((o) => (
          <div key={o} style={{ height: 8, borderRadius: 4, background: s.text, opacity: o * 0.6 }} />
        ))}
      </div>
      <div style={{ flex: 1, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          {[s.primary, s.accent].map((c, i) => (
            <div key={i} style={{ flex: 1, padding: 9, display: 'flex', flexDirection: 'column', gap: 6, ...fx.panel }}>
              <div style={{ height: 6, width: '50%', borderRadius: 3, background: s.text, opacity: 0.5 }} />
              <div style={{ height: 14, width: i ? '45%' : '65%', borderRadius: 4, background: c }} />
            </div>
          ))}
        </div>
        <div style={{ flex: 1, padding: 9, display: 'flex', flexDirection: 'column', gap: 6, ...fx.panel }}>
          <div style={{ height: 6, width: '80%', borderRadius: 3, background: s.text, opacity: 0.35 }} />
          <div style={{ height: 6, width: '55%', borderRadius: 3, background: s.text, opacity: 0.25 }} />
        </div>
        <div style={{ height: 24, width: '42%', ...fx.button }} />
      </div>
    </div>
  );
}

interface PremiumThemePageProps extends EditorGroupProps {
  /** 'browse' picks a ready-made starter; 'create' builds a theme from the individual controls. */
  mode?: 'browse' | 'create';
}

export function PremiumThemePage({ groupId: groupIdProp, onGroupChange, mode = 'browse' }: PremiumThemePageProps = {}) {
  const [localGroupId, setLocalGroupId] = useState<string | undefined>(undefined);
  // Controlled by the Make Your Own switcher when it passes onGroupChange, otherwise local.
  const groupId = onGroupChange ? groupIdProp : localGroupId;
  const setGroupId = onGroupChange ?? setLocalGroupId;
  const [enabled, setEnabled] = useState(false);
  const [theme, setTheme] = useState<PremiumTheme | null>(null);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [savedSnap, setSavedSnap] = useState('');
  const [starterQuery, setStarterQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    premiumThemeService
      .get(groupId)
      .then((loaded) => {
        if (cancelled) return;
        const loadedTheme = loaded?.theme ? { ...loaded.theme, texture: normalizeTexture(loaded.theme.texture), sidebarEffect: normalizeSidebarEffect(loaded.theme.sidebarEffect) } : null;
        // The builder always has something to edit: start from a neutral base when nothing is saved yet.
        const base = PREMIUM_STARTERS.find((st) => st.style === 'darkMode') ?? PREMIUM_STARTERS[0];
        const shown = loadedTheme ?? (mode === 'create' ? { ...themeFromStarter(base), name: 'My premium theme' } : null);
        setEnabled(Boolean(loaded?.enabled));
        setTheme(shown);
        setSavedSnap(JSON.stringify({ enabled: Boolean(loaded?.enabled), theme: shown }));
      })
      .catch(() => {
        if (!cancelled) message.error('Failed to load the premium theme');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [groupId, mode]);

  const patch = (p: Partial<PremiumTheme>) => setTheme((t) => (t ? { ...t, ...p } : t));
  const setColor = (key: keyof InterfaceColors, value: string) => setTheme((t) => (t ? { ...t, interfaceColors: { ...t.interfaceColors, [key]: value } } : t));

  const handleSave = async () => {
    if (enabled && !theme) {
      message.error('Pick a starter theme first');
      return;
    }
    setSaving(true);
    try {
      const saved = await premiumThemeService.save({ enabled, theme }, groupId);
      setEnabled(saved.enabled);
      setTheme(saved.theme);
      setSavedSnap(JSON.stringify({ enabled: saved.enabled, theme: saved.theme }));
      message.success(saved.enabled ? 'Premium theme saved and switched on' : 'Premium theme saved');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to save the premium theme');
    } finally {
      setSaving(false);
    }
  };

  const dirty = !loading && JSON.stringify({ enabled, theme }) !== savedSnap;
  const visibleStarters = useMemo(() => {
    const q = starterQuery.trim().toLowerCase();
    return q ? PREMIUM_STARTERS.filter((s) => `${s.name} ${s.tagline} ${DESIGN_STYLE_META[s.style].label}`.toLowerCase().includes(q)) : PREMIUM_STARTERS;
  }, [starterQuery]);
  const pickStarter = (starter: PremiumStarter) => setTheme(themeFromStarter(starter));

  /** Re-derives the page colors from the base palette, discarding individual tweaks. */
  const rederive = () => theme && patch({ interfaceColors: deriveInterfaceColors(theme) });

  const grouped = useMemo(() => {
    const described = new Set<string>();
    const groups = new Map<string, { key: keyof InterfaceColors; label: string; selector: string }[]>();
    for (const el of GHL_ELEMENTS) {
      if (described.has(el.key)) continue;
      described.add(el.key);
      groups.set(el.group, [...(groups.get(el.group) ?? []), { key: el.key, label: el.label, selector: el.selector }]);
    }
    const core = (Object.keys(theme?.interfaceColors ?? {}) as (keyof InterfaceColors)[])
      .filter((k) => !described.has(k))
      .map((k) => ({ key: k, label: humanize(k), selector: '' }));
    if (core.length) groups.set('Core & other', core);
    return groups;
  }, [theme?.interfaceColors]);

  const needle = filter.trim().toLowerCase();
  const textureKeys = theme ? Object.keys(DEFAULT_TEXTURE[theme.style] as unknown as Record<string, number>) : [];
  const effect = theme?.sidebarEffect;

  const starterGallery = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 20, padding: '6px 4px' }}>
      {visibleStarters.map((s) => {
        const selected = theme?.name === s.name && theme.style === s.style;
        return (
          <button
            key={s.name}
            type="button"
            aria-pressed={selected}
            onClick={() => pickStarter(s)}
            className="premium-starter"
            style={{
              ['--glow' as string]: s.primary,
              textAlign: 'left',
              font: 'inherit',
              cursor: 'pointer',
              borderRadius: 22,
              padding: 12,
              background: 'linear-gradient(180deg, #ffffff, #fbf9f7)',
              border: `1.5px solid ${selected ? s.primary : '#ece7e3'}`,
              boxShadow: selected ? `0 0 0 4px ${s.primary}33, 0 18px 36px ${s.primary}33` : '0 1px 2px rgba(31,25,20,0.04)',
              position: 'relative',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
            }}
          >
            <StarterArt s={s} />
            {selected && (
              <span style={{ position: 'absolute', top: 22, right: 22, display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px 3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: '#fff', color: '#26201d', boxShadow: '0 2px 10px rgba(0,0,0,0.25)' }}>
                <CheckCircleFilled style={{ color: s.primary }} /> Selected
              </span>
            )}
            <div style={{ padding: '14px 6px 4px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 16.5, fontWeight: 700, color: '#1f1914', letterSpacing: -0.2 }}>
                  <span style={{ marginRight: 6, opacity: 0.8 }}>{DESIGN_STYLE_META[s.style].icon}</span>
                  {s.name}
                </div>
                <div style={{ fontSize: 13, color: '#8a817a', marginTop: 2 }}>{s.tagline}</div>
              </div>
              <div style={{ display: 'flex', paddingTop: 3, flexShrink: 0 }}>
                {[s.primary, s.accent, s.secondary, s.bg].map((c, i) => (
                  <span key={i} style={{ width: 16, height: 16, borderRadius: '50%', background: c, border: '2px solid #fff', boxShadow: '0 0 0 1px rgba(0,0,0,0.12)', marginLeft: i ? -6 : 0 }} />
                ))}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );

  const paletteTab = theme ? (
    <Space direction="vertical" size="small" style={{ width: '100%', maxWidth: 560 }}>
      <Row label="Theme name">
        <Input style={{ width: 220 }} maxLength={60} value={theme.name} onChange={(e) => patch({ name: e.target.value })} />
      </Row>
      <Row label="Design style">
        <Select
          style={{ width: 220 }}
          value={theme.style}
          onChange={(style: DesignStyle) => patch({ style })}
          options={(Object.keys(DESIGN_STYLE_META) as DesignStyle[]).map((k) => ({ value: k, label: `${DESIGN_STYLE_META[k].icon} ${DESIGN_STYLE_META[k].label}` }))}
        />
      </Row>
      <Row label="Corner roundness (sidebar items)">
        <Select
          style={{ width: 220 }}
          value={theme.borderRadius}
          onChange={(borderRadius: BorderRadiusStyle) => patch({ borderRadius })}
          options={[{ value: 'sharp', label: 'Sharp' }, { value: 'soft', label: 'Soft' }, { value: 'rounded', label: 'Rounded' }, { value: 'pill', label: 'Pill' }]}
        />
      </Row>
      {(['primary', 'secondary', 'accent', 'bg', 'text', 'border'] as const).map((k) => (
        <Row key={k} label={{ primary: 'Primary', secondary: 'Secondary (sidebar)', accent: 'Accent', bg: 'Background', text: 'Text', border: 'Border' }[k]}>
          <ColorField label={k} value={theme[k]} onChange={(v) => patch({ [k]: v })} />
        </Row>
      ))}
      <Button onClick={rederive}>Recalculate page colors from this palette</Button>
      <Typography.Text type="secondary">This overwrites any individual page colors you changed.</Typography.Text>
    </Space>
  ) : null;

  const textureTab = theme ? (
    <Space direction="vertical" size="small" style={{ width: '100%', maxWidth: 560 }}>
      <Typography.Text type="secondary">Fine-tune the {DESIGN_STYLE_META[theme.style].label} look.</Typography.Text>
      {textureKeys.map((k) => {
        const group = theme.texture[theme.style] as unknown as Record<string, number>;
        return (
          <Row key={k} label={humanize(k)}>
            <InputNumber
              style={{ width: 110 }}
              step={Math.abs(group[k]) < 3 ? 0.05 : 1}
              min={-500}
              max={1000}
              value={group[k]}
              onChange={(v) => v !== null && setTheme((t) => (t ? { ...t, texture: { ...t.texture, [t.style]: { ...(t.texture[t.style] as object), [k]: v } } as PremiumTheme['texture'] } : t))}
            />
          </Row>
        );
      })}
    </Space>
  ) : null;

  const setEffect = (p: Partial<typeof DEFAULT_SIDEBAR_EFFECT>) => theme && patch({ sidebarEffect: { ...theme.sidebarEffect, ...p } });
  const sidebarTab = theme && effect ? (
    <Space direction="vertical" size="small" style={{ width: '100%', maxWidth: 560 }}>
      <Row label="Sidebar item style">
        <Select
          style={{ width: 220 }}
          value={effect.style}
          onChange={(style: SidebarEffectStyle) => setEffect({ style })}
          options={(Object.keys(SIDEBAR_EFFECT_META) as SidebarEffectStyle[]).map((k) => ({ value: k, label: `${SIDEBAR_EFFECT_META[k].icon} ${SIDEBAR_EFFECT_META[k].label}` }))}
        />
      </Row>
      {effect.style !== 'inherit' ? (
        <>
          <Row label="Text color">
            <ColorField label="sidebar text" value={effect.textColor} onChange={(textColor) => setEffect({ textColor })} />
          </Row>
          <Row label="Active item text color">
            <ColorField label="active text" value={effect.activeTextColor} onChange={(activeTextColor) => setEffect({ activeTextColor })} />
          </Row>
          {effect.style === 'threeDBox' ? (
            <>
              <Row label="Depth"><Slider style={{ width: 200 }} min={0} max={12} value={effect.threeDBox.depth} onChange={(depth) => setEffect({ threeDBox: { ...effect.threeDBox, depth } })} /></Row>
              <Row label="Outline weight"><Slider style={{ width: 200 }} min={0} max={6} value={effect.threeDBox.outlineWeight} onChange={(outlineWeight) => setEffect({ threeDBox: { ...effect.threeDBox, outlineWeight } })} /></Row>
            </>
          ) : null}
          {effect.style === 'glass' ? (
            <>
              <Row label="Blur"><Slider style={{ width: 200 }} min={0} max={40} value={effect.glass.blurAmount} onChange={(blurAmount) => setEffect({ glass: { ...effect.glass, blurAmount } })} /></Row>
              <Row label="Opacity"><Slider style={{ width: 200 }} min={0} max={1} step={0.02} value={effect.glass.opacity} onChange={(opacity) => setEffect({ glass: { ...effect.glass, opacity } })} /></Row>
            </>
          ) : null}
          {effect.style === 'bordered' ? (
            <>
              <Row label="Border weight"><Slider style={{ width: 200 }} min={0} max={6} value={effect.bordered.borderWeight} onChange={(borderWeight) => setEffect({ bordered: { ...effect.bordered, borderWeight } })} /></Row>
              <Row label="Corner radius"><Slider style={{ width: 200 }} min={0} max={30} value={effect.bordered.cornerRadius} onChange={(cornerRadius) => setEffect({ bordered: { ...effect.bordered, cornerRadius } })} /></Row>
            </>
          ) : null}
          {effect.style === 'neumorphic' ? (
            <>
              <Row label="Shadow distance"><Slider style={{ width: 200 }} min={0} max={20} value={effect.neumorphic.shadowDistance} onChange={(shadowDistance) => setEffect({ neumorphic: { ...effect.neumorphic, shadowDistance } })} /></Row>
              <Row label="Shadow blur"><Slider style={{ width: 200 }} min={0} max={40} value={effect.neumorphic.shadowBlur} onChange={(shadowBlur) => setEffect({ neumorphic: { ...effect.neumorphic, shadowBlur } })} /></Row>
            </>
          ) : null}
          {effect.style === 'clay' ? (
            <>
              <Row label="Inner shadow"><Slider style={{ width: 200 }} min={0} max={30} value={effect.clay.innerShadowDepth} onChange={(innerShadowDepth) => setEffect({ clay: { ...effect.clay, innerShadowDepth } })} /></Row>
              <Row label="Outer shadow"><Slider style={{ width: 200 }} min={0} max={40} value={effect.clay.outerShadowDepth} onChange={(outerShadowDepth) => setEffect({ clay: { ...effect.clay, outerShadowDepth } })} /></Row>
            </>
          ) : null}
        </>
      ) : (
        <Typography.Text type="secondary">The sidebar follows the design style.</Typography.Text>
      )}
    </Space>
  ) : null;

  const colorsTab = theme ? (
    <div>
      <Input.Search allowClear placeholder="Find a color, e.g. button, calendar, table" style={{ maxWidth: 360, marginBottom: 12 }} value={filter} onChange={(e) => setFilter(e.target.value)} />
      <Collapse
        defaultActiveKey={needle ? [...grouped.keys()] : ['Core & other']}
        key={needle ? 'filtered' : 'all'}
        items={[...grouped.entries()]
          .map(([name, items]) => ({ name, items: items.filter((i) => !needle || i.label.toLowerCase().includes(needle) || name.toLowerCase().includes(needle)) }))
          .filter((g) => g.items.length > 0)
          .map((g) => ({
            key: g.name,
            label: `${g.name} (${g.items.length})`,
            children: g.items.map((i) => (
              <Row key={i.key} label={i.label} hint={i.selector}>
                <ColorField label={i.label} value={theme.interfaceColors[i.key]} onChange={(v) => setColor(i.key, v)} />
              </Row>
            )),
          }))}
      />
    </div>
  ) : null;

  const needTheme = <Alert type="info" showIcon message="Pick a starting look on the page first." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 84 }}>
      <style>{`
        .premium-starter:hover { transform: translateY(-5px); box-shadow: 0 22px 40px color-mix(in srgb, var(--glow) 28%, transparent), 0 4px 10px rgba(31,25,20,0.08) !important; }
        .premium-starter:focus-visible { outline: 2px solid #26201d; outline-offset: 2px; }
        .premium-strip::-webkit-scrollbar { height: 6px; }
        .premium-strip::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.25); border-radius: 3px; }
        @media (max-width: 900px) { .premium-hero { grid-template-columns: minmax(0, 1fr) !important; } }
      `}</style>

      {/* Hero: what's selected right now */}
      <section
        style={{
          borderRadius: 22,
          padding: 28,
          background: theme
            ? `linear-gradient(135deg, ${theme.primary}1a, ${theme.accent}0a 60%, #fff)`
            : 'linear-gradient(135deg, #f3effc, #fff 60%)',
          border: '1px solid #ece7e3',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)',
          gap: 32,
          alignItems: 'center',
        }}
        className="premium-hero"
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#6d4fd6' }}>
              <CrownOutlined /> {mode === 'create' ? 'Create a premium theme' : 'Premium themes'}
            </span>
            {theme && <span style={{ fontSize: 12, color: '#6b625b' }}>{DESIGN_STYLE_META[theme.style].label} style</span>}
          </div>
          <h1 style={{ margin: 0, fontSize: 32, lineHeight: 1.15, fontWeight: 750, color: '#1f1914' }}>
            {loading ? 'Loading…' : theme ? theme.name : 'Choose a look'}
          </h1>
          <p style={{ margin: '10px 0 18px', maxWidth: 460, fontSize: 14.5, lineHeight: 1.55, color: '#6b625b' }}>
            {theme
              ? mode === 'create'
                ? 'Build it piece by piece: style, palette, texture, sidebar and page colors. The preview updates as you go.'
                : 'Fine-tune the palette, texture, sidebar and page colors, then save.'
              : 'Restyle GHL with a full design movement: glass, neon, clay and more. Pick a starting look below, then adjust anything.'}
          </p>
          {theme && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
              {[theme.primary, theme.secondary, theme.accent, theme.bg, theme.text].map((c, i) => (
                <span key={i} style={{ width: 28, height: 28, borderRadius: 9, background: c, border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 6px rgba(0,0,0,0.12)' }} />
              ))}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            {mode === 'browse' && <button
              type="button"
              disabled={!theme}
              onClick={() => setDrawerOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                borderRadius: 11,
                border: 'none',
                cursor: theme ? 'pointer' : 'not-allowed',
                opacity: theme ? 1 : 0.5,
                fontSize: 14,
                fontWeight: 600,
                color: '#fff',
                background: 'linear-gradient(135deg, #7c5ce6, #5b3fc4)',
                boxShadow: '0 8px 18px rgba(91,63,196,0.3)',
              }}
            >
              <SlidersOutlined /> Customize
            </button>}
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 600, color: '#26201d', cursor: 'pointer' }}>
              <Switch checked={enabled} onChange={setEnabled} aria-label="Use a premium theme" />
              {enabled ? 'Premium theme on' : 'Premium theme off'}
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#8a817a' }}>
              <GroupSelector value={groupId} onChange={setGroupId} />
            </div>
          </div>
        </div>
        {theme ? (
          <div style={{ borderRadius: 14, overflow: 'hidden', boxShadow: '0 20px 44px rgba(31,25,20,0.16)' }}>
            <div style={{ zoom: 1.2 }}>
              <Preview theme={theme} />
            </div>
          </div>
        ) : (
          <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#8a817a', border: '1.5px dashed #d9d1ca', borderRadius: 16 }}>
            Choose a look below to preview it
          </div>
        )}
      </section>

      {enabled ? <Alert type="info" showIcon message="While this is on, it replaces the classic theme for everyone it applies to." /> : null}

      {mode === 'create' ? (
        <section style={{ borderRadius: 20, border: '1px solid #ece7e3', background: '#fff', padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 4 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1f1914' }}>Design your theme</h2>
            <Select
              showSearch
              placeholder="Start from a ready-made look"
              style={{ width: 260 }}
              optionFilterProp="label"
              value={undefined}
              onChange={(name: string) => {
                const st = PREMIUM_STARTERS.find((x) => x.name === name);
                if (st) pickStarter(st);
              }}
              options={PREMIUM_STARTERS.map((st) => ({ value: st.name, label: `${DESIGN_STYLE_META[st.style].icon} ${st.name}` }))}
            />
          </div>
          <p style={{ margin: '0 0 18px', fontSize: 13, color: '#8a817a' }}>Choose a design movement, then tune every part of it below.</p>

          {theme && (
            <div role="radiogroup" aria-label="Design style" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
              {(Object.keys(DESIGN_STYLE_META) as DesignStyle[]).map((k) => {
                const active = theme.style === k;
                const sample: PremiumStarter = { name: DESIGN_STYLE_META[k].label, tagline: '', style: k, primary: theme.primary, secondary: theme.secondary, accent: theme.accent, bg: theme.bg, text: theme.text, border: theme.border };
                return (
                  <button
                    key={k}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => patch({ style: k })}
                    className="premium-starter"
                    style={{
                      ['--glow' as string]: theme.primary,
                      textAlign: 'left',
                      font: 'inherit',
                      cursor: 'pointer',
                      padding: 8,
                      borderRadius: 16,
                      background: '#fff',
                      border: `1.5px solid ${active ? theme.primary : '#ece7e3'}`,
                      boxShadow: active ? `0 0 0 4px ${theme.primary}26` : 'none',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    }}
                  >
                    <StarterArt s={sample} height={104} />
                    <div style={{ padding: '8px 4px 2px', fontSize: 13.5, fontWeight: active ? 700 : 600, color: '#1f1914', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{DESIGN_STYLE_META[k].icon}</span>
                      {DESIGN_STYLE_META[k].label}
                      {active && <CheckCircleFilled style={{ marginLeft: 'auto', color: theme.primary }} />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <Tabs
            items={[
              { key: 'palette', label: 'Palette', children: paletteTab ?? needTheme },
              { key: 'texture', label: 'Texture', children: textureTab ?? needTheme },
              { key: 'sidebar', label: 'Sidebar', children: sidebarTab ?? needTheme },
              { key: 'colors', label: 'Page colors', children: colorsTab ?? needTheme },
            ]}
          />
        </section>
      ) : (
        <>
      {/* Toolbar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '10px 12px 10px 16px',
          borderRadius: 14,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(8px)',
          border: '1px solid #ece7e3',
        }}
      >
        <span style={{ fontSize: 13, color: '#8a817a' }}>
          All looks · {visibleStarters.length} theme{visibleStarters.length === 1 ? '' : 's'}
        </span>
        <Input
          allowClear
          value={starterQuery}
          onChange={(e) => setStarterQuery(e.target.value)}
          prefix={<SearchOutlined style={{ color: '#a39a93' }} />}
          placeholder="Search looks"
          style={{ width: 200, borderRadius: 10 }}
        />
      </div>

      {loading ? <div style={{ height: 160 }} /> : visibleStarters.length === 0 ? <Empty description="No looks match your search" style={{ padding: '48px 0' }} /> : starterGallery}

        </>
      )}

      {/* Floating save bar */}
      <div
        style={{
          position: 'fixed',
          left: '50%',
          bottom: 20,
          transform: 'translateX(-50%)',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '8px 8px 8px 20px',
          borderRadius: 999,
          background: '#1f1914',
          color: '#fff',
          boxShadow: '0 14px 34px rgba(0,0,0,0.3)',
          fontSize: 13.5,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: dirty ? '#f5a524' : '#3ccf91' }} />
          {theme ? `${theme.name} · ${enabled ? 'on' : 'off'}` : 'No theme selected'}
          <span style={{ opacity: 0.6 }}>{dirty ? '· Unsaved changes' : '· All changes saved'}</span>
        </span>
        <Button type="primary" shape="round" size="large" loading={saving} disabled={!dirty} onClick={() => void handleSave()} style={{ fontWeight: 600, ...(dirty ? {} : { background: 'rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.6)', borderColor: 'transparent' }) }}>
          Save premium theme
        </Button>
      </div>

      {mode === 'browse' && (
      <Drawer
        title={theme ? `Customize ${theme.name}` : 'Customize'}
        placement="right"
        width={560}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        destroyOnClose={false}
        mask={false}
        extra={theme ? <Button size="small" onClick={rederive}>Recalculate page colors</Button> : null}
      >
        <Tabs
          items={[
            { key: 'palette', label: 'Palette', children: paletteTab ?? needTheme },
            { key: 'texture', label: 'Texture', children: textureTab ?? needTheme },
            { key: 'sidebar', label: 'Sidebar', children: sidebarTab ?? needTheme },
            { key: 'colors', label: 'Page colors', children: colorsTab ?? needTheme },
          ]}
        />
      </Drawer>
      )}
    </div>
  );
}
