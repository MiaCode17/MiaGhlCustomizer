import { LoginPagePreset } from '../../../types/loginPage';

interface PresetOption {
  value: LoginPagePreset;
  label: string;
}

const PRESETS: PresetOption[] = [
  { value: 'split-left', label: 'Split left' },
  { value: 'split-right', label: 'Split right' },
  { value: 'centered', label: 'Centered' },
  { value: 'full-bleed', label: 'Full bleed' },
  { value: 'shape-left', label: 'Picture shape, left' },
  { value: 'shape-right', label: 'Picture shape, right' },
];

interface PresetPickerProps {
  value: LoginPagePreset;
  onChange: (preset: LoginPagePreset) => void;
}

function PresetDiagram({ preset }: { preset: LoginPagePreset }) {
  const frameStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: 72,
    border: '1px solid #d9d9d9',
    borderRadius: 4,
    overflow: 'hidden',
    background: '#fff',
  };

  if (preset === 'split-left') {
    return (
      <div style={frameStyle}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '45%', background: '#4f46e5' }} />
        <div style={{ position: 'absolute', right: '10%', top: '35%', width: '30%', height: '30%', background: '#f0f0f0', borderRadius: 2 }} />
      </div>
    );
  }

  if (preset === 'split-right') {
    return (
      <div style={frameStyle}>
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '45%', background: '#4f46e5' }} />
        <div style={{ position: 'absolute', left: '10%', top: '35%', width: '30%', height: '30%', background: '#f0f0f0', borderRadius: 2 }} />
      </div>
    );
  }

  if (preset === 'shape-left' || preset === 'shape-right') {
    const right = preset === 'shape-right';
    return (
      <div style={frameStyle}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            [right ? 'right' : 'left']: 0,
            width: '60%',
            background: '#4f46e5',
            clipPath: right ? 'polygon(100% 0%, 30% 0%, 15% 50%, 30% 100%, 100% 100%)' : 'polygon(0% 0%, 70% 0%, 85% 50%, 70% 100%, 0% 100%)',
          }}
        />
        <div style={{ position: 'absolute', [right ? 'left' : 'right']: '8%', top: '30%', width: '28%', height: '40%', background: '#f0f0f0', borderRadius: 2 }} />
      </div>
    );
  }

  if (preset === 'full-bleed') {
    return (
      <div style={{ ...frameStyle, background: '#4f46e5' }}>
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: '36%', height: '46%', background: '#fff', borderRadius: 2 }} />
      </div>
    );
  }

  return (
    <div style={frameStyle}>
      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: '40%', height: '55%', background: '#4f46e5', borderRadius: 2 }} />
    </div>
  );
}

export function PresetPicker({ value, onChange }: PresetPickerProps) {
  return (
    <div role="radiogroup" aria-label="Layout preset" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
      {PRESETS.map((preset) => {
        const selected = preset.value === value;
        return (
          <button
            key={preset.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(preset.value)}
            style={{
              textAlign: 'left',
              font: 'inherit',
              cursor: 'pointer',
              padding: 8,
              borderRadius: 14,
              background: selected ? '#f4f3ff' : '#fff',
              border: `1.5px solid ${selected ? '#4f46e5' : '#ece7e3'}`,
              boxShadow: selected ? '0 0 0 3px rgba(79,70,229,0.14)' : 'none',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            }}
          >
            <PresetDiagram preset={preset.value} />
            <div style={{ marginTop: 8, textAlign: 'center', fontSize: 13, fontWeight: selected ? 700 : 500, color: '#1f1914' }}>{preset.label}</div>
          </button>
        );
      })}
    </div>
  );
}
