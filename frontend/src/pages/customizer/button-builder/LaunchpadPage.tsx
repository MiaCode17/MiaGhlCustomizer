import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Upload,
  message,
} from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, RocketOutlined, UploadOutlined } from '@ant-design/icons';
import { PageIntro } from '../../../components/PageIntro';
import { launchpadService } from '../../../services/launchpadService';
import { uploadService } from '../../../services/uploadService';
import {
  emptyLaunchpadTile,
  LaunchpadOpenMode,
  LaunchpadTile,
  LaunchpadTileInput,
  LaunchpadTileKind,
  NATIVE_LAUNCHPAD_TILES,
} from '../../../types/launchpad';

const OPEN_MODE_OPTIONS: { value: LaunchpadOpenMode; label: string }[] = [
  { value: 'modal', label: 'Pop-up window' },
  { value: 'drawer', label: 'Side drawer' },
  { value: 'new-tab', label: 'New tab' },
  { value: 'same-tab', label: 'Same tab' },
];

export function LaunchpadPage() {
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [tiles, setTiles] = useState<LaunchpadTile[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<LaunchpadTileInput>(emptyLaunchpadTile('custom'));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = () => {
    setLoading(true);
    launchpadService
      .list(groupId)
      .then(setTiles)
      .catch((err) => message.error(err instanceof Error ? err.message : 'Failed to load tiles'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const openCreate = (kind: LaunchpadTileKind) => {
    setEditingId(null);
    setForm(emptyLaunchpadTile(kind));
    setModalOpen(true);
  };

  const openEdit = (tile: LaunchpadTile) => {
    setEditingId(tile._id);
    setForm({
      order: tile.order,
      kind: tile.kind,
      nativeId: tile.nativeId,
      description: tile.description,
      imageUrl: tile.imageUrl,
      buttonText: tile.buttonText,
      url: tile.url,
      openMode: tile.openMode,
      hidden: tile.hidden,
    });
    setModalOpen(true);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadService.uploadImage(file);
      setForm((f) => ({ ...f, imageUrl: url }));
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
    return false;
  };

  const handleSubmit = async () => {
    if (form.kind === 'custom') {
      if (!form.description.trim() || !form.buttonText.trim() || !form.url.trim()) {
        message.error('A custom tile needs a description, button text and a URL');
        return;
      }
    }
    setSaving(true);
    try {
      if (editingId) await launchpadService.update(editingId, form);
      else await launchpadService.create(form, groupId);
      message.success(editingId ? 'Tile updated' : 'Tile created');
      setModalOpen(false);
      load();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to save tile');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await launchpadService.remove(id);
      message.success('Tile deleted');
      load();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to delete tile');
    }
  };

  const isNative = form.kind === 'native';

  return (
    <div className="pt-4">
      <PageIntro
        icon={<RocketOutlined />}
        description="Add your own setup tiles to GHL's Launchpad, or change and hide the built-in ones."
        groupId={groupId}
        onGroupChange={setGroupId}
      />

      <Card
        title="Launchpad tiles"
        extra={
          <Space>
            <Button icon={<PlusOutlined />} onClick={() => openCreate('native')}>
              Change a GHL tile
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreate('custom')}>
              Add custom tile
            </Button>
          </Space>
        }
      >
        <Table<LaunchpadTile>
          rowKey="_id"
          loading={loading}
          dataSource={tiles}
          pagination={false}
          columns={[
            {
              title: 'Tile',
              key: 'tile',
              render: (_, row) =>
                row.kind === 'native' ? (
                  <Space>
                    <Tag color="blue">GHL tile</Tag>
                    {NATIVE_LAUNCHPAD_TILES.find((t) => t.id === row.nativeId)?.label ?? row.nativeId}
                    {row.hidden && <Tag color="volcano">Hidden</Tag>}
                  </Space>
                ) : (
                  <Space>
                    {row.imageUrl && <img src={row.imageUrl} alt="" style={{ width: 24, height: 24, objectFit: 'contain' }} />}
                    {row.description}
                  </Space>
                ),
            },
            { title: 'Button', dataIndex: 'buttonText' },
            { title: 'URL', dataIndex: 'url', ellipsis: true },
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
        title={editingId ? 'Edit tile' : isNative ? 'Change a GHL tile' : 'Add custom tile'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={saving}
        destroyOnClose
      >
        <Form layout="vertical">
          {isNative && (
            <>
              <Alert
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
                message="Leave a field empty to keep GHL's own text, image or action for that part."
              />
              <Form.Item label="Which tile">
                <Select
                  value={form.nativeId}
                  options={NATIVE_LAUNCHPAD_TILES.map((t) => ({ value: t.id, label: t.label }))}
                  onChange={(nativeId) => setForm({ ...form, nativeId })}
                />
              </Form.Item>
              <Form.Item label="Hide this tile">
                <Switch checked={form.hidden} onChange={(hidden) => setForm({ ...form, hidden })} />
              </Form.Item>
            </>
          )}
          {!(isNative && form.hidden) && (
            <>
              <Form.Item label="Description" required={!isNative}>
                <Input.TextArea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </Form.Item>
              <Form.Item label="Image">
                <Space.Compact style={{ width: '100%' }}>
                  <Input
                    value={form.imageUrl}
                    placeholder="https://…/icon.png"
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  />
                  <Upload beforeUpload={handleUpload} showUploadList={false} accept="image/*">
                    <Button icon={<UploadOutlined />} loading={uploading}>
                      Upload
                    </Button>
                  </Upload>
                </Space.Compact>
              </Form.Item>
              <Form.Item label="Button text" required={!isNative}>
                <Input value={form.buttonText} onChange={(e) => setForm({ ...form, buttonText: e.target.value })} />
              </Form.Item>
              <Form.Item
                label="Button URL"
                required={!isNative}
                extra={
                  <>
                    Placeholders such as <code>{'{{location.id}}'}</code> work here.
                  </>
                }
              >
                <Input
                  value={form.url}
                  placeholder="https://example.com/start?loc={{location.id}}"
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                />
              </Form.Item>
              <Form.Item label="Opens in">
                <Radio.Group
                  value={form.openMode}
                  options={OPEN_MODE_OPTIONS}
                  optionType="button"
                  onChange={(e) => setForm({ ...form, openMode: e.target.value as LaunchpadOpenMode })}
                />
              </Form.Item>
            </>
          )}
          {!isNative && (
            <Form.Item label="Order" extra="Lower numbers appear first, above GHL's last tile.">
              <InputNumber value={form.order} onChange={(order) => setForm({ ...form, order: order ?? 0 })} />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
