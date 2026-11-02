import { useEffect, useState } from 'react';
import { AutoComplete, Button, Input, Segmented, Slider, message } from 'antd';
import { BgColorsOutlined } from '@ant-design/icons';
import { GroupSelector } from '../../../components/GroupSelector';
import { themeService } from '../../../services/themeService';
import { emptyTheme, ShadowIntensity, Theme } from '../../../types/theme';
import { useBrandTheme } from '../../../context/BrandThemeContext';
import { withAlpha } from '../../../utils/colorUtils';
import { ColorRulesTable } from './ColorRulesTable';
import { GradientEditor } from './GradientEditor';
import { ThemePreview, themeSwatches } from './ThemeCard';
import type { EditorGroupProps } from './editorTypes';

const SHADOW_OPTIONS: { value: ShadowIntensity; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
];

const FONT_SUGGESTIONS = ['Inter', 'Poppins', 'Roboto', 'Montserrat', 'Playfair Display', 'Open Sans', 'Lato', 'DM Sans'].map((f) => ({ value: f }));

const PAGE_CSS = `
@media (max-width: 1100px) { .myo-layout { grid-template-columns: minmax(0, 1fr) !important; } .myo-aside { position: static !important; } }
@media (max-width: 760px) { .myo-rule-fields { grid-template-columns: minmax(0, 1fr) !important; } }
`;

const card: React.CSSProperties = { borderRadius: 20, border: '1px solid #ece7e3', background: '#fff', padding: 22 };

function Section({ title, hint, count, children }: { title: string; hint: string; count?: number; children: React.ReactNode }) {
  return (
    <section style={card}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1f1914' }}>{title}</h2>
        {count !== undefined && <span style={{ fontSize: 12, fontWeight: 600, padding: '1px 9px', borderRadius: 999, background: '#f1ede9', color: '#6b625b' }}>{count}</span>}
      </div>
      <p style={{ margin: '2px 0 18px', fontSize: 13, color: '#8a817a', maxWidth: 620 }}>{hint}</p>
      {children}
    </section>
  );
}

function Field({ label, children, aside }: { label: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#3d3530' }}>{label}</span>
        {aside}
      </div>
      {children}
    </div>
  );
}

export function ClassicThemeEditor({ groupId: groupIdProp, onGroupChange }: EditorGroupProps) {
  const [localGroupId, setLocalGroupId] = useState<string | undefined>(undefined);
  // Controlled by the Make Your Own switcher when it passes onGroupChange, otherwise local.
  const groupId = onGroupChange ? groupIdProp : localGroupId;
  const setGroupId = onGroupChange ?? setLocalGroupId;
  const [theme, setTheme] = useState<Theme>(emptyTheme);
  const [savedSnap, setSavedSnap] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { setActiveTheme } = useBrandTheme();

  // Preview the customizer chrome in the theme's brand color as it's edited,
  // but not before the real theme has finished loading (avoids a flash of red-wine).
  useEffect(() => {
    if (!loading) setActiveTheme(theme);
  }, [theme, loading, setActiveTheme]);

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

  const dirty = !loading && JSON.stringify(theme) !== savedSnap;
  const swatches = themeSwatches(theme);
  const radiusPx = Math.min(parseInt(theme.borderRadius, 10) || 0, 32);

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await themeService.save(theme, groupId);
      setTheme(saved);
      setSavedSnap(JSON.stringify(saved));
      message.success('Theme saved');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to save theme');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 84 }}>
      <style>{PAGE_CSS}</style>

      {/* Hero */}
      <section
        style={{
          borderRadius: 22,
          padding: '24px 28px',
          border: '1px solid #ece7e3',
          background: `linear-gradient(135deg, ${withAlpha(swatches[0], 0.12)}, ${withAlpha(swatches[1] ?? swatches[0], 0.05)} 60%, #fff)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ minWidth: 0, flex: '1 1 380px' }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#6b625b', marginBottom: 8 }}>
            <BgColorsOutlined /> Make your own
          </div>
          <input
            aria-label="Theme name"
            value={theme.themeName}
            onChange={(e) => setTheme({ ...theme, themeName: e.target.value })}
            placeholder="Name your theme"
            style={{ width: '100%', maxWidth: 520, border: 'none', borderBottom: '2px dashed #d9d1ca', background: 'transparent', outline: 'none', fontSize: 32, fontWeight: 750, color: '#1f1914', padding: '2px 0' }}
          />
          <p style={{ margin: '10px 0 14px', fontSize: 14, color: '#6b625b', maxWidth: 520 }}>
            Design the colour palette, gradients and typography used across the embedded app's chrome.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            {swatches.map((c, i) => (
              <span key={i} style={{ width: 26, height: 26, borderRadius: 8, background: c, border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 2px 6px rgba(0,0,0,0.12)' }} />
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#8a817a' }}>
          <GroupSelector value={groupId} onChange={setGroupId} />
        </div>
      </section>

      <div className="myo-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 20, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0, opacity: loading ? 0.6 : 1 }}>
          <Section title="Brand" hint="Fonts, corner roundness and depth.">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
              <Field label="Heading font">
                <AutoComplete
                  style={{ width: '100%' }}
                  options={FONT_SUGGESTIONS}
                  value={theme.fonts.heading}
                  onChange={(heading) => setTheme({ ...theme, fonts: { ...theme.fonts, heading } })}
                >
                  <Input aria-label="Heading font" />
                </AutoComplete>
              </Field>
              <Field label="Body font">
                <AutoComplete
                  style={{ width: '100%' }}
                  options={FONT_SUGGESTIONS}
                  value={theme.fonts.body}
                  onChange={(body) => setTheme({ ...theme, fonts: { ...theme.fonts, body } })}
                >
                  <Input aria-label="Body font" />
                </AutoComplete>
              </Field>
              <Field label="Border radius" aside={<span style={{ fontSize: 12, fontWeight: 700 }}>{theme.borderRadius || '0px'}</span>}>
                <Slider min={0} max={32} value={radiusPx} onChange={(v) => setTheme({ ...theme, borderRadius: `${v}px` })} style={{ margin: '6px 4px' }} />
              </Field>
              <Field label="Shadow intensity">
                <Segmented block value={theme.shadowIntensity} options={SHADOW_OPTIONS} onChange={(v) => setTheme({ ...theme, shadowIntensity: v as ShadowIntensity })} />
              </Field>
            </div>
          </Section>

          <Section title="Color rules" count={theme.colorRules.length} hint="Map a CSS selector and property inside the embedded app to a colour. The runtime injector replays these as a stylesheet.">
            <ColorRulesTable rules={theme.colorRules} onChange={(colorRules) => setTheme({ ...theme, colorRules })} />
          </Section>

          <Section title="Gradients" count={theme.gradients.length} hint="Give the header, sidebar or buttons a gradient fill.">
            <GradientEditor gradients={theme.gradients} onChange={(gradients) => setTheme({ ...theme, gradients })} />
          </Section>
        </div>

        <aside className="myo-aside" style={{ ...card, position: 'sticky', top: 16, padding: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: '#a39a93', marginBottom: 12 }}>LIVE PREVIEW</div>
          <ThemePreview theme={theme} height={190} />
          <div style={{ marginTop: 14, fontSize: 15, fontWeight: 700, color: '#1f1914' }}>{theme.themeName || 'Untitled theme'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
            {swatches.map((c, i) => (
              <span key={i} style={{ width: 20, height: 20, borderRadius: 7, background: c, border: '1px solid rgba(0,0,0,0.12)' }} />
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 12.5, color: '#8a817a', lineHeight: 1.6 }}>
            {theme.fonts.heading} / {theme.fonts.body} · radius {theme.borderRadius} · shadow {theme.shadowIntensity}
          </div>
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
          Save theme
        </Button>
      </div>
    </div>
  );
}
