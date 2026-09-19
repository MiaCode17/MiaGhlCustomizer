import { useEffect, useState } from 'react';
import { Button, Card, Form, Input, Modal, Select, Space, Table, Typography, message, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { LinkOutlined } from '@ant-design/icons';
import { PageIntro } from '../../../components/PageIntro';
import { dynamicLinksService } from '../../../services/dynamicLinksService';
import { DynamicLink, DynamicLinkInput } from '../../../types/dynamicLink';

const OPEN_MODE_OPTIONS = [
  { value: 'same-tab', label: 'Same tab' },
  { value: 'new-tab', label: 'New tab' },
  { value: 'modal', label: 'Modal' },
];

const ROLE_TARGET_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'owner', label: 'Owner' },
  { value: 'admin', label: 'Admin' },
];

const EMPTY_INPUT: DynamicLinkInput = {
  title: '',
  url: '',
  icon: '',
  openMode: 'new-tab',
  roleTarget: 'all',
};

export function DynamicLinksPage() {
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [links, setLinks] = useState<DynamicLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm<DynamicLinkInput>();

  const loadLinks = () => {
    setLoading(true);
    dynamicLinksService
      .list(groupId)
      .then(setLinks)
      .catch(() => message.error('Failed to load dynamic links'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLinks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const openCreateModal = () => {
    setEditingId(null);
    form.setFieldsValue(EMPTY_INPUT);
    setModalOpen(true);
  };

  const openEditModal = (link: DynamicLink) => {
    setEditingId(link._id);
    form.setFieldsValue({
      title: link.title,
      url: link.url,
      icon: link.icon ?? '',
      openMode: link.openMode,
      roleTarget: link.roleTarget,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editingId) {
        await dynamicLinksService.update(editingId, values);
        message.success('Link updated');
      } else {
        await dynamicLinksService.create(values, groupId);
        message.success('Link created');
      }
      setModalOpen(false);
      loadLinks();
    } catch (err) {
      if (err instanceof Error) {
        message.error(err.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dynamicLinksService.remove(id);
      message.success('Link deleted');
      loadLinks();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to delete link');
    }
  };

  const columns: ColumnsType<DynamicLink> = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'URL', dataIndex: 'url', key: 'url' },
    {
      title: 'Open mode',
      dataIndex: 'openMode',
      key: 'openMode',
      render: (value: DynamicLink['openMode']) =>
        OPEN_MODE_OPTIONS.find((o) => o.value === value)?.label ?? value,
    },
    {
      title: 'Role',
      dataIndex: 'roleTarget',
      key: 'roleTarget',
      render: (value: DynamicLink['roleTarget']) =>
        ROLE_TARGET_OPTIONS.find((o) => o.value === value)?.label ?? value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => openEditModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this link?"
            onConfirm={() => handleDelete(record._id)}
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="pt-4">
      <PageIntro
        icon={<LinkOutlined />}
        description="Add custom navigation links alongside the embedded app's built-in menu."
        groupId={groupId}
        onGroupChange={setGroupId}
      />

      <Card
        title="Links"
        extra={
          <Button type="primary" onClick={openCreateModal}>
            Add link
          </Button>
        }
      >
        <Table
          rowKey="_id"
          loading={loading}
          columns={columns}
          dataSource={links}
          pagination={false}
        />
      </Card>

      <Modal
        title={editingId ? 'Edit link' : 'Add link'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={saving}
        okText={editingId ? 'Save' : 'Create'}
      >
        <Form form={form} layout="vertical" initialValues={EMPTY_INPUT}>
          <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Title is required' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="url" label="URL" rules={[{ required: true, message: 'URL is required' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="icon" label="Icon">
            <Input placeholder="Optional icon name or URL" />
          </Form.Item>
          <Form.Item name="openMode" label="Open mode" rules={[{ required: true }]}>
            <Select options={OPEN_MODE_OPTIONS} />
          </Form.Item>
          <Form.Item name="roleTarget" label="Role" rules={[{ required: true }]}>
            <Select options={ROLE_TARGET_OPTIONS} />
          </Form.Item>
        </Form>
        <Typography.Text type="secondary">
          Titles that match a built-in HighLevel menu item (e.g. Dashboard, Contacts) are not allowed.
        </Typography.Text>
      </Modal>
    </div>
  );
}
