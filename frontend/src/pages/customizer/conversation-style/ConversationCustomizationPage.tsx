import { useEffect, useState } from 'react';
import { Button, Card, Form, Input, InputNumber, Space, Switch, Typography, message } from 'antd';
import { CommentOutlined } from '@ant-design/icons';
import { PageIntro } from '../../../components/PageIntro';
import { conversationStyleService } from '../../../services/conversationStyleService';
import { ConversationStyleConfig, emptyConversationStyle } from '../../../types/conversationStyle';

export function ConversationCustomizationPage() {
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [config, setConfig] = useState<ConversationStyleConfig>(emptyConversationStyle);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    conversationStyleService
      .get(groupId)
      .then((loaded) => {
        if (!cancelled) setConfig(loaded ?? emptyConversationStyle);
      })
      .catch(() => {
        if (!cancelled) message.error('Failed to load conversation styling');
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
      const saved = await conversationStyleService.save(config, groupId);
      setConfig(saved);
      message.success('Conversation styling saved');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to save conversation styling');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pt-4">
      <PageIntro
        icon={<CommentOutlined />}
        description="Style the embedded app's native conversations / inbox — bubble colors, font, and metadata."
        groupId={groupId}
        onGroupChange={setGroupId}
      />

      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <Card title="Conversation styling" loading={loading}>
          <Space align="center" style={{ marginBottom: 20 }}>
            <Switch checked={config.enabled} onChange={(enabled) => setConfig({ ...config, enabled })} />
            <Typography.Text>Enabled</Typography.Text>
          </Space>

          <Form layout="vertical">
            <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
              Agent bubble
            </Typography.Text>
            <Space size="large" wrap style={{ marginBottom: 20 }}>
              <Form.Item label="Bubble color" style={{ marginBottom: 0 }}>
                <input
                  type="color"
                  value={config.agentBubbleColor}
                  onChange={(e) => setConfig({ ...config, agentBubbleColor: e.target.value })}
                />
              </Form.Item>
              <Form.Item label="Text color" style={{ marginBottom: 0 }}>
                <input
                  type="color"
                  value={config.agentTextColor}
                  onChange={(e) => setConfig({ ...config, agentTextColor: e.target.value })}
                />
              </Form.Item>
            </Space>

            <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
              Contact bubble
            </Typography.Text>
            <Space size="large" wrap style={{ marginBottom: 20 }}>
              <Form.Item label="Bubble color" style={{ marginBottom: 0 }}>
                <input
                  type="color"
                  value={config.contactBubbleColor}
                  onChange={(e) => setConfig({ ...config, contactBubbleColor: e.target.value })}
                />
              </Form.Item>
              <Form.Item label="Text color" style={{ marginBottom: 0 }}>
                <input
                  type="color"
                  value={config.contactTextColor}
                  onChange={(e) => setConfig({ ...config, contactTextColor: e.target.value })}
                />
              </Form.Item>
            </Space>

            <Space size="large" wrap style={{ marginBottom: 20 }}>
              <Form.Item label="Font family" style={{ marginBottom: 0 }}>
                <Input
                  value={config.fontFamily}
                  onChange={(e) => setConfig({ ...config, fontFamily: e.target.value })}
                  style={{ width: 180 }}
                />
              </Form.Item>
              <Form.Item label="Bubble radius (px)" style={{ marginBottom: 0 }}>
                <InputNumber
                  min={0}
                  max={32}
                  value={config.bubbleRadius}
                  onChange={(v) => setConfig({ ...config, bubbleRadius: v ?? 0 })}
                />
              </Form.Item>
            </Space>

            <Space size="large">
              <Space align="center">
                <Switch
                  checked={config.showTimestamps}
                  onChange={(showTimestamps) => setConfig({ ...config, showTimestamps })}
                />
                <Typography.Text>Show timestamps</Typography.Text>
              </Space>
              <Space align="center">
                <Switch
                  checked={config.showAvatars}
                  onChange={(showAvatars) => setConfig({ ...config, showAvatars })}
                />
                <Typography.Text>Show avatars</Typography.Text>
              </Space>
            </Space>
          </Form>
        </Card>

        <div className="flex justify-end">
          <Button type="primary" size="large" onClick={handleSave} loading={saving}>
            Save conversation styling
          </Button>
        </div>
      </Space>
    </div>
  );
}
