import { Typography } from 'antd';
import { LOGIN_DESIGNS, LoginDesign } from '../../../utils/loginDesigns';

interface DesignPickerProps {
  /** The design whose settings are currently applied, if the agency has not changed them. */
  activeId: string | undefined;
  onPick: (design: LoginDesign) => void;
}

export function DesignPicker({ activeId, onPick }: DesignPickerProps) {
  return (
    <div className="flex flex-wrap gap-4">
      {LOGIN_DESIGNS.map((d) => {
        const selected = d.id === activeId;
        return (
          <div
            key={d.id}
            role="button"
            tabIndex={0}
            aria-pressed={selected}
            title={d.description}
            onClick={() => onPick(d)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onPick(d);
              }
            }}
            style={{
              width: 150,
              cursor: 'pointer',
              padding: 6,
              borderRadius: 8,
              border: selected ? '2px solid #1677ff' : '2px solid transparent',
              background: selected ? '#e6f4ff' : 'transparent',
            }}
          >
            <div style={{ height: 70, borderRadius: 6, background: d.vars['--login-bg-gradient'], position: 'relative', overflow: 'hidden' }}>
              <div
                style={{
                  position: 'absolute',
                  top: '22%',
                  bottom: '22%',
                  width: '34%',
                  borderRadius: 4,
                  background: d.vars['--login-card-bg'],
                  [d.preset === 'shape-left' ? 'right' : d.preset === 'shape-right' ? 'left' : 'left']: d.preset === 'shape-left' || d.preset === 'shape-right' ? '10%' : '33%',
                }}
              />
            </div>
            <Typography.Text style={{ display: 'block', textAlign: 'center', marginTop: 6 }} strong={selected}>
              {d.name}
            </Typography.Text>
          </div>
        );
      })}
    </div>
  );
}
