import { CSSProperties } from 'react';
import { assetUrl } from '../../../utils/assetUrl';
import { getVar, mirrorClipPath, SHAPES } from '../../../utils/loginDesigns';
import { LoginPageConfig } from '../../../types/loginPage';

/** A small stand-in for the login screen, drawn from the same variables the real stylesheet uses. */
export function LoginPreview({ config }: { config: LoginPageConfig }) {
  const v = (name: string, fallback: string) => getVar(config.cssVariables, name) || fallback;
  const preset = config.preset;
  const isShape = preset === 'shape-left' || preset === 'shape-right';
  const right = preset === 'shape-right';
  const gradient = getVar(config.cssVariables, '--login-bg-gradient');
  const image = config.backgroundImageUrl ? `url("${assetUrl(config.backgroundImageUrl)}")` : undefined;
  const shape = v('--login-shape', SHAPES[0].value);
  const primary = v('--primary-color', '#4f46e5');
  const button = getVar(config.cssVariables, '--login-button-gradient') ?? primary;
  const dark = v('--login-text-color', '#1f2937');

  const page: CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    height: 220,
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: preset === 'split-left' ? 'flex-start' : preset === 'split-right' ? 'flex-end' : 'center',
    padding: preset === 'split-left' || preset === 'split-right' ? '0 12%' : 0,
    backgroundColor: v('--login-bg-color', '#f8fafc'),
    backgroundImage: isShape ? gradient : (image ?? gradient),
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  const width = v('--login-shape-width', '65%');
  const offset = v('--login-shape-offset', '55%');

  return (
    <div style={page} aria-label="Login page preview">
      {isShape ? (
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            [right ? 'right' : 'left']: 0,
            width,
            backgroundImage: image ?? gradient ?? 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            clipPath: right ? mirrorClipPath(shape) : shape,
          }}
        />
      ) : null}
      <div
        style={{
          position: 'relative',
          width: 130,
          padding: 12,
          borderRadius: Number.parseInt(v('--login-card-radius', '16px'), 10) / 2 || 8,
          background: preset === 'full-bleed' ? 'rgba(255,255,255,.86)' : v('--login-card-bg', '#ffffff'),
          boxShadow: '0 8px 24px rgba(15,23,42,.2)',
          color: dark,
          [right ? 'marginRight' : 'marginLeft']: isShape ? `calc(${offset} * 0.4)` : undefined,
        }}
      >
        {config.logoUrl ? (
          <img src={assetUrl(config.logoUrl)} alt="" style={{ display: 'block', maxHeight: 22, maxWidth: '100%', margin: '0 auto 8px', objectFit: 'contain' }} />
        ) : (
          <div style={{ height: 8, width: 40, background: '#d1d5db', borderRadius: 4, margin: '0 auto 10px' }} />
        )}
        <div style={{ height: 14, borderRadius: 4, background: v('--login-input-bg', '#f3f4f6'), marginBottom: 6 }} />
        <div style={{ height: 14, borderRadius: 4, background: v('--login-input-bg', '#f3f4f6'), marginBottom: 10 }} />
        <div style={{ height: 16, borderRadius: 6, background: button }} />
      </div>
    </div>
  );
}
