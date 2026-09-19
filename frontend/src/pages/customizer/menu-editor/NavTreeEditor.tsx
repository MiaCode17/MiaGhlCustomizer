import { Button, Input, InputNumber, Select, Table } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { NavTreeItem } from '../../../types/menuEdit';

interface NavTreeEditorProps {
  items: NavTreeItem[];
  onChange: (items: NavTreeItem[]) => void;
}

const NONE_VALUE = '';

function emptyItem(): NavTreeItem {
  return {
    id: `nav-${Date.now()}-${Math.round(Math.random() * 100000)}`,
    label: '',
    url: '',
    parentId: undefined,
    order: 0,
  };
}

export function NavTreeEditor({ items, onChange }: NavTreeEditorProps) {
  const updateRow = (index: number, patch: Partial<NavTreeItem>) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const removeRow = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <Table<NavTreeItem>
      dataSource={items.map((item) => ({ ...item, key: item.id }))}
      pagination={false}
      size="small"
      footer={() => (
        <Button icon={<PlusOutlined />} type="dashed" onClick={() => onChange([...items, emptyItem()])}>
          Add nav item
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
            <Input
              value={row.url ?? ''}
              onChange={(e) => updateRow(i, { url: e.target.value })}
            />
          ),
        },
        {
          title: 'Parent',
          dataIndex: 'parentId',
          render: (_, row, i) => (
            <Select
              value={row.parentId ?? NONE_VALUE}
              style={{ minWidth: 160 }}
              onChange={(parentId) => updateRow(i, { parentId: parentId || undefined })}
              options={[
                { value: NONE_VALUE, label: 'None' },
                ...items
                  .filter((other) => other.id !== row.id)
                  .map((other) => ({ value: other.id, label: other.label || other.id })),
              ]}
            />
          ),
        },
        {
          title: 'Order',
          dataIndex: 'order',
          width: 100,
          render: (_, row, i) => (
            <InputNumber value={row.order} onChange={(order) => updateRow(i, { order: order ?? 0 })} />
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
