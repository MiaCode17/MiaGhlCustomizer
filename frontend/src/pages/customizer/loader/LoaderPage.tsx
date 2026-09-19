import { useEffect, useRef, useState } from 'react';
import { Button, Card, Space, Spin, Switch, Typography, Upload, message } from 'antd';
import { LoadingOutlined, UploadOutlined } from '@ant-design/icons';
import { PageIntro } from '../../../components/PageIntro';
import { loaderService } from '../../../services/loaderService';
import { uploadService } from '../../../services/uploadService';
import { assetUrl } from '../../../utils/assetUrl';
import { emptyLoaderConfig, LoaderConfig, LoaderType } from '../../../types/loader';

const DOTS_PREVIEW = (
  <Space size={4}>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        style={{ width: 8, height: 8, borderRadius: '50%', background: '#1677ff', opacity: 1 - i * 0.25 }}
      />
    ))}
  </Space>
);

const BAR_PREVIEW = (
  <div style={{ width: 60, height: 6, borderRadius: 3, background: '#f0f0f0', overflow: 'hidden' }}>
    <div style={{ width: '60%', height: '100%', background: '#1677ff', borderRadius: 3 }} />
  </div>
);

const LOADER_OPTIONS: { value: LoaderType; label: string; preview: React.ReactNode }[] = [
  { value: 'spinner', label: 'Spinner', preview: <Spin size="small" /> },
  { value: 'dots', label: 'Dots', preview: DOTS_PREVIEW },
  { value: 'bar', label: 'Bar', preview: BAR_PREVIEW },
  { value: 'custom-image', label: 'Custom image', preview: <UploadOutlined style={{ fontSize: 18 }} /> },
];

export function LoaderPage() {
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [config, setConfig] = useState<LoaderConfig>(emptyLoaderConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    setLoading(true);
    loaderService
      .get(groupId)
      .then((loaded) => {
        if (!cancelledRef.current) setConfig(loaded ?? emptyLoaderConfig);
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await loaderService.save(config, groupId);
      setConfig(saved);
      message.success('Loader settings saved');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to save loader settings');
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadService.uploadImage(file);
      setConfig((prev) => ({ ...prev, customImageUrl: url }));
      message.success('Image uploaded');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
    return false;
  };

  return (
    <div className="pt-4">
      <PageIntro
        icon={<LoadingOutlined />}
        description="Pick the loading animation shown while the embedded app boots."
        groupId={groupId}
        onGroupChange={setGroupId}
      />

      <Card title="Loading indicator" loading={loading}>
        <Space align="center" style={{ marginBottom: 16 }}>
          <Switch
            checked={config.enabled}
            onChange={(enabled) => setConfig({ ...config, enabled })}
          />
          <Typography.Text>Enabled</Typography.Text>
        </Space>

        <div className="flex flex-wrap gap-4">
          {LOADER_OPTIONS.map((option) => {
            const selected = config.loaderType === option.value;
            return (
              <div
                key={option.value}
                onClick={() => setConfig({ ...config, loaderType: option.value })}
                className="flex flex-col items-center justify-center gap-2 cursor-pointer"
                style={{
                  width: 120,
                  height: 90,
                  borderRadius: 8,
                  border: selected ? '2px solid #1677ff' : '1px solid #d9d9d9',
                  boxShadow: selected ? '0 0 0 2px rgba(22,119,255,0.2)' : 'none',
                }}
              >
                {option.preview}
                <span>{option.label}</span>
              </div>
            );
          })}
        </div>

        {config.loaderType === 'custom-image' && (
          <div className="mt-4">
            <Upload showUploadList={false} beforeUpload={handleUpload} accept="image/*">
              <Button icon={<UploadOutlined />} loading={uploading}>
                Upload image
              </Button>
            </Upload>
            {config.customImageUrl && (
              <div className="mt-2">
                <img
                  src={assetUrl(config.customImageUrl)}
                  alt="Custom loader"
                  style={{ maxWidth: 120, maxHeight: 80 }}
                />
              </div>
            )}
          </div>
        )}
      </Card>

      <div className="mt-4 flex justify-end">
        <Button type="primary" size="large" onClick={handleSave} loading={saving}>
          Save loader settings
        </Button>
      </div>
    </div>
  );
}
