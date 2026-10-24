import { useEffect, useState } from 'react';
import { Button, Card, Form, Input, InputNumber, Radio, Select, Space, Switch, Tabs, Typography, message } from 'antd';
import { StarOutlined } from '@ant-design/icons';
import { IconGlyph, IconPicker } from '../../../components/IconPicker';
import { PageIntro } from '../../../components/PageIntro';
import { feedbackService } from '../../../services/feedbackService';
import {
  DEFAULT_CANCEL_REASONS,
  FeedbackConfig,
  emptyFeedbackConfig,
  normalizeFeedbackConfig,
} from '../../../types/feedback';

const EMOJIS = ['😡', '🙁', '😐', '🙂', '😍'];

function RatingPreview({ type }: { type: FeedbackConfig['ratingType'] }) {
  const items = type === 'ten' ? Array.from({ length: 10 }, (_, i) => String(i + 1)) : type === 'emoji' ? EMOJIS : ['★', '★', '★', '★', '★'];
  return (
    <Space size={4} wrap>
      {items.map((x, i) => (
        <span
          key={i}
          style={{
            minWidth: 30,
            textAlign: 'center',
            padding: '4px 6px',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            fontSize: type === 'ten' ? 13 : 20,
            color: type === 'stars' ? '#f59e0b' : undefined,
          }}
        >
          {x}
        </span>
      ))}
    </Space>
  );
}

export function FeedbackSettingsPage() {
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [config, setConfig] = useState<FeedbackConfig>(emptyFeedbackConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    feedbackService
      .getConfig(groupId)
      .then((loaded) => {
        if (!cancelled) setConfig(normalizeFeedbackConfig(loaded));
      })
      .catch(() => {
        if (!cancelled) message.error('Failed to load feedback settings');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [groupId]);

  const set = (patch: Partial<FeedbackConfig>) => setConfig((c) => ({ ...c, ...patch }));
  const setCancel = (patch: Partial<FeedbackConfig['cancel']>) => setConfig((c) => ({ ...c, cancel: { ...c.cancel, ...patch } }));

  const handleSave = async () => {
    const reasons = config.cancel.reasons.map((r) => r.trim()).filter(Boolean);
    if (config.cancel.enabled && reasons.length === 0) {
      message.error('Add at least one cancellation reason');
      return;
    }
    setSaving(true);
    try {
      const saved = await feedbackService.saveConfig({ ...config, cancel: { ...config.cancel, reasons } }, groupId);
      setConfig(normalizeFeedbackConfig(saved));
      message.success('Feedback settings saved');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to save feedback settings');
    } finally {
      setSaving(false);
    }
  };

  const ratingTab = (
    <Card size="small" loading={loading}>
      <Space align="center" style={{ marginBottom: 12 }}>
        <Switch checked={config.enabled} onChange={(enabled) => set({ enabled })} />
        <Typography.Text>Show a feedback button in GHL</Typography.Text>
      </Space>
      <Form layout="vertical">
        <Form.Item label="Rating type">
          <Radio.Group value={config.ratingType} onChange={(e) => set({ ratingType: e.target.value })}>
            <Radio.Button value="stars">Stars (1-5)</Radio.Button>
            <Radio.Button value="emoji">Faces (1-5)</Radio.Button>
            <Radio.Button value="ten">Numbers (1-10)</Radio.Button>
          </Radio.Group>
          <div style={{ marginTop: 8 }}>
            <RatingPreview type={config.ratingType} />
          </div>
        </Form.Item>
        <Form.Item label="Question">
          <Input style={{ maxWidth: 420 }} value={config.title} maxLength={120} onChange={(e) => set({ title: e.target.value })} />
        </Form.Item>
        <Space size="large" wrap align="start">
          <Form.Item label="Button text">
            <Input style={{ width: 180 }} value={config.buttonText} maxLength={30} onChange={(e) => set({ buttonText: e.target.value })} />
          </Form.Item>
          <Form.Item label="Icon">
            <IconPicker value={config.icon} onChange={(icon) => set({ icon })} />
          </Form.Item>
          <Form.Item label="Placement">
            <Select
              style={{ width: 190 }}
              value={config.placement}
              onChange={(placement) => set({ placement })}
              options={[
                { value: 'right', label: 'Right edge' },
                { value: 'left', label: 'Left edge' },
                { value: 'bottom-right', label: 'Bottom right corner' },
                { value: 'bottom-left', label: 'Bottom left corner' },
                { value: 'header', label: 'Top bar' },
              ]}
            />
          </Form.Item>
          <Form.Item label="Background">
            <input type="color" value={config.backgroundColor} onChange={(e) => set({ backgroundColor: e.target.value })} />
          </Form.Item>
          <Form.Item label="Text color">
            <input type="color" value={config.textColor} onChange={(e) => set({ textColor: e.target.value })} />
          </Form.Item>
        </Space>
        <Space size="large" wrap align="start">
          <Form.Item label="Comment box">
            <Select
              style={{ width: 160 }}
              value={config.commentMode}
              onChange={(commentMode) => set({ commentMode })}
              options={[
                { value: 'off', label: 'Hidden' },
                { value: 'optional', label: 'Optional' },
                { value: 'required', label: 'Required' },
              ]}
            />
          </Form.Item>
          {config.commentMode !== 'off' ? (
            <Form.Item label="Comment placeholder">
              <Input style={{ width: 280 }} value={config.commentPlaceholder} maxLength={120} onChange={(e) => set({ commentPlaceholder: e.target.value })} />
            </Form.Item>
          ) : null}
        </Space>
        <Form.Item label="Thank-you message">
          <Input style={{ maxWidth: 420 }} value={config.thanksMessage} maxLength={200} onChange={(e) => set({ thanksMessage: e.target.value })} />
        </Form.Item>
        <Space size="large" wrap align="start">
          <Form.Item label="Hide the button after feedback for (hours)" extra="0 keeps it always visible.">
            <InputNumber min={0} max={720} value={config.cooldownHours} onChange={(v) => set({ cooldownHours: Math.round(v ?? 0) })} />
          </Form.Item>
          <Form.Item label="Let people drag it along the edges">
            <Switch checked={config.draggable} onChange={(draggable) => set({ draggable })} />
          </Form.Item>
          <Form.Item label="Ask for a rating when a support chat ends">
            <Switch checked={config.askAfterChat} onChange={(askAfterChat) => set({ askAfterChat })} />
          </Form.Item>
        </Space>
        <Form.Item label="Button preview">
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              background: config.backgroundColor,
              color: config.textColor,
              borderRadius: 10,
              fontWeight: 600,
            }}
          >
            <IconGlyph value={config.icon} />
            {config.buttonText}
          </span>
        </Form.Item>
      </Form>
    </Card>
  );

  const cancelTab = (
    <Card size="small" loading={loading}>
      <Space align="center" style={{ marginBottom: 4 }}>
        <Switch checked={config.cancel.enabled} onChange={(enabled) => setCancel({ enabled })} />
        <Typography.Text>Ask why when someone cancels their subscription</Typography.Text>
      </Space>
      <Typography.Paragraph type="secondary">
        A short pop-up appears when a client presses Cancel on their GHL billing page. Their answer is recorded under Feedback Responses.
      </Typography.Paragraph>
      <Form layout="vertical">
        <Form.Item label="Answering">
          <Radio.Group value={config.cancel.required} onChange={(e) => setCancel({ required: e.target.value })}>
            <Radio.Button value={false}>Optional (they can skip)</Radio.Button>
            <Radio.Button value={true}>Required</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="Title">
          <Input style={{ maxWidth: 420 }} value={config.cancel.title} maxLength={80} onChange={(e) => setCancel({ title: e.target.value })} />
        </Form.Item>
        <Form.Item label="Message">
          <Input.TextArea style={{ maxWidth: 420 }} rows={2} value={config.cancel.message} maxLength={300} onChange={(e) => setCancel({ message: e.target.value })} />
        </Form.Item>
        <Form.Item label="Reasons to choose from" extra="One per line, up to 10.">
          <Input.TextArea
            style={{ maxWidth: 420 }}
            rows={6}
            value={config.cancel.reasons.join('\n')}
            onChange={(e) => setCancel({ reasons: e.target.value.split('\n').slice(0, 10) })}
          />
          <Button type="link" style={{ padding: 0 }} onClick={() => setCancel({ reasons: [...DEFAULT_CANCEL_REASONS] })}>
            Restore the default list
          </Button>
        </Form.Item>
        <Form.Item label="Comment placeholder">
          <Input style={{ maxWidth: 420 }} value={config.cancel.commentPlaceholder} maxLength={120} onChange={(e) => setCancel({ commentPlaceholder: e.target.value })} />
        </Form.Item>
      </Form>
    </Card>
  );

  return (
    <div>
      <PageIntro
        icon={<StarOutlined />}
        description="Collect ratings from the people using GHL, rate finished support chats, and learn why clients cancel."
        groupId={groupId}
        onGroupChange={setGroupId}
      />
      <Tabs
        items={[
          { key: 'rating', label: 'Feedback button', children: ratingTab },
          { key: 'cancel', label: 'Cancellation survey', children: cancelTab },
        ]}
      />
      <Button type="primary" loading={saving} onClick={() => void handleSave()}>
        Save
      </Button>
    </div>
  );
}
