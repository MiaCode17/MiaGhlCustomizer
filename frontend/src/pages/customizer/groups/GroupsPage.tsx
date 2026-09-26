import { useState } from 'react';
import {
  Button,
  Card,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Radio,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import { ClusterOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useGroups } from '../../../context/GroupsContext';
import { Group, GroupInput, emptyGroupInput } from '../../../types/group';

function IdTags({ ids }: { ids: string[] }) {
  if (ids.length === 0) return <Typography.Text type="secondary">—</Typography.Text>;
  return (
    <Space size={[4, 4]} wrap>
      {ids.map((id) => (
        <Tag key={id}>{id}</Tag>
      ))}
    </Space>
  );
}

export function GroupsPage() {
  const { groups, isLoading, createGroup, updateGroup, removeGroup } = useGroups();
  const [editing, setEditing] = useState<Group | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<GroupInput>(emptyGroupInput);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyGroupInput);
    setModalOpen(true);
  };

  const openEdit = (group: Group) => {
    setEditing(group);
    setForm({ name: group.name, type: group.type, planIds: group.planIds, locationIds: group.locationIds });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      message.error('Give the group a name');
      return;
    }
    if (form.type === 'saas-plan' && form.planIds.length === 0 && form.locationIds.length === 0) {
      message.error('A SaaS plan group needs at least one plan ID or location ID');
      return;
    }
    setSaving(true);
    try {
      if (editing) await updateGroup(editing._id, form);
      else await createGroup(form);
      setModalOpen(false);
      message.success(editing ? 'Group updated' : 'Group created');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to save group');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (group: Group) => {
    try {
      await removeGroup(group._id);
      message.success('Group deleted');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to delete group');
    }
  };

  return (
    <div className="pt-4">
      <Card
        title={
          <Space>
            <ClusterOutlined />
            Location groups
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            New group
          </Button>
        }
      >
        <Typography.Paragraph type="secondary">
          Every customizer page can save settings for a group instead of globally. When a location
          loads the embed script, it gets its group's settings, or the global settings if its group
          has none. A location in both a SaaS plan group and a custom group uses the SaaS plan
          group.
        </Typography.Paragraph>

        <Table<Group>
          rowKey="_id"
          loading={isLoading}
          dataSource={groups}
          pagination={false}
          locale={{ emptyText: <Empty description="No groups yet. All locations use the global settings." /> }}
          columns={[
            { title: 'Name', dataIndex: 'name', key: 'name' },
            {
              title: 'Type',
              dataIndex: 'type',
              key: 'type',
              render: (type: Group['type']) =>
                type === 'saas-plan' ? <Tag color="purple">SaaS plan</Tag> : <Tag color="blue">Custom</Tag>,
            },
            { title: 'Plan IDs', key: 'planIds', render: (_, g) => <IdTags ids={g.planIds} /> },
            { title: 'Location IDs', key: 'locationIds', render: (_, g) => <IdTags ids={g.locationIds} /> },
            {
              title: '',
              key: 'actions',
              width: 96,
              render: (_, g) => (
                <Space>
                  <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(g)} />
                  <Popconfirm
                    title="Delete this group?"
                    description="Settings saved for it stay in the database but stop applying."
                    onConfirm={() => handleDelete(g)}
                  >
                    <Button type="text" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        open={modalOpen}
        title={editing ? 'Edit group' : 'New group'}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText="Save"
      >
        <Form layout="vertical">
          <Form.Item label="Name" required>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Form.Item>
          <Form.Item label="Type">
            <Radio.Group
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              options={[
                { value: 'custom', label: 'Custom (hand-picked locations)' },
                { value: 'saas-plan', label: 'SaaS plan' },
              ]}
            />
          </Form.Item>
          {form.type === 'saas-plan' && (
            <Form.Item label="Plan IDs" extra="Locations on any of these SaaS plans belong to this group.">
              <Select
                mode="tags"
                value={form.planIds}
                onChange={(planIds) => setForm({ ...form, planIds })}
                tokenSeparators={[',', ' ']}
                open={false}
                placeholder="Type a plan ID and press Enter"
              />
            </Form.Item>
          )}
          <Form.Item
            label="Location IDs"
            extra="The GHL location (sub-account) ID shown in the portal URL: /v2/location/<id>/…"
          >
            <Select
              mode="tags"
              value={form.locationIds}
              onChange={(locationIds) => setForm({ ...form, locationIds })}
              tokenSeparators={[',', ' ']}
              open={false}
              placeholder="Type a location ID and press Enter"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
