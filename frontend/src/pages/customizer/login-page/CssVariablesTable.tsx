import { useState } from 'react';
import { Input, Popover, Slider } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { CssVariable } from '../../../types/loginPage';

interface CssVariablesTableProps {
  variables: CssVariable[];
  onChange: (variables: CssVariable[]) => void;
}

function emptyVariable(): CssVariable {
  return { name: '--brand-color', value: '#000000' };
}

const COLOR = '(#[0-9a-fA-F]{3,8}|rgba?\\([^)]*\\)|hsla?\\([^)]*\\))';
const GRADIENT_RE = new RegExp(`^linear-gradient\\(\\s*(-?\\d+)deg\\s*,\\s*${COLOR}\\s*([\\d.]+%)?\\s*,\\s*${COLOR}\\s*([\\d.]+%)?\\s*\\)$`, 'i');
const SOLID_RE = /^(#[0-9a-fA-F]{3}|#[0-9a-fA-F]{6}|(rgb|hsl)a?\(.*\))$/i;

interface ParsedGradient {
  angle: number;
  from: string;
  fromStop: string;
  to: string;
  toStop: string;
}

/** Understands the common two-colour form, e.g. `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`. */
function parseGradient(value: string): ParsedGradient | null {
  const m = GRADIENT_RE.exec(value.trim());
  return m ? { angle: Number(m[1]), from: m[2], fromStop: m[3] ?? '', to: m[4], toStop: m[5] ?? '' } : null;
}

function buildGradient(g: ParsedGradient): string {
  return `linear-gradient(${g.angle}deg, ${g.from}${g.fromStop ? ` ${g.fromStop}` : ''}, ${g.to}${g.toStop ? ` ${g.toStop}` : ''})`;
}

/** The native picker needs #rrggbb; expands #rgb and falls back to black for rgb()/hsl() values. */
function toHex6(value: string): string {
  const v = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v;
  if (/^#[0-9a-fA-F]{3}$/.test(v)) {
    return `#${v
      .slice(1)
      .split('')
      .map((c) => c + c)
      .join('')}`;
  }
  return '#000000';
}

const swatchBase: React.CSSProperties = {
  position: 'relative',
  display: 'block',
  width: 30,
  height: 30,
  borderRadius: 9,
  border: '1px solid rgba(0,0,0,0.12)',
  padding: 0,
  overflow: 'hidden',
  flexShrink: 0,
};

const HOVER_CSS =
  '.css-swatch { transition: box-shadow 0.15s ease; } .css-swatch:hover, .css-swatch:focus-visible { box-shadow: 0 0 0 3px rgba(79,70,229,0.28); } .css-swatch:hover .css-swatch-edit, .css-swatch:focus-visible .css-swatch-edit { opacity: 1 !important; }';

function EditBadge() {
  return (
    <span
      className="css-swatch-edit"
      aria-hidden
      style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,12,20,0.45)', color: '#fff', fontSize: 12, opacity: 0, transition: 'opacity 0.15s ease', pointerEvents: 'none' }}
    >
      <EditOutlined />
    </span>
  );
}

function ColorSmall({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#6b625b', cursor: 'pointer' }}>
      <span style={{ position: 'relative', width: 28, height: 28, borderRadius: 8, background: value, border: '1px solid rgba(0,0,0,0.15)', overflow: 'hidden' }}>
        <input type="color" aria-label={label} value={toHex6(value)} onChange={(e) => onChange(e.target.value)} style={{ position: 'absolute', inset: -8, width: 44, height: 44, opacity: 0, cursor: 'pointer' }} />
      </span>
      {label}
    </label>
  );
}

/** A swatch you edit in place: a colour picker for solid colours, a small editor for two-stop gradients. */
function EditableSwatch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const gradient = parseGradient(value);

  if (gradient) {
    const set = (patch: Partial<ParsedGradient>) => onChange(buildGradient({ ...gradient, ...patch }));
    return (
      <Popover
        trigger="click"
        open={open}
        onOpenChange={setOpen}
        placement="bottomLeft"
        content={
          <div style={{ width: 230 }}>
            <div style={{ height: 36, borderRadius: 10, background: value, marginBottom: 12 }} />
            <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
              <ColorSmall label="From" value={gradient.from} onChange={(from) => set({ from })} />
              <ColorSmall label="To" value={gradient.to} onChange={(to) => set({ to })} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#6b625b' }}>
              Angle <span>{gradient.angle}°</span>
            </div>
            <Slider min={0} max={360} value={gradient.angle} onChange={(angle) => set({ angle })} />
          </div>
        }
      >
        <button type="button" aria-label="Edit gradient" title="Click to edit gradient" className="css-swatch" style={{ ...swatchBase, background: value, cursor: 'pointer' }}>
          <EditBadge />
        </button>
      </Popover>
    );
  }

  if (SOLID_RE.test(value.trim())) {
    return (
      <span className="css-swatch" title="Click to change colour" style={{ ...swatchBase, background: value, cursor: 'pointer' }}>
        <EditBadge />
        <input type="color" aria-label="Pick colour" value={toHex6(value)} onChange={(e) => onChange(e.target.value)} style={{ position: 'absolute', inset: -8, width: 46, height: 46, opacity: 0, cursor: 'pointer' }} />
      </span>
    );
  }

  return <span aria-hidden title="Not a colour" style={{ ...swatchBase, background: 'repeating-linear-gradient(45deg, #f1eeeb 0 5px, #fbfaf9 5px 10px)' }} />;
}

export function CssVariablesTable({ variables, onChange }: CssVariablesTableProps) {
  const updateRow = (index: number, patch: Partial<CssVariable>) => {
    onChange(variables.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  };
  const removeRow = (index: number) => onChange(variables.filter((_, i) => i !== index));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <style>{HOVER_CSS}</style>

      {variables.length === 0 && (
        <div style={{ padding: '18px 12px', textAlign: 'center', fontSize: 13, color: '#8a817a', border: '1.5px dashed #e3dcd6', borderRadius: 14 }}>
          No variables yet. Picking a ready-made design fills these in for you.
        </div>
      )}

      {variables.map((v, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '30px minmax(0, 1fr) minmax(0, 1.3fr) 32px', gap: 8, alignItems: 'center' }}>
          <EditableSwatch value={v.value} onChange={(value) => updateRow(i, { value })} />
          <Input value={v.name} onChange={(e) => updateRow(i, { name: e.target.value })} placeholder="--brand-color" aria-label="Variable name" style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12.5 }} />
          <Input value={v.value} onChange={(e) => updateRow(i, { value: e.target.value })} placeholder="#4f46e5" aria-label="Variable value" style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12.5 }} />
          <button type="button" aria-label={`Delete ${v.name}`} onClick={() => removeRow(i)} style={{ width: 32, height: 32, borderRadius: 9, border: 'none', background: 'transparent', color: '#b3524a', cursor: 'pointer' }}>
            <DeleteOutlined />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...variables, emptyVariable()])}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 10, borderRadius: 12, border: '1.5px dashed #d9d1ca', background: 'transparent', color: '#4b4440', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}
      >
        <PlusOutlined /> Add CSS variable
      </button>
    </div>
  );
}
