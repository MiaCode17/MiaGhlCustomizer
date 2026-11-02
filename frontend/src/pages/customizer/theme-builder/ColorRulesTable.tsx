import { Input } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { ColorRule } from '../../../types/theme';

interface ColorRulesTableProps {
  rules: ColorRule[];
  onChange: (rules: ColorRule[]) => void;
}

const COMMON_PROPERTIES = ['background-color', 'color', 'border-color', 'fill', 'box-shadow'];

function emptyRule(): ColorRule {
  return { name: '', selector: '', property: 'background-color', value: '#6366f1' };
}

const isHex6 = (v: string) => /^#[0-9a-fA-F]{6}$/.test(v);

export function ColorRulesTable({ rules, onChange }: ColorRulesTableProps) {
  const updateRow = (index: number, patch: Partial<ColorRule>) => {
    onChange(rules.map((rule, i) => (i === index ? { ...rule, ...patch } : rule)));
  };
  const removeRow = (index: number) => onChange(rules.filter((_, i) => i !== index));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <datalist id="css-properties">
        {COMMON_PROPERTIES.map((p) => (
          <option key={p} value={p} />
        ))}
      </datalist>

      {rules.length === 0 && (
        <div style={{ padding: '22px 12px', textAlign: 'center', fontSize: 13, color: '#8a817a', border: '1.5px dashed #e3dcd6', borderRadius: 14 }}>
          No color rules yet. Add one to restyle a part of the app.
        </div>
      )}

      {rules.map((rule, i) => (
        <div
          key={i}
          style={{ display: 'grid', gridTemplateColumns: '48px minmax(0, 1fr) auto', gap: 14, alignItems: 'center', padding: 12, borderRadius: 16, border: '1px solid #ece7e3', background: '#fdfcfb' }}
        >
          <label style={{ position: 'relative', width: 48, height: 48, borderRadius: 14, background: rule.value, border: '1px solid rgba(0,0,0,0.12)', boxShadow: '0 4px 10px rgba(0,0,0,0.12)', cursor: 'pointer', overflow: 'hidden' }}>
            <input
              type="color"
              aria-label={`${rule.name || 'Rule'} colour`}
              value={isHex6(rule.value) ? rule.value : '#000000'}
              onChange={(e) => updateRow(i, { value: e.target.value })}
              style={{ position: 'absolute', inset: -8, width: 70, height: 70, opacity: 0, cursor: 'pointer' }}
            />
          </label>

          <div className="myo-rule-fields" style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 1.1fr) minmax(120px, 1fr) minmax(120px, 1fr) 110px', gap: 10, minWidth: 0 }}>
            <Input value={rule.name} onChange={(e) => updateRow(i, { name: e.target.value })} placeholder="Name, e.g. Primary button" aria-label="Rule name" style={{ fontWeight: 600 }} />
            <Input value={rule.selector} onChange={(e) => updateRow(i, { selector: e.target.value })} placeholder=".hl-btn-primary" aria-label="CSS selector" style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12.5 }} />
            <Input value={rule.property} list="css-properties" onChange={(e) => updateRow(i, { property: e.target.value })} placeholder="background-color" aria-label="CSS property" style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12.5 }} />
            <Input value={rule.value} onChange={(e) => updateRow(i, { value: e.target.value })} aria-label="Colour value" status={rule.value && !isHex6(rule.value) ? 'warning' : undefined} style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12.5 }} />
          </div>

          <button
            type="button"
            aria-label={`Delete ${rule.name || 'rule'}`}
            onClick={() => removeRow(i)}
            style={{ width: 34, height: 34, borderRadius: 10, border: 'none', background: 'transparent', color: '#b3524a', cursor: 'pointer' }}
          >
            <DeleteOutlined />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...rules, emptyRule()])}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 14, border: '1.5px dashed #d9d1ca', background: 'transparent', color: '#4b4440', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
      >
        <PlusOutlined /> Add color rule
      </button>
    </div>
  );
}
