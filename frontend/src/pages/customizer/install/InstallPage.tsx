import { useState } from 'react';
import { Alert, Button, Card, Input, Space, Table, Tag, Typography, message } from 'antd';
import { CodeOutlined, CopyOutlined, KeyOutlined, SearchOutlined } from '@ant-design/icons';
import { useCompany } from '../../../context/CompanyContext';
import { useGroups } from '../../../context/GroupsContext';
import { embedScriptUrl, runtimeService } from '../../../services/runtimeService';
import { RuntimeConfig } from '../../../types/runtime';

const FEATURE_LABELS: Record<string, string> = {
  theme: 'Theme',
  'special-theme': 'Occasional theme',
  logo: 'Logo',
  buttons: 'Page buttons',
  'floating-buttons': 'Side / bottom buttons',
  'book-a-call': 'Book a Call',
  'dynamic-links': 'Custom menu links',
  menu: 'Menu edits',
  banners: 'Banners',
  'chat-bubble': 'Chat bubble',
  loader: 'Loader',
  'conversation-style': 'Conversation style',
  misc: 'Help tooltip & add-on banner',
  membership: 'Membership button',
  'unread-badge': 'Unread conversations badge',
  'custom-fields': 'Custom field locks',
  'opportunity-tabs': 'Opportunity tabs',
};

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    message.success('Copied to clipboard');
  } catch {
    message.error('Could not copy. Select the text and copy it manually.');
  }
}

export function InstallPage() {
  const { company, updateCompany, setGhlApiToken } = useCompany();
  const { groups } = useGroups();
  const [ghlIdDraft, setGhlIdDraft] = useState<string | null>(null);
  const [savingGhlId, setSavingGhlId] = useState(false);
  const [tokenDraft, setTokenDraft] = useState('');
  const [savingToken, setSavingToken] = useState(false);
  const [locationId, setLocationId] = useState('');
  const [planId, setPlanId] = useState('');
  const [result, setResult] = useState<RuntimeConfig | null>(null);
  const [checking, setChecking] = useState(false);

  if (!company) return null;

  // The runtime accepts either ID; the GHL one is what agencies recognise, so prefer it.
  const publicId = company.ghlCompanyId || company.id;
  const snippet = `<script async src="${embedScriptUrl(publicId)}"></script>`;
  const ghlId = ghlIdDraft ?? company.ghlCompanyId;

  const saveGhlId = async () => {
    setSavingGhlId(true);
    try {
      await updateCompany({ ghlCompanyId: ghlId.trim() });
      setGhlIdDraft(null);
      message.success('GHL company ID saved');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to save GHL company ID');
    } finally {
      setSavingGhlId(false);
    }
  };

  const saveToken = async (token: string) => {
    setSavingToken(true);
    try {
      await setGhlApiToken(token);
      setTokenDraft('');
      message.success(token ? 'GHL API token saved' : 'GHL API token removed');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to save the GHL API token');
    } finally {
      setSavingToken(false);
    }
  };

  const check = async () => {
    setChecking(true);
    try {
      setResult(await runtimeService.resolve(publicId, locationId.trim(), planId.trim()));
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Could not reach the runtime API');
    } finally {
      setChecking(false);
    }
  };

  const groupName = (id: string) =>
    id ? (groups.find((g) => g._id === id)?.name ?? `Unknown group (${id})`) : 'Global (no group)';

  return (
    <div className="pt-4">
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <Card
          title={
            <Space>
              <CodeOutlined />
              Install the customizer in GHL
            </Space>
          }
        >
          <Typography.Paragraph style={{ marginBottom: 8 }}>
            <b>Your GHL company ID</b>{' '}
            <Typography.Text type="secondary">
              (GHL → Agency Settings → Company, or the <code>companyId</code> in GHL&apos;s URLs)
            </Typography.Text>
          </Typography.Paragraph>
          <Space.Compact style={{ width: 420, marginBottom: 20 }}>
            <Input
              value={ghlId}
              onChange={(e) => setGhlIdDraft(e.target.value)}
              placeholder="e.g. zyvKWkiBNLlwzBcEAEyM"
            />
            <Button onClick={saveGhlId} loading={savingGhlId} disabled={ghlId === company.ghlCompanyId}>
              Save
            </Button>
          </Space.Compact>
          <Typography.Paragraph>
            One script tag runs every customizer feature. Paste it once into GHL and it picks up
            whatever you save here. You never need to reinstall it.
          </Typography.Paragraph>
          <Space.Compact style={{ width: '100%' }}>
            <Input readOnly value={snippet} style={{ fontFamily: 'monospace' }} />
            <Button type="primary" icon={<CopyOutlined />} onClick={() => copy(snippet)}>
              Copy
            </Button>
          </Space.Compact>
          <ol style={{ marginTop: 16, paddingLeft: 20, lineHeight: 1.9 }}>
            <li>
              In GHL, open <b>Agency Settings → Company</b> and find <b>Custom JS</b> (Whitelabel
              section).
            </li>
            <li>Paste the script tag and save.</li>
            <li>
              Reload any sub-account. Changes you save here show up within about 30 seconds (the
              runtime config is cached briefly).
            </li>
          </ol>
          <Typography.Text type="secondary">
            To debug in the portal, run <code>localStorage.mgcDebug = &apos;1&apos;</code> in the
            browser console and reload. Run <code>__mgcCustomizer.reload()</code> to re-fetch
            settings without reloading.
          </Typography.Text>
        </Card>

        <Card
          title={
            <Space>
              <KeyOutlined />
              GHL API token
            </Space>
          }
        >
          <Typography.Paragraph>
            Some features read data the browser can&apos;t see, such as the unread conversations
            badge. For those, our server calls GHL with a{' '}
            <b>Private Integration token</b> from your agency (GHL → Settings → Private
            Integrations). Give it the <code>conversations.readonly</code> scope, plus{' '}
            <code>locations.readonly</code> and <code>oauth.write</code> if it&apos;s an
            agency-level token. It is stored encrypted and is never shown again after saving.
          </Typography.Paragraph>
          {company.hasGhlApiToken ? (
            <Alert
              type="success"
              showIcon
              style={{ marginBottom: 12 }}
              message="A token is saved"
              action={
                <Button size="small" danger loading={savingToken} onClick={() => saveToken('')}>
                  Remove
                </Button>
              }
            />
          ) : null}
          <Space.Compact style={{ width: 520 }}>
            <Input.Password
              value={tokenDraft}
              onChange={(e) => setTokenDraft(e.target.value)}
              placeholder={company.hasGhlApiToken ? 'Paste a new token to replace it' : 'pit-…'}
              autoComplete="off"
            />
            <Button
              type="primary"
              loading={savingToken}
              disabled={!tokenDraft.trim()}
              onClick={() => saveToken(tokenDraft.trim())}
            >
              Save token
            </Button>
          </Space.Compact>
        </Card>

        <Card title="Check what a location will see">
          <Typography.Paragraph type="secondary">
            This calls the same endpoint the script uses, so you can confirm which group a location
            resolves to and which features are on for it.
          </Typography.Paragraph>
          <Space wrap>
            <Input
              style={{ width: 260 }}
              placeholder="Location ID (blank = global)"
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              onPressEnter={check}
            />
            <Input
              style={{ width: 200 }}
              placeholder="SaaS plan ID (optional)"
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
              onPressEnter={check}
            />
            <Button icon={<SearchOutlined />} onClick={check} loading={checking}>
              Check
            </Button>
          </Space>

          {result && (
            <div style={{ marginTop: 20 }}>
              <Alert
                type="info"
                showIcon
                message={
                  <>
                    Resolves to: <b>{groupName(result.groupId)}</b>
                  </>
                }
                style={{ marginBottom: 12 }}
              />
              <Table
                size="small"
                pagination={false}
                rowKey="key"
                dataSource={Object.entries(result.features).map(([key, cfg]) => ({
                  key,
                  label: FEATURE_LABELS[key] ?? key,
                  enabled: cfg.enabled,
                }))}
                columns={[
                  { title: 'Feature', dataIndex: 'label', key: 'label' },
                  {
                    title: 'Status',
                    dataIndex: 'enabled',
                    key: 'enabled',
                    render: (enabled: boolean) =>
                      enabled ? <Tag color="green">Active</Tag> : <Tag>Off / not configured</Tag>,
                  },
                ]}
              />
            </div>
          )}
        </Card>
      </Space>
    </div>
  );
}
