import { useEffect, useState } from 'react';
import { Button, Card, Form, Input, Space, Switch, Typography, message } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import { PageIntro } from '../../../components/PageIntro';
import { chatBubbleService } from '../../../services/chatBubbleService';
import { ChatBubbleConfig, emptyChatBubbleConfig } from '../../../types/chatBubble';
import { QuickActionsEditor } from './QuickActionsEditor';

export function ChatBubblePage() {
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [config, setConfig] = useState<ChatBubbleConfig>(emptyChatBubbleConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    chatBubbleService
      .get(groupId)
      .then((loaded) => {
        if (!cancelled) setConfig(loaded ?? emptyChatBubbleConfig);
      })
      .catch(() => {
        if (!cancelled) message.error('Failed to load chat bubble settings');
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
      const saved = await chatBubbleService.save(config, groupId);
      setConfig(saved);
      message.success('Chat bubble settings saved');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to save chat bubble settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pt-4">
      <PageIntro
        icon={<MessageOutlined />}
        description="Brand the floating chat launcher with your own colors and copy."
        groupId={groupId}
        onGroupChange={setGroupId}
      />

      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <Card title="Chat bubble widget" loading={loading}>
          <Space align="center" style={{ marginBottom: 16 }}>
            <Switch
              checked={config.enabled}
              onChange={(enabled) => setConfig({ ...config, enabled })}
            />
            <Typography.Text>Enabled</Typography.Text>
          </Space>

          <Form layout="vertical">
            <Space size="large" style={{ width: '100%' }}>
              <Form.Item label="Title">
                <Input
                  value={config.title}
                  onChange={(e) => setConfig({ ...config, title: e.target.value })}
                />
              </Form.Item>
              <Form.Item label="Subtitle">
                <Input
                  value={config.subtitle}
                  onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                />
              </Form.Item>
            </Space>

            <Form.Item label="Gradient">
              <Space align="center">
                <input
                  type="color"
                  value={config.gradientFrom}
                  onChange={(e) => setConfig({ ...config, gradientFrom: e.target.value })}
                />
                <input
                  type="color"
                  value={config.gradientTo}
                  onChange={(e) => setConfig({ ...config, gradientTo: e.target.value })}
                />
                <div
                  style={{
                    width: 80,
                    height: 24,
                    borderRadius: 4,
                    background: `linear-gradient(90deg, ${config.gradientFrom}, ${config.gradientTo})`,
                  }}
                />
              </Space>
            </Form.Item>

            <Form.Item label="Welcome message">
              <Input.TextArea
                rows={2}
                value={config.welcomeMessage}
                onChange={(e) => setConfig({ ...config, welcomeMessage: e.target.value })}
              />
            </Form.Item>
            <Form.Item label="Success message">
              <Input.TextArea
                rows={2}
                value={config.successMessage}
                onChange={(e) => setConfig({ ...config, successMessage: e.target.value })}
              />
            </Form.Item>
            <Form.Item label="Error message">
              <Input.TextArea
                rows={2}
                value={config.errorMessage}
                onChange={(e) => setConfig({ ...config, errorMessage: e.target.value })}
              />
            </Form.Item>
          </Form>
        </Card>

        <Card title="Quick actions" loading={loading}>
          <QuickActionsEditor
            quickActions={config.quickActions}
            onChange={(quickActions) => setConfig({ ...config, quickActions })}
          />
        </Card>

        <div className="flex justify-end">
          <Button type="primary" size="large" onClick={handleSave} loading={saving}>
            Save chat bubble settings
          </Button>
        </div>
      </Space>
    </div>
  );
}
