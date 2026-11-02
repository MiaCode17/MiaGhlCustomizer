import { useEffect, useMemo, useState } from 'react';
import { Button, Empty, Form, Input, InputNumber, Switch, message } from 'antd';
import { CheckCircleFilled, GiftOutlined, SearchOutlined } from '@ant-design/icons';
import { GroupSelector } from '../../../components/GroupSelector';
import { specialThemeService } from '../../../services/specialThemeService';
import { CUSTOM_OCCASION_KEY, DEFAULT_CUSTOM_OCCASION, emptySpecialTheme, SpecialTheme } from '../../../types/specialTheme';
import { OccasionBuilder } from './OccasionBuilder';
import { findOccasion, OCCASIONS, OCCASION_CATEGORIES, Occasion, OccasionCategory } from '../../../utils/occasions';
import type { EditorGroupProps } from '../theme-builder/editorTypes';

type CategoryFilter = OccasionCategory | 'all';

const PAGE_CSS = `
.occ-card:hover { transform: translateY(-4px); box-shadow: 0 20px 38px color-mix(in srgb, var(--glow) 35%, transparent), 0 4px 10px rgba(31,25,20,0.08) !important; }
.occ-card:hover .occ-emoji { transform: translateX(-50%) scale(1.15) rotate(-6deg) !important; }
@keyframes occ-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
.occ-float { animation: occ-float 3.2s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .occ-float { animation: none; } }
.occ-card:focus-visible { outline: 2px solid #26201d; outline-offset: 2px; }
.occ-chips { scrollbar-width: none; }
.occ-chips::-webkit-scrollbar { display: none; }
@media (max-width: 900px) { .occ-hero { grid-template-columns: minmax(0, 1fr) !important; } .occ-forms { grid-template-columns: minmax(0, 1fr) !important; } }
`;

const panel: React.CSSProperties = { borderRadius: 20, border: '1px solid #ece7e3', background: '#fff', padding: 24 };

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600, color: '#26201d', cursor: 'pointer' }}>
      <Switch checked={checked} onChange={onChange} aria-label={label} />
      {label}
    </label>
  );
}

/** Mock of the popup the portal will show, painted with the chosen occasion. */
function PopupPreview({ occasion, theme }: { occasion?: Occasion; theme: SpecialTheme }) {
  const [a, b] = occasion?.accent ?? ['#6b625b', '#a39a93'];
  const { title, message: body, ctaText } = theme.popup;
  const particles = occasion?.particles ?? [];
  return (
    <div
      style={{
        position: 'relative',
        height: 270,
        borderRadius: 16,
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${a}, ${b})`,
        boxShadow: `0 24px 48px ${b}55`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {theme.particleEffect.enabled &&
        particles.length > 0 &&
        Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            aria-hidden
            style={{ position: 'absolute', left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`, fontSize: 14 + (i % 3) * 6, opacity: 0.5, transform: `rotate(${i * 25}deg)` }}
          >
            {particles[i % particles.length]}
          </span>
        ))}
      <div
        style={{
          position: 'relative',
          width: '68%',
          borderRadius: 16,
          padding: '20px 18px',
          textAlign: 'center',
          background: 'rgba(255,255,255,0.96)',
          boxShadow: '0 16px 36px rgba(0,0,0,0.3)',
          opacity: theme.popup.visible ? 1 : 0.55,
        }}
      >
        <div style={{ fontSize: 30, lineHeight: 1 }}>{occasion?.emoji ?? '🎁'}</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#1f1914', margin: '8px 0 4px' }}>{title || 'Popup title'}</div>
        <div style={{ fontSize: 12, lineHeight: 1.45, color: '#6b625b', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {body || 'Your message appears here.'}
        </div>
        {ctaText ? (
          <span style={{ display: 'inline-block', marginTop: 10, padding: '5px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, color: '#fff', background: `linear-gradient(135deg, ${a}, ${b})` }}>
            {ctaText}
          </span>
        ) : null}
        {!theme.popup.visible && <div style={{ marginTop: 8, fontSize: 11, color: '#a39a93' }}>Popup is off</div>}
      </div>
    </div>
  );
}

interface SpecialThemePageProps extends EditorGroupProps {
  /** 'browse' picks a predefined occasion; 'create' designs a custom one. */
  mode?: 'browse' | 'create';
}

export function SpecialThemePage({ groupId: groupIdProp, onGroupChange, mode = 'browse' }: SpecialThemePageProps = {}) {
  const [localGroupId, setLocalGroupId] = useState<string | undefined>(undefined);
  // Controlled by the Make Your Own switcher when it passes onGroupChange, otherwise local.
  const groupId = onGroupChange ? groupIdProp : localGroupId;
  const setGroupId = onGroupChange ?? setLocalGroupId;
  const [specialTheme, setSpecialTheme] = useState<SpecialTheme>(emptySpecialTheme);
  const [savedSnap, setSavedSnap] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    specialThemeService
      .get(groupId)
      .then((loaded) => {
        if (cancelled) return;
        const next = loaded ?? emptySpecialTheme;
        if (mode === 'create' && next.themeKey !== CUSTOM_OCCASION_KEY) {
          // Open the builder on a blank custom occasion; only a fresh setup counts as "saved".
          const seeded: SpecialTheme = { ...next, themeKey: CUSTOM_OCCASION_KEY, custom: next.custom ?? DEFAULT_CUSTOM_OCCASION };
          setSpecialTheme(seeded);
          setSavedSnap(JSON.stringify(next.themeKey === '' ? seeded : next));
        } else {
          setSpecialTheme(next);
          setSavedSnap(JSON.stringify(next));
        }
      })
      .catch(() => {
        if (!cancelled) message.error('Failed to load special theme');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [groupId, mode]);

  /** Picking an occasion also suggests its popup text, unless the agency has already written their own. */
  const pick = (occasion: Occasion) => {
    const previous = OCCASIONS.find((o) => o.key === specialTheme.themeKey);
    const popup = specialTheme.popup;
    const untouched =
      (!popup.title && !popup.message) || (previous && popup.title === previous.title && popup.message === previous.message);
    setSpecialTheme({
      ...specialTheme,
      themeKey: occasion.key,
      custom: undefined,
      popup: untouched ? { ...popup, title: occasion.title, message: occasion.message } : popup,
    });
  };

  const handleSave = async () => {
    if (specialTheme.themeKey === CUSTOM_OCCASION_KEY) {
      const c = specialTheme.custom;
      if (!c || !c.name.trim() || !c.emoji.trim() || c.particles.length === 0) {
        message.error('Give your occasion a name, an emoji and at least one particle');
        return;
      }
    }
    setSaving(true);
    try {
      const saved = await specialThemeService.save(specialTheme, groupId);
      setSpecialTheme(saved);
      setSavedSnap(JSON.stringify(saved));
      message.success('Special theme saved');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to save special theme');
    } finally {
      setSaving(false);
    }
  };

  const setPopup = (p: Partial<SpecialTheme['popup']>) => setSpecialTheme({ ...specialTheme, popup: { ...specialTheme.popup, ...p } });
  const setParticles = (p: Partial<SpecialTheme['particleEffect']>) =>
    setSpecialTheme({ ...specialTheme, particleEffect: { ...specialTheme.particleEffect, ...p } });

  const dirty = !loading && JSON.stringify(specialTheme) !== savedSnap;
  const custom = specialTheme.themeKey === CUSTOM_OCCASION_KEY ? specialTheme.custom : undefined;
  const selected: Occasion | undefined = custom
    ? {
        key: CUSTOM_OCCASION_KEY,
        name: custom.name || 'Untitled occasion',
        emoji: custom.emoji || '🎁',
        description: 'Your own occasion, with your colours and particles.',
        category: 'Festival',
        accent: custom.accent,
        title: '',
        message: '',
        particles: custom.particles,
      }
    : findOccasion(specialTheme.themeKey);
  const [accA, accB] = selected?.accent ?? ['#6b625b', '#a39a93'];

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return OCCASIONS.filter((o) => {
      if (category !== 'all' && o.category !== category) return false;
      return !q || `${o.name} ${o.description} ${o.category}`.toLowerCase().includes(q);
    });
  }, [category, query]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 84 }}>
      <style>{PAGE_CSS}</style>

      {/* Hero */}
      <section
        className="occ-hero"
        style={{
          borderRadius: 22,
          padding: 28,
          background: `linear-gradient(135deg, ${accB}1f, ${accA}0d 60%, #fff)`,
          border: '1px solid #ece7e3',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)',
          gap: 32,
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: accB }}>
              <GiftOutlined /> {mode === 'create' ? 'Create an occasional theme' : 'Occasional themes'}
            </span>
            {selected && !custom && <span style={{ fontSize: 12, color: '#6b625b' }}>{selected.category}</span>}
          </div>
          <h1 style={{ margin: 0, fontSize: 32, lineHeight: 1.15, fontWeight: 750, color: '#1f1914' }}>
            {loading ? 'Loading…' : selected ? `${selected.emoji} ${selected.name}` : 'Pick an occasion'}
          </h1>
          <p style={{ margin: '10px 0 20px', maxWidth: 460, fontSize: 14.5, lineHeight: 1.55, color: '#6b625b' }}>
            {selected
              ? selected.description
              : 'Turn on a festive seasonal skin with an optional popup and page effect. For a fully custom one-off look, use Make Your Own.'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
            <Toggle checked={specialTheme.enabled} onChange={(enabled) => setSpecialTheme({ ...specialTheme, enabled })} label={specialTheme.enabled ? 'Theme on' : 'Theme off'} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#8a817a' }}>
              <GroupSelector value={groupId} onChange={setGroupId} />
            </div>
          </div>
        </div>
        <PopupPreview occasion={selected} theme={specialTheme} />
      </section>

      {mode === 'create' ? (
        <OccasionBuilder
          value={specialTheme.custom ?? DEFAULT_CUSTOM_OCCASION}
          onChange={(next) => setSpecialTheme({ ...specialTheme, themeKey: CUSTOM_OCCASION_KEY, custom: next })}
          onStartFrom={(key) => {
            const o = OCCASIONS.find((x) => x.key === key);
            const popup = specialTheme.popup;
            if (o && !popup.title && !popup.message) {
              setSpecialTheme((prev) => ({ ...prev, popup: { ...prev.popup, title: o.title, message: o.message } }));
            }
          }}
        />
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
          gap: 12,
          padding: '10px 12px',
          borderRadius: 14,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(8px)',
          border: '1px solid #ece7e3',
        }}
      >
        <div className="occ-chips" style={{ display: 'flex', gap: 4, overflowX: 'auto', flex: 1, minWidth: 0 }}>
          {(['all', ...OCCASION_CATEGORIES] as CategoryFilter[]).map((c) => {
            const active = category === c;
            const count = c === 'all' ? OCCASIONS.length : OCCASIONS.filter((o) => o.category === c).length;
            return (
              <button
                key={c}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(c)}
                style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 10, border: '1px solid transparent', background: active ? '#26201d' : 'transparent', color: active ? '#fff' : '#5a514b', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
              >
                {c === 'all' ? 'All' : c}
                <span style={{ opacity: 0.55, fontSize: 12 }}>{count}</span>
              </button>
            );
          })}
        </div>
        <Input
          allowClear
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          prefix={<SearchOutlined style={{ color: '#a39a93' }} />}
          placeholder="Search occasions"
          style={{ width: 210, flexShrink: 0, borderRadius: 10 }}
        />
      </div>

      {/* Occasion grid */}
      {visible.length === 0 ? (
        <Empty description="No occasions match your search" style={{ padding: '48px 0' }} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 18, padding: '4px' }}>
          {visible.map((o) => {
            const isSel = specialTheme.themeKey === o.key;
            return (
              <button
                key={o.key}
                type="button"
                aria-pressed={isSel}
                title={o.description}
                onClick={() => pick(o)}
                className="occ-card"
                style={{
                  ['--glow' as string]: o.accent[1],
                  position: 'relative',
                  height: 210,
                  borderRadius: 24,
                  border: 'none',
                  padding: 0,
                  color: '#fff',
                  textAlign: 'left',
                  cursor: 'pointer',
                  font: 'inherit',
                  overflow: 'hidden',
                  background: `radial-gradient(120% 90% at 80% 0%, ${o.accent[1]}, transparent 60%), linear-gradient(150deg, ${o.accent[0]}, ${o.accent[1]})`,
                  boxShadow: isSel ? `0 0 0 3px #fff, 0 0 0 6px ${o.accent[1]}, 0 20px 40px ${o.accent[1]}66` : '0 4px 14px rgba(31,25,20,0.16)',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                }}
              >
                {/* sheen */}
                <span aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(255,255,255,0.28), rgba(255,255,255,0) 42%)', pointerEvents: 'none' }} />
                {/* scattered particles */}
                {o.particles.slice(0, 4).map((p, i) => (
                  <span
                    key={i}
                    aria-hidden
                    className="occ-float"
                    style={{ position: 'absolute', left: `${[12, 74, 30, 82][i]}%`, top: `${[16, 12, 52, 48][i]}%`, fontSize: [16, 20, 14, 18][i], opacity: 0.55, animationDelay: `${i * 0.6}s` }}
                  >
                    {p}
                  </span>
                ))}
                {/* hero emoji */}
                <span className="occ-emoji" style={{ position: 'absolute', left: '50%', top: 52, transform: 'translateX(-50%)', fontSize: 64, lineHeight: 1, filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.35))', transition: 'transform 0.3s ease' }}>
                  {o.emoji}
                </span>
                {isSel && (
                  <span style={{ position: 'absolute', top: 12, right: 12, display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px 3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: '#fff', color: '#26201d', boxShadow: '0 2px 10px rgba(0,0,0,0.25)' }}>
                    <CheckCircleFilled style={{ color: o.accent[1] }} /> Selected
                  </span>
                )}
                {/* glass label */}
                <span
                  style={{
                    position: 'absolute',
                    left: 10,
                    right: 10,
                    bottom: 10,
                    padding: '9px 12px',
                    borderRadius: 16,
                    background: 'rgba(15,12,20,0.38)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.22)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                  }}
                >
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.name}</span>
                    <span style={{ display: 'block', fontSize: 10.5, opacity: 0.8, textTransform: 'uppercase', letterSpacing: 0.9 }}>{o.category}</span>
                  </span>
                  <span style={{ display: 'flex', flexShrink: 0 }}>
                    {o.accent.map((c, i) => (
                      <span key={i} style={{ width: 16, height: 16, borderRadius: '50%', background: c, border: '2px solid rgba(255,255,255,0.9)', marginLeft: i ? -6 : 0 }} />
                    ))}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

        </>
      )}

      {/* Popup + particles */}
      <div className="occ-forms" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 20, alignItems: 'start' }}>
        <section style={panel}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1f1914' }}>Popup</h2>
            <Toggle checked={specialTheme.popup.visible} onChange={(visible) => setPopup({ visible })} label="Show popup" />
          </div>
          <Form layout="vertical" disabled={loading}>
            <Form.Item label="Title">
              <Input value={specialTheme.popup.title} onChange={(e) => setPopup({ title: e.target.value })} />
            </Form.Item>
            <Form.Item label="Message">
              <Input.TextArea rows={3} value={specialTheme.popup.message} onChange={(e) => setPopup({ message: e.target.value })} />
            </Form.Item>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.4fr)', gap: 16 }}>
              <Form.Item label="CTA text" style={{ marginBottom: 0 }}>
                <Input value={specialTheme.popup.ctaText} onChange={(e) => setPopup({ ctaText: e.target.value })} />
              </Form.Item>
              <Form.Item label="CTA URL" style={{ marginBottom: 0 }}>
                <Input value={specialTheme.popup.ctaUrl} onChange={(e) => setPopup({ ctaUrl: e.target.value })} />
              </Form.Item>
            </div>
          </Form>
        </section>

        <section style={panel}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1f1914' }}>Particle effect</h2>
            <Toggle checked={specialTheme.particleEffect.enabled} onChange={(enabled) => setParticles({ enabled })} label="On" />
          </div>
          <p style={{ margin: '0 0 16px', fontSize: 13, color: '#8a817a' }}>
            {selected && selected.particles.length ? `Falling ${selected.particles.slice(0, 4).join(' ')} across the page.` : 'Pick an occasion to see its particles.'}
          </p>
          <Form layout="vertical" disabled={loading}>
            <Form.Item label="Duration (seconds)" style={{ marginBottom: 0 }}>
              <InputNumber
                min={0}
                style={{ width: 140 }}
                value={specialTheme.particleEffect.durationSeconds}
                onChange={(durationSeconds) => setParticles({ durationSeconds: durationSeconds ?? 0 })}
              />
            </Form.Item>
          </Form>
        </section>
      </div>

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
          {selected ? selected.name : 'No occasion selected'} · {specialTheme.enabled ? 'on' : 'off'}
          <span style={{ opacity: 0.6 }}>{dirty ? '· Unsaved changes' : '· All changes saved'}</span>
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
          Save special theme
        </Button>
      </div>
    </div>
  );
}
