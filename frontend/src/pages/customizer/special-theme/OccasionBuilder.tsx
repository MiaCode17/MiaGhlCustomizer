import { useState } from 'react';
import { Input, Select } from 'antd';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import { CustomOccasion } from '../../../types/specialTheme';
import { OCCASIONS, OCCASION_CATEGORIES } from '../../../utils/occasions';

const MAX_PARTICLES = 8;

const EMOJI_PICKS = ['🎉', '🎁', '🎂', '🚀', '⭐', '🔥', '💝', '🌸', '☀️', '🍂', '❄️', '🎃', '🎄', '🪔', '🌙', '🏆'];
const PARTICLE_PICKS = ['✨', '🎉', '🎊', '⭐', '💖', '🌸', '🍁', '❄️', '🔥', '🎈', '💎', '🌈'];

const box: React.CSSProperties = { borderRadius: 20, border: '1px solid #ece7e3', background: '#fff', padding: 24 };

function Label({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#3d3530' }}>{children}</span>
      {aside}
    </div>
  );
}

function ColorPick({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 14, border: '1px solid #e6dfd9', background: '#fcfbfa', cursor: 'pointer' }}>
      <span style={{ position: 'relative', width: 34, height: 34, borderRadius: 10, background: value, border: '1px solid rgba(0,0,0,0.15)', overflow: 'hidden', flexShrink: 0 }}>
        <input type="color" aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} style={{ position: 'absolute', inset: -8, width: 52, height: 52, opacity: 0, cursor: 'pointer' }} />
      </span>
      <span>
        <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#3d3530' }}>{label}</span>
        <span style={{ fontSize: 12, fontFamily: 'ui-monospace, monospace', color: '#8a817a' }}>{value}</span>
      </span>
    </label>
  );
}

interface OccasionBuilderProps {
  value: CustomOccasion;
  onChange: (next: CustomOccasion) => void;
  /** Called when the user starts from a predefined occasion, so the popup text can follow. */
  onStartFrom?: (key: string) => void;
}

/** The "create your own occasion" form: name, emoji, two colours and a list of falling particles. */
export function OccasionBuilder({ value, onChange, onStartFrom }: OccasionBuilderProps) {
  const [draft, setDraft] = useState('');
  const set = (patch: Partial<CustomOccasion>) => onChange({ ...value, ...patch });

  const addParticle = (glyph: string) => {
    const g = glyph.trim();
    if (!g || value.particles.length >= MAX_PARTICLES || value.particles.includes(g)) return;
    set({ particles: [...value.particles, g] });
    setDraft('');
  };

  const startFrom = (key: string) => {
    const o = OCCASIONS.find((x) => x.key === key);
    if (!o) return;
    onChange({ name: o.name, emoji: o.emoji, accent: [o.accent[0], o.accent[1]], particles: o.particles.slice(0, MAX_PARTICLES) });
    onStartFrom?.(key);
  };

  return (
    <section style={box}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 4 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1f1914' }}>Design your occasion</h2>
        <Select
          showSearch
          placeholder="Start from an existing occasion"
          style={{ width: 260 }}
          optionFilterProp="label"
          value={undefined}
          onChange={startFrom}
          options={OCCASION_CATEGORIES.map((c) => ({
            label: c,
            options: OCCASIONS.filter((o) => o.category === c).map((o) => ({ value: o.key, label: `${o.emoji} ${o.name}` })),
          }))}
        />
      </div>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: '#8a817a' }}>Name it, pick its colours and choose what falls across the page.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 22 }}>
        <div>
          <Label aside={<span style={{ fontSize: 12, color: '#a39a93' }}>{value.name.length}/60</span>}>Occasion name</Label>
          <Input value={value.name} maxLength={60} placeholder="Founders Day" onChange={(e) => set({ name: e.target.value })} status={value.name.trim() ? undefined : 'error'} />
        </div>

        <div>
          <Label>Emoji</Label>
          <Input value={value.emoji} maxLength={16} onChange={(e) => set({ emoji: e.target.value })} style={{ width: 90, fontSize: 20, textAlign: 'center' }} aria-label="Emoji" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {EMOJI_PICKS.map((e) => (
              <button key={e} type="button" onClick={() => set({ emoji: e })} aria-label={`Use ${e}`} style={{ width: 32, height: 32, borderRadius: 9, border: `1.5px solid ${value.emoji === e ? '#26201d' : '#ece7e3'}`, background: '#fff', fontSize: 17, cursor: 'pointer' }}>
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>Colours</Label>
          <div style={{ height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${value.accent[0]}, ${value.accent[1]})`, marginBottom: 10, boxShadow: `0 8px 18px ${value.accent[1]}44` }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <ColorPick label="From" value={value.accent[0]} onChange={(c) => set({ accent: [c, value.accent[1]] })} />
            <ColorPick label="To" value={value.accent[1]} onChange={(c) => set({ accent: [value.accent[0], c] })} />
          </div>
        </div>

        <div>
          <Label aside={<span style={{ fontSize: 12, color: '#a39a93' }}>{value.particles.length}/{MAX_PARTICLES}</span>}>Falling particles</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, minHeight: 36, marginBottom: 10 }}>
            {value.particles.map((p) => (
              <span key={p} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 6px 4px 11px', borderRadius: 999, background: '#f6f3f0', border: '1px solid #ece7e3', fontSize: 17 }}>
                {p}
                <button type="button" aria-label={`Remove ${p}`} onClick={() => set({ particles: value.particles.filter((x) => x !== p) })} style={{ width: 20, height: 20, borderRadius: '50%', border: 'none', background: '#e4ded8', color: '#5a514b', fontSize: 9, cursor: 'pointer' }}>
                  <CloseOutlined />
                </button>
              </span>
            ))}
            {value.particles.length === 0 && <span style={{ fontSize: 12.5, color: '#c0392b' }}>Add at least one particle.</span>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Input value={draft} maxLength={16} placeholder="Type an emoji" onChange={(e) => setDraft(e.target.value)} onPressEnter={() => addParticle(draft)} aria-label="New particle" />
            <button type="button" onClick={() => addParticle(draft)} disabled={!draft.trim() || value.particles.length >= MAX_PARTICLES} style={{ padding: '0 14px', borderRadius: 10, border: '1px solid #e6dfd9', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>
              <PlusOutlined /> Add
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {PARTICLE_PICKS.map((p) => (
              <button key={p} type="button" onClick={() => addParticle(p)} aria-label={`Add ${p}`} disabled={value.particles.includes(p) || value.particles.length >= MAX_PARTICLES} style={{ width: 30, height: 30, borderRadius: 8, border: '1px dashed #d9d1ca', background: 'transparent', fontSize: 15, cursor: 'pointer', opacity: value.particles.includes(p) ? 0.35 : 1 }}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
