import { Button, Input, Space, Switch } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { IconPicker } from '../../../components/IconPicker';
import { ChatBubbleNavTab } from '../../../types/chatBubble';

const MAX_TABS = 6;

interface ChatNavTabsEditorProps {
  tabs: ChatBubbleNavTab[];
  onChange: (tabs: ChatBubbleNavTab[]) => void;
}

/** The extra tabs of the chat window; each shows a page of its own next to the Chat tab. */
export function ChatNavTabsEditor({ tabs, onChange }: ChatNavTabsEditorProps) {
  const update = (index: number, patch: Partial<ChatBubbleNavTab>) =>
    onChange(tabs.map((t, i) => (i === index ? { ...t, ...patch } : t)));

  return (
    <Space direction="vertical" style={{ width: '100%' }} size={10}>
      {tabs.map((tab, index) => (
        <div
          key={index}
          style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }}
        >
          <Switch
            size="small"
            checked={tab.enabled}
            onChange={(enabled) => update(index, { enabled })}
            title={tab.enabled ? 'Shown' : 'Hidden'}
          />
          <Input
            style={{ width: 130 }}
            placeholder="Tab name"
            value={tab.label}
            maxLength={30}
            onChange={(e) => update(index, { label: e.target.value })}
          />
          <IconPicker width={150} value={tab.icon} onChange={(icon) => update(index, { icon })} placeholder="Icon" />
          <Input
            style={{ flex: 1, minWidth: 220 }}
            placeholder="https://… (placeholders like {{location.id}} work)"
            value={tab.url}
            onChange={(e) => update(index, { url: e.target.value })}
          />
          <Button danger type="text" icon={<DeleteOutlined />} onClick={() => onChange(tabs.filter((_, i) => i !== index))} />
        </div>
      ))}
      <Button
        type="dashed"
        icon={<PlusOutlined />}
        disabled={tabs.length >= MAX_TABS}
        onClick={() => onChange([...tabs, { label: '', url: '', icon: '', enabled: true }])}
      >
        Add tab
      </Button>
    </Space>
  );
}
