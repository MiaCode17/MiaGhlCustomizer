import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import { Link } from 'react-router-dom';
import { SettingOutlined } from '@ant-design/icons';
import { useCompany } from '../../../context/CompanyContext';
import { PageIntro } from '../../../components/PageIntro';
import { locationLinksService } from '../../../services/locationLinksService';
import { miscSettingsService } from '../../../services/miscSettingsService';
import { LocationLink } from '../../../types/locationLink';
import { emptyMiscSettings, MiscSettings } from '../../../types/miscSettings';

const TOOLTIP_PLACEMENT_OPTIONS = [
  { value: 'bottom-right', label: 'Bottom right' },
  { value: 'bottom-left', label: 'Bottom left' },
  { value: 'top-right', label: 'Top right' },
  { value: 'top-left', label: 'Top left' },
];

const ADDON_BANNER_PLACEMENT_OPTIONS = [
  { value: 'top', label: 'Top' },
  { value: 'sidebar', label: 'Sidebar' },
  { value: 'dashboard', label: 'Dashboard' },
];

const MEMBERSHIP_OPEN_MODE_OPTIONS = [
  { value: 'modal', label: 'Pop-up window' },
  { value: 'drawer', label: 'Side drawer' },
  { value: 'new-tab', label: 'New tab' },
];

export function MiscSettingsPage() {
  const { company } = useCompany();
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [settings, setSettings] = useState<MiscSettings>(emptyMiscSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locationIdDraft, setLocationIdDraft] = useState('');
  const [locationLinks, setLocationLinks] = useState<LocationLink[]>([]);
  const [linksLoading, setLinksLoading] = useState(false);

  const loadLocationLinks = useCallback(() => {
    setLinksLoading(true);
    locationLinksService
      .list()
      .then(setLocationLinks)
      .catch(() => message.error('Failed to load location links'))
      .finally(() => setLinksLoading(false));
  }, []);

  useEffect(() => {
    loadLocationLinks();
  }, [loadLocationLinks]);

  const removeLocationLink = async (id: string) => {
    try {
      await locationLinksService.remove(id);
      message.success('Link removed');
      loadLocationLinks();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to remove link');
    }
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    miscSettingsService
      .get(groupId)
      .then((loaded) => {
        if (!cancelled) setSettings(loaded ? { ...emptyMiscSettings, ...loaded } : emptyMiscSettings);
      })
      .catch(() => {
        if (!cancelled) message.error('Failed to load settings');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [groupId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await miscSettingsService.save(settings, groupId);
      setSettings(saved);
      message.success('Settings saved');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const addLocationId = () => {
    const trimmed = locationIdDraft.trim();
    if (!trimmed) return;
    if (settings.membership.allowedLocationIds.includes(trimmed)) {
      setLocationIdDraft('');
      return;
    }
    setSettings({
      ...settings,
      membership: {
        ...settings.membership,
        allowedLocationIds: [...settings.membership.allowedLocationIds, trimmed],
      },
    });
    setLocationIdDraft('');
  };

  const removeLocationId = (id: string) => {
    setSettings({
      ...settings,
      membership: {
        ...settings.membership,
        allowedLocationIds: settings.membership.allowedLocationIds.filter((x) => x !== id),
      },
    });
  };

  return (
    <div className="pt-4">
      <PageIntro
        icon={<SettingOutlined />}
        description="Fine-tune the help tooltip, add-on banner, membership button, and unread badge."
        groupId={groupId}
        onGroupChange={setGroupId}
      />

      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <Card title="Help tooltip" loading={loading}>
          <Space align="center" style={{ marginBottom: 16 }}>
            <Switch
              checked={settings.tooltip.enabled}
              onChange={(enabled) =>
                setSettings({ ...settings, tooltip: { ...settings.tooltip, enabled } })
              }
            />
            <Typography.Text>Enabled</Typography.Text>
          </Space>
          <Form layout="vertical">
            <Space size="large">
              <Form.Item label="Button text">
                <Input
                  value={settings.tooltip.buttonText}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      tooltip: { ...settings.tooltip, buttonText: e.target.value },
                    })
                  }
                />
              </Form.Item>
              <Form.Item label="Placement">
                <Select
                  style={{ width: 160 }}
                  value={settings.tooltip.placement}
                  options={TOOLTIP_PLACEMENT_OPTIONS}
                  onChange={(placement) =>
                    setSettings({ ...settings, tooltip: { ...settings.tooltip, placement } })
                  }
                />
              </Form.Item>
            </Space>
          </Form>
        </Card>

        <Card title="Add-on integration banner" loading={loading}>
          <Space align="center" style={{ marginBottom: 16 }}>
            <Switch
              checked={settings.addonBanner.enabled}
              onChange={(enabled) =>
                setSettings({ ...settings, addonBanner: { ...settings.addonBanner, enabled } })
              }
            />
            <Typography.Text>Enabled</Typography.Text>
          </Space>
          <Form layout="vertical">
            <Space size="large">
              <Form.Item label="Placement">
                <Select
                  style={{ width: 160 }}
                  value={settings.addonBanner.placement}
                  options={ADDON_BANNER_PLACEMENT_OPTIONS}
                  onChange={(placement) =>
                    setSettings({
                      ...settings,
                      addonBanner: { ...settings.addonBanner, placement },
                    })
                  }
                />
              </Form.Item>
              <Form.Item label="Show on other pages">
                <Switch
                  checked={settings.addonBanner.showOnOtherPages}
                  onChange={(showOnOtherPages) =>
                    setSettings({
                      ...settings,
                      addonBanner: { ...settings.addonBanner, showOnOtherPages },
                    })
                  }
                />
              </Form.Item>
            </Space>
            <Form.Item label="Message">
              <Input.TextArea
                rows={2}
                value={settings.addonBanner.message}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    addonBanner: { ...settings.addonBanner, message: e.target.value },
                  })
                }
              />
            </Form.Item>
            <Form.Item label="CTA URL">
              <Input
                value={settings.addonBanner.ctaUrl ?? ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    addonBanner: { ...settings.addonBanner, ctaUrl: e.target.value },
                  })
                }
                style={{ width: 320 }}
              />
            </Form.Item>
          </Form>
        </Card>

        <Card title="Membership button" loading={loading}>
          <Space align="center" style={{ marginBottom: 8 }}>
            <Switch
              checked={settings.membership.enabled}
              onChange={(enabled) =>
                setSettings({ ...settings, membership: { ...settings.membership, enabled } })
              }
            />
            <Typography.Text>Enabled</Typography.Text>
          </Space>
          <Typography.Paragraph type="secondary">
            Adds a button to the top-right header of each sub-account that opens your membership or
            client-portal page. The URL can use placeholders such as{' '}
            <code>{'{{location.id}}'}</code>, <code>{'{{user.email}}'}</code> and{' '}
            <code>{'{{user.id}}'}</code>.
          </Typography.Paragraph>
          <Form layout="vertical">
            <Space size="large" align="start" wrap>
              <Form.Item label="Button label">
                <Input
                  style={{ width: 220 }}
                  value={settings.membership.buttonLabel}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      membership: { ...settings.membership, buttonLabel: e.target.value },
                    })
                  }
                />
              </Form.Item>
              <Form.Item label="Opens in">
                <Select
                  style={{ width: 160 }}
                  value={settings.membership.openMode}
                  options={MEMBERSHIP_OPEN_MODE_OPTIONS}
                  onChange={(openMode) =>
                    setSettings({ ...settings, membership: { ...settings.membership, openMode } })
                  }
                />
              </Form.Item>
              <Form.Item label="Icon (emoji or image URL)">
                <Input
                  style={{ width: 200 }}
                  value={settings.membership.icon ?? ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      membership: { ...settings.membership, icon: e.target.value },
                    })
                  }
                />
              </Form.Item>
              <Form.Item label="Background">
                <input
                  type="color"
                  value={settings.membership.backgroundColor}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      membership: { ...settings.membership, backgroundColor: e.target.value },
                    })
                  }
                />
              </Form.Item>
              <Form.Item label="Text">
                <input
                  type="color"
                  value={settings.membership.textColor}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      membership: { ...settings.membership, textColor: e.target.value },
                    })
                  }
                />
              </Form.Item>
            </Space>
            <Form.Item label="Membership page URL" required>
              <Input
                value={settings.membership.url}
                placeholder="https://portal.example.com/membership/{{location.id}}"
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    membership: { ...settings.membership, url: e.target.value },
                  })
                }
              />
            </Form.Item>
            <Form.Item
              label="Only these location IDs"
              extra="Leave empty to show the button in every location."
            >
              <Space.Compact style={{ width: 360 }}>
                <Input
                  value={locationIdDraft}
                  onChange={(e) => setLocationIdDraft(e.target.value)}
                  onPressEnter={addLocationId}
                  placeholder="Location ID"
                />
                <Button onClick={addLocationId}>Add</Button>
              </Space.Compact>
              <div className="mt-2">
                <Space size={[8, 8]} wrap>
                  {settings.membership.allowedLocationIds.map((id) => (
                    <Tag key={id} closable onClose={() => removeLocationId(id)}>
                      {id}
                    </Tag>
                  ))}
                </Space>
              </div>
            </Form.Item>
          </Form>
        </Card>

        <Card title="Unread conversations badge" loading={loading}>
          <Space align="center" style={{ marginBottom: 8 }}>
            <Switch
              checked={settings.unreadBadge.enabled}
              onChange={(enabled) =>
                setSettings({ ...settings, unreadBadge: { ...settings.unreadBadge, enabled } })
              }
            />
            <Typography.Text>Enabled</Typography.Text>
          </Space>
          <Typography.Paragraph type="secondary">
            Shows the number of unread conversations on the Conversations link in each
            sub-account&apos;s sidebar. The count is read from GHL by our server (cached for a
            minute), so it needs a GHL API token.
          </Typography.Paragraph>
          {company && !company.hasGhlApiToken && (
            <Alert
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
              message="No GHL API token saved yet"
              description={
                <>
                  The badge stays off until you add one on the{' '}
                  <Link to="/miaghlcustomizer/install">Install Script</Link> page.
                </>
              }
            />
          )}
          <Form layout="vertical">
            <Form.Item label="Badge color">
              <input
                type="color"
                value={settings.unreadBadge.badgeColor}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    unreadBadge: { ...settings.unreadBadge, badgeColor: e.target.value },
                  })
                }
              />
            </Form.Item>
          </Form>
        </Card>

        <Card title="Sub-account links" loading={loading}>
          <Space align="center" style={{ marginBottom: 8 }}>
            <Switch
              checked={settings.userLinks.enabled}
              onChange={(enabled) =>
                setSettings({ ...settings, userLinks: { ...settings.userLinks, enabled } })
              }
            />
            <Typography.Text>Let sub-account admins add their own sidebar links</Typography.Text>
          </Space>
          <Typography.Paragraph type="secondary">
            Admins of a sub-account get a <b>My links</b> entry in their sidebar where they can add, edit and
            delete links that show for everyone in that sub-account. Their GHL session is checked against
            GHL on every change. Save the settings above to apply this switch.
          </Typography.Paragraph>
          <Form layout="vertical">
            <Form.Item label="Maximum links per sub-account">
              <InputNumber
                min={1}
                max={30}
                value={settings.userLinks.maxLinks}
                onChange={(maxLinks) =>
                  setSettings({ ...settings, userLinks: { ...settings.userLinks, maxLinks: maxLinks ?? 10 } })
                }
              />
            </Form.Item>
          </Form>
          <Typography.Text strong>Links created so far</Typography.Text>
          <Table<LocationLink>
            style={{ marginTop: 8 }}
            size="small"
            rowKey="_id"
            loading={linksLoading}
            dataSource={locationLinks}
            pagination={{ pageSize: 8, hideOnSinglePage: true }}
            locale={{ emptyText: 'No sub-account has added a link yet.' }}
            columns={[
              { title: 'Location', dataIndex: 'locationId', width: 160 },
              {
                title: 'Link',
                key: 'link',
                render: (_, row) => (
                  <span>
                    {row.icon} {row.title}
                  </span>
                ),
              },
              { title: 'URL', dataIndex: 'url', ellipsis: true },
              {
                title: '',
                key: 'remove',
                width: 90,
                render: (_, row) => (
                  <Popconfirm title="Remove this link?" onConfirm={() => removeLocationLink(row._id)}>
                    <Button size="small" danger type="text">
                      Remove
                    </Button>
                  </Popconfirm>
                ),
              },
            ]}
          />
        </Card>

        <div className="flex justify-end">
          <Button type="primary" size="large" onClick={handleSave} loading={saving}>
            Save settings
          </Button>
        </div>
      </Space>
    </div>
  );
}
