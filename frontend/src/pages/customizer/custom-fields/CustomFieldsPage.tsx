import { useEffect, useState } from 'react';
import { Button, Card, Checkbox, Form, Input, Modal, Space, Table, message } from 'antd';
import { DeleteOutlined, EditOutlined, FormOutlined, PlusOutlined } from '@ant-design/icons';
import { PageIntro } from '../../../components/PageIntro';
import { customFieldsService } from '../../../services/customFieldsService';
import { AVAILABLE_CUSTOM_FIELDS, CustomFieldCampaign } from '../../../types/customField';

interface CampaignFormState {
  id: string | null;
  name: string;
  exposedFieldKeys: string[];
}

function emptyForm(): CampaignFormState {
  return { id: null, name: '', exposedFieldKeys: [] };
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
    setForm({ id: campaign._id, name: campaign.name, exposedFieldKeys: campaign.exposedFieldKeys });
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
      const input = { name: form.name, exposedFieldKeys: form.exposedFieldKeys };
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
        description="Choose which custom fields are exposed to each location via campaigns."
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
              title: 'Exposed fields',
              key: 'count',
              render: (_, row) => row.exposedFieldKeys.length,
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
          <Form.Item label="Exposed fields">
            <Checkbox.Group
              value={form.exposedFieldKeys}
              onChange={(exposedFieldKeys) =>
                setForm({ ...form, exposedFieldKeys: exposedFieldKeys as string[] })
              }
              options={AVAILABLE_CUSTOM_FIELDS.map((field) => ({ value: field, label: field }))}
              style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
