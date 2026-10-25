import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Checkbox, Input, InputNumber, Modal, Popconfirm, Radio, Select, Slider, Space, Switch, Table, Tabs, Tag, Typography, Upload, message } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined, DeleteOutlined, EditOutlined, PictureOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { PageIntro } from '../../../components/PageIntro';
import { heroBannersService } from '../../../services/heroBannersService';
import { uploadService } from '../../../services/uploadService';
import { assetUrl } from '../../../utils/assetUrl';
import {
  emptyHeroBanner,
  emptyHeroSlide,
  HeroBanner,
  HeroBannerInput,
  HeroSlide,
  normalizeHeroBanner,
  slideBackground,
} from '../../../types/heroBanner';

const isUrl = (v: string) => v === '' || /^(https?:\/\/|\/(?!\/))/i.test(v.trim());

function validate(b: HeroBannerInput): string | null {
  if (!b.name.trim()) return 'Give the banner a name';
  for (let i = 0; i < b.slides.length; i++) {
    const s = b.slides[i];
    const n = b.kind === 'slider' ? `Panel ${i + 1}: ` : '';
    if (!s.title.trim() && !s.subtitle.trim() && !s.description.trim() && !s.image) return `${n}add some text or a picture`;
    if (Boolean(s.ctaText.trim()) !== Boolean(s.ctaUrl.trim())) return `${n}a button needs both a label and an address`;
    if (!isUrl(s.ctaUrl)) return `${n}the button address must start with http:// or https://`;
    if (s.icon.type === 'image' && !/^(https?:\/\/|\/(?!\/))/i.test(s.icon.value)) return `${n}add the icon image`;
  }
  return null;
}

function ColorInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return <input type="color" aria-label={label} value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#000000'} onChange={(e) => onChange(e.target.value)} />;
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <Typography.Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
        {label}
      </Typography.Text>
      {children}
      {hint ? <Typography.Text type="secondary" style={{ fontSize: 11 }}>{hint}</Typography.Text> : null}
    </div>
  );
}

/** A sketch of one panel, drawn from the same settings the dashboard uses. */
function Preview({ banner, index }: { banner: HeroBannerInput; index: number }) {
  const s = banner.slides[Math.min(index, banner.slides.length - 1)];
  const minHeight = banner.sizeMode === 'custom' ? banner.height : 280;
  const image = s.image ? <img src={assetUrl(s.image)} alt="" style={{ width: 'min(260px, 100%)', borderRadius: 14, objectFit: 'cover', alignSelf: 'stretch', maxHeight: minHeight }} /> : null;
  const icon = !image && s.icon.type === 'emoji' && s.icon.value ? <div style={{ fontSize: 48 }}>{s.icon.value}</div> : !image && s.icon.type === 'image' && s.icon.value ? <img src={assetUrl(s.icon.value)} alt="" style={{ width: 64, height: 64, objectFit: 'contain' }} /> : null;
  const text = (
    <div style={{ flex: '1 1 200px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {s.title ? <div style={{ fontSize: Math.min(banner.titleSize, 32), fontWeight: 800, lineHeight: 1.2 }}>{s.title}</div> : null}
      {s.subtitle ? <div style={{ fontSize: Math.min(banner.subtitleSize, 20), fontWeight: 600, opacity: 0.95 }}>{s.subtitle}</div> : null}
      {s.description ? <div style={{ fontSize: Math.min(banner.descriptionSize, 15), opacity: 0.9, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{s.description}</div> : null}
      {s.ctaText ? <span style={{ alignSelf: 'flex-start', padding: '8px 18px', borderRadius: 999, border: `2px solid ${s.textColor}`, background: 'rgba(255,255,255,.16)', fontWeight: 600, fontSize: 13 }}>{s.ctaText}</span> : null}
    </div>
  );
  const parts = image ? (s.imagePosition === 'left' ? [image, text] : [text, image]) : icon ? (s.icon.position === 'right' || s.icon.position === 'bottom' ? [text, icon] : [icon, text]) : [text];
  return (
    <div style={{ position: 'relative', width: banner.sizeMode === 'custom' ? `${banner.widthPercent}%` : '100%', margin: '0 auto', borderRadius: banner.borderRadius, overflow: 'hidden', background: slideBackground(s.background), color: s.textColor, minHeight: Math.min(minHeight, 340), boxShadow: '0 10px 30px rgba(0,0,0,.15)' }}>
      {s.backgroundImage ? <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("${assetUrl(s.backgroundImage)}")`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15 }} /> : null}
      <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 24, padding: `${Math.min(banner.padY, 40)}px ${Math.min(banner.padX, 40)}px`, minHeight: Math.min(minHeight, 340) }}>{parts}</div>
      {banner.closable ? <div style={{ position: 'absolute', top: 10, right: 10, width: 28, height: 28, borderRadius: 14, background: 'rgba(255,255,255,.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>×</div> : null}
    </div>
  );
}

function ImageField({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const [uploading, setUploading] = useState(false);
  return (
    <Field label={label}>
      <Space.Compact style={{ width: '100%' }}>
        <Input value={value} placeholder="https://… or upload" maxLength={2000} onChange={(e) => onChange(e.target.value)} status={isUrl(value) ? undefined : 'error'} />
        <Upload
          showUploadList={false}
          accept="image/*"
          beforeUpload={async (file) => {
            setUploading(true);
            try {
              onChange(await uploadService.uploadImage(file));
            } catch (err) {
              message.error(err instanceof Error ? err.message : 'Failed to upload');
            } finally {
              setUploading(false);
            }
            return false;
          }}
        >
          <Button icon={<UploadOutlined />} loading={uploading}>Upload</Button>
        </Upload>
        {value ? <Button onClick={() => onChange('')}>Clear</Button> : null}
      </Space.Compact>
    </Field>
  );
}

function SlideEditor({ slide, onChange }: { slide: HeroSlide; onChange: (p: Partial<HeroSlide>) => void }) {
  const bg = slide.background;
  return (
    <div>
      <Field label="Title"><Input value={slide.title} maxLength={120} onChange={(e) => onChange({ title: e.target.value })} /></Field>
      <Field label="Subtitle"><Input value={slide.subtitle} maxLength={160} onChange={(e) => onChange({ subtitle: e.target.value })} /></Field>
      <Field label="Text"><Input.TextArea rows={3} value={slide.description} maxLength={600} onChange={(e) => onChange({ description: e.target.value })} /></Field>
      <Space size="large" wrap align="start">
        <Field label="Button label (optional)"><Input style={{ width: 180 }} value={slide.ctaText} maxLength={40} onChange={(e) => onChange({ ctaText: e.target.value })} /></Field>
        <Field label="Button address"><Input style={{ width: 300 }} value={slide.ctaUrl} maxLength={2000} placeholder="https://…" onChange={(e) => onChange({ ctaUrl: e.target.value })} status={isUrl(slide.ctaUrl) ? undefined : 'error'} /></Field>
        <Field label="Opens in">
          <Select style={{ width: 130 }} value={slide.ctaOpenIn} onChange={(ctaOpenIn) => onChange({ ctaOpenIn })} options={[{ value: 'new', label: 'New tab' }, { value: 'same', label: 'Same tab' }]} />
        </Field>
      </Space>
      <ImageField label="Picture (optional)" value={slide.image} onChange={(image) => onChange({ image })} />
      {slide.image ? (
        <Space size="large" wrap>
          <Field label="Picture position">
            <Radio.Group value={slide.imagePosition} onChange={(e) => onChange({ imagePosition: e.target.value })}>
              <Radio.Button value="left">Left</Radio.Button>
              <Radio.Button value="right">Right</Radio.Button>
            </Radio.Group>
          </Field>
          <Field label="Picture description (for screen readers)"><Input style={{ width: 280 }} value={slide.imageAlt} maxLength={160} onChange={(e) => onChange({ imageAlt: e.target.value })} /></Field>
        </Space>
      ) : (
        <Space size="large" wrap align="start">
          <Field label="Icon">
            <Select style={{ width: 120 }} value={slide.icon.type} onChange={(type) => onChange({ icon: { ...slide.icon, type, value: '' } })} options={[{ value: 'none', label: 'None' }, { value: 'emoji', label: 'Emoji' }, { value: 'image', label: 'Image' }]} />
          </Field>
          {slide.icon.type === 'emoji' ? <Field label="Emoji"><Input style={{ width: 90 }} value={slide.icon.value} maxLength={8} onChange={(e) => onChange({ icon: { ...slide.icon, value: e.target.value } })} /></Field> : null}
          {slide.icon.type === 'image' ? <div style={{ width: 360 }}><ImageField label="Icon image" value={slide.icon.value} onChange={(value) => onChange({ icon: { ...slide.icon, value } })} /></div> : null}
          {slide.icon.type !== 'none' ? (
            <Field label="Icon position">
              <Select style={{ width: 120 }} value={slide.icon.position} onChange={(position) => onChange({ icon: { ...slide.icon, position } })} options={['left', 'right', 'top', 'bottom'].map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) }))} />
            </Field>
          ) : null}
        </Space>
      )}
      <ImageField label="Background picture (faint, optional)" value={slide.backgroundImage} onChange={(backgroundImage) => onChange({ backgroundImage })} />
      <Space size="large" wrap align="end">
        <Field label="Background">
          <Radio.Group value={bg.type} onChange={(e) => onChange({ background: { ...bg, type: e.target.value } })}>
            <Radio.Button value="solid">Solid</Radio.Button>
            <Radio.Button value="gradient">Gradient</Radio.Button>
          </Radio.Group>
        </Field>
        <Field label={bg.type === 'solid' ? 'Color' : 'From'}><ColorInput label="Background color" value={bg.color} onChange={(color) => onChange({ background: { ...bg, color } })} /></Field>
        {bg.type === 'gradient' ? (
          <>
            <Field label="To"><ColorInput label="Gradient end color" value={bg.color2} onChange={(color2) => onChange({ background: { ...bg, color2 } })} /></Field>
            <Field label={`Angle (${bg.angle}°)`}><Slider style={{ width: 140 }} min={0} max={360} value={bg.angle} onChange={(angle) => onChange({ background: { ...bg, angle } })} /></Field>
          </>
        ) : null}
        <Field label="Text color"><ColorInput label="Text color" value={slide.textColor} onChange={(textColor) => onChange({ textColor })} /></Field>
      </Space>
    </div>
  );
}

function Num({ label, value, onChange, min, max, suffix }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; suffix?: string }) {
  return (
    <Field label={label}>
      <InputNumber style={{ width: 110 }} min={min} max={max} value={value} addonAfter={suffix} onChange={(v) => v !== null && onChange(Math.round(v))} />
    </Field>
  );
}

export function HeroBannersPage() {
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<{ id: string | null; banner: HeroBannerInput } | null>(null);
  const [panel, setPanel] = useState(0);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setBanners(await heroBannersService.list(groupId));
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to load hero banners');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    void load();
  }, [load]);

  const open = (id: string | null, banner: HeroBannerInput) => {
    setPanel(0);
    setEditing({ id, banner });
  };
  const patch = (p: Partial<HeroBannerInput>) => setEditing((e) => (e ? { ...e, banner: { ...e.banner, ...p } } : e));
  const patchSlide = (i: number, p: Partial<HeroSlide>) => setEditing((e) => (e ? { ...e, banner: { ...e.banner, slides: e.banner.slides.map((s, n) => (n === i ? { ...s, ...p } : s)) } } : e));
  const moveSlide = (i: number, d: -1 | 1) =>
    setEditing((e) => {
      if (!e) return e;
      const slides = [...e.banner.slides];
      const to = i + d;
      if (to < 0 || to >= slides.length) return e;
      [slides[i], slides[to]] = [slides[to], slides[i]];
      setPanel(to);
      return { ...e, banner: { ...e.banner, slides } };
    });

  const save = async () => {
    if (!editing) return;
    const problem = validate(editing.banner);
    if (problem) {
      message.error(problem);
      return;
    }
    setSaving(true);
    try {
      const input = { ...editing.banner, name: editing.banner.name.trim() };
      if (editing.id) await heroBannersService.update(editing.id, input);
      else await heroBannersService.create({ ...input, order: banners.length }, groupId);
      message.success('Banner saved');
      setEditing(null);
      await load();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to save the banner');
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (b: HeroBanner, enabled: boolean) => {
    try {
      const { _id, companyId, groupId: _g, createdAt, updatedAt, ...rest } = b;
      void _id; void companyId; void _g; void createdAt; void updatedAt;
      await heroBannersService.update(b._id, { ...normalizeHeroBanner(rest), enabled });
      setBanners((list) => list.map((x) => (x._id === b._id ? { ...x, enabled } : x)));
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to update the banner');
    }
  };

  const remove = async (b: HeroBanner) => {
    try {
      await heroBannersService.remove(b._id);
      message.success('Banner deleted');
      await load();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to delete the banner');
    }
  };

  const b = editing?.banner;
  const isSlider = b?.kind === 'slider';

  return (
    <div className="pt-4">
      <PageIntro
        icon={<PictureOutlined />}
        description="Large banners on the GHL dashboard: one panel or a slider, with a picture, text and a button. Different from the thin announcement bars."
        groupId={groupId}
        onGroupChange={setGroupId}
      />
      <Card
        title="Hero banners"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => open(null, normalizeHeroBanner(emptyHeroBanner))}>New banner</Button>}
      >
        <Table<HeroBanner>
          rowKey="_id"
          loading={loading}
          dataSource={banners}
          pagination={false}
          locale={{ emptyText: 'No hero banners yet.' }}
          columns={[
            { title: 'Name', dataIndex: 'name' },
            { title: 'Type', dataIndex: 'kind', width: 130, render: (k: string, r) => (k === 'slider' ? `Slider (${r.slides.length})` : 'Single') },
            { title: 'Position', dataIndex: 'position', width: 100, render: (p: string) => <Tag>{p === 'top' ? 'Top' : 'Bottom'}</Tag> },
            { title: 'On', dataIndex: 'enabled', width: 80, render: (v: boolean, r) => <Switch size="small" checked={v} onChange={(x) => void toggle(r, x)} /> },
            {
              title: '',
              key: 'actions',
              width: 110,
              render: (_: unknown, r) => (
                <Space>
                  <Button size="small" icon={<EditOutlined />} aria-label="Edit" onClick={() => open(r._id, normalizeHeroBanner(r))} />
                  <Popconfirm title="Delete this banner?" okText="Delete" okButtonProps={{ danger: true }} onConfirm={() => void remove(r)}>
                    <Button size="small" danger icon={<DeleteOutlined />} aria-label="Delete" />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        open={editing !== null}
        title={editing?.id ? 'Edit hero banner' : 'New hero banner'}
        width={880}
        onCancel={() => setEditing(null)}
        onOk={() => void save()}
        okText="Save banner"
        confirmLoading={saving}
        maskClosable={false}
        destroyOnClose
      >
        {b ? (
          <>
            <div style={{ marginBottom: 16 }}>
              <Preview banner={b} index={panel} />
            </div>
            <Tabs
              items={[
                {
                  key: 'general',
                  label: 'General',
                  children: (
                    <>
                      <Field label="Name (only you see this)"><Input maxLength={80} value={b.name} onChange={(e) => patch({ name: e.target.value })} /></Field>
                      <Space size="large" wrap align="start">
                        <Field label="Type">
                          <Radio.Group value={b.kind} onChange={(e) => { patch({ kind: e.target.value }); setPanel(0); }}>
                            <Radio.Button value="single">Single</Radio.Button>
                            <Radio.Button value="slider">Slider</Radio.Button>
                          </Radio.Group>
                        </Field>
                        <Field label="Position">
                          <Radio.Group value={b.position} onChange={(e) => patch({ position: e.target.value })}>
                            <Radio.Button value="top">Above the dashboard</Radio.Button>
                            <Radio.Button value="bottom">Below it</Radio.Button>
                          </Radio.Group>
                        </Field>
                        <Field label="Enabled"><Switch checked={b.enabled} onChange={(enabled) => patch({ enabled })} /></Field>
                        <Field label="Visitors can close it"><Switch checked={b.closable} onChange={(closable) => patch({ closable })} /></Field>
                      </Space>
                      <Field label="Entrance">
                        <Select style={{ width: 160 }} value={b.animation} onChange={(animation) => patch({ animation })} options={[{ value: 'fade', label: 'Fade in' }, { value: 'slide', label: 'Slide down' }, { value: 'none', label: 'None' }]} />
                      </Field>
                    </>
                  ),
                },
                {
                  key: 'panels',
                  label: isSlider ? `Panels (${b.slides.length})` : 'Content',
                  children: (
                    <>
                      {isSlider ? (
                        <Space wrap style={{ marginBottom: 12 }}>
                          {b.slides.map((_, i) => (
                            <Button key={i} type={i === panel ? 'primary' : 'default'} onClick={() => setPanel(i)}>
                              Panel {i + 1}
                            </Button>
                          ))}
                          <Button icon={<PlusOutlined />} disabled={b.slides.length >= 10} onClick={() => { patch({ slides: [...b.slides, { ...emptyHeroSlide, title: 'New panel' }] }); setPanel(b.slides.length); }} />
                          <Button icon={<ArrowUpOutlined />} disabled={panel === 0} onClick={() => moveSlide(panel, -1)} aria-label="Move panel earlier" />
                          <Button icon={<ArrowDownOutlined />} disabled={panel >= b.slides.length - 1} onClick={() => moveSlide(panel, 1)} aria-label="Move panel later" />
                          <Button danger icon={<DeleteOutlined />} disabled={b.slides.length === 1} onClick={() => { patch({ slides: b.slides.filter((_, i) => i !== panel) }); setPanel(0); }} aria-label="Remove panel" />
                        </Space>
                      ) : null}
                      <SlideEditor slide={b.slides[Math.min(panel, b.slides.length - 1)]} onChange={(p) => patchSlide(Math.min(panel, b.slides.length - 1), p)} />
                    </>
                  ),
                },
                {
                  key: 'layout',
                  label: 'Size & spacing',
                  children: (
                    <>
                      <Field label="Size">
                        <Radio.Group value={b.sizeMode} onChange={(e) => patch({ sizeMode: e.target.value })}>
                          <Radio.Button value="default">Standard</Radio.Button>
                          <Radio.Button value="custom">Custom</Radio.Button>
                        </Radio.Group>
                      </Field>
                      {b.sizeMode === 'custom' ? (
                        <Space size="large" wrap>
                          <Num label="Height" value={b.height} min={120} max={800} suffix="px" onChange={(height) => patch({ height })} />
                          <Num label="Width" value={b.widthPercent} min={30} max={100} suffix="%" onChange={(widthPercent) => patch({ widthPercent })} />
                        </Space>
                      ) : null}
                      <Space size="large" wrap>
                        <Num label="Corner radius" value={b.borderRadius} min={0} max={60} suffix="px" onChange={(borderRadius) => patch({ borderRadius })} />
                        <Num label="Space above" value={b.marginTop} min={0} max={120} suffix="px" onChange={(marginTop) => patch({ marginTop })} />
                        <Num label="Space below" value={b.marginBottom} min={0} max={120} suffix="px" onChange={(marginBottom) => patch({ marginBottom })} />
                      </Space>
                      <Space size="large" wrap>
                        <Num label="Padding top/bottom" value={b.padY} min={0} max={160} suffix="px" onChange={(padY) => patch({ padY })} />
                        <Num label="Padding sides" value={b.padX} min={0} max={160} suffix="px" onChange={(padX) => patch({ padX })} />
                        <Num label="Padding sides (phones)" value={b.mobilePadX} min={0} max={100} suffix="px" onChange={(mobilePadX) => patch({ mobilePadX })} />
                      </Space>
                      <Space size="large" wrap>
                        <Num label="Title size" value={b.titleSize} min={14} max={72} suffix="px" onChange={(titleSize) => patch({ titleSize })} />
                        <Num label="Subtitle size" value={b.subtitleSize} min={12} max={48} suffix="px" onChange={(subtitleSize) => patch({ subtitleSize })} />
                        <Num label="Text size" value={b.descriptionSize} min={11} max={32} suffix="px" onChange={(descriptionSize) => patch({ descriptionSize })} />
                      </Space>
                    </>
                  ),
                },
                ...(isSlider
                  ? [
                      {
                        key: 'slider',
                        label: 'Slider',
                        children: (
                          <>
                            <Space size="large" wrap align="start">
                              <Field label="Slide on its own"><Switch checked={b.slider.autoSlide} onChange={(autoSlide) => patch({ slider: { ...b.slider, autoSlide } })} /></Field>
                              {b.slider.autoSlide ? <Num label="Every" value={Math.round(b.slider.intervalMs / 1000)} min={2} max={30} suffix="sec" onChange={(s) => patch({ slider: { ...b.slider, intervalMs: s * 1000 } })} /> : null}
                              <Field label="Pause when hovered"><Switch checked={b.slider.pauseOnHover} onChange={(pauseOnHover) => patch({ slider: { ...b.slider, pauseOnHover } })} /></Field>
                              <Field label="Loop"><Switch checked={b.slider.loop} onChange={(loop) => patch({ slider: { ...b.slider, loop } })} /></Field>
                            </Space>
                            <Space size="large" wrap align="start">
                              <Field label="Transition">
                                <Radio.Group value={b.slider.transition} onChange={(e) => patch({ slider: { ...b.slider, transition: e.target.value } })}>
                                  <Radio.Button value="slide">Slide</Radio.Button>
                                  <Radio.Button value="fade">Fade</Radio.Button>
                                </Radio.Group>
                              </Field>
                              <Num label="Speed" value={b.slider.transitionMs} min={100} max={2000} suffix="ms" onChange={(transitionMs) => patch({ slider: { ...b.slider, transitionMs } })} />
                            </Space>
                            <Field label="Arrows and dots">
                              <Checkbox checked={b.slider.showControls} onChange={(e) => patch({ slider: { ...b.slider, showControls: e.target.checked } })}>Show</Checkbox>
                              {b.slider.showControls ? (
                                <Select style={{ width: 140, marginLeft: 12 }} value={b.slider.controlsPosition} onChange={(controlsPosition) => patch({ slider: { ...b.slider, controlsPosition } })} options={[{ value: 'bottom', label: 'Bottom' }, { value: 'top', label: 'Top' }, { value: 'sides', label: 'Sides' }]} />
                              ) : null}
                            </Field>
                          </>
                        ),
                      },
                    ]
                  : []),
              ]}
            />
          </>
        ) : null}
      </Modal>
    </div>
  );
}
