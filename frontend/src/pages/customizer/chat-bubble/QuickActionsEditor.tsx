import { Button, Input, Space, Table } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { ChatBubbleQuickAction } from '../../../types/chatBubble';

interface QuickActionsEditorProps {
  quickActions: ChatBubbleQuickAction[];
  onChange: (quickActions: ChatBubbleQuickAction[]) => void;
}

function emptyQuickAction(): ChatBubbleQuickAction {
  return { label: '', url: '' };
}

export function QuickActionsEditor({ quickActions, onChange }: QuickActionsEditorProps) {
  const updateRow = (index: number, patch: Partial<ChatBubbleQuickAction>) => {
    onChange(quickActions.map((a, i) => (i === index ? { ...a, ...patch } : a)));
  };

  const removeRow = (index: number) => {
    onChange(quickActions.filter((_, i) => i !== index));
  };

  return (
    <Table<ChatBubbleQuickAction>
      dataSource={quickActions.map((a, i) => ({ ...a, key: i }))}
      pagination={false}
      size="small"
      footer={() => (
        <Button
          icon={<PlusOutlined />}
          onClick={() => onChange([...quickActions, emptyQuickAction()])}
          type="dashed"
        >
          Add quick action
        </Button>
      )}
      columns={[
        {
          title: 'Label',
          dataIndex: 'label',
          render: (_, row, i) => (
            <Input value={row.label} onChange={(e) => updateRow(i, { label: e.target.value })} />
          ),
        },
        {
          title: 'URL',
          dataIndex: 'url',
          render: (_, row, i) => (
            <Input value={row.url} onChange={(e) => updateRow(i, { url: e.target.value })} />
          ),
        },
        {
          title: '',
          key: 'actions',
          render: (_, _row, i) => (
            <Space>
              <Button danger type="text" icon={<DeleteOutlined />} onClick={() => removeRow(i)} />
            </Space>
          ),
        },
      ]}
    />
  );
}
