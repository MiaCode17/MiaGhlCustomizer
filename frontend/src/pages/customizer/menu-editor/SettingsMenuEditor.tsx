import { Button, Input, Select, Table, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { MENU_OPEN_MODE_OPTIONS, SettingsMenuItem } from '../../../types/menuEdit';

interface SettingsMenuEditorProps {
  items: SettingsMenuItem[];
  onChange: (items: SettingsMenuItem[]) => void;
}

function emptyItem(type: SettingsMenuItem['type']): SettingsMenuItem {
  return { type, name: '', link: '', openMode: 'auto' };
}

export function SettingsMenuEditor({ items, onChange }: SettingsMenuEditorProps) {
  const updateRow = (index: number, patch: Partial<SettingsMenuItem>) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const removeRow = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <>
      <Typography.Paragraph type="secondary">
        Items appear in this order on GHL&apos;s Settings pages, just above the Billing entry. A divider is
        a small uppercase section heading. Links may use <code>{'{{location.id}}'}</code>,{' '}
        <code>{'{{user.email}}'}</code> and the other URL placeholders.
      </Typography.Paragraph>
      <Table<SettingsMenuItem>
        dataSource={items.map((item, i) => ({ ...item, key: i }))}
        pagination={false}
        size="small"
        footer={() => (
          <>
            <Button
              icon={<PlusOutlined />}
              type="dashed"
              style={{ marginRight: 8 }}
              onClick={() => onChange([...items, emptyItem('link')])}
            >
              Add link
            </Button>
            <Button icon={<PlusOutlined />} type="dashed" onClick={() => onChange([...items, emptyItem('divider')])}>
              Add divider
            </Button>
          </>
        )}
        columns={[
          {
            title: 'Type',
            dataIndex: 'type',
            width: 110,
            render: (_, row, i) => (
              <Select
                value={row.type}
                style={{ width: '100%' }}
                options={[
                  { value: 'link', label: 'Link' },
                  { value: 'divider', label: 'Divider' },
                ]}
                onChange={(type) => updateRow(i, { type })}
              />
            ),
          },
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
            render: (_, row, i) =>
              row.type === 'divider' ? (
                <Typography.Text type="secondary">—</Typography.Text>
              ) : (
                <Input value={row.link} onChange={(e) => updateRow(i, { link: e.target.value })} />
              ),
          },
          {
            title: 'Opens in',
            dataIndex: 'openMode',
            width: 150,
            render: (_, row, i) =>
              row.type === 'divider' ? null : (
                <Select
                  value={row.openMode}
                  options={MENU_OPEN_MODE_OPTIONS}
                  style={{ width: '100%' }}
                  onChange={(openMode) => updateRow(i, { openMode })}
                />
              ),
          },
          {
            title: '',
            key: 'actions',
            width: 130,
            render: (_, _row, i) => (
              <>
                <Button type="text" disabled={i === 0} onClick={() => move(i, -1)}>
                  ↑
                </Button>
                <Button type="text" disabled={i === items.length - 1} onClick={() => move(i, 1)}>
                  ↓
                </Button>
                <Button danger type="text" icon={<DeleteOutlined />} onClick={() => removeRow(i)} />
              </>
            ),
          },
        ]}
      />
    </>
  );
}
