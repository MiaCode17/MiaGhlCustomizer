import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { NotificationOutlined } from '@ant-design/icons';
import { PageIntro } from '../../../components/PageIntro';
import { bannersService } from '../../../services/bannersService';
import { Banner, BannerInput } from '../../../types/banner';

const TYPE_OPTIONS: { value: Banner['type']; label: string; color: string }[] = [
  { value: 'info', label: 'Info', color: 'blue' },
  { value: 'warning', label: 'Warning', color: 'gold' },
  { value: 'success', label: 'Success', color: 'green' },
  { value: 'promo', label: 'Promo', color: 'magenta' },
];

const POSITION_OPTIONS = [
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
];

const EMPTY_INPUT: BannerInput = {
  name: '',
  type: 'info',
  position: 'top',
  enabled: true,
  content: '',
};

function truncate(text: string, max = 60): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export function BannersPage() {
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm<BannerInput>();

  const loadBanners = () => {
    setLoading(true);
    bannersService
      .list(groupId)
      .then(setBanners)
      .catch(() => message.error('Failed to load banners'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBanners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const openCreateModal = () => {
    setEditingId(null);
    form.setFieldsValue(EMPTY_INPUT);
    setModalOpen(true);
  };

  const openEditModal = (banner: Banner) => {
    setEditingId(banner._id);
    form.setFieldsValue({
      name: banner.name,
      type: banner.type,
      position: banner.position,
      enabled: banner.enabled,
      content: banner.content,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editingId) {
        await bannersService.update(editingId, values);
        message.success('Banner updated');
      } else {
        await bannersService.create(values, groupId);
        message.success('Banner created');
      }
      setModalOpen(false);
      loadBanners();
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
      await bannersService.remove(id);
      message.success('Banner deleted');
      loadBanners();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to delete banner');
    }
  };

  const handleToggleEnabled = async (banner: Banner, enabled: boolean) => {
    setBanners((prev) => prev.map((b) => (b._id === banner._id ? { ...b, enabled } : b)));
    try {
      await bannersService.update(banner._id, { enabled });
    } catch (err) {
      setBanners((prev) => prev.map((b) => (b._id === banner._id ? { ...b, enabled: !enabled } : b)));
      message.error(err instanceof Error ? err.message : 'Failed to update banner');
    }
  };

  const columns: ColumnsType<Banner> = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (value: Banner['type']) => {
        const option = TYPE_OPTIONS.find((o) => o.value === value);
        return <Tag color={option?.color}>{option?.label ?? value}</Tag>;
      },
    },
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
      render: (value: Banner['position']) =>
        POSITION_OPTIONS.find((o) => o.value === value)?.label ?? value,
    },
    {
      title: 'Enabled',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean, record) => (
        <Switch checked={enabled} onChange={(checked) => handleToggleEnabled(record, checked)} />
      ),
    },
    {
      title: 'Content',
      dataIndex: 'content',
      key: 'content',
      render: (content: string) => truncate(content),
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
            title="Delete this banner?"
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
        icon={<NotificationOutlined />}
        description="Create dismissible banners shown at the top or bottom of the app."
        groupId={groupId}
        onGroupChange={setGroupId}
      />

      <Card
        title="Banners"
        extra={
          <Button type="primary" onClick={openCreateModal}>
            Add banner
          </Button>
        }
      >
        <Table rowKey="_id" loading={loading} columns={columns} dataSource={banners} pagination={false} />
      </Card>

      <Modal
        title={editingId ? 'Edit banner' : 'Add banner'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={saving}
        okText={editingId ? 'Save' : 'Create'}
      >
        <Form form={form} layout="vertical" initialValues={EMPTY_INPUT}>
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name is required' }]}>
            <Input />
          </Form.Item>
          <Space size="large" style={{ width: '100%' }}>
            <Form.Item name="type" label="Type" rules={[{ required: true }]}>
              <Select style={{ width: 160 }} options={TYPE_OPTIONS} />
            </Form.Item>
            <Form.Item name="position" label="Position" rules={[{ required: true }]}>
              <Select style={{ width: 160 }} options={POSITION_OPTIONS} />
            </Form.Item>
            <Form.Item name="enabled" label="Enabled" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Space>
          <Form.Item
            name="content"
            label="Content"
            rules={[{ required: true, message: 'Content is required' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
