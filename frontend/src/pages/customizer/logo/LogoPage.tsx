import { useEffect, useState } from 'react';
import { Button, Card, Empty, Input, Modal, Space, Upload, message } from 'antd';
import { DeleteOutlined, PictureOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { PageIntro } from '../../../components/PageIntro';
import { logoService } from '../../../services/logoService';
import { uploadService } from '../../../services/uploadService';
import { assetUrl } from '../../../utils/assetUrl';
import { LogoCampaign } from '../../../types/logo';

export function LogoPage() {
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [campaigns, setCampaigns] = useState<LogoCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    logoService
      .list(groupId)
      .then((loaded) => {
        if (!cancelled) setCampaigns(loaded);
      })
      .catch(() => {
        if (!cancelled) message.error('Failed to load logo campaigns');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [groupId]);

  const openModal = () => {
    setName('');
    setLogoUrl(undefined);
    setModalOpen(true);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadService.uploadImage(file);
      setLogoUrl(url);
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to upload logo');
    } finally {
      setUploading(false);
    }
    return false;
  };

  const handleCreate = async () => {
    if (!name.trim() || !logoUrl) {
      message.error('Provide a name and a logo image');
      return;
    }
    setSubmitting(true);
    try {
      const created = await logoService.create({ name, logoUrl }, groupId);
      setCampaigns([created, ...campaigns]);
      setModalOpen(false);
      message.success('Logo campaign created');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to create logo campaign');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await logoService.remove(id);
      setCampaigns(campaigns.filter((c) => c._id !== id));
      message.success('Logo campaign deleted');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to delete logo campaign');
    }
  };

  return (
    <div className="pt-4">
      <PageIntro
        icon={<PictureOutlined />}
        description="Upload and manage branded logo campaigns for your locations."
        groupId={groupId}
        onGroupChange={setGroupId}
      />

      <Card
        title="Logo campaigns"
        loading={loading}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openModal}>
            Add logo campaign
          </Button>
        }
      >
        {campaigns.length === 0 ? (
          <Empty description="No logo campaigns yet" />
        ) : (
          <div className="flex flex-wrap gap-4">
            {campaigns.map((campaign) => (
              <Card
                key={campaign._id}
                size="small"
                style={{ width: 200 }}
                cover={
                  <div
                    style={{
                      height: 120,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#fafafa',
                    }}
                  >
                    <img
                      src={assetUrl(campaign.logoUrl)}
                      alt={campaign.name}
                      style={{ maxHeight: 100, maxWidth: '90%', objectFit: 'contain' }}
                    />
                  </div>
                }
                actions={[
                  <DeleteOutlined key="delete" onClick={() => handleDelete(campaign._id)} />,
                ]}
              >
                <Card.Meta title={campaign.name} />
              </Card>
            ))}
          </div>
        )}
      </Card>

      <Modal
        title="Add logo campaign"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleCreate}
        confirmLoading={submitting}
        okButtonProps={{ disabled: !name.trim() || !logoUrl }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Input
            placeholder="Campaign name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Upload beforeUpload={handleUpload} showUploadList={false} accept="image/*">
            <Button icon={<UploadOutlined />} loading={uploading}>
              Upload logo
            </Button>
          </Upload>
          {logoUrl && (
            <img
              src={assetUrl(logoUrl)}
              alt="Logo preview"
              style={{ maxHeight: 100, maxWidth: '100%', objectFit: 'contain' }}
            />
          )}
        </Space>
      </Modal>
    </div>
  );
}
