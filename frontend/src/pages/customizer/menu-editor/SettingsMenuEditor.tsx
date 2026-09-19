import { Button, Input, Table } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { SettingsMenuItem } from '../../../types/menuEdit';

interface SettingsMenuEditorProps {
  items: SettingsMenuItem[];
  onChange: (items: SettingsMenuItem[]) => void;
}

function emptyItem(): SettingsMenuItem {
  return { name: '', link: '' };
}

export function SettingsMenuEditor({ items, onChange }: SettingsMenuEditorProps) {
  const updateRow = (index: number, patch: Partial<SettingsMenuItem>) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const removeRow = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <Table<SettingsMenuItem>
      dataSource={items.map((item, i) => ({ ...item, key: i }))}
      pagination={false}
      size="small"
      footer={() => (
        <Button icon={<PlusOutlined />} type="dashed" onClick={() => onChange([...items, emptyItem()])}>
          Add settings item
        </Button>
      )}
      columns={[
        {
          title: 'Name',
          dataIndex: 'name',
          render: (_, row, i) => (
            <Input value={row.name} onChange={(e) => updateRow(i, { name: e.target.value })} />
          ),
        },
        {
          title: 'Link',
          dataIndex: 'link',
          render: (_, row, i) => (
            <Input value={row.link} onChange={(e) => updateRow(i, { link: e.target.value })} />
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
