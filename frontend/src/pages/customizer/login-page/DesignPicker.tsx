import { CheckCircleFilled } from '@ant-design/icons';
import { LOGIN_DESIGNS, LoginDesign } from '../../../utils/loginDesigns';
import { LoginPagePreset } from '../../../types/loginPage';

interface DesignPickerProps {
  /** The design whose settings are currently applied, if the agency has not changed them. */
  activeId: string | undefined;
  onPick: (design: LoginDesign) => void;
}

/** A tiny login screen showing where the panel and the form card sit for a preset. */
function MiniLogin({ preset, gradient, cardBg }: { preset: LoginPagePreset; gradient: string; cardBg: string }) {
  const shape = preset === 'shape-left' || preset === 'shape-right';
  const right = preset === 'split-right' || preset === 'shape-right';
  const split = preset === 'split-left' || preset === 'split-right';
  const full = preset === 'full-bleed';

  const panel: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    [right ? 'right' : 'left']: 0,
    width: split ? '48%' : '62%',
    background: gradient,
    clipPath: shape ? (right ? 'polygon(100% 0%, 28% 0%, 12% 50%, 28% 100%, 100% 100%)' : 'polygon(0% 0%, 72% 0%, 88% 50%, 72% 100%, 0% 100%)') : undefined,
  };

  const card: React.CSSProperties = {
    position: 'absolute',
    top: '24%',
    bottom: '24%',
    width: '30%',
    borderRadius: 6,
    background: cardBg,
    boxShadow: '0 6px 14px rgba(15,23,42,0.22)',
    padding: 6,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    ...(full || preset === 'centered' ? { left: '35%' } : right ? { left: '10%' } : { right: '10%' }),
  };

  return (
    <div style={{ position: 'relative', height: 112, borderRadius: 12, overflow: 'hidden', background: full ? gradient : preset === 'centered' ? gradient : '#f4f2f0', border: '1px solid rgba(0,0,0,0.06)' }}>
      {!full && preset !== 'centered' && <div style={panel} />}
      <div style={card}>
        <span style={{ height: 4, width: '55%', borderRadius: 2, background: 'rgba(0,0,0,0.18)', alignSelf: 'center' }} />
        <span style={{ height: 6, borderRadius: 2, background: 'rgba(0,0,0,0.08)' }} />
        <span style={{ height: 6, borderRadius: 2, background: 'rgba(0,0,0,0.08)' }} />
        <span style={{ height: 8, borderRadius: 3, background: gradient, marginTop: 'auto' }} />
      </div>
    </div>
  );
}

export function DesignPicker({ activeId, onPick }: DesignPickerProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
      {LOGIN_DESIGNS.map((d) => {
        const selected = d.id === activeId;
        const accent = '#4f46e5';
        return (
          <button
            key={d.id}
            type="button"
            aria-pressed={selected}
            title={d.description}
            onClick={() => onPick(d)}
            className="login-card"
            style={{
              position: 'relative',
              textAlign: 'left',
              font: 'inherit',
              cursor: 'pointer',
              padding: 10,
              borderRadius: 18,
              background: '#fff',
              border: `1.5px solid ${selected ? accent : '#ece7e3'}`,
              boxShadow: selected ? `0 0 0 4px ${accent}1f, 0 14px 28px ${accent}22` : '0 1px 2px rgba(31,25,20,0.04)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
          >
            <MiniLogin preset={d.preset} gradient={d.vars['--login-bg-gradient']} cardBg={d.vars['--login-card-bg']} />
            {selected && (
              <span style={{ position: 'absolute', top: 18, right: 18, display: 'flex', alignItems: 'center', gap: 5, padding: '2px 9px 2px 7px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: '#fff', color: '#26201d', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                <CheckCircleFilled style={{ color: accent }} /> Applied
              </span>
            )}
            <div style={{ padding: '10px 4px 2px' }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: '#1f1914' }}>{d.name}</div>
              <div style={{ fontSize: 12.5, color: '#8a817a', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.description}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
