import { useEffect, useState } from 'react';
import { Button, Card, Form, Input, Modal, Radio, Select, Space, Table, Tag, message } from 'antd';
import { DeleteOutlined, EditOutlined, FormOutlined, PlusOutlined } from '@ant-design/icons';
import { PageIntro } from '../../../components/PageIntro';
import { customFieldsService } from '../../../services/customFieldsService';
import { CustomFieldCampaign, CustomFieldMode, SUGGESTED_CUSTOM_FIELDS } from '../../../types/customField';

interface CampaignFormState {
  id: string | null;
  name: string;
  exposedFieldKeys: string[];
  mode: CustomFieldMode;
}

function emptyForm(): CampaignFormState {
  return { id: null, name: '', exposedFieldKeys: [], mode: 'lock' };
}

export function CustomFieldsPage() {
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [campaigns, setCampaigns] = useState<CustomFieldCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CampaignFormState>(emptyForm());

  const load = () => {
    setLoading(true);
    customFieldsService
      .list(groupId)
      .then(setCampaigns)
      .catch(() => message.error('Failed to load campaigns'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const openCreateModal = () => {
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEditModal = (campaign: CustomFieldCampaign) => {
    setForm({
      id: campaign._id,
      name: campaign.name,
      exposedFieldKeys: campaign.exposedFieldKeys,
      mode: campaign.mode ?? 'lock',
    });
    setModalOpen(true);
  };

  const handleDelete = async (campaign: CustomFieldCampaign) => {
    try {
      await customFieldsService.remove(campaign._id);
      message.success('Campaign deleted');
      load();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to delete campaign');
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      message.error('Campaign name is required');
      return;
    }
    setSaving(true);
    try {
      const input = { name: form.name, exposedFieldKeys: form.exposedFieldKeys, mode: form.mode };
      if (form.id) {
        await customFieldsService.update(form.id, input);
        message.success('Campaign updated');
      } else {
        await customFieldsService.create(input, groupId);
        message.success('Campaign created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to save campaign');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pt-4">
      <PageIntro
        icon={<FormOutlined />}
        description="Lock or hide specific custom fields on contact and opportunity pages. A group's campaigns replace the global ones."
        groupId={groupId}
        onGroupChange={setGroupId}
      />

      <Card
        title="Custom field campaigns"
        loading={loading}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            New campaign
          </Button>
        }
      >
        <Table<CustomFieldCampaign>
          dataSource={campaigns.map((c) => ({ ...c, key: c._id }))}
          pagination={false}
          columns={[
            { title: 'Name', dataIndex: 'name' },
            {
              title: 'Action',
              key: 'mode',
              render: (_, row) =>
                row.mode === 'hide' ? <Tag color="volcano">Hide</Tag> : <Tag color="blue">Lock (read-only)</Tag>,
            },
            {
              title: 'Fields',
              key: 'fields',
              render: (_, row) => (
                <Space size={[4, 4]} wrap>
                  {row.exposedFieldKeys.map((key) => (
                    <Tag key={key}>{key}</Tag>
                  ))}
                </Space>
              ),
            },
            {
              title: '',
              key: 'actions',
              render: (_, row) => (
                <Space>
                  <Button icon={<EditOutlined />} type="text" onClick={() => openEditModal(row)} />
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    type="text"
                    onClick={() => handleDelete(row)}
                  />
                </Space>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={form.id ? 'Edit campaign' : 'New campaign'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={saving}
      >
        <Form layout="vertical">
          <Form.Item label="Campaign name" required>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Form.Item>
          <Form.Item
            label="What should happen to these fields?"
            extra="Lock keeps the field visible but read-only. Hide removes it from the page."
          >
            <Radio.Group
              value={form.mode}
              onChange={(e) => setForm({ ...form, mode: e.target.value as CustomFieldMode })}
              options={[
                { value: 'lock', label: 'Lock (read-only)' },
                { value: 'hide', label: 'Hide' },
              ]}
              optionType="button"
            />
          </Form.Item>
          <Form.Item
            label="Fields"
            extra="Type a GHL field key (for example lead_source or contact.lead_source) and press Enter."
          >
            <Select
              mode="tags"
              value={form.exposedFieldKeys}
              onChange={(exposedFieldKeys) => setForm({ ...form, exposedFieldKeys })}
              options={SUGGESTED_CUSTOM_FIELDS.map((field) => ({ value: field, label: field }))}
              tokenSeparators={[',', ' ']}
              placeholder="Add field keys"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
