import { Button, Checkbox, Input, InputNumber, Popover, Select, Table } from 'antd';
import { DeleteOutlined, PlusOutlined, TeamOutlined } from '@ant-design/icons';
import {
  allRoles,
  MENU_OPEN_MODE_OPTIONS,
  NavTreeItem,
  ROLE_KEYS,
  ROLE_LABELS,
  RoleKey,
} from '../../../types/menuEdit';

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
    icon: '',
    openMode: 'auto',
    permissions: allRoles(),
  };
}

export function NavTreeEditor({ items, onChange }: NavTreeEditorProps) {
  const updateRow = (index: number, patch: Partial<NavTreeItem>) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const removeRow = (index: number) => {
    // Children of a removed item move up to the top level instead of becoming orphans.
    const removed = items[index];
    onChange(
      items
        .filter((_, i) => i !== index)
        .map((item) => (item.parentId === removed.id ? { ...item, parentId: undefined } : item)),
    );
  };

  return (
    <Table<NavTreeItem>
      dataSource={items.map((item) => ({ ...item, key: item.id }))}
      pagination={false}
      size="small"
      scroll={{ x: 1000 }}
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
          title: 'Icon',
          dataIndex: 'icon',
          width: 110,
          render: (_, row, i) => (
            <Input
              value={row.icon ?? ''}
              placeholder="emoji / URL"
              onChange={(e) => updateRow(i, { icon: e.target.value })}
            />
          ),
        },
        {
          title: 'URL',
          dataIndex: 'url',
          render: (_, row, i) => (
            <Input
              value={row.url ?? ''}
              placeholder="empty = folder"
              onChange={(e) => updateRow(i, { url: e.target.value })}
            />
          ),
        },
        {
          title: 'Opens in',
          dataIndex: 'openMode',
          width: 140,
          render: (_, row, i) => (
            <Select
              value={row.openMode}
              options={MENU_OPEN_MODE_OPTIONS}
              style={{ width: '100%' }}
              onChange={(openMode) => updateRow(i, { openMode })}
            />
          ),
        },
        {
          title: 'Parent',
          dataIndex: 'parentId',
          render: (_, row, i) => (
            <Select
              value={row.parentId ?? NONE_VALUE}
              style={{ minWidth: 140 }}
              onChange={(parentId) => updateRow(i, { parentId: parentId || undefined })}
              options={[
                { value: NONE_VALUE, label: 'None' },
                ...items
                  .filter((other) => other.id !== row.id && !other.parentId)
                  .map((other) => ({ value: other.id, label: other.label || other.id })),
              ]}
            />
          ),
        },
        {
          title: 'Order',
          dataIndex: 'order',
          width: 90,
          render: (_, row, i) => (
            <InputNumber value={row.order} onChange={(order) => updateRow(i, { order: order ?? 0 })} />
          ),
        },
        {
          title: 'Who sees it',
          key: 'permissions',
          width: 120,
          render: (_, row, i) => {
            const blocked = ROLE_KEYS.filter((k) => !row.permissions[k]).length;
            return (
              <Popover
                trigger="click"
                title="Visible to"
                content={
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {ROLE_KEYS.map((role: RoleKey) => (
                      <Checkbox
                        key={role}
                        checked={row.permissions[role]}
                        onChange={(e) =>
                          updateRow(i, { permissions: { ...row.permissions, [role]: e.target.checked } })
                        }
                      >
                        {ROLE_LABELS[role]}
                      </Checkbox>
                    ))}
                  </div>
                }
              >
                <Button size="small" icon={<TeamOutlined />}>
                  {blocked === 0 ? 'Everyone' : `${4 - blocked} of 4`}
                </Button>
              </Popover>
            );
          },
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
