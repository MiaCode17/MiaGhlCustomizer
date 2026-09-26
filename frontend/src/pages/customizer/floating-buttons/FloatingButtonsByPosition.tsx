import { useEffect, useState } from 'react';
import { Button, Card, Form, Input, InputNumber, Modal, Select, Space, Table, message } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { PageIntro } from '../../../components/PageIntro';
import { floatingButtonsService } from '../../../services/floatingButtonsService';
import {
  FloatingButton,
  FloatingButtonAnimation,
  FloatingButtonInput,
  FloatingButtonPosition,
  FloatingButtonShadow,
  emptyFloatingButtonInput,
} from '../../../types/floatingButton';
import { SubItemsEditor } from './SubItemsEditor';

interface FloatingButtonsByPositionProps {
  position: FloatingButtonPosition;
  description: string;
}

const SHADOW_OPTIONS: { value: FloatingButtonShadow; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
];

const ANIMATION_OPTIONS: { value: FloatingButtonAnimation; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'pulse', label: 'Pulse' },
  { value: 'bounce', label: 'Bounce' },
  { value: 'shimmer', label: 'Shimmer' },
];

export function FloatingButtonsByPosition({ position, description }: FloatingButtonsByPositionProps) {
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [buttons, setButtons] = useState<FloatingButton[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FloatingButtonInput>({ ...emptyFloatingButtonInput(), position });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    floatingButtonsService
      .list(groupId)
      .then((all) => setButtons(all.filter((button) => button.position === position)))
      .catch((err) =>
        message.error(err instanceof Error ? err.message : 'Failed to load floating buttons'),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, position]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyFloatingButtonInput(), position });
    setModalOpen(true);
  };

  const openEdit = (button: FloatingButton) => {
    setEditingId(button._id);
    setForm({
      position: button.position,
      label: button.label,
      icon: button.icon ?? '',
      backgroundColor: button.backgroundColor,
      textColor: button.textColor,
      borderRadius: button.borderRadius,
      shadow: button.shadow,
      animation: button.animation,
      subItems: button.subItems,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await floatingButtonsService.remove(id);
      message.success('Floating button deleted');
      load();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to delete floating button');
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (editingId) {
        await floatingButtonsService.update(editingId, form);
        message.success('Floating button updated');
      } else {
        await floatingButtonsService.create(form, groupId);
        message.success('Floating button created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to save floating button');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pt-4">
      <PageIntro
        icon={<ThunderboltOutlined />}
        description={description}
        groupId={groupId}
        onGroupChange={setGroupId}
      />

      <Card
        title="Floating buttons"
        extra={
          <Button type="dashed" icon={<PlusOutlined />} onClick={openCreate}>
            Add floating button
          </Button>
        }
      >
        <Table<FloatingButton>
          rowKey="_id"
          loading={loading}
          dataSource={buttons}
          pagination={false}
          columns={[
            { title: 'Label', dataIndex: 'label' },
            {
              title: 'Colors',
              key: 'colors',
              render: (_, row) => (
                <Space>
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      background: row.backgroundColor,
                      border: '1px solid rgba(0,0,0,0.1)',
                    }}
                  />
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      background: row.textColor,
                      border: '1px solid rgba(0,0,0,0.1)',
                    }}
                  />
                </Space>
              ),
            },
            {
              title: 'Sub-items',
              key: 'subItems',
              render: (_, row) => row.subItems.length,
            },
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
      </Card>

      <Modal
        title={editingId ? 'Edit floating button' : 'Add floating button'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={saving}
        destroyOnClose
        width={640}
      >
        <Form layout="vertical">
          <Form.Item label="Label" required>
            <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
          </Form.Item>
          <Form.Item label="Icon">
            <Input
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              placeholder="e.g. star, bolt"
            />
          </Form.Item>
          <Space size="large" wrap>
            <Form.Item label="Background color">
              <input
                type="color"
                value={form.backgroundColor}
                onChange={(e) => setForm({ ...form, backgroundColor: e.target.value })}
              />
            </Form.Item>
            <Form.Item label="Text color">
              <input
                type="color"
                value={form.textColor}
                onChange={(e) => setForm({ ...form, textColor: e.target.value })}
              />
            </Form.Item>
            <Form.Item label="Corner radius (px)">
              <InputNumber
                min={0}
                max={999}
                value={form.borderRadius}
                onChange={(v) => setForm({ ...form, borderRadius: v ?? 0 })}
              />
            </Form.Item>
          </Space>
          <Space size="large" wrap>
            <Form.Item label="Shadow">
              <Select
                value={form.shadow}
                options={SHADOW_OPTIONS}
                style={{ width: 120 }}
                onChange={(shadow) => setForm({ ...form, shadow })}
              />
            </Form.Item>
            <Form.Item label="Animation">
              <Select
                value={form.animation}
                options={ANIMATION_OPTIONS}
                style={{ width: 140 }}
                onChange={(animation) => setForm({ ...form, animation })}
              />
            </Form.Item>
          </Space>
          <Form.Item label="Sub-items">
            <SubItemsEditor
              subItems={form.subItems}
              onChange={(subItems) => setForm({ ...form, subItems })}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
