import { useEffect, useState } from 'react';
import { Button, Card, Input, Space, Upload, message } from 'antd';
import { LoginOutlined, UploadOutlined } from '@ant-design/icons';
import { PageIntro } from '../../../components/PageIntro';
import { loginPageService } from '../../../services/loginPageService';
import { uploadService } from '../../../services/uploadService';
import { assetUrl } from '../../../utils/assetUrl';
import { emptyLoginPageConfig, LoginPageConfig } from '../../../types/loginPage';
import { PresetPicker } from './PresetPicker';
import { CssVariablesTable } from './CssVariablesTable';

export function LoginPageBuilderPage() {
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [config, setConfig] = useState<LoginPageConfig>(emptyLoginPageConfig);
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
        if (!cancelled) setConfig(loaded ?? emptyLoginPageConfig);
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await loginPageService.save(config, groupId);
      setConfig(saved);
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
      setConfig({ ...config, logoUrl: url });
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
      setConfig({ ...config, backgroundImageUrl: url });
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to upload background image');
    } finally {
      setUploadingBackground(false);
    }
    return false;
  };

  return (
    <div className="pt-4">
      <PageIntro
        icon={<LoginOutlined />}
        description="Restyle the embedded app's own login screen with layout presets and custom CSS."
        groupId={groupId}
        onGroupChange={setGroupId}
      />

      <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <Card title="Layout preset" loading={loading}>
        <PresetPicker
          value={config.preset}
          onChange={(preset) => setConfig({ ...config, preset })}
        />
      </Card>

      <Card title="Images" loading={loading}>
        <Space size="large" align="start">
          <div>
            <Upload beforeUpload={handleLogoUpload} showUploadList={false} accept="image/*">
              <Button icon={<UploadOutlined />} loading={uploadingLogo}>
                Upload logo
              </Button>
            </Upload>
            {config.logoUrl && (
              <div style={{ marginTop: 8 }}>
                <img
                  src={assetUrl(config.logoUrl)}
                  alt="Logo preview"
                  style={{ maxHeight: 80, maxWidth: 200, objectFit: 'contain' }}
                />
              </div>
            )}
          </div>
          <div>
            <Upload beforeUpload={handleBackgroundUpload} showUploadList={false} accept="image/*">
              <Button icon={<UploadOutlined />} loading={uploadingBackground}>
                Upload background image
              </Button>
            </Upload>
            {config.backgroundImageUrl && (
              <div style={{ marginTop: 8 }}>
                <img
                  src={assetUrl(config.backgroundImageUrl)}
                  alt="Background preview"
                  style={{ maxHeight: 80, maxWidth: 200, objectFit: 'cover' }}
                />
              </div>
            )}
          </div>
        </Space>
      </Card>

      <Card title="CSS variables" loading={loading}>
        <CssVariablesTable
          variables={config.cssVariables}
          onChange={(cssVariables) => setConfig({ ...config, cssVariables })}
        />
      </Card>

      <Card title="Custom CSS" loading={loading}>
        <Input.TextArea
          rows={10}
          value={config.customCss}
          onChange={(e) => setConfig({ ...config, customCss: e.target.value })}
          style={{ fontFamily: 'monospace' }}
          placeholder=".login-form { border-radius: 12px; }"
        />
      </Card>

      <div className="mt-4 flex justify-end">
        <Button type="primary" size="large" onClick={handleSave} loading={saving}>
          Save login page
        </Button>
      </div>
      </Space>
    </div>
  );
}
