import { useEffect, useState } from 'react';
import { Button, Select, Segmented, Slider, Switch, message } from 'antd';
import {
  CalendarFilled,
  CalendarOutlined,
  CalendarTwoTone,
  ContactsFilled,
  ContactsOutlined,
  ContactsTwoTone,
  DashboardFilled,
  DashboardOutlined,
  DashboardTwoTone,
  DownOutlined,
  LayoutOutlined,
  MessageFilled,
  MessageOutlined,
  MessageTwoTone,
  ShopFilled,
  ShopOutlined,
  ShopTwoTone,
  UndoOutlined,
} from '@ant-design/icons';
import { GroupSelector } from '../../../components/GroupSelector';
import { themeService } from '../../../services/themeService';
import { defaultSidebarStyle, emptyTheme, SidebarHoverEffect, SidebarIconStyle, SidebarStyle, Theme } from '../../../types/theme';
import { withAlpha } from '../../../utils/colorUtils';

const FONT_OPTIONS = ['Default', 'Inter', 'Poppins', 'Playfair Display', 'Roboto', 'Montserrat'].map((f) => ({ value: f, label: f }));

const ICON_STYLE_OPTIONS: { value: SidebarIconStyle; label: string }[] = [
  { value: 'outline', label: 'Outline' },
  { value: 'bold', label: 'Bold' },
  { value: 'line', label: 'Line' },
  { value: 'duotone', label: 'Duotone' },
];

const HOVER_EFFECT_OPTIONS: { value: SidebarHoverEffect; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'slide', label: 'Slide' },
  { value: 'fade', label: 'Fade' },
  { value: 'scale', label: 'Scale' },
  { value: 'glow', label: 'Glow' },
];

const NAV = [
  { label: 'Dashboard', icons: { outline: DashboardOutlined, bold: DashboardFilled, duotone: DashboardTwoTone } },
  { label: 'Conversations', icons: { outline: MessageOutlined, bold: MessageFilled, duotone: MessageTwoTone } },
  { label: 'Calendars', icons: { outline: CalendarOutlined, bold: CalendarFilled, duotone: CalendarTwoTone } },
  { label: 'Contacts', icons: { outline: ContactsOutlined, bold: ContactsFilled, duotone: ContactsTwoTone } },
  { label: 'Opportunities', icons: { outline: ShopOutlined, bold: ShopFilled, duotone: ShopTwoTone } },
] as const;

const PAGE_CSS = `
.sb-chip-row .ant-segmented { background: #f3efeb; }
@media (max-width: 1100px) { .sb-layout { grid-template-columns: minmax(0, 1fr) !important; } .sb-aside { position: static !important; } }
`;

const card: React.CSSProperties = { borderRadius: 20, border: '1px solid #ece7e3', background: '#fff', padding: 22 };

function Group({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section style={card}>
      <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#1f1914' }}>{title}</h2>
      <p style={{ margin: '2px 0 18px', fontSize: 13, color: '#8a817a' }}>{hint}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>{children}</div>
    </section>
  );
}

function Field({ label, children, aside }: { label: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#3d3530' }}>{label}</span>
        {aside}
      </div>
      {children}
    </div>
  );
}

function ColorField({ label, value, fallback, onChange }: { label: string; value: string; fallback: string; onChange: (v: string) => void }) {
  return (
    <Field
      label={label}
      aside={
        value ? (
          <button type="button" onClick={() => onChange('')} style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', fontSize: 12, color: '#6b625b', display: 'flex', alignItems: 'center', gap: 4 }}>
            <UndoOutlined /> Reset
          </button>
        ) : (
          <span style={{ fontSize: 12, color: '#a39a93' }}>Default</span>
        )
      }
    >
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', borderRadius: 12, border: '1px solid #e6dfd9', cursor: 'pointer', background: '#fcfbfa' }}>
        <span style={{ position: 'relative', width: 26, height: 26, borderRadius: 8, background: value || fallback, border: '1px solid rgba(0,0,0,0.15)', overflow: 'hidden', flexShrink: 0 }}>
          <input
            type="color"
            aria-label={label}
            value={value || fallback}
            onChange={(e) => onChange(e.target.value)}
            style={{ position: 'absolute', inset: -6, width: 40, height: 40, opacity: 0, cursor: 'pointer' }}
          />
        </span>
        <span style={{ fontSize: 13, fontFamily: 'ui-monospace, monospace', color: value ? '#26201d' : '#a39a93' }}>{value || 'Not set'}</span>
      </label>
    </Field>
  );
}

function SliderField({ label, value, defaultValue, min, max, onChange }: { label: string; value: number; defaultValue: number; min: number; max: number; onChange: (v: number) => void }) {
  const changed = value !== defaultValue;
  return (
    <Field
      label={label}
      aside={
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
          <span style={{ fontWeight: 700, color: '#26201d' }}>{value}px</span>
          {changed ? (
            <button type="button" aria-label={`Reset ${label}`} onClick={() => onChange(defaultValue)} style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', color: '#8a817a' }}>
              <UndoOutlined />
            </button>
          ) : (
            <span style={{ color: '#a39a93' }}>default</span>
          )}
        </span>
      }
    >
      <Slider min={min} max={max} value={value} onChange={onChange} style={{ margin: '4px 6px' }} />
    </Field>
  );
}

/** The embedded app's sidebar, drawn live from the current settings. */
function SidebarPreview({ theme, s, hoverIdx, setHoverIdx }: { theme: Theme; s: SidebarStyle; hoverIdx: number | null; setHoverIdx: (i: number | null) => void }) {
  const sidebarGradient = theme.gradients.find((g) => g.target === 'sidebar') ?? theme.gradients.find((g) => g.target === 'header');
  const base = theme.colorRules[0]?.value ?? '#0f1b2d';
  const background = sidebarGradient ? `linear-gradient(${sidebarGradient.angle}deg, ${sidebarGradient.from}, ${sidebarGradient.to})` : base;
  const text = s.fontColor || '#e9edf5';
  const iconColor = s.iconColor || text;
  const hoverText = s.hoverTextColor || text;
  const hoverBg = s.hoverBackgroundColor || 'rgba(255,255,255,0.12)';
  const family = s.fontFamily && s.fontFamily !== 'Default' ? `${s.fontFamily}, system-ui, sans-serif` : 'inherit';
  const activeHover = hoverIdx ?? 1;
  const iconKey: 'outline' | 'bold' | 'duotone' = s.iconStyle === 'bold' ? 'bold' : s.iconStyle === 'duotone' ? 'duotone' : 'outline';

  const hoverStyle = (on: boolean): React.CSSProperties => {
    if (!on) return {};
    switch (s.hoverEffect) {
      case 'slide':
        return { transform: 'translateX(6px)' };
      case 'scale':
        return { transform: 'scale(1.05)' };
      case 'glow':
        return { boxShadow: `0 0 16px ${withAlpha(hoverBg.startsWith('#') ? hoverBg : '#ffffff', 0.6)}` };
      case 'fade':
        return { opacity: 0.8 };
      default:
        return {};
    }
  };

  return (
    <div style={{ width: 250, margin: '0 auto', borderRadius: 18, overflow: 'hidden', background, boxShadow: '0 24px 48px rgba(15,27,45,0.3)', padding: 12, display: 'flex', flexDirection: 'column', fontFamily: family }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: s.cornerRadius + 4, background: s.locationSwitcherColor || 'rgba(255,255,255,0.14)', color: '#fff', fontSize: s.fontSize, marginBottom: 12 }}>
        <span style={{ fontWeight: 600 }}>Acme Agency</span>
        <DownOutlined style={{ fontSize: 10 }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: s.itemSpacing }}>
        {NAV.map((n, i) => {
          const hot = i === activeHover;
          const Icon = n.icons[iconKey];
          const showHover = hot;
          return (
            <div
              key={n.label}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: s.iconLabelGap,
                padding: s.itemPadding + 2,
                borderRadius: s.cornerRadius,
                fontSize: s.fontSize,
                fontWeight: s.boldIcons ? 600 : 500,
                color: showHover ? hoverText : text,
                background: showHover ? hoverBg : 'transparent',
                transition: 'all 0.18s ease',
                cursor: 'default',
                ...hoverStyle(showHover),
              }}
            >
              <span style={{ fontSize: s.iconSize, color: iconColor, display: 'flex', lineHeight: 1, WebkitTextStroke: s.boldIcons ? '0.6px currentColor' : undefined }}>
                <Icon />
              </span>
              {n.label}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 14, alignSelf: 'flex-end', width: 5, height: 46, borderRadius: 3, background: s.scrollbarColor || 'rgba(255,255,255,0.3)' }} title="Scrollbar" />
    </div>
  );
}

export function SidebarStylingPage() {
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [theme, setTheme] = useState<Theme>(emptyTheme);
  const [savedSnap, setSavedSnap] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    themeService
      .get(groupId)
      .then((loaded) => {
        if (cancelled) return;
        const next = loaded ?? emptyTheme;
        setTheme(next);
        setSavedSnap(JSON.stringify(next));
      })
      .catch(() => {
        if (!cancelled) message.error('Failed to load theme');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [groupId]);

  const sidebar: SidebarStyle = theme.sidebarStyle ?? defaultSidebarStyle;
  const update = (patch: Partial<SidebarStyle>) => setTheme({ ...theme, sidebarStyle: { ...sidebar, ...patch } });
  const dirty = !loading && JSON.stringify(theme) !== savedSnap;
  const customised = JSON.stringify(sidebar) !== JSON.stringify(defaultSidebarStyle);

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await themeService.save(theme, groupId);
      setTheme(saved);
      setSavedSnap(JSON.stringify(saved));
      message.success('Sidebar styling saved');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to save sidebar styling');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 84 }}>
      <style>{PAGE_CSS}</style>

      {/* Hero */}
      <section style={{ borderRadius: 22, padding: '24px 28px', border: '1px solid #ece7e3', background: 'linear-gradient(135deg, #eeeafc, #f8f6ff 55%, #fff)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 15, background: 'linear-gradient(135deg, #6a5cf0, #3d2fd1)', color: '#fff', fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 22px rgba(61,47,209,0.3)' }}>
            <LayoutOutlined />
          </div>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#5b4de0' }}>Sidebar styling</div>
            <h1 style={{ margin: '2px 0 4px', fontSize: 28, fontWeight: 750, color: '#1f1914' }}>Make the sidebar yours</h1>
            <p style={{ margin: 0, fontSize: 14, color: '#6b625b', maxWidth: 520 }}>
              Style the embedded app's native sidebar: typography, icons, layout and hover states. Changes show live on the right.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#8a817a' }}>
            <GroupSelector value={groupId} onChange={setGroupId} />
          </div>
          <Button icon={<UndoOutlined />} disabled={!customised} onClick={() => update({ ...defaultSidebarStyle })} style={{ borderRadius: 10 }}>
            Reset all
          </Button>
        </div>
      </section>

      <div className="sb-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 20, alignItems: 'start' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, opacity: loading ? 0.6 : 1 }}>
          <Group title="Typography" hint="How the labels read.">
            <Field label="Font family">
              <Select value={sidebar.fontFamily} options={FONT_OPTIONS} style={{ width: '100%' }} onChange={(fontFamily) => update({ fontFamily })} />
            </Field>
            <ColorField label="Font color" value={sidebar.fontColor} fallback="#e9edf5" onChange={(fontColor) => update({ fontColor })} />
            <SliderField label="Font size" value={sidebar.fontSize} defaultValue={14} min={10} max={22} onChange={(fontSize) => update({ fontSize })} />
          </Group>

          <Group title="Icons" hint="Colour, weight and size.">
            <div className="sb-chip-row">
              <Field label="Icon style">
                <Segmented block value={sidebar.iconStyle} options={ICON_STYLE_OPTIONS} onChange={(v) => update({ iconStyle: v as SidebarIconStyle })} />
              </Field>
            </div>
            <ColorField label="Icon color" value={sidebar.iconColor} fallback="#e9edf5" onChange={(iconColor) => update({ iconColor })} />
            <SliderField label="Icon size" value={sidebar.iconSize} defaultValue={20} min={12} max={32} onChange={(iconSize) => update({ iconSize })} />
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: '#3d3530', cursor: 'pointer' }}>
              Bold icons
              <Switch checked={sidebar.boldIcons} onChange={(boldIcons) => update({ boldIcons })} aria-label="Bold icons" />
            </label>
          </Group>

          <Group title="Layout" hint="Spacing between and inside items.">
            <SliderField label="Item spacing" value={sidebar.itemSpacing} defaultValue={10} min={0} max={24} onChange={(itemSpacing) => update({ itemSpacing })} />
            <SliderField label="Item padding" value={sidebar.itemPadding} defaultValue={8} min={0} max={24} onChange={(itemPadding) => update({ itemPadding })} />
            <SliderField label="Icon ↔ label gap" value={sidebar.iconLabelGap} defaultValue={8} min={0} max={24} onChange={(iconLabelGap) => update({ iconLabelGap })} />
            <SliderField label="Corner radius" value={sidebar.cornerRadius} defaultValue={6} min={0} max={24} onChange={(cornerRadius) => update({ cornerRadius })} />
          </Group>

          <Group title="Hover & extras" hint="Interaction and finishing touches.">
            <div className="sb-chip-row">
              <Field label="Hover effect">
                <Segmented block value={sidebar.hoverEffect} options={HOVER_EFFECT_OPTIONS} onChange={(v) => update({ hoverEffect: v as SidebarHoverEffect })} />
              </Field>
            </div>
            <ColorField label="Hover text color" value={sidebar.hoverTextColor} fallback="#ffffff" onChange={(hoverTextColor) => update({ hoverTextColor })} />
            <ColorField label="Hover background color" value={sidebar.hoverBackgroundColor} fallback="#ffffff" onChange={(hoverBackgroundColor) => update({ hoverBackgroundColor })} />
            <ColorField label="Scrollbar color" value={sidebar.scrollbarColor} fallback="#ffffff" onChange={(scrollbarColor) => update({ scrollbarColor })} />
            <ColorField label="Location switcher color" value={sidebar.locationSwitcherColor} fallback="#ffffff" onChange={(locationSwitcherColor) => update({ locationSwitcherColor })} />
          </Group>
        </div>

        <aside className="sb-aside" style={{ ...card, position: 'sticky', top: 16, background: 'linear-gradient(180deg, #f6f4fb, #efecf8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: '#8a81b8' }}>LIVE PREVIEW</span>
            <span style={{ fontSize: 12, color: '#8a81b8' }}>Hover an item</span>
          </div>
          <SidebarPreview theme={theme} s={sidebar} hoverIdx={hoverIdx} setHoverIdx={setHoverIdx} />
        </aside>
      </div>

      {/* Floating save bar */}
      <div style={{ position: 'fixed', left: '50%', bottom: 20, transform: 'translateX(-50%)', zIndex: 20, display: 'flex', alignItems: 'center', gap: 14, padding: '8px 8px 8px 20px', borderRadius: 999, background: '#1f1914', color: '#fff', boxShadow: '0 14px 34px rgba(0,0,0,0.3)', fontSize: 13.5 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: dirty ? '#f5a524' : '#3ccf91' }} />
          {dirty ? 'Unsaved changes' : 'All changes saved'}
        </span>
        <Button
          type="primary"
          shape="round"
          size="large"
          loading={saving}
          disabled={!dirty}
          onClick={() => void handleSave()}
          style={{ fontWeight: 600, ...(dirty ? {} : { background: 'rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.6)', borderColor: 'transparent' }) }}
        >
          Save sidebar styling
        </Button>
      </div>
    </div>
  );
}
