import { Typography } from 'antd';
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
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '45%', background: '#1677ff' }} />
        <div style={{ position: 'absolute', right: '10%', top: '35%', width: '30%', height: '30%', background: '#f0f0f0', borderRadius: 2 }} />
      </div>
    );
  }

  if (preset === 'split-right') {
    return (
      <div style={frameStyle}>
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '45%', background: '#1677ff' }} />
        <div style={{ position: 'absolute', left: '10%', top: '35%', width: '30%', height: '30%', background: '#f0f0f0', borderRadius: 2 }} />
      </div>
    );
  }

  if (preset === 'full-bleed') {
    return (
      <div style={{ ...frameStyle, background: '#1677ff' }}>
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: '36%', height: '46%', background: '#fff', borderRadius: 2 }} />
      </div>
    );
  }

  return (
    <div style={frameStyle}>
      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: '40%', height: '55%', background: '#1677ff', borderRadius: 2 }} />
    </div>
  );
}

export function PresetPicker({ value, onChange }: PresetPickerProps) {
  return (
    <div className="flex flex-wrap gap-4">
      {PRESETS.map((preset) => {
        const selected = preset.value === value;
        return (
          <div
            key={preset.value}
            onClick={() => onChange(preset.value)}
            style={{
              width: 160,
              cursor: 'pointer',
              padding: 8,
              borderRadius: 6,
              border: selected ? '2px solid #1677ff' : '2px solid transparent',
              background: selected ? '#e6f4ff' : 'transparent',
            }}
          >
            <PresetDiagram preset={preset.value} />
            <Typography.Text
              style={{ display: 'block', textAlign: 'center', marginTop: 8 }}
              strong={selected}
            >
              {preset.label}
            </Typography.Text>
          </div>
        );
      })}
    </div>
  );
}
