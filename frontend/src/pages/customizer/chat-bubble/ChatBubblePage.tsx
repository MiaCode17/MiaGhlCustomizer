import { ReactNode, useEffect, useState } from 'react';
import { Alert, Button, Card, Form, Input, InputNumber, Radio, Select, Slider, Space, Switch, Tabs, Typography, Upload, message } from 'antd';
import { MessageOutlined, UploadOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { IconPicker } from '../../../components/IconPicker';
import { PageIntro } from '../../../components/PageIntro';
import { chatBubbleService } from '../../../services/chatBubbleService';
import { uploadService } from '../../../services/uploadService';
import { ChatBubbleConfig, emptyChatBubbleConfig, normalizeChatBubbleConfig } from '../../../types/chatBubble';
import { ChatNavTabsEditor } from './ChatNavTabsEditor';
import { ChatPreview } from './ChatPreview';
import { QuickActionsEditor } from './QuickActionsEditor';

function ColorField({ label, value, onChange, clearable }: { label: string; value: string; onChange: (v: string) => void; clearable?: boolean }) {
  return (
    <Form.Item label={label} style={{ marginBottom: 12 }}>
      <Space>
        <input type="color" value={value || '#ffffff'} onChange={(e) => onChange(e.target.value)} />
        {clearable && value ? (
          <Button size="small" type="link" onClick={() => onChange('')}>
            Use gradient
          </Button>
        ) : null}
      </Space>
    </Form.Item>
  );
}

function Row({ children }: { children: ReactNode }) {
  return (
    <Space size="large" align="start" wrap>
      {children}
    </Space>
  );
}

export function ChatBubblePage() {
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [config, setConfig] = useState<ChatBubbleConfig>(emptyChatBubbleConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    chatBubbleService
      .get(groupId)
      .then((loaded) => {
        if (!cancelled) setConfig(normalizeChatBubbleConfig(loaded));
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

  const set = (patch: Partial<ChatBubbleConfig>) => setConfig((c) => ({ ...c, ...patch }));

  const handleSave = async () => {
    if (config.navTabs.some((t) => !t.label.trim() || !t.url.trim())) {
      message.error('Every tab needs a name and a URL');
      return;
    }
    setSaving(true);
    try {
      const saved = await chatBubbleService.save(config, groupId);
      setConfig(normalizeChatBubbleConfig(saved));
      message.success('Chat bubble settings saved');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to save chat bubble settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (file: File) => {
    setUploading(true);
    try {
      set({ logoUrl: await uploadService.uploadImage(file) });
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to upload the logo');
    } finally {
      setUploading(false);
    }
    return false;
  };

  const contentTab = (
    <>
      <Space align="center" style={{ marginBottom: 12 }}>
        <Switch checked={config.enabled} onChange={(enabled) => set({ enabled })} />
        <Typography.Text>Show the chat bubble</Typography.Text>
      </Space>
      <div style={{ marginBottom: 16 }}>
        <Space align="center">
          <Switch checked={config.chatEnabled} onChange={(chatEnabled) => set({ chatEnabled })} />
          <Typography.Text>Live chat with your team</Typography.Text>
        </Space>
        <Typography.Paragraph type="secondary" style={{ margin: '4px 0 0' }}>
          Visitors can message you from inside a sub-account; you answer from the{' '}
          <Link to="/miaghlcustomizer/engagement/inbox">Chat Inbox</Link>. Turn it off for a link-only launcher.
        </Typography.Paragraph>
      </div>
      <Form layout="vertical">
        <Row>
          <Form.Item label="Title">
            <Input style={{ width: 240 }} value={config.title} maxLength={80} onChange={(e) => set({ title: e.target.value })} />
          </Form.Item>
          <Form.Item label="Subtitle">
            <Input style={{ width: 300 }} value={config.subtitle} maxLength={200} onChange={(e) => set({ subtitle: e.target.value })} />
          </Form.Item>
        </Row>
        <Form.Item label="Logo">
          <Space.Compact style={{ width: 420 }}>
            <Input value={config.logoUrl} placeholder="https://…/logo.png" onChange={(e) => set({ logoUrl: e.target.value })} />
            <Upload beforeUpload={handleLogoUpload} showUploadList={false} accept="image/*">
              <Button icon={<UploadOutlined />} loading={uploading}>
                Upload
              </Button>
            </Upload>
          </Space.Compact>
        </Form.Item>
        <Row>
          <Form.Item label="Status line">
            <Space>
              <Switch checked={config.showStatus} onChange={(showStatus) => set({ showStatus })} />
              <Input style={{ width: 200 }} value={config.statusText} maxLength={80} onChange={(e) => set({ statusText: e.target.value })} />
              <input type="color" value={config.statusColor} onChange={(e) => set({ statusColor: e.target.value })} />
            </Space>
          </Form.Item>
          <Form.Item label="Name on replies">
            <Input style={{ width: 160 }} value={config.agentName} maxLength={40} onChange={(e) => set({ agentName: e.target.value })} />
          </Form.Item>
        </Row>
        <Form.Item label="Welcome message">
          <Input.TextArea rows={2} value={config.welcomeMessage} maxLength={1000} onChange={(e) => set({ welcomeMessage: e.target.value })} />
        </Form.Item>
        <Form.Item label="Message box placeholder">
          <Input style={{ width: 320 }} value={config.inputPlaceholder} maxLength={80} onChange={(e) => set({ inputPlaceholder: e.target.value })} />
        </Form.Item>
        <Form.Item label="After a chat starts" extra="Shown as a note under the visitor's first message.">
          <Input.TextArea rows={2} value={config.successMessage} onChange={(e) => set({ successMessage: e.target.value })} />
        </Form.Item>
        <Form.Item label="If a message fails to send" extra="Leave empty for a standard message.">
          <Input.TextArea rows={2} value={config.errorMessage} onChange={(e) => set({ errorMessage: e.target.value })} />
        </Form.Item>
        <Form.Item
          label="Quick replies"
          extra="One-tap buttons under the welcome message; tapping one sends it as the first message. Up to 6."
        >
          <Select
            mode="tags"
            value={config.quickReplies}
            onChange={(quickReplies) => set({ quickReplies: quickReplies.slice(0, 6) })}
            tokenSeparators={[',']}
            placeholder="Type a reply and press Enter"
            disabled={!config.chatEnabled}
          />
        </Form.Item>
        <Form.Item label="Quick links" extra="Buttons under the welcome message that open a page.">
          <QuickActionsEditor quickActions={config.quickActions} onChange={(quickActions) => set({ quickActions })} />
        </Form.Item>
      </Form>
    </>
  );

  const tabsTab = (
    <>
      <Typography.Paragraph type="secondary">
        Extra tabs sit next to the Chat tab and show a page of yours inside the window: a help center, a booking page, an
        FAQ. URLs may use placeholders such as <code>{'{{location.id}}'}</code> and <code>{'{{user.email}}'}</code>.
      </Typography.Paragraph>
      <ChatNavTabsEditor tabs={config.navTabs} onChange={(navTabs) => set({ navTabs })} />
      <Space direction="vertical" style={{ marginTop: 20 }}>
        <Space>
          <Switch checked={config.hideNavTabs} onChange={(hideNavTabs) => set({ hideNavTabs })} />
          <Typography.Text>Hide the tab bar</Typography.Text>
        </Space>
        <Space>
          <Switch checked={config.hideInput} onChange={(hideInput) => set({ hideInput })} />
          <Typography.Text>Hide the message box (quick replies and links only)</Typography.Text>
        </Space>
        <Space>
          <Switch checked={config.hideSendButton} onChange={(hideSendButton) => set({ hideSendButton })} />
          <Typography.Text>Hide the Send button (Enter still sends)</Typography.Text>
        </Space>
      </Space>
    </>
  );

  const colorsTab = (
    <Form layout="vertical">
      <Typography.Text strong>Header</Typography.Text>
      <Row>
        <ColorField label="Gradient start" value={config.gradientFrom} onChange={(gradientFrom) => set({ gradientFrom })} />
        <ColorField label="Gradient end" value={config.gradientTo} onChange={(gradientTo) => set({ gradientTo })} />
        <ColorField label="Solid header (optional)" value={config.headerBgColor} clearable onChange={(headerBgColor) => set({ headerBgColor })} />
        <ColorField label="Title text" value={config.headerTitleColor} onChange={(headerTitleColor) => set({ headerTitleColor })} />
        <ColorField label="Subtitle text" value={config.headerSubtitleColor} onChange={(headerSubtitleColor) => set({ headerSubtitleColor })} />
      </Row>
      <Typography.Text strong>Messages</Typography.Text>
      <Row>
        <ColorField label="Visitor bubble" value={config.visitorBubbleBg} onChange={(visitorBubbleBg) => set({ visitorBubbleBg })} />
        <ColorField label="Visitor text" value={config.visitorBubbleText} onChange={(visitorBubbleText) => set({ visitorBubbleText })} />
        <ColorField label="Reply bubble" value={config.agentBubbleBg} onChange={(agentBubbleBg) => set({ agentBubbleBg })} />
        <ColorField label="Reply text" value={config.agentBubbleText} onChange={(agentBubbleText) => set({ agentBubbleText })} />
      </Row>
      <Typography.Text strong>Tab bar</Typography.Text>
      <Row>
        <ColorField label="Background" value={config.navBarBgColor} onChange={(navBarBgColor) => set({ navBarBgColor })} />
        <ColorField label="Border" value={config.navBarBorderColor} onChange={(navBarBorderColor) => set({ navBarBorderColor })} />
        <ColorField label="Active tab text" value={config.navTabActiveColor} onChange={(navTabActiveColor) => set({ navTabActiveColor })} />
        <ColorField label="Active tab background" value={config.navTabActiveBgColor} onChange={(navTabActiveBgColor) => set({ navTabActiveBgColor })} />
        <ColorField label="Other tabs text" value={config.navTabInactiveColor} onChange={(navTabInactiveColor) => set({ navTabInactiveColor })} />
      </Row>
      <Button
        style={{ marginTop: 8 }}
        onClick={() =>
          set({
            headerBgColor: emptyChatBubbleConfig.headerBgColor,
            headerTitleColor: emptyChatBubbleConfig.headerTitleColor,
            headerSubtitleColor: emptyChatBubbleConfig.headerSubtitleColor,
            visitorBubbleBg: emptyChatBubbleConfig.visitorBubbleBg,
            visitorBubbleText: emptyChatBubbleConfig.visitorBubbleText,
            agentBubbleBg: emptyChatBubbleConfig.agentBubbleBg,
            agentBubbleText: emptyChatBubbleConfig.agentBubbleText,
            navBarBgColor: emptyChatBubbleConfig.navBarBgColor,
            navBarBorderColor: emptyChatBubbleConfig.navBarBorderColor,
            navTabActiveColor: emptyChatBubbleConfig.navTabActiveColor,
            navTabInactiveColor: emptyChatBubbleConfig.navTabInactiveColor,
            navTabActiveBgColor: emptyChatBubbleConfig.navTabActiveBgColor,
          })
        }
      >
        Reset window colors to the defaults
      </Button>
    </Form>
  );

  const launcherTab = (
    <Form layout="vertical">
      <Row>
        <Form.Item label="Launcher icon">
          <IconPicker width={220} value={config.bubbleIcon} onChange={(bubbleIcon) => set({ bubbleIcon })} />
        </Form.Item>
        <ColorField label="Icon color" value={config.bubbleTextColor} onChange={(bubbleTextColor) => set({ bubbleTextColor })} />
        <Form.Item label={`Launcher size (${config.bubbleSize}px)`} style={{ width: 220 }}>
          <Slider min={40} max={96} value={config.bubbleSize} onChange={(bubbleSize) => set({ bubbleSize })} />
        </Form.Item>
      </Row>
      <Row>
        <Form.Item label="Side of the screen">
          <Radio.Group
            optionType="button"
            value={config.side}
            options={[
              { value: 'right', label: 'Right' },
              { value: 'left', label: 'Left' },
            ]}
            onChange={(e) => set({ side: e.target.value })}
          />
        </Form.Item>
        <Form.Item label="Distance from the side (px)">
          <InputNumber min={0} max={400} value={config.sideOffset} onChange={(v) => set({ sideOffset: v ?? 20 })} />
        </Form.Item>
        <Form.Item label="Distance from the bottom (px)">
          <InputNumber min={0} max={600} value={config.bottomOffset} onChange={(v) => set({ bottomOffset: v ?? 20 })} />
        </Form.Item>
      </Row>
      <Form.Item extra="Viewers can drag the launcher; it snaps to the left or right edge and their choice is remembered in their browser.">
        <Space>
          <Switch checked={config.draggable} onChange={(draggable) => set({ draggable })} />
          <Typography.Text>Let viewers move the launcher</Typography.Text>
        </Space>
      </Form.Item>
      <Row>
        <Form.Item label="Window width (px)">
          <InputNumber min={300} max={640} value={config.windowWidth} onChange={(v) => set({ windowWidth: v ?? 380 })} />
        </Form.Item>
        <Form.Item label="Window height (px)">
          <InputNumber min={360} max={900} value={config.windowHeight} onChange={(v) => set({ windowHeight: v ?? 560 })} />
        </Form.Item>
      </Row>
    </Form>
  );

  return (
    <div className="pt-4">
      <PageIntro
        icon={<MessageOutlined />}
        description="Brand the chat launcher and window, set up live chat with your team, and add tabs, quick replies and links."
        groupId={groupId}
        onGroupChange={setGroupId}
      />

      {config.chatEnabled && config.enabled && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="Live chat is on"
          description={
            <>
              Chats started from sub-accounts land in the <Link to="/miaghlcustomizer/engagement/inbox">Chat Inbox</Link>.
              Starting a chat needs the visitor to be signed in to GHL.
            </>
          }
        />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 420px', gap: 24, alignItems: 'start' }}>
        <Card loading={loading} bodyStyle={{ paddingTop: 8 }}>
          <Tabs
            items={[
              { key: 'content', label: 'Content', children: contentTab },
              { key: 'tabs', label: 'Tabs & behaviour', children: tabsTab },
              { key: 'colors', label: 'Colors', children: colorsTab },
              { key: 'launcher', label: 'Launcher & window', children: launcherTab },
            ]}
          />
          <div className="flex justify-end" style={{ marginTop: 16 }}>
            <Button type="primary" size="large" onClick={handleSave} loading={saving}>
              Save chat bubble settings
            </Button>
          </div>
        </Card>
        <div style={{ position: 'sticky', top: 16 }}>
          <Card title="Preview" size="small">
            <ChatPreview config={config} />
          </Card>
        </div>
      </div>
    </div>
  );
}
