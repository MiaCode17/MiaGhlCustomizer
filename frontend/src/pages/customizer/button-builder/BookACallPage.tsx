import { useEffect, useState } from 'react';
import { Button, Card, Form, Input, Space, Switch, message } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { PageIntro } from '../../../components/PageIntro';
import { bookACallService } from '../../../services/bookACallService';
import { BookACallConfig, emptyBookACallConfig } from '../../../types/bookACall';

export function BookACallPage() {
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [config, setConfig] = useState<BookACallConfig>(emptyBookACallConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    bookACallService
      .get(groupId)
      .then((loaded) => {
        if (!cancelled) setConfig(loaded ?? emptyBookACallConfig);
      })
      .catch(() => {
        if (!cancelled) message.error('Failed to load Book a Call settings');
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
      const saved = await bookACallService.save(config, groupId);
      setConfig(saved);
      message.success('Book a Call settings saved');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to save Book a Call settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pt-4">
      <PageIntro
        icon={<CalendarOutlined />}
        description="Show a Book a Call button that opens your booking link or calendar."
        groupId={groupId}
        onGroupChange={setGroupId}
      />

      <Card title="Book a Call" loading={loading}>
        <Form layout="vertical">
          <Form.Item label="Enabled">
            <Switch
              checked={config.enabled}
              onChange={(enabled) => setConfig({ ...config, enabled })}
            />
          </Form.Item>
          <Form.Item label="Button label" required>
            <Input
              value={config.buttonLabel}
              onChange={(e) => setConfig({ ...config, buttonLabel: e.target.value })}
            />
          </Form.Item>
          <Form.Item label="Booking link" required>
            <Input
              value={config.bookingUrl}
              placeholder="https://your-calendar-link.com"
              onChange={(e) => setConfig({ ...config, bookingUrl: e.target.value })}
            />
          </Form.Item>
          <Space size="large">
            <Form.Item label="Background color">
              <input
                type="color"
                value={config.backgroundColor}
                onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })}
              />
            </Form.Item>
            <Form.Item label="Text color">
              <input
                type="color"
                value={config.textColor}
                onChange={(e) => setConfig({ ...config, textColor: e.target.value })}
              />
            </Form.Item>
          </Space>
        </Form>

        <div className="flex justify-end">
          <Button type="primary" size="large" onClick={handleSave} loading={saving}>
            Save
          </Button>
        </div>
      </Card>
    </div>
  );
}
