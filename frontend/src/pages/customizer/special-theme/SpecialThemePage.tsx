import { useEffect, useState } from 'react';
import { Button, Card, Form, Input, InputNumber, Space, Switch, Typography, message } from 'antd';
import { GiftOutlined } from '@ant-design/icons';
import { PageIntro } from '../../../components/PageIntro';
import { specialThemeService } from '../../../services/specialThemeService';
import { emptySpecialTheme, SpecialTheme } from '../../../types/specialTheme';

const SEASONAL_THEMES = [
  { key: 'christmas', label: 'Christmas', emoji: '🎄', gradient: ['#1b4332', '#d90429'] },
  { key: 'halloween', label: 'Halloween', emoji: '🎃', gradient: ['#ff7b00', '#240046'] },
  { key: 'thanksgiving', label: 'Thanksgiving', emoji: '🦃', gradient: ['#7f4f24', '#d4a373'] },
  { key: 'new-year', label: 'New Year', emoji: '🎉', gradient: ['#ffd60a', '#000814'] },
  { key: 'valentines', label: "Valentine's", emoji: '💕', gradient: ['#ff8fa3', '#c9184a'] },
  { key: 'summer', label: 'Summer', emoji: '☀️', gradient: ['#00b4d8', '#ffb703'] },
  { key: 'black-friday', label: 'Black Friday', emoji: '🛍️', gradient: ['#000000', '#7a1f2b'] },
] as const;

export function SpecialThemePage() {
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [specialTheme, setSpecialTheme] = useState<SpecialTheme>(emptySpecialTheme);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    specialThemeService
      .get(groupId)
      .then((loaded) => {
        if (!cancelled) setSpecialTheme(loaded ?? emptySpecialTheme);
      })
      .catch(() => {
        if (!cancelled) message.error('Failed to load special theme');
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
      const saved = await specialThemeService.save(specialTheme, groupId);
      setSpecialTheme(saved);
      message.success('Special theme saved');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to save special theme');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pt-4">
      <PageIntro
        icon={<GiftOutlined />}
        description="Occasional themes: turn on a festive seasonal skin with an optional popup and page effect. To design a fully custom one-off look instead, use Make Your Own and save it under its own name."
        groupId={groupId}
        onGroupChange={setGroupId}
      />

      <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <Card title="Seasonal theme" loading={loading}>
        <Space align="center" style={{ marginBottom: 16 }}>
          <Switch
            checked={specialTheme.enabled}
            onChange={(enabled) => setSpecialTheme({ ...specialTheme, enabled })}
          />
          <Typography.Text>Enabled</Typography.Text>
        </Space>

        <div className="flex flex-wrap gap-4">
          {SEASONAL_THEMES.map((theme) => {
            const selected = specialTheme.themeKey === theme.key;
            return (
              <div
                key={theme.key}
                onClick={() => setSpecialTheme({ ...specialTheme, themeKey: theme.key })}
                className="flex flex-col items-center justify-center gap-2 cursor-pointer"
                style={{
                  width: 140,
                  height: 100,
                  borderRadius: 8,
                  color: '#fff',
                  background: `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})`,
                  border: selected ? '3px solid #1677ff' : '3px solid transparent',
                  boxShadow: selected ? '0 0 0 2px rgba(22,119,255,0.3)' : 'none',
                }}
              >
                <span style={{ fontSize: 28 }}>{theme.emoji}</span>
                <span style={{ fontWeight: 600 }}>{theme.label}</span>
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="Popup" loading={loading}>
        <Form layout="vertical">
          <Space align="center" style={{ marginBottom: 16 }}>
            <Switch
              checked={specialTheme.popup.visible}
              onChange={(visible) =>
                setSpecialTheme({ ...specialTheme, popup: { ...specialTheme.popup, visible } })
              }
            />
            <Typography.Text>Show popup</Typography.Text>
          </Space>
          <Form.Item label="Title">
            <Input
              value={specialTheme.popup.title}
              onChange={(e) =>
                setSpecialTheme({
                  ...specialTheme,
                  popup: { ...specialTheme.popup, title: e.target.value },
                })
              }
            />
          </Form.Item>
          <Form.Item label="Message">
            <Input.TextArea
              rows={3}
              value={specialTheme.popup.message}
              onChange={(e) =>
                setSpecialTheme({
                  ...specialTheme,
                  popup: { ...specialTheme.popup, message: e.target.value },
                })
              }
            />
          </Form.Item>
          <Space size="large">
            <Form.Item label="CTA text">
              <Input
                value={specialTheme.popup.ctaText}
                onChange={(e) =>
                  setSpecialTheme({
                    ...specialTheme,
                    popup: { ...specialTheme.popup, ctaText: e.target.value },
                  })
                }
              />
            </Form.Item>
            <Form.Item label="CTA URL">
              <Input
                value={specialTheme.popup.ctaUrl}
                onChange={(e) =>
                  setSpecialTheme({
                    ...specialTheme,
                    popup: { ...specialTheme.popup, ctaUrl: e.target.value },
                  })
                }
                style={{ width: 260 }}
              />
            </Form.Item>
          </Space>
        </Form>
      </Card>

      <Card title="Particle effect" loading={loading}>
        <Space align="center" size="large">
          <Space align="center">
            <Switch
              checked={specialTheme.particleEffect.enabled}
              onChange={(enabled) =>
                setSpecialTheme({
                  ...specialTheme,
                  particleEffect: { ...specialTheme.particleEffect, enabled },
                })
              }
            />
            <Typography.Text>Enabled</Typography.Text>
          </Space>
          <Form.Item label="Duration (seconds)" style={{ marginBottom: 0 }}>
            <InputNumber
              min={0}
              value={specialTheme.particleEffect.durationSeconds}
              onChange={(durationSeconds) =>
                setSpecialTheme({
                  ...specialTheme,
                  particleEffect: {
                    ...specialTheme.particleEffect,
                    durationSeconds: durationSeconds ?? 0,
                  },
                })
              }
            />
          </Form.Item>
        </Space>
      </Card>

      <div className="mt-4 flex justify-end">
        <Button type="primary" size="large" onClick={handleSave} loading={saving}>
          Save special theme
        </Button>
      </div>
      </Space>
    </div>
  );
}
