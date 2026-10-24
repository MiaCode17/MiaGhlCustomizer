import { useEffect, useState } from 'react';
import { Button, Card, Checkbox, Form, Input, InputNumber, Modal, Space, Table, Tag, Typography, message } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, ProfileOutlined } from '@ant-design/icons';
import { PageIntro } from '../../../components/PageIntro';
import { buttonBuilderService } from '../../../services/buttonBuilderService';
import { ButtonPermissions, emptyButtonInput, InjectedButton, InjectedButtonInput } from '../../../types/button';

const SURFACE = 'opportunity-tab';

const ROLE_LABELS: Record<keyof ButtonPermissions, string> = {
  agency_admins: 'Agency admins',
  agency_users: 'Agency users',
  account_admins: 'Sub-account admins',
  account_users: 'Sub-account users',
};

/** Opportunity tabs reuse the button store: label, URL, icon, accent color, order, who sees it. */
export function OpportunityTabsPage() {
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [tabs, setTabs] = useState<InjectedButton[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<InjectedButtonInput>(emptyButtonInput(SURFACE));
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    buttonBuilderService
      .list(SURFACE, groupId)
      .then(setTabs)
      .catch((err) => message.error(err instanceof Error ? err.message : 'Failed to load tabs'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyButtonInput(SURFACE), backgroundColor: '#4f46e5' });
    setModalOpen(true);
  };

  const openEdit = (tab: InjectedButton) => {
    setEditingId(tab._id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, companyId, groupId: _g, createdAt, updatedAt, ...rest } = tab;
    const defaults = emptyButtonInput(SURFACE);
    setForm({
      ...defaults,
      ...rest,
      permissions: { ...defaults.permissions, ...(rest.permissions ?? {}) },
      menuItems: rest.menuItems ?? [],
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.label.trim()) {
      message.error('A tab name is required');
      return;
    }
    if (!(form.targetUrl ?? '').trim()) {
      message.error('A URL is required');
      return;
    }
    setSaving(true);
    try {
      if (editingId) await buttonBuilderService.update(editingId, form);
      else await buttonBuilderService.create(form, groupId);
      message.success(editingId ? 'Tab updated' : 'Tab created');
      setModalOpen(false);
      load();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to save tab');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await buttonBuilderService.remove(id);
      message.success('Tab deleted');
      load();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to delete tab');
    }
  };

  return (
    <div className="pt-4">
      <PageIntro
        icon={<ProfileOutlined />}
        description="Add tabs to the opportunity dialog that show your own page, such as a quote builder or a client file."
        groupId={groupId}
        onGroupChange={setGroupId}
      />

      <Card
        title="Opportunity tabs"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Add tab
          </Button>
        }
      >
        <Table<InjectedButton>
          rowKey="_id"
          loading={loading}
          dataSource={tabs}
          pagination={false}
          columns={[
            {
              title: 'Tab',
              key: 'label',
              render: (_, row) => (
                <Space>
                  {row.backgroundColor && (
                    <span
                      style={{
                        display: 'inline-block',
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        background: row.backgroundColor,
                      }}
                    />
                  )}
                  {row.icon} {row.label}
                </Space>
              ),
            },
            { title: 'URL', dataIndex: 'targetUrl', ellipsis: true },
            {
              title: 'Sends',
              key: 'sends',
              render: (_, row) => (
                <Space size={4}>
                  {row.sendContact && <Tag>Contact</Tag>}
                  {row.sendCustomFields && <Tag>Custom fields</Tag>}
                </Space>
              ),
            },
            { title: 'Order', dataIndex: 'order', width: 80 },
            {
              title: '',
              key: 'actions',
              render: (_, row) => (
                <>
                  <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(row)} />
                  <Button danger type="text" icon={<DeleteOutlined />} onClick={() => handleDelete(row._id)} />
                </>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={editingId ? 'Edit tab' : 'Add tab'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={saving}
        destroyOnClose
      >
        <Form layout="vertical">
          <Form.Item label="Tab name" required>
            <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
          </Form.Item>
          <Form.Item
            label="URL"
            required
            extra={
              <>
                The opportunity&apos;s ID is added as <code>opportunityId</code>. Placeholders such as{' '}
                <code>{'{{location.id}}'}</code> work too.
              </>
            }
          >
            <Input
              value={form.targetUrl}
              placeholder="https://example.com/quotes?loc={{location.id}}"
              onChange={(e) => setForm({ ...form, targetUrl: e.target.value })}
            />
          </Form.Item>
          <Space size="large" wrap align="start">
            <Form.Item label="Icon (emoji or image URL)">
              <Input
                style={{ width: 200 }}
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
              />
            </Form.Item>
            <Form.Item label="Accent color">
              <input
                type="color"
                value={form.backgroundColor || '#4f46e5'}
                onChange={(e) => setForm({ ...form, backgroundColor: e.target.value })}
              />
            </Form.Item>
            <Form.Item label="Order">
              <InputNumber value={form.order} onChange={(order) => setForm({ ...form, order: order ?? 0 })} />
            </Form.Item>
          </Space>
          <Space direction="vertical" style={{ marginBottom: 16 }}>
            <Checkbox
              checked={form.sendContact}
              onChange={(e) => setForm({ ...form, sendContact: e.target.checked })}
            >
              Send the contact&apos;s name, email and pipeline to the URL
            </Checkbox>
            <Checkbox
              checked={form.sendCustomFields}
              onChange={(e) => setForm({ ...form, sendCustomFields: e.target.checked })}
            >
              Send the opportunity&apos;s custom fields to the URL
            </Checkbox>
          </Space>
          <Typography.Text strong style={{ display: 'block', marginBottom: 6 }}>
            Who sees it
          </Typography.Text>
          <Space direction="vertical">
            {(Object.keys(ROLE_LABELS) as (keyof ButtonPermissions)[]).map((role) => (
              <Checkbox
                key={role}
                checked={form.permissions[role]}
                onChange={(e) =>
                  setForm({ ...form, permissions: { ...form.permissions, [role]: e.target.checked } })
                }
              >
                {ROLE_LABELS[role]}
              </Checkbox>
            ))}
          </Space>
        </Form>
      </Modal>
    </div>
  );
}
