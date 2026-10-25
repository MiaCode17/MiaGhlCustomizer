import { CSSProperties, useEffect, useRef, useState } from 'react';
import { Button, Card, Input, Popconfirm, Select, Space, Switch, Typography, Upload, message } from 'antd';
import { DeleteOutlined, LoadingOutlined, UploadOutlined } from '@ant-design/icons';
import { PageIntro } from '../../../components/PageIntro';
import { loaderService } from '../../../services/loaderService';
import { uploadService } from '../../../services/uploadService';
import { assetUrl } from '../../../utils/assetUrl';
import { emptyLoaderConfig, LoaderConfig, LoaderSize, LoaderType, normalizeLoaderConfig } from '../../../types/loader';
import './loaders.css';

const SPAN_COUNTS: Partial<Record<LoaderType, number>> = { dots: 3, bars: 5, wave: 5, grid: 9, orbit: 1 };
const SCALES: Record<LoaderSize, number> = { small: 0.7, medium: 1, large: 1.5 };
const MAX_LIBRARY = 20;

const BUILT_IN: { value: LoaderType; label: string }[] = [
  { value: 'spinner', label: 'Spinner' },
  { value: 'ring', label: 'Ring' },
  { value: 'dots', label: 'Dots' },
  { value: 'pulse', label: 'Pulse' },
  { value: 'bars', label: 'Bars' },
  { value: 'wave', label: 'Wave' },
  { value: 'orbit', label: 'Orbit' },
  { value: 'grid', label: 'Grid' },
  { value: 'bar', label: 'Top bar' },
];

function Animation({ type, color, scale = 1 }: { type: LoaderType; color: string; scale?: number }) {
  const spans = Array.from({ length: SPAN_COUNTS[type] ?? 0 }, (_, i) => <span key={i} />);
  return (
    <span className="pv" style={{ ['--pv-color' as string]: color, transform: `scale(${scale})` } as CSSProperties} aria-hidden="true">
      <span className={`pv-${type}`}>{spans}</span>
    </span>
  );
}

export function LoaderPage() {
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [config, setConfig] = useState<LoaderConfig>(emptyLoaderConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageName, setImageName] = useState('');
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    setLoading(true);
    loaderService
      .get(groupId)
      .then((loaded) => {
        if (!cancelledRef.current) setConfig(normalizeLoaderConfig(loaded));
      })
      .catch(() => {
        if (!cancelledRef.current) message.error('Failed to load loader settings');
      })
      .finally(() => {
        if (!cancelledRef.current) setLoading(false);
      });
    return () => {
      cancelledRef.current = true;
    };
  }, [groupId]);

  const set = (patch: Partial<LoaderConfig>) => setConfig((c) => ({ ...c, ...patch }));

  const handleSave = async () => {
    if (config.enabled && config.loaderType === 'custom-image' && !config.customImageUrl) {
      message.error('Choose or upload an image first');
      return;
    }
    setSaving(true);
    try {
      setConfig(normalizeLoaderConfig(await loaderService.save(config, groupId)));
      message.success('Loader settings saved');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to save loader settings');
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (file: File) => {
    if (config.library.length >= MAX_LIBRARY) {
      message.error(`You can keep up to ${MAX_LIBRARY} images. Delete one first.`);
      return false;
    }
    setUploading(true);
    try {
      const url = await uploadService.uploadImage(file);
      const name = imageName.trim() || file.name.replace(/\.[^.]+$/, '').slice(0, 60) || 'Loader image';
      set({ library: [...config.library, { name, url }], loaderType: 'custom-image', customImageUrl: url });
      setImageName('');
      message.success('Image added. Save to apply it.');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
    return false;
  };

  const removeImage = (url: string) =>
    set({
      library: config.library.filter((i) => i.url !== url),
      ...(config.customImageUrl === url ? { customImageUrl: undefined } : {}),
    });

  const scale = SCALES[config.size];
  const previewIsImage = config.loaderType === 'custom-image';

  return (
    <div className="pt-4">
      <PageIntro
        icon={<LoadingOutlined />}
        description="Choose the loading animation people see while GHL moves between pages."
        groupId={groupId}
        onGroupChange={setGroupId}
      />

      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <Card title="Loading indicator" loading={loading}>
          <Space align="center" style={{ marginBottom: 16 }}>
            <Switch checked={config.enabled} onChange={(enabled) => set({ enabled })} />
            <Typography.Text>Enabled</Typography.Text>
          </Space>

          <div className="flex flex-wrap gap-4">
            {BUILT_IN.map((option) => {
              const selected = config.loaderType === option.value;
              return (
                <div
                  key={option.value}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selected}
                  onClick={() => set({ loaderType: option.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      set({ loaderType: option.value });
                    }
                  }}
                  className="flex flex-col items-center justify-center gap-2 cursor-pointer"
                  style={{ width: 110, height: 90, borderRadius: 8, border: selected ? '2px solid #1677ff' : '1px solid #d9d9d9', boxShadow: selected ? '0 0 0 2px rgba(22,119,255,0.2)' : 'none' }}
                >
                  <Animation type={option.value} color={config.color} />
                  <span>{option.label}</span>
                </div>
              );
            })}
            <div
              role="button"
              tabIndex={0}
              aria-pressed={previewIsImage}
              onClick={() => set({ loaderType: 'custom-image' })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  set({ loaderType: 'custom-image' });
                }
              }}
              className="flex flex-col items-center justify-center gap-2 cursor-pointer"
              style={{ width: 110, height: 90, borderRadius: 8, border: previewIsImage ? '2px solid #1677ff' : '1px solid #d9d9d9', boxShadow: previewIsImage ? '0 0 0 2px rgba(22,119,255,0.2)' : 'none' }}
            >
              <UploadOutlined style={{ fontSize: 22 }} />
              <span>My image</span>
            </div>
          </div>

          {!previewIsImage ? (
            <Space size="large" wrap style={{ marginTop: 20 }} align="end">
              <div>
                <Typography.Text type="secondary" style={{ display: 'block' }}>Color</Typography.Text>
                <input type="color" aria-label="Loader color" value={/^#[0-9a-f]{6}$/i.test(config.color) ? config.color : '#4f46e5'} onChange={(e) => set({ color: e.target.value })} />
              </div>
              <div>
                <Typography.Text type="secondary" style={{ display: 'block' }}>Size</Typography.Text>
                <Select
                  style={{ width: 130 }}
                  value={config.size}
                  onChange={(size) => set({ size })}
                  options={[{ value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' }]}
                />
              </div>
              <div style={{ minWidth: 120, minHeight: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #d9d9d9', borderRadius: 8, padding: 12 }}>
                <Animation type={config.loaderType} color={config.color} scale={config.loaderType === 'bar' ? 1 : scale} />
              </div>
            </Space>
          ) : null}
        </Card>

        {previewIsImage ? (
          <Card title="My images" loading={loading}>
            <Space.Compact style={{ width: '100%', maxWidth: 480, marginBottom: 12 }}>
              <Input placeholder="Name (optional)" maxLength={60} value={imageName} onChange={(e) => setImageName(e.target.value)} />
              <Upload showUploadList={false} beforeUpload={handleUpload} accept="image/*">
                <Button icon={<UploadOutlined />} loading={uploading}>
                  Upload image
                </Button>
              </Upload>
            </Space.Compact>
            {config.library.length === 0 ? (
              <Typography.Text type="secondary">Upload a GIF, SVG or PNG. Your images are kept here so you can switch between them.</Typography.Text>
            ) : (
              <div className="flex flex-wrap gap-4">
                {config.library.map((image) => {
                  const active = config.customImageUrl === image.url;
                  return (
                    <Card
                      key={image.url}
                      size="small"
                      style={{ width: 150, borderColor: active ? '#1677ff' : undefined }}
                      cover={
                        <div style={{ height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
                          <img src={assetUrl(image.url)} alt={image.name} style={{ maxWidth: '85%', maxHeight: 70, objectFit: 'contain' }} />
                        </div>
                      }
                      actions={[
                        <Button key="use" type={active ? 'primary' : 'link'} size="small" onClick={() => set({ customImageUrl: image.url })}>
                          {active ? 'In use' : 'Use'}
                        </Button>,
                        <Popconfirm key="del" title="Remove this image?" okText="Remove" okButtonProps={{ danger: true }} onConfirm={() => removeImage(image.url)}>
                          <DeleteOutlined aria-label={`Remove ${image.name}`} />
                        </Popconfirm>,
                      ]}
                    >
                      <Card.Meta description={image.name} />
                    </Card>
                  );
                })}
              </div>
            )}
          </Card>
        ) : null}

        <div className="flex justify-end">
          <Button type="primary" size="large" onClick={() => void handleSave()} loading={saving}>
            Save loader settings
          </Button>
        </div>
      </Space>
    </div>
  );
}
