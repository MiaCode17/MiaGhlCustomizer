import { useEffect, useState } from 'react';
import { Button, Card, Form, Input, Select, Space, Typography, message } from 'antd';
import { BgColorsOutlined } from '@ant-design/icons';
import { PageIntro } from '../../../components/PageIntro';
import { themeService } from '../../../services/themeService';
import { emptyTheme, Theme } from '../../../types/theme';
import { useBrandTheme } from '../../../context/BrandThemeContext';
import { ColorRulesTable } from './ColorRulesTable';
import { GradientEditor } from './GradientEditor';

const SHADOW_OPTIONS = ['none', 'sm', 'md', 'lg'] as const;

export function MakeYourOwnThemePage() {
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [theme, setTheme] = useState<Theme>(emptyTheme);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { setActiveTheme } = useBrandTheme();

  // Preview the customizer chrome in the theme's brand color as it's edited,
  // but not before the real theme has finished loading (avoids a flash of red-wine).
  useEffect(() => {
    if (!loading) setActiveTheme(theme);
  }, [theme, loading, setActiveTheme]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    themeService
      .get(groupId)
      .then((loaded) => {
        if (!cancelled) setTheme(loaded ?? emptyTheme);
      })
      .catch(() => {
        if (!cancelled) message.error('Failed to load theme');
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
      const saved = await themeService.save(theme, groupId);
      setTheme(saved);
      message.success('Theme saved');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to save theme');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageIntro
        icon={<BgColorsOutlined />}
        description="Design the color palette, gradients, and typography used across the embedded app's chrome."
        groupId={groupId}
        onGroupChange={setGroupId}
      />

      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <Card title="Brand" loading={loading}>
          <Form layout="vertical">
            <Form.Item label="Theme name">
              <Input
                value={theme.themeName}
                onChange={(e) => setTheme({ ...theme, themeName: e.target.value })}
              />
            </Form.Item>
            <Space size="large" wrap>
              <Form.Item label="Heading font">
                <Input
                  value={theme.fonts.heading}
                  onChange={(e) =>
                    setTheme({ ...theme, fonts: { ...theme.fonts, heading: e.target.value } })
                  }
                />
              </Form.Item>
              <Form.Item label="Body font">
                <Input
                  value={theme.fonts.body}
                  onChange={(e) =>
                    setTheme({ ...theme, fonts: { ...theme.fonts, body: e.target.value } })
                  }
                />
              </Form.Item>
              <Form.Item label="Border radius">
                <Input
                  value={theme.borderRadius}
                  onChange={(e) => setTheme({ ...theme, borderRadius: e.target.value })}
                  style={{ width: 100 }}
                />
              </Form.Item>
              <Form.Item label="Shadow intensity">
                <Select
                  value={theme.shadowIntensity}
                  style={{ width: 120 }}
                  options={SHADOW_OPTIONS.map((s) => ({ value: s, label: s }))}
                  onChange={(shadowIntensity) => setTheme({ ...theme, shadowIntensity })}
                />
              </Form.Item>
            </Space>
          </Form>
        </Card>

        <Card title="Color rules" loading={loading}>
          <Typography.Paragraph type="secondary">
            Map a CSS selector + property inside the embedded app to a color. The runtime
            injector replays these as a stylesheet.
          </Typography.Paragraph>
          <ColorRulesTable
            rules={theme.colorRules}
            onChange={(colorRules) => setTheme({ ...theme, colorRules })}
          />
        </Card>

        <Card title="Gradients" loading={loading}>
          <GradientEditor
            gradients={theme.gradients}
            onChange={(gradients) => setTheme({ ...theme, gradients })}
          />
        </Card>

        <div className="flex justify-end">
          <Button type="primary" size="large" onClick={handleSave} loading={saving}>
            Save theme
          </Button>
        </div>
      </Space>
    </div>
  );
}
