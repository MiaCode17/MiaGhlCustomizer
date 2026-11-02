import { useEffect, useState } from 'react';
import { Button, Input, Select, Slider, Upload, message } from 'antd';
import { DeleteOutlined, InboxOutlined, LoginOutlined } from '@ant-design/icons';
import { GroupSelector } from '../../../components/GroupSelector';
import { loginPageService } from '../../../services/loginPageService';
import { uploadService } from '../../../services/uploadService';
import { assetUrl } from '../../../utils/assetUrl';
import { emptyLoginPageConfig, LoginPageConfig } from '../../../types/loginPage';
import { PresetPicker } from './PresetPicker';
import { DesignPicker } from './DesignPicker';
import { LoginPreview } from './LoginPreview';
import { applyDesign, getVar, LOGIN_DESIGNS, LoginDesign, setVar, SHAPES } from '../../../utils/loginDesigns';
import { CssVariablesTable } from './CssVariablesTable';

const PAGE_CSS = `
.login-card:hover { transform: translateY(-3px); box-shadow: 0 16px 30px rgba(79,70,229,0.16) !important; }
.login-card:focus-visible { outline: 2px solid #26201d; outline-offset: 2px; }
.login-two { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; align-items: start; }
@media (max-width: 1000px) { .login-hero, .login-two { grid-template-columns: minmax(0, 1fr) !important; } }
`;

const CHECKER = 'conic-gradient(#f1eeeb 25%, #fbfaf9 0 50%, #f1eeeb 0 75%, #fbfaf9 0) 0 0 / 14px 14px';
const card: React.CSSProperties = { borderRadius: 20, border: '1px solid #ece7e3', background: '#fff', padding: 24 };

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section style={card}>
      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1f1914' }}>{title}</h2>
      {hint ? <p style={{ margin: '2px 0 0', fontSize: 13, color: '#8a817a' }}>{hint}</p> : null}
      <div style={{ marginTop: 18 }}>{children}</div>
    </section>
  );
}

function ImageSlot({ label, hint, url, uploading, onUpload, onClear }: { label: string; hint: string; url?: string; uploading: boolean; onUpload: (file: File) => Promise<boolean>; onClear: () => void }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#3d3530' }}>{label}</span>
        {url && (
          <button type="button" onClick={onClear} style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', fontSize: 12, color: '#b3524a', display: 'flex', alignItems: 'center', gap: 4 }}>
            <DeleteOutlined /> Remove
          </button>
        )}
      </div>
      <Upload.Dragger beforeUpload={onUpload} showUploadList={false} accept="image/*" disabled={uploading} style={{ background: url ? CHECKER : undefined, borderRadius: 16 }}>
        {url ? (
          <div style={{ padding: '6px 0' }}>
            <img src={assetUrl(url)} alt={`${label} preview`} style={{ maxHeight: 84, maxWidth: '85%', objectFit: 'contain' }} />
            <div style={{ marginTop: 6, fontSize: 12, color: '#8a817a' }}>{uploading ? 'Uploading…' : 'Drop or click to replace'}</div>
          </div>
        ) : (
          <div style={{ padding: '10px 0' }}>
            <p className="ant-upload-drag-icon" style={{ marginBottom: 6 }}>
              <InboxOutlined />
            </p>
            <p className="ant-upload-text" style={{ fontSize: 14 }}>{uploading ? 'Uploading…' : `Upload ${label.toLowerCase()}`}</p>
            <p className="ant-upload-hint" style={{ fontSize: 12 }}>{hint}</p>
          </div>
        )}
      </Upload.Dragger>
    </div>
  );
}

export function LoginPageBuilderPage() {
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [config, setConfig] = useState<LoginPageConfig>(emptyLoginPageConfig);
  const [savedSnap, setSavedSnap] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBackground, setUploadingBackground] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loginPageService
      .get(groupId)
      .then((loaded) => {
        if (cancelled) return;
        const next = loaded ?? emptyLoginPageConfig;
        setConfig(next);
        setSavedSnap(JSON.stringify(next));
      })
      .catch(() => {
        if (!cancelled) message.error('Failed to load login page config');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [groupId]);

  const isShape = config.preset === 'shape-left' || config.preset === 'shape-right';
  /** A design counts as active while every variable it sets still has its value. */
  const activeDesign = LOGIN_DESIGNS.find(
    (d) => d.preset === config.preset && Object.entries(d.vars).every(([name, value]) => getVar(config.cssVariables, name) === value),
  );
  const shapeValue = getVar(config.cssVariables, '--login-shape') ?? SHAPES[0].value;
  const widthPct = Number.parseInt(getVar(config.cssVariables, '--login-shape-width') ?? '65', 10) || 65;
  const dirty = !loading && JSON.stringify(config) !== savedSnap;

  const pickDesign = (design: LoginDesign) => setConfig({ ...config, preset: design.preset, cssVariables: applyDesign(config.cssVariables, design) });

  const setWidth = (pct: number) =>
    setConfig({
      ...config,
      cssVariables: setVar(setVar(config.cssVariables, '--login-shape-width', `${pct}%`), '--login-shape-offset', `${Math.max(0, pct - 10)}%`),
    });

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await loginPageService.save(config, groupId);
      setConfig(saved);
      setSavedSnap(JSON.stringify(saved));
      message.success('Login page saved');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to save login page');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (file: File) => {
    setUploadingLogo(true);
    try {
      const url = await uploadService.uploadImage(file);
      setConfig((c) => ({ ...c, logoUrl: url }));
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
    return false;
  };

  const handleBackgroundUpload = async (file: File) => {
    setUploadingBackground(true);
    try {
      const url = await uploadService.uploadImage(file);
      setConfig((c) => ({ ...c, backgroundImageUrl: url }));
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to upload background image');
    } finally {
      setUploadingBackground(false);
    }
    return false;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 84 }}>
      <style>{PAGE_CSS}</style>

      {/* Hero with the live preview */}
      <section
        className="login-hero"
        style={{ borderRadius: 22, padding: 28, border: '1px solid #ece7e3', background: 'linear-gradient(135deg, #eeeafc, #f8f6ff 60%, #fff)', display: 'grid', gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.2fr)', gap: 32, alignItems: 'center' }}
      >
        <div>
          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#5b4de0', marginBottom: 12 }}>
            <LoginOutlined /> Login page
          </div>
          <h1 style={{ margin: 0, fontSize: 32, lineHeight: 1.15, fontWeight: 750, color: '#1f1914' }}>
            {loading ? 'Loading…' : activeDesign ? activeDesign.name : 'Custom design'}
          </h1>
          <p style={{ margin: '10px 0 20px', maxWidth: 440, fontSize: 14.5, lineHeight: 1.55, color: '#6b625b' }}>
            Restyle the embedded app's own login screen with layout presets and custom CSS. The preview updates as you edit.
          </p>
          <GroupSelector value={groupId} onChange={setGroupId} />
        </div>
        <div>
          <div style={{ borderRadius: 14, overflow: 'hidden', boxShadow: '0 20px 44px rgba(31,25,20,0.16)' }}>
            <div style={{ zoom: 1.35 }}>
              <LoginPreview config={config} />
            </div>
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: '#a39a93' }}>A simplified sketch; the real page uses GHL's own login form.</div>
        </div>
      </section>

      <Section title="Ready-made designs" hint="Picking a design sets the layout and colors below. Anything you add yourself stays.">
        <div style={{ opacity: loading ? 0.5 : 1 }}>
          <DesignPicker activeId={activeDesign?.id} onPick={pickDesign} />
        </div>
      </Section>

      <div className="login-two">
        <Section title="Layout preset" hint="Where the form and the picture sit.">
          <PresetPicker value={config.preset} onChange={(preset) => setConfig({ ...config, preset })} />
        </Section>

        <Section title="Images" hint="Your logo and an optional background picture.">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <ImageSlot label="Logo" hint="PNG or SVG, transparent works best" url={config.logoUrl} uploading={uploadingLogo} onUpload={handleLogoUpload} onClear={() => setConfig({ ...config, logoUrl: undefined })} />
            <ImageSlot label="Background image" hint="Wide photo or pattern" url={config.backgroundImageUrl} uploading={uploadingBackground} onUpload={handleBackgroundUpload} onClear={() => setConfig({ ...config, backgroundImageUrl: undefined })} />
          </div>
        </Section>
      </div>

      {isShape ? (
        <Section title="Picture shape" hint="Without an uploaded background picture, the panel shows the design's gradient.">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#3d3530', marginBottom: 8 }}>Shape</div>
              <Select
                style={{ width: '100%' }}
                value={SHAPES.find((s) => s.value === shapeValue)?.id}
                placeholder="Custom"
                options={SHAPES.map((s) => ({ value: s.id, label: s.label }))}
                onChange={(id) => setConfig({ ...config, cssVariables: setVar(config.cssVariables, '--login-shape', SHAPES.find((s) => s.id === id)!.value) })}
              />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: '#3d3530' }}>
                Picture width <span>{widthPct}%</span>
              </div>
              <Slider min={30} max={100} value={widthPct} onChange={setWidth} style={{ margin: '8px 4px 0' }} />
            </div>
          </div>
        </Section>
      ) : null}

      <div className="login-two">
        <Section title="CSS variables" hint="The values the login stylesheet reads.">
          <CssVariablesTable variables={config.cssVariables} onChange={(cssVariables) => setConfig({ ...config, cssVariables })} />
        </Section>

        <Section title="Custom CSS" hint="Anything else, applied after the variables.">
          <Input.TextArea
            rows={11}
            value={config.customCss}
            onChange={(e) => setConfig({ ...config, customCss: e.target.value })}
            spellCheck={false}
            placeholder=".login-form { border-radius: 12px; }"
            style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12.5, background: '#17141c', color: '#e7e3f5', borderColor: '#17141c', borderRadius: 14, padding: 14 }}
          />
        </Section>
      </div>

      {/* Floating save bar */}
      <div style={{ position: 'fixed', left: '50%', bottom: 20, transform: 'translateX(-50%)', zIndex: 20, display: 'flex', alignItems: 'center', gap: 14, padding: '8px 8px 8px 20px', borderRadius: 999, background: '#1f1914', color: '#fff', boxShadow: '0 14px 34px rgba(0,0,0,0.3)', fontSize: 13.5 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: dirty ? '#f5a524' : '#3ccf91' }} />
          {dirty ? 'Unsaved changes' : 'All changes saved'}
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
          Save login page
        </Button>
      </div>
    </div>
  );
}
