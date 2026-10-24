import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Collapse, Input, InputNumber, Select, Slider, Space, Switch, Tabs, Typography, message } from 'antd';
import { CrownOutlined } from '@ant-design/icons';
import { PageIntro } from '../../../components/PageIntro';
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
    <div style={{ display: 'flex', height: 190, borderRadius: 10, overflow: 'hidden', border: `1px solid ${theme.border}`, background: c.dashboardBg }}>
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
        <div style={{ padding: '0 10px' }}>
          <span style={{ display: 'inline-block', fontSize: 10, padding: '4px 10px', borderRadius: 6, background: c.primaryButtonBg, color: readableOn(c.primaryButtonBg) }}>Primary action</span>
        </div>
      </div>
    </div>
  );
}

export function PremiumThemePage() {
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [enabled, setEnabled] = useState(false);
  const [theme, setTheme] = useState<PremiumTheme | null>(null);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    premiumThemeService
      .get(groupId)
      .then((loaded) => {
        if (cancelled) return;
        setEnabled(Boolean(loaded?.enabled));
        setTheme(loaded?.theme ? { ...loaded.theme, texture: normalizeTexture(loaded.theme.texture), sidebarEffect: normalizeSidebarEffect(loaded.theme.sidebarEffect) } : null);
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
  }, [groupId]);

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
      message.success(saved.enabled ? 'Premium theme saved and switched on' : 'Premium theme saved');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to save the premium theme');
    } finally {
      setSaving(false);
    }
  };

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

  const startTab = (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Space align="center">
        <Switch checked={enabled} onChange={setEnabled} />
        <Typography.Text>Use a premium theme</Typography.Text>
      </Space>
      {enabled ? <Alert type="info" showIcon message="While this is on, it replaces the classic theme for everyone it applies to." /> : null}
      <div className="flex flex-wrap gap-4">
        {PREMIUM_STARTERS.map((s) => {
          const selected = theme?.name === s.name && theme.style === s.style;
          return (
            <div
              key={s.name}
              role="button"
              tabIndex={0}
              aria-pressed={selected}
              onClick={() => pickStarter(s)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  pickStarter(s);
                }
              }}
              style={{ width: 170, cursor: 'pointer', borderRadius: 10, padding: 6, border: selected ? '2px solid #1677ff' : '2px solid transparent', background: selected ? '#e6f4ff' : 'transparent' }}
            >
              <div style={{ height: 80, borderRadius: 8, background: s.bg, border: `1px solid ${s.border}`, display: 'flex', overflow: 'hidden' }}>
                <div style={{ width: '28%', background: s.secondary }} />
                <div style={{ flex: 1, padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ height: 10, width: '60%', borderRadius: 4, background: s.primary }} />
                  <div style={{ height: 10, width: '40%', borderRadius: 4, background: s.accent }} />
                </div>
              </div>
              <Typography.Text strong style={{ display: 'block', marginTop: 6 }}>
                {DESIGN_STYLE_META[s.style].icon} {s.name}
              </Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {s.tagline}
              </Typography.Text>
            </div>
          );
        })}
      </div>
    </Space>
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

  const needTheme = <Alert type="info" showIcon message="Pick a starter theme on the first tab to begin." />;

  return (
    <div className="pt-4">
      <PageIntro
        icon={<CrownOutlined />}
        description="Premium themes restyle GHL with a full design movement: glass, neon, clay and more. Start from a ready-made look, then adjust anything."
        groupId={groupId}
        onGroupChange={setGroupId}
      />
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        {theme ? (
          <Card title="Preview" size="small" loading={loading}>
            <Preview theme={theme} />
          </Card>
        ) : null}
        <Card loading={loading}>
          <Tabs
            items={[
              { key: 'start', label: 'Start', children: startTab },
              { key: 'palette', label: 'Palette', children: paletteTab ?? needTheme },
              { key: 'texture', label: 'Texture', children: textureTab ?? needTheme },
              { key: 'sidebar', label: 'Sidebar', children: sidebarTab ?? needTheme },
              { key: 'colors', label: 'Page colors', children: colorsTab ?? needTheme },
            ]}
          />
        </Card>
        <div className="flex justify-end">
          <Button type="primary" size="large" loading={saving} onClick={() => void handleSave()}>
            Save premium theme
          </Button>
        </div>
      </Space>
    </div>
  );
}
