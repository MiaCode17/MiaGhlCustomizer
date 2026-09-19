import { useEffect, useState } from 'react';
import { Button, Form, Input, InputNumber, Modal, Select, Table, message } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { buttonBuilderService } from '../../../services/buttonBuilderService';
import {
  ButtonSizeVariant,
  ButtonStyleVariant,
  ButtonSurface,
  InjectedButton,
  InjectedButtonInput,
  emptyButtonInput,
} from '../../../types/button';

interface ButtonSurfaceTableProps {
  surface: ButtonSurface;
  groupId: string | undefined;
}

const STYLE_OPTIONS: { value: ButtonStyleVariant; label: string }[] = [
  { value: 'primary', label: 'Primary' },
  { value: 'default', label: 'Default' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'text', label: 'Text' },
];

const SIZE_OPTIONS: { value: ButtonSizeVariant; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'middle', label: 'Middle' },
  { value: 'large', label: 'Large' },
];

export function ButtonSurfaceTable({ surface, groupId }: ButtonSurfaceTableProps) {
  const [buttons, setButtons] = useState<InjectedButton[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<InjectedButtonInput>(emptyButtonInput(surface));
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    buttonBuilderService
      .list(surface, groupId)
      .then(setButtons)
      .catch((err) => message.error(err instanceof Error ? err.message : 'Failed to load buttons'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surface, groupId]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyButtonInput(surface));
    setModalOpen(true);
  };

  const openEdit = (button: InjectedButton) => {
    setEditingId(button._id);
    setForm({
      surface: button.surface,
      label: button.label,
      tooltip: button.tooltip ?? '',
      icon: button.icon ?? '',
      style: button.style,
      size: button.size,
      targetUrl: button.targetUrl ?? '',
      order: button.order,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await buttonBuilderService.remove(id);
      message.success('Button deleted');
      load();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to delete button');
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (editingId) {
        await buttonBuilderService.update(editingId, form);
        message.success('Button updated');
      } else {
        await buttonBuilderService.create(form, groupId);
        message.success('Button created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to save button');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pt-2">
      <div className="mb-3 flex justify-end">
        <Button type="dashed" icon={<PlusOutlined />} onClick={openCreate}>
          Add button
        </Button>
      </div>

      <Table<InjectedButton>
        rowKey="_id"
        loading={loading}
        dataSource={buttons}
        pagination={false}
        columns={[
          { title: 'Label', dataIndex: 'label' },
          { title: 'Style', dataIndex: 'style' },
          { title: 'Size', dataIndex: 'size' },
          { title: 'Order', dataIndex: 'order' },
          { title: 'Target URL', dataIndex: 'targetUrl' },
          {
            title: '',
            key: 'actions',
            render: (_, row) => (
              <>
                <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(row)} />
                <Button
                  danger
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(row._id)}
                />
              </>
            ),
          },
        ]}
      />

      <Modal
        title={editingId ? 'Edit button' : 'Add button'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={saving}
        destroyOnClose
      >
        <Form layout="vertical">
          <Form.Item label="Label" required>
            <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
          </Form.Item>
          <Form.Item label="Tooltip">
            <Input
              value={form.tooltip}
              onChange={(e) => setForm({ ...form, tooltip: e.target.value })}
            />
          </Form.Item>
          <Form.Item label="Icon">
            <Input
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              placeholder="e.g. star, bolt"
            />
          </Form.Item>
          <Form.Item label="Style">
            <Select
              value={form.style}
              options={STYLE_OPTIONS}
              onChange={(style) => setForm({ ...form, style })}
            />
          </Form.Item>
          <Form.Item label="Size">
            <Select
              value={form.size}
              options={SIZE_OPTIONS}
              onChange={(size) => setForm({ ...form, size })}
            />
          </Form.Item>
          <Form.Item label="Target URL">
            <Input
              value={form.targetUrl}
              onChange={(e) => setForm({ ...form, targetUrl: e.target.value })}
            />
          </Form.Item>
          <Form.Item label="Order">
            <InputNumber
              value={form.order}
              onChange={(order) => setForm({ ...form, order: order ?? 0 })}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
