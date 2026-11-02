import { useEffect, useState } from 'react';
import { Input, Modal, Popconfirm, Select, Space, Typography, Upload, message } from 'antd';
import { CheckCircleFilled, DeleteOutlined, EditOutlined, InboxOutlined, PictureOutlined, PlusOutlined } from '@ant-design/icons';
import { GroupSelector } from '../../../components/GroupSelector';
import { useGroups } from '../../../context/GroupsContext';
import { logoService } from '../../../services/logoService';
import { uploadService } from '../../../services/uploadService';
import { assetUrl } from '../../../utils/assetUrl';
import { LogoCampaign } from '../../../types/logo';

const GLOBAL = '__global__';

const PAGE_CSS = `
.logo-tile:hover { transform: translateY(-4px); box-shadow: 0 18px 34px rgba(79,70,229,0.16), 0 3px 8px rgba(31,25,20,0.06) !important; }
.logo-tile .logo-actions { opacity: 0; transition: opacity 0.15s ease; }
.logo-tile:hover .logo-actions, .logo-tile:focus-within .logo-actions { opacity: 1; }
.logo-add:hover { border-color: #4f46e5 !important; background: #f6f5ff !important; }
@media (max-width: 900px) { .logo-hero { grid-template-columns: minmax(0, 1fr) !important; } }
@media (hover: none) { .logo-tile .logo-actions { opacity: 1; } }
`;

const CHECKER = 'conic-gradient(#f1eeeb 25%, #fbfaf9 0 50%, #f1eeeb 0 75%, #fbfaf9 0) 0 0 / 16px 16px';

/** Shows the logo image, falling back to the name's initial when the file can't be loaded. */
function LogoImage({ url, name, max = 100 }: { url: string; name: string; max?: number }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [url]);
  if (broken) {
    return (
      <span style={{ width: max * 0.8, height: max * 0.8, borderRadius: 18, background: 'linear-gradient(135deg, #e6e2ff, #f3e8ff)', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: max * 0.36, fontWeight: 750 }}>
        {name.trim().charAt(0).toUpperCase() || '?'}
      </span>
    );
  }
  return <img src={assetUrl(url)} alt={name} onError={() => setBroken(true)} style={{ maxHeight: max, maxWidth: '82%', objectFit: 'contain' }} />;
}


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

  const active = campaigns.find((c) => c._id === activeId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{PAGE_CSS}</style>

      {/* Hero: the logo people see right now */}
      <section
        className="logo-hero"
        style={{
          borderRadius: 22,
          padding: 28,
          border: '1px solid #ece7e3',
          background: 'linear-gradient(135deg, #eeeafc, #f8f6ff 60%, #fff)',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)',
          gap: 32,
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#5b4de0', marginBottom: 12 }}>
            <PictureOutlined /> Logo
          </div>
          <h1 style={{ margin: 0, fontSize: 32, lineHeight: 1.15, fontWeight: 750, color: '#1f1914' }}>
            {loading ? 'Loading…' : active ? active.name : "GHL's own logo"}
          </h1>
          <p style={{ margin: '10px 0 20px', maxWidth: 470, fontSize: 14.5, lineHeight: 1.55, color: '#6b625b' }}>
            Replace the GHL logo with your own. Locations in a group see that group's logo; everyone else sees the global one.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={openCreate}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 11, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, #6a5cf0, #3d2fd1)', boxShadow: '0 8px 18px rgba(61,47,209,0.3)' }}
            >
              <PlusOutlined /> Add logo
            </button>
            <GroupSelector value={groupId} onChange={setGroupId} />
          </div>
        </div>

        {/* How it looks in the app's top-left corner */}
        <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #ece7e3', boxShadow: '0 20px 44px rgba(31,25,20,0.14)', background: '#fff' }}>
          <div style={{ height: 76, display: 'flex', alignItems: 'center', gap: 14, padding: '0 20px', background: 'linear-gradient(135deg, #0f172a, #1e1b4b)' }}>
            <div style={{ height: 46, minWidth: 46, display: 'flex', alignItems: 'center' }}>
              {active ? (
                <LogoImage url={active.logoUrl} name={active.name} max={46} />
              ) : (
                <span style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: 0.5 }}>GHL</span>
              )}
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.35)' }} />
              ))}
            </div>
          </div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8, background: '#faf9f8' }}>
            <div style={{ height: 8, width: '60%', borderRadius: 4, background: '#e6e2de' }} />
            <div style={{ height: 8, width: '40%', borderRadius: 4, background: '#eeebe8' }} />
            <div style={{ height: 8, width: '75%', borderRadius: 4, background: '#eeebe8' }} />
          </div>
        </div>
      </section>

      {/* Library */}
      <section style={{ borderRadius: 20, border: '1px solid #ece7e3', background: '#fff', padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1f1914' }}>Your logos</h2>
          <span style={{ fontSize: 12, fontWeight: 600, padding: '1px 9px', borderRadius: 999, background: '#f1ede9', color: '#6b625b' }}>{campaigns.length}</span>
        </div>
        <p style={{ margin: '0 0 18px', fontSize: 13, color: '#8a817a' }}>
          Only the most recently saved logo is shown. Edit a logo to make it the active one; delete all of them to go back to GHL's logo.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 18, opacity: loading ? 0.5 : 1 }}>
          {campaigns.map((campaign) => {
            const isActive = campaign._id === activeId;
            return (
              <div
                key={campaign._id}
                className="logo-tile"
                style={{
                  position: 'relative',
                  borderRadius: 20,
                  padding: 10,
                  background: '#fff',
                  border: `1.5px solid ${isActive ? '#4f46e5' : '#ece7e3'}`,
                  boxShadow: isActive ? '0 0 0 4px rgba(79,70,229,0.12), 0 14px 28px rgba(79,70,229,0.14)' : '0 1px 2px rgba(31,25,20,0.04)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                <div style={{ height: 140, borderRadius: 14, background: CHECKER, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <LogoImage url={campaign.logoUrl} name={campaign.name} />
                </div>

                {isActive && (
                  <span style={{ position: 'absolute', top: 18, left: 18, display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px 3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: '#fff', color: '#4f46e5', boxShadow: '0 2px 10px rgba(0,0,0,0.18)' }}>
                    <CheckCircleFilled /> In use
                  </span>
                )}

                <div className="logo-actions" style={{ position: 'absolute', top: 18, right: 18, display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    aria-label={`Edit ${campaign.name}`}
                    onClick={() => openEdit(campaign)}
                    style={{ width: 32, height: 32, borderRadius: 10, border: 'none', background: '#fff', color: '#3d3530', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
                  >
                    <EditOutlined />
                  </button>
                  <Popconfirm title="Delete this logo?" okText="Delete" okButtonProps={{ danger: true }} onConfirm={() => void handleDelete(campaign._id)}>
                    <button
                      type="button"
                      aria-label={`Delete ${campaign.name}`}
                      style={{ width: 32, height: 32, borderRadius: 10, border: 'none', background: '#fff', color: '#b3524a', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
                    >
                      <DeleteOutlined />
                    </button>
                  </Popconfirm>
                </div>

                <div style={{ padding: '12px 6px 4px' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1f1914', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{campaign.name}</div>
                  <div style={{ fontSize: 12, color: '#a39a93', marginTop: 2 }}>Saved {new Date(campaign.updatedAt).toLocaleDateString()}</div>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={openCreate}
            className="logo-add"
            style={{ minHeight: campaigns.length === 0 ? 220 : 218, borderRadius: 20, border: '2px dashed #d9d1ca', background: '#fcfbfa', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#4b4440', font: 'inherit', transition: 'border-color 0.15s ease, background 0.15s ease' }}
          >
            <span style={{ width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#4f46e5', background: '#eeecff' }}>
              <PlusOutlined />
            </span>
            <span style={{ fontWeight: 650 }}>{campaigns.length === 0 ? 'Add your first logo' : 'Add another logo'}</span>
            {campaigns.length === 0 && <span style={{ fontSize: 12.5, color: '#8a817a' }}>GHL's own logo is shown until you do.</span>}
          </button>
        </div>
      </section>

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
          <Upload.Dragger beforeUpload={handleUpload} showUploadList={false} accept="image/*" disabled={uploading} style={{ background: logoUrl ? CHECKER : undefined }}>
            {logoUrl ? (
              <div style={{ padding: '8px 0' }}>
                <LogoImage url={logoUrl} name={name} max={96} />
                <div style={{ marginTop: 8, fontSize: 12.5, color: '#8a817a' }}>{uploading ? 'Uploading…' : 'Drop or click to replace the image'}</div>
              </div>
            ) : (
              <div style={{ padding: '14px 0' }}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">{uploading ? 'Uploading…' : 'Click or drag your logo here'}</p>
                <p className="ant-upload-hint">PNG, SVG or JPG. A transparent background works best.</p>
              </div>
            )}
          </Upload.Dragger>
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
