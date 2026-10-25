import { Button, Checkbox, Input, Popover, Select, Space, Table, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined, TeamOutlined } from '@ant-design/icons';
import {
  allRoles,
  EXTENDED_TAB_PAGE_OPTIONS,
  ExtendedTab,
  ROLE_KEYS,
  ROLE_LABELS,
  RoleKey,
} from '../../../types/menuEdit';

interface ExtendedTabsEditorProps {
  tabs: ExtendedTab[];
  onChange: (tabs: ExtendedTab[]) => void;
}

function emptyTab(): ExtendedTab {
  return {
    id: `tab-${Date.now()}-${Math.round(Math.random() * 100000)}`,
    label: '',
    url: '',
    page: 'opportunities',
    permissions: allRoles(),
  };
}

export function ExtendedTabsEditor({ tabs, onChange }: ExtendedTabsEditorProps) {
  const update = (index: number, patch: Partial<ExtendedTab>) =>
    onChange(tabs.map((tab, i) => (i === index ? { ...tab, ...patch } : tab)));

  return (
    <>
      <Typography.Paragraph type="secondary">
        Adds a tab to the sub-navigation bar of a GHL page (the row of tabs under the page title). Opening
        it shows your URL inside the page; clicking any native tab brings the normal view back. Tabs for
        the same page appear in this order. The URL can use placeholders such as{' '}
        <code>{'{{location.id}}'}</code>.
      </Typography.Paragraph>
      <Table<ExtendedTab>
        dataSource={tabs.map((tab) => ({ ...tab, key: tab.id }))}
        pagination={false}
        size="small"
        scroll={{ x: 900 }}
        footer={() => (
          <Button icon={<PlusOutlined />} type="dashed" onClick={() => onChange([...tabs, emptyTab()])}>
            Add tab
          </Button>
        )}
        columns={[
          {
            title: 'Page',
            dataIndex: 'page',
            width: 160,
            render: (_, row, i) => (
              <Select
                value={row.page}
                options={EXTENDED_TAB_PAGE_OPTIONS}
                style={{ width: '100%' }}
                onChange={(page) => update(i, { page })}
              />
            ),
          },
          {
            title: 'Tab label',
            dataIndex: 'label',
            width: 170,
            render: (_, row, i) => (
              <Input value={row.label} onChange={(e) => update(i, { label: e.target.value })} />
            ),
          },
          {
            title: 'URL',
            dataIndex: 'url',
            render: (_, row, i) => (
              <Space direction="vertical" style={{ width: '100%' }} size={6}>
                <Input
                  value={row.url}
                  placeholder="https://example.com/tool?loc={{location.id}}"
                  onChange={(e) => update(i, { url: e.target.value })}
                />
                {row.page === 'custom' && (
                  <>
                    <Input
                      value={row.routeContains ?? ''}
                      placeholder="Show on routes containing… e.g. /reporting"
                      onChange={(e) => update(i, { routeContains: e.target.value })}
                    />
                    <Input
                      value={row.referenceSelector ?? ''}
                      placeholder="Insert after this tab (CSS selector) e.g. #tb_reports"
                      onChange={(e) => update(i, { referenceSelector: e.target.value })}
                    />
                    <Input
                      value={row.containerSelector ?? ''}
                      placeholder="Content area to replace (CSS selector) e.g. .hl-wrapper-container"
                      onChange={(e) => update(i, { containerSelector: e.target.value })}
                    />
                  </>
                )}
              </Space>
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
                            update(i, { permissions: { ...row.permissions, [role]: e.target.checked } })
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
              <Button
                danger
                type="text"
                icon={<DeleteOutlined />}
                onClick={() => onChange(tabs.filter((_t, idx) => idx !== i))}
              />
            ),
          },
        ]}
      />
    </>
  );
}
