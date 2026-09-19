import { useEffect, useState } from 'react';
import { Form, Input, Modal, Select, Space, Typography, message } from 'antd';
import { ColorRulesTable } from './ColorRulesTable';
import { GradientEditor } from './GradientEditor';
import { Theme, emptyTheme } from '../../../types/theme';

const SHADOW_OPTIONS = ['none', 'sm', 'md', 'lg'] as const;

function blankCustomTheme(): Theme {
  return { ...emptyTheme, themeName: '', description: '' };
}

interface CreateThemeModalProps {
  open: boolean;
  onCancel: () => void;
  onCreate: (theme: Theme) => void;
}

export function CreateThemeModal({ open, onCancel, onCreate }: CreateThemeModalProps) {
  const [draft, setDraft] = useState<Theme>(blankCustomTheme);

  useEffect(() => {
    if (open) setDraft(blankCustomTheme());
  }, [open]);

  const handleOk = () => {
    if (!draft.themeName.trim()) {
      message.error('Give your theme a name');
      return;
    }
    onCreate({
      ...draft,
      id: `custom-${Date.now()}`,
      themeName: draft.themeName.trim(),
      isCustom: true,
      enabled: true,
    });
  };

  return (
    <Modal
      title="Design your own theme"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Create theme"
      width={760}
      destroyOnClose
    >
      <Typography.Paragraph type="secondary">
        This theme is just for you — it won't be shared with anyone else, only added to your own
        collection above.
      </Typography.Paragraph>

      <Form layout="vertical">
        <Space size="large" wrap style={{ width: '100%' }}>
          <Form.Item label="Theme name" required style={{ minWidth: 220 }}>
            <Input
              value={draft.themeName}
              placeholder="e.g. My Studio Look"
              onChange={(e) => setDraft({ ...draft, themeName: e.target.value })}
            />
          </Form.Item>
          <Form.Item label="Tagline" style={{ minWidth: 260, flex: 1 }}>
            <Input
              value={draft.description}
              placeholder="A short description of the vibe"
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
          </Form.Item>
        </Space>
        <Space size="large" wrap>
          <Form.Item label="Heading font">
            <Input
              value={draft.fonts.heading}
              onChange={(e) => setDraft({ ...draft, fonts: { ...draft.fonts, heading: e.target.value } })}
            />
          </Form.Item>
          <Form.Item label="Body font">
            <Input
              value={draft.fonts.body}
              onChange={(e) => setDraft({ ...draft, fonts: { ...draft.fonts, body: e.target.value } })}
            />
          </Form.Item>
          <Form.Item label="Border radius">
            <Input
              value={draft.borderRadius}
              onChange={(e) => setDraft({ ...draft, borderRadius: e.target.value })}
              style={{ width: 100 }}
            />
          </Form.Item>
          <Form.Item label="Shadow intensity">
            <Select
              value={draft.shadowIntensity}
              style={{ width: 120 }}
              options={SHADOW_OPTIONS.map((s) => ({ value: s, label: s }))}
              onChange={(shadowIntensity) => setDraft({ ...draft, shadowIntensity })}
            />
          </Form.Item>
        </Space>
      </Form>

      <Typography.Title level={5} style={{ marginTop: 8 }}>
        Color rules
      </Typography.Title>
      <ColorRulesTable
        rules={draft.colorRules}
        onChange={(colorRules) => setDraft({ ...draft, colorRules })}
      />

      <Typography.Title level={5} style={{ marginTop: 16 }}>
        Gradients
      </Typography.Title>
      <GradientEditor
        gradients={draft.gradients}
        onChange={(gradients) => setDraft({ ...draft, gradients })}
      />
    </Modal>
  );
}
