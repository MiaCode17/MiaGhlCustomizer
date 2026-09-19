import { Button, Input, Table } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { FloatingButtonSubItem } from '../../../types/floatingButton';

interface SubItemsEditorProps {
  subItems: FloatingButtonSubItem[];
  onChange: (subItems: FloatingButtonSubItem[]) => void;
}

const MAX_SUB_ITEMS = 8;

function emptySubItem(): FloatingButtonSubItem {
  return { label: '', url: '' };
}

export function SubItemsEditor({ subItems, onChange }: SubItemsEditorProps) {
  const updateRow = (index: number, patch: Partial<FloatingButtonSubItem>) => {
    onChange(subItems.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const removeRow = (index: number) => {
    onChange(subItems.filter((_, i) => i !== index));
  };

  return (
    <Table<FloatingButtonSubItem>
      dataSource={subItems.map((item, i) => ({ ...item, key: i }))}
      pagination={false}
      size="small"
      footer={() => (
        <Button
          icon={<PlusOutlined />}
          type="dashed"
          disabled={subItems.length >= MAX_SUB_ITEMS}
          onClick={() => onChange([...subItems, emptySubItem()])}
        >
          Add sub-item
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
            <Button danger type="text" icon={<DeleteOutlined />} onClick={() => removeRow(i)} />
          ),
        },
      ]}
    />
  );
}
