import { useEffect, useState } from 'react';
import { Button, Card, Form, Input, InputNumber, Space, Switch, Typography, message } from 'antd';
import { GiftOutlined } from '@ant-design/icons';
import { PageIntro } from '../../../components/PageIntro';
import { specialThemeService } from '../../../services/specialThemeService';
import { emptySpecialTheme, SpecialTheme } from '../../../types/specialTheme';
import { OCCASIONS, OCCASION_CATEGORIES, Occasion } from '../../../utils/occasions';

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

  /** Picking an occasion also suggests its popup text, unless the agency has already written their own. */
  const pick = (occasion: Occasion) => {
    const previous = OCCASIONS.find((o) => o.key === specialTheme.themeKey);
    const popup = specialTheme.popup;
    const untouched =
      (!popup.title && !popup.message) || (previous && popup.title === previous.title && popup.message === previous.message);
    setSpecialTheme({
      ...specialTheme,
      themeKey: occasion.key,
      popup: untouched ? { ...popup, title: occasion.title, message: occasion.message } : popup,
    });
  };

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

        {OCCASION_CATEGORIES.map((category) => (
          <div key={category} style={{ marginBottom: 16 }}>
            <Typography.Text type="secondary" strong>
              {category}
            </Typography.Text>
            <div className="flex flex-wrap gap-4" style={{ marginTop: 8 }}>
              {OCCASIONS.filter((o) => o.category === category).map((theme) => {
                const selected = specialTheme.themeKey === theme.key;
                return (
                  <div
                    key={theme.key}
                    role="button"
                    tabIndex={0}
                    aria-pressed={selected}
                    title={theme.description}
                    onClick={() => pick(theme)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        pick(theme);
                      }
                    }}
                    className="flex flex-col items-center justify-center gap-2 cursor-pointer"
                    style={{
                      width: 140,
                      height: 100,
                      borderRadius: 8,
                      color: '#fff',
                      textAlign: 'center',
                      background: `linear-gradient(135deg, ${theme.accent[0]}, ${theme.accent[1]})`,
                      border: selected ? '3px solid #1677ff' : '3px solid transparent',
                      boxShadow: selected ? '0 0 0 2px rgba(22,119,255,0.3)' : 'none',
                    }}
                  >
                    <span style={{ fontSize: 28 }}>{theme.emoji}</span>
                    <span style={{ fontWeight: 600 }}>{theme.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
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
