import { useEffect, useState } from 'react';
import { Alert, Button, Card, Empty, Input, Modal, Popconfirm, Select, Space, Tag, Typography, Upload, message } from 'antd';
import { DeleteOutlined, EditOutlined, PictureOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { PageIntro } from '../../../components/PageIntro';
import { useGroups } from '../../../context/GroupsContext';
import { logoService } from '../../../services/logoService';
import { uploadService } from '../../../services/uploadService';
import { assetUrl } from '../../../utils/assetUrl';
import { LogoCampaign } from '../../../types/logo';

const GLOBAL = '__global__';

export function LogoPage() {
  const { groups } = useGroups();
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [campaigns, setCampaigns] = useState<LogoCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<LogoCampaign | null>(null);
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  /** Extra scopes to save a new logo for, besides the one being viewed. */
  const [alsoFor, setAlsoFor] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = (cancelled: () => boolean = () => false) => {
    setLoading(true);
    return logoService
      .list(groupId)
      .then((loaded) => {
        if (!cancelled()) setCampaigns(loaded);
      })
      .catch(() => {
        if (!cancelled()) message.error('Failed to load logo campaigns');
      })
      .finally(() => {
        if (!cancelled()) setLoading(false);
      });
  };

  useEffect(() => {
    let stale = false;
    void load(() => stale);
    return () => {
      stale = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  /** The logo people see: the most recently saved one for this scope. */
  const activeId = [...campaigns].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]?._id;

  const openCreate = () => {
    setEditing(null);
    setName('');
    setLogoUrl(undefined);
    setAlsoFor([]);
    setModalOpen(true);
  };

  const openEdit = (campaign: LogoCampaign) => {
    setEditing(campaign);
    setName(campaign.name);
    setLogoUrl(campaign.logoUrl);
    setAlsoFor([]);
    setModalOpen(true);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      setLogoUrl(await uploadService.uploadImage(file));
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to upload logo');
    } finally {
      setUploading(false);
    }
    return false;
  };

  const handleSubmit = async () => {
    if (!name.trim() || !logoUrl) {
      message.error('Provide a name and a logo image');
      return;
    }
    setSubmitting(true);
    try {
      if (editing) {
        await logoService.update(editing._id, { name: name.trim(), logoUrl });
        message.success('Logo updated');
      } else {
        const scopes = [groupId ?? GLOBAL, ...alsoFor.filter((s) => s !== (groupId ?? GLOBAL))];
        for (const scope of scopes) {
          await logoService.create({ name: name.trim(), logoUrl }, scope === GLOBAL ? undefined : scope);
        }
        message.success(scopes.length > 1 ? `Logo saved for ${scopes.length} places` : 'Logo saved');
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to save the logo');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await logoService.remove(id);
      setCampaigns((list) => list.filter((c) => c._id !== id));
      message.success('Logo deleted');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to delete the logo');
    }
  };

  const scopeOptions = [
    { value: GLOBAL, label: 'Global (all locations)' },
    ...groups.map((g) => ({ value: g._id, label: g.name })),
  ].filter((o) => o.value !== (groupId ?? GLOBAL));

  return (
    <div className="pt-4">
      <PageIntro
        icon={<PictureOutlined />}
        description="Replace the GHL logo with your own. Locations in a group see that group's logo; everyone else sees the global one."
        groupId={groupId}
        onGroupChange={setGroupId}
      />

      <Card
        title="Logos"
        loading={loading}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Add logo
          </Button>
        }
      >
        {campaigns.length === 0 ? (
          <Empty description="No logos yet. GHL's own logo is shown." />
        ) : (
          <>
            {campaigns.length > 1 ? (
              <Alert
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
                message="Only the most recently saved logo is shown. Edit a logo to make it the active one; delete all of them to go back to GHL's logo."
              />
            ) : null}
            <div className="flex flex-wrap gap-4">
              {campaigns.map((campaign) => (
                <Card
                  key={campaign._id}
                  size="small"
                  style={{ width: 200, borderColor: campaign._id === activeId ? '#4f46e5' : undefined }}
                  cover={
                    <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
                      <img src={assetUrl(campaign.logoUrl)} alt={campaign.name} style={{ maxHeight: 100, maxWidth: '90%', objectFit: 'contain' }} />
                    </div>
                  }
                  actions={[
                    <EditOutlined key="edit" aria-label="Edit" onClick={() => openEdit(campaign)} />,
                    <Popconfirm key="delete" title="Delete this logo?" okText="Delete" okButtonProps={{ danger: true }} onConfirm={() => void handleDelete(campaign._id)}>
                      <DeleteOutlined aria-label="Delete" />
                    </Popconfirm>,
                  ]}
                >
                  <Card.Meta
                    title={
                      <Space size={4} wrap>
                        {campaign.name}
                        {campaign._id === activeId ? <Tag color="purple">In use</Tag> : null}
                      </Space>
                    }
                  />
                </Card>
              ))}
            </div>
          </>
        )}
      </Card>

      <Modal
        title={editing ? 'Edit logo' : 'Add logo'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => void handleSubmit()}
        confirmLoading={submitting}
        okButtonProps={{ disabled: !name.trim() || !logoUrl }}
        destroyOnClose
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Input placeholder="Logo name" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} />
          <Upload beforeUpload={handleUpload} showUploadList={false} accept="image/*">
            <Button icon={<UploadOutlined />} loading={uploading}>
              {logoUrl ? 'Replace image' : 'Upload logo'}
            </Button>
          </Upload>
          {logoUrl ? <img src={assetUrl(logoUrl)} alt="Logo preview" style={{ maxHeight: 100, maxWidth: '100%', objectFit: 'contain' }} /> : null}
          {!editing && scopeOptions.length > 0 ? (
            <div>
              <Typography.Text type="secondary">Also save this logo for (optional)</Typography.Text>
              <Select mode="multiple" style={{ width: '100%', marginTop: 4 }} value={alsoFor} options={scopeOptions} onChange={setAlsoFor} placeholder="Other groups" />
            </div>
          ) : null}
          {editing ? <Typography.Text type="secondary">Saving makes this the logo that is shown.</Typography.Text> : null}
        </Space>
      </Modal>
    </div>
  );
}
