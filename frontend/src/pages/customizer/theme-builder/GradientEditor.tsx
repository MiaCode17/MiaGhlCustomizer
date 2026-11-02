import { Segmented, Slider } from 'antd';
import { DeleteOutlined, PlusOutlined, SwapOutlined } from '@ant-design/icons';
import { Gradient, GradientTarget } from '../../../types/theme';

interface GradientEditorProps {
  gradients: Gradient[];
  onChange: (gradients: Gradient[]) => void;
}

const TARGET_OPTIONS: { value: GradientTarget; label: string }[] = [
  { value: 'header', label: 'Header' },
  { value: 'sidebar', label: 'Sidebar' },
  { value: 'button', label: 'Buttons' },
];

function emptyGradient(): Gradient {
  return { target: 'header', from: '#6366f1', to: '#8b5cf6', angle: 90 };
}

function ColorDot({ value, label, onChange }: { value: string; label: string; onChange: (v: string) => void }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#6b625b', cursor: 'pointer' }}>
      <span style={{ position: 'relative', width: 30, height: 30, borderRadius: 10, background: value, border: '1px solid rgba(0,0,0,0.15)', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.12)' }}>
        <input type="color" aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} style={{ position: 'absolute', inset: -8, width: 50, height: 50, opacity: 0, cursor: 'pointer' }} />
      </span>
      <span>
        <span style={{ display: 'block', fontWeight: 600, color: '#3d3530' }}>{label}</span>
        <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11.5 }}>{value}</span>
      </span>
    </label>
  );
}

export function GradientEditor({ gradients, onChange }: GradientEditorProps) {
  const updateRow = (index: number, patch: Partial<Gradient>) => {
    onChange(gradients.map((g, i) => (i === index ? { ...g, ...patch } : g)));
  };
  const removeRow = (index: number) => onChange(gradients.filter((_, i) => i !== index));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {gradients.length === 0 && (
        <div style={{ padding: '22px 12px', textAlign: 'center', fontSize: 13, color: '#8a817a', border: '1.5px dashed #e3dcd6', borderRadius: 14 }}>
          No gradients yet. Add one for the header, sidebar or buttons.
        </div>
      )}

      {gradients.map((g, i) => (
        <div key={i} style={{ borderRadius: 18, border: '1px solid #ece7e3', overflow: 'hidden', background: '#fdfcfb' }}>
          <div style={{ height: 64, background: `linear-gradient(${g.angle}deg, ${g.from}, ${g.to})`, position: 'relative' }}>
            <button
              type="button"
              aria-label="Delete gradient"
              onClick={() => removeRow(i)}
              style={{ position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: 10, border: 'none', background: 'rgba(255,255,255,0.92)', color: '#b3524a', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
            >
              <DeleteOutlined />
            </button>
          </div>
          <div style={{ padding: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, alignItems: 'center' }}>
            <Segmented value={g.target} options={TARGET_OPTIONS} onChange={(target) => updateRow(i, { target: target as GradientTarget })} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <ColorDot value={g.from} label="From" onChange={(from) => updateRow(i, { from })} />
              <button type="button" aria-label="Swap colours" onClick={() => updateRow(i, { from: g.to, to: g.from })} style={{ border: 'none', background: 'none', color: '#8a817a', cursor: 'pointer' }}>
                <SwapOutlined />
              </button>
              <ColorDot value={g.to} label="To" onChange={(to) => updateRow(i, { to })} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 600, color: '#3d3530' }}>
                Angle <span>{g.angle}°</span>
              </div>
              <Slider min={0} max={360} value={g.angle} onChange={(angle) => updateRow(i, { angle })} style={{ margin: '6px 4px 0' }} />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...gradients, emptyGradient()])}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 14, border: '1.5px dashed #d9d1ca', background: 'transparent', color: '#4b4440', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
      >
        <PlusOutlined /> Add gradient
      </button>
    </div>
  );
}
