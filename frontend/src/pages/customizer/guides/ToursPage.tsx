import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Radio,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  AimOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { IconGlyph, IconPicker } from '../../../components/IconPicker';
import { PageIntro } from '../../../components/PageIntro';
import { guidesService } from '../../../services/guidesService';
import {
  GuideSettings,
  Tour,
  TourInput,
  TourStep,
  emptyTourInput,
  emptyTourStep,
  normalizeGuideSettings,
  normalizeTour,
} from '../../../types/guide';

const GHL_URL_KEY = 'mgc:guide:ghlUrl';
const PLACEMENTS = ['auto', 'top', 'bottom', 'left', 'right', 'center'] as const;
const ROLE_LABELS: Record<keyof TourInput['permissions'], string> = {
  agency_admins: 'Agency admins',
  agency_users: 'Agency users',
  account_admins: 'Sub-account admins',
  account_users: 'Sub-account users',
};

function readGhlUrl(): string {
  try {
    return window.localStorage.getItem(GHL_URL_KEY) ?? '';
  } catch {
    return '';
  }
}

/** "/v2/location/ABC123/contacts/detail" -> "/contacts/detail": the part that is the same for every sub-account. */
function pagePart(path: string): string {
  return path.replace(/^\/v2\/location\/[^/]+/, '') || '/';
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

function validate(tour: TourInput): string | null {
  if (!tour.name.trim()) return 'Give the tour a name';
  if (tour.steps.length === 0) return 'A tour needs at least one step';
  for (let i = 0; i < tour.steps.length; i++) {
    const s = tour.steps[i];
    const n = i + 1;
    if (!s.title.trim() && !s.content.trim()) return `Step ${n} needs a title or some text`;
    if (s.mediaType !== 'none' && !isHttpUrl(s.mediaUrl)) return `Step ${n}: add the image or video URL (http:// or https://)`;
    if (Boolean(s.ctaLabel.trim()) !== Boolean(s.ctaUrl.trim())) return `Step ${n}: a button needs both a label and a URL`;
    if (s.ctaUrl.trim() && !isHttpUrl(s.ctaUrl)) return `Step ${n}: the button URL must start with http:// or https://`;
  }
  return null;
}

interface StepEditorProps {
  step: TourStep;
  index: number;
  total: number;
  picking: boolean;
  onChange: (patch: Partial<TourStep>) => void;
  onMove: (delta: -1 | 1) => void;
  onRemove: () => void;
  onPick: () => void;
}

function StepEditor({ step, index, total, picking, onChange, onMove, onRemove, onPick }: StepEditorProps) {
  return (
    <Card
      size="small"
      style={{ marginBottom: 12 }}
      title={`Step ${index + 1}`}
      extra={
        <Space size={4}>
          <Button size="small" icon={<ArrowUpOutlined />} disabled={index === 0} onClick={() => onMove(-1)} aria-label="Move up" />
          <Button size="small" icon={<ArrowDownOutlined />} disabled={index === total - 1} onClick={() => onMove(1)} aria-label="Move down" />
          <Button size="small" danger icon={<DeleteOutlined />} disabled={total === 1} onClick={onRemove} aria-label="Remove step" />
        </Space>
      }
    >
      <Form layout="vertical">
        <Form.Item label="Title" style={{ marginBottom: 8 }}>
          <Input value={step.title} maxLength={80} onChange={(e) => onChange({ title: e.target.value })} />
        </Form.Item>
        <Form.Item label="Text" style={{ marginBottom: 8 }}>
          <Input.TextArea rows={3} value={step.content} maxLength={2000} onChange={(e) => onChange({ content: e.target.value })} />
        </Form.Item>
        <Form.Item
          label="Point at (CSS selector)"
          extra="Leave empty to show this step as a centered card."
          style={{ marginBottom: 8 }}
        >
          <Space.Compact style={{ width: '100%' }}>
            <Input value={step.selector} maxLength={300} placeholder="#sb_contacts" onChange={(e) => onChange({ selector: e.target.value })} />
            <Button icon={<AimOutlined />} loading={picking} onClick={onPick}>
              Pick element in GHL
            </Button>
          </Space.Compact>
        </Form.Item>
        <Space size="large" wrap align="start">
          <Form.Item label="Card position" style={{ marginBottom: 8 }}>
            <Select
              style={{ width: 130 }}
              value={step.placement}
              options={PLACEMENTS.map((p) => ({ value: p, label: p[0].toUpperCase() + p.slice(1) }))}
              onChange={(placement) => onChange({ placement })}
            />
          </Form.Item>
          <Form.Item label="Click first (optional)" extra="Opens a menu or tab the target lives in." style={{ marginBottom: 8 }}>
            <Input style={{ width: 240 }} value={step.clickSelector} maxLength={300} onChange={(e) => onChange({ clickSelector: e.target.value })} />
          </Form.Item>
        </Space>
        <Space size="large" wrap align="start">
          <Form.Item label="Media" style={{ marginBottom: 8 }}>
            <Radio.Group
              value={step.mediaType}
              onChange={(e) => onChange({ mediaType: e.target.value, ...(e.target.value === 'none' ? { mediaUrl: '' } : {}) })}
            >
              <Radio.Button value="none">None</Radio.Button>
              <Radio.Button value="image">Image</Radio.Button>
              <Radio.Button value="video">Video</Radio.Button>
            </Radio.Group>
          </Form.Item>
          {step.mediaType !== 'none' ? (
            <Form.Item label={step.mediaType === 'video' ? 'Video URL' : 'Image URL'} style={{ marginBottom: 8 }}>
              <Input style={{ width: 340 }} value={step.mediaUrl} maxLength={2000} placeholder="https://…" onChange={(e) => onChange({ mediaUrl: e.target.value })} />
            </Form.Item>
          ) : null}
        </Space>
        <Space size="large" wrap align="start">
          <Form.Item label="Button label (optional)" style={{ marginBottom: 0 }}>
            <Input style={{ width: 180 }} value={step.ctaLabel} maxLength={40} onChange={(e) => onChange({ ctaLabel: e.target.value })} />
          </Form.Item>
          <Form.Item label="Button URL" style={{ marginBottom: 0 }}>
            <Input style={{ width: 340 }} value={step.ctaUrl} maxLength={2000} placeholder="https://…" onChange={(e) => onChange({ ctaUrl: e.target.value })} />
          </Form.Item>
        </Space>
      </Form>
    </Card>
  );
}

export function ToursPage() {
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [tours, setTours] = useState<Tour[]>([]);
  const [settings, setSettings] = useState<GuideSettings>(normalizeGuideSettings(null));
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [editing, setEditing] = useState<{ id: string | null; tour: TourInput } | null>(null);
  const [saving, setSaving] = useState(false);
  const [ghlUrl, setGhlUrl] = useState(readGhlUrl);
  const [pickingIndex, setPickingIndex] = useState<number | null>(null);
  const popupRef = useRef<Window | null>(null);
  const pickingRef = useRef<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, loaded] = await Promise.all([guidesService.listTours(groupId), guidesService.getSettings(groupId)]);
      setTours(list);
      setSettings(normalizeGuideSettings(loaded));
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to load guided tours');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    void load();
  }, [load]);

  // Selectors arrive from the GHL tab the picker was opened in. Only that exact window is trusted.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data as { type?: unknown; selector?: unknown; path?: unknown } | null;
      if (!popupRef.current || event.source !== popupRef.current) return;
      if (!data || data.type !== 'mgc-picked' || typeof data.selector !== 'string') return;
      const index = pickingRef.current;
      if (index === null) return;
      const path = typeof data.path === 'string' ? pagePart(data.path) : '';
      setEditing((cur) => {
        if (!cur || !cur.tour.steps[index]) return cur;
        const steps = cur.tour.steps.map((s, i) => (i === index ? { ...s, selector: data.selector as string } : s));
        const pages = cur.tour.pages.length === 0 && path ? [path] : cur.tour.pages;
        return { ...cur, tour: { ...cur.tour, steps, pages } };
      });
      message.success('Element selected');
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const startPicking = (index: number) => {
    const url = ghlUrl.trim();
    if (!isHttpUrl(url)) {
      message.error('Enter your GHL address first (for example https://app.yourdomain.com)');
      return;
    }
    try {
      window.localStorage.setItem(GHL_URL_KEY, url);
    } catch {
      /* remembering the address is only a convenience */
    }
    const target = url.replace(/#.*$/, '') + '#mgc-pick';
    const popup = window.open(target, 'mgc-guide-picker');
    if (!popup) {
      message.error('The browser blocked the new tab. Allow pop-ups for this page and try again.');
      return;
    }
    popupRef.current = popup;
    pickingRef.current = index;
    setPickingIndex(index);
    message.info('Pick the element in the GHL tab, press "Use this element", then come back here.');
  };

  const closeEditor = () => {
    setEditing(null);
    setPickingIndex(null);
    pickingRef.current = null;
  };

  const patchTour = (patch: Partial<TourInput>) => setEditing((cur) => (cur ? { ...cur, tour: { ...cur.tour, ...patch } } : cur));
  const patchStep = (index: number, patch: Partial<TourStep>) =>
    setEditing((cur) =>
      cur ? { ...cur, tour: { ...cur.tour, steps: cur.tour.steps.map((s, i) => (i === index ? { ...s, ...patch } : s)) } } : cur,
    );
  const moveStep = (index: number, delta: -1 | 1) =>
    setEditing((cur) => {
      if (!cur) return cur;
      const steps = [...cur.tour.steps];
      const to = index + delta;
      if (to < 0 || to >= steps.length) return cur;
      [steps[index], steps[to]] = [steps[to], steps[index]];
      return { ...cur, tour: { ...cur.tour, steps } };
    });

  const handleSave = async () => {
    if (!editing) return;
    const problem = validate(editing.tour);
    if (problem) {
      message.error(problem);
      return;
    }
    setSaving(true);
    try {
      const input: TourInput = { ...editing.tour, name: editing.tour.name.trim(), pages: editing.tour.pages.map((p) => p.trim()).filter(Boolean) };
      if (editing.id) await guidesService.updateTour(editing.id, input);
      else await guidesService.createTour({ ...input, order: tours.length }, groupId);
      message.success('Tour saved');
      closeEditor();
      await load();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to save the tour');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (tour: Tour, enabled: boolean) => {
    try {
      const { _id, companyId, groupId: _g, createdAt, updatedAt, ...input } = tour;
      void _id; void companyId; void _g; void createdAt; void updatedAt;
      await guidesService.updateTour(tour._id, { ...normalizeTour(input), enabled });
      setTours((list) => list.map((t) => (t._id === tour._id ? { ...t, enabled } : t)));
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to update the tour');
    }
  };

  const handleDelete = async (tour: Tour) => {
    try {
      await guidesService.removeTour(tour._id);
      message.success('Tour deleted');
      await load();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to delete the tour');
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      setSettings(normalizeGuideSettings(await guidesService.saveSettings(settings, groupId)));
      message.success('Guide button saved');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to save the guide button');
    } finally {
      setSavingSettings(false);
    }
  };

  const setS = (patch: Partial<GuideSettings>) => setSettings((s) => ({ ...s, ...patch }));

  const toursTab = (
    <>
      <Space style={{ marginBottom: 12 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setEditing({ id: null, tour: normalizeTour(emptyTourInput) })}>
          New tour
        </Button>
      </Space>
      <Table<Tour>
        rowKey="_id"
        loading={loading}
        dataSource={tours}
        pagination={false}
        locale={{ emptyText: 'No guided tours yet. Create one to walk people through GHL.' }}
        columns={[
          { title: 'Name', dataIndex: 'name' },
          { title: 'Steps', dataIndex: 'steps', width: 80, render: (s: TourStep[]) => s.length },
          {
            title: 'Pages',
            dataIndex: 'pages',
            render: (p: string[]) => (p.length ? p.map((x) => <Tag key={x}>{x}</Tag>) : <Tag color="blue">Every page</Tag>),
          },
          {
            title: 'Starts',
            dataIndex: 'autoStart',
            width: 140,
            render: (a: string) => (a === 'first-visit' ? 'On first visit' : 'From the button'),
          },
          {
            title: 'On',
            dataIndex: 'enabled',
            width: 80,
            render: (enabled: boolean, tour) => <Switch size="small" checked={enabled} onChange={(v) => void handleToggle(tour, v)} />,
          },
          {
            title: '',
            key: 'actions',
            width: 110,
            render: (_: unknown, tour) => (
              <Space>
                <Button size="small" icon={<EditOutlined />} aria-label="Edit" onClick={() => setEditing({ id: tour._id, tour: normalizeTour(tour) })} />
                <Popconfirm title="Delete this tour?" okText="Delete" okButtonProps={{ danger: true }} onConfirm={() => void handleDelete(tour)}>
                  <Button size="small" danger icon={<DeleteOutlined />} aria-label="Delete" />
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />
    </>
  );

  const buttonTab = (
    <Card size="small">
      <Space align="center" style={{ marginBottom: 12 }}>
        <Switch checked={settings.enabled} onChange={(enabled) => setS({ enabled })} />
        <Typography.Text>Show the guide button in GHL</Typography.Text>
      </Space>
      <Form layout="vertical">
        <Space size="large" wrap align="start">
          <Form.Item label="Text">
            <Input style={{ width: 180 }} value={settings.buttonText} maxLength={30} onChange={(e) => setS({ buttonText: e.target.value })} />
          </Form.Item>
          <Form.Item label="Icon">
            <IconPicker value={settings.icon} onChange={(icon) => setS({ icon })} />
          </Form.Item>
          <Form.Item label="Placement">
            <Select
              style={{ width: 180 }}
              value={settings.placement}
              onChange={(placement) => setS({ placement })}
              options={[
                { value: 'header', label: 'Top bar' },
                { value: 'bottom-right', label: 'Bottom right' },
                { value: 'bottom-left', label: 'Bottom left' },
                { value: 'top-right', label: 'Top right' },
                { value: 'top-left', label: 'Top left' },
              ]}
            />
          </Form.Item>
        </Space>
        <Space size="large" wrap align="start">
          <Form.Item label="Background">
            <input type="color" value={settings.backgroundColor} onChange={(e) => setS({ backgroundColor: e.target.value })} />
          </Form.Item>
          <Form.Item label="Text color">
            <input type="color" value={settings.textColor} onChange={(e) => setS({ textColor: e.target.value })} />
          </Form.Item>
          <Form.Item label="Corner radius">
            <InputNumber min={0} max={999} value={settings.borderRadius} onChange={(v) => setS({ borderRadius: v ?? 0 })} />
          </Form.Item>
          <Form.Item label="Size">
            <Select
              style={{ width: 120 }}
              value={settings.size}
              onChange={(size) => setS({ size })}
              options={[{ value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' }]}
            />
          </Form.Item>
          <Form.Item label="Shadow">
            <Select
              style={{ width: 120 }}
              value={settings.shadow}
              onChange={(shadow) => setS({ shadow })}
              options={[{ value: 'none', label: 'None' }, { value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }]}
            />
          </Form.Item>
        </Space>
        <Form.Item label="Preview">
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: settings.size === 'small' ? '4px 10px' : settings.size === 'large' ? '10px 20px' : '7px 14px',
              background: settings.backgroundColor,
              color: settings.textColor,
              borderRadius: Math.min(settings.borderRadius, 999),
              fontWeight: 600,
              boxShadow: { none: 'none', sm: '0 1px 3px rgba(0,0,0,.2)', md: '0 6px 16px rgba(0,0,0,.2)', lg: '0 14px 32px rgba(0,0,0,.25)' }[settings.shadow],
            }}
          >
            <IconGlyph value={settings.icon} />
            {settings.buttonText}
          </span>
        </Form.Item>
        <Button type="primary" loading={savingSettings} onClick={() => void handleSaveSettings()}>
          Save
        </Button>
      </Form>
    </Card>
  );

  return (
    <div>
      <PageIntro
        icon={<QuestionCircleOutlined />}
        description="Build step-by-step guided tours that highlight parts of GHL. People start them from the guide button, or automatically the first time they open a page."
        groupId={groupId}
        onGroupChange={setGroupId}
      />
      <Tabs
        items={[
          { key: 'tours', label: 'Tours', children: toursTab },
          { key: 'button', label: 'Guide button', children: buttonTab },
        ]}
      />
      <Modal
        open={editing !== null}
        title={editing?.id ? 'Edit tour' : 'New tour'}
        width={760}
        onCancel={closeEditor}
        onOk={() => void handleSave()}
        okText="Save tour"
        confirmLoading={saving}
        maskClosable={false}
        destroyOnClose
      >
        {editing ? (
          <>
            <Form layout="vertical">
              <Form.Item label="Tour name">
                <Input value={editing.tour.name} maxLength={80} onChange={(e) => patchTour({ name: e.target.value })} />
              </Form.Item>
              <Space size="large" wrap align="start">
                <Form.Item label="Enabled">
                  <Switch checked={editing.tour.enabled} onChange={(enabled) => patchTour({ enabled })} />
                </Form.Item>
                <Form.Item label="Starts">
                  <Select
                    style={{ width: 200 }}
                    value={editing.tour.autoStart}
                    onChange={(autoStart) => patchTour({ autoStart })}
                    options={[
                      { value: 'never', label: 'Only from the guide button' },
                      { value: 'first-visit', label: 'Automatically on first visit' },
                    ]}
                  />
                </Form.Item>
              </Space>
              <Form.Item
                label="Pages"
                extra="The tour appears on pages whose address contains any of these (for example /contacts). Leave empty for every page."
              >
                <Select
                  mode="tags"
                  tokenSeparators={[',']}
                  value={editing.tour.pages}
                  onChange={(pages) => patchTour({ pages })}
                  placeholder="/contacts, /conversations"
                />
              </Form.Item>
              <Form.Item label="Who can see it">
                <Checkbox.Group
                  value={(Object.keys(ROLE_LABELS) as (keyof TourInput['permissions'])[]).filter((k) => editing.tour.permissions[k])}
                  options={(Object.keys(ROLE_LABELS) as (keyof TourInput['permissions'])[]).map((k) => ({ value: k, label: ROLE_LABELS[k] }))}
                  onChange={(vals) =>
                    patchTour({
                      permissions: {
                        agency_admins: vals.includes('agency_admins'),
                        agency_users: vals.includes('agency_users'),
                        account_admins: vals.includes('account_admins'),
                        account_users: vals.includes('account_users'),
                      },
                    })
                  }
                />
              </Form.Item>
              <Form.Item label="Your GHL address (for the element picker)" extra="Opens in a new tab so you can click the element to point at. Remembered in this browser.">
                <Input value={ghlUrl} placeholder="https://app.yourdomain.com" onChange={(e) => setGhlUrl(e.target.value)} />
              </Form.Item>
            </Form>
            {pickingIndex !== null ? (
              <Alert
                type="info"
                showIcon
                style={{ marginBottom: 12 }}
                message={`Waiting for an element for step ${pickingIndex + 1}. Pick it in the GHL tab.`}
                closable
                onClose={() => {
                  pickingRef.current = null;
                  setPickingIndex(null);
                }}
              />
            ) : null}
            {editing.tour.steps.map((step, i) => (
              <StepEditor
                key={i}
                step={step}
                index={i}
                total={editing.tour.steps.length}
                picking={pickingIndex === i}
                onChange={(patch) => patchStep(i, patch)}
                onMove={(d) => moveStep(i, d)}
                onRemove={() => patchTour({ steps: editing.tour.steps.filter((_, j) => j !== i) })}
                onPick={() => startPicking(i)}
              />
            ))}
            <Button
              icon={<PlusOutlined />}
              disabled={editing.tour.steps.length >= 20}
              onClick={() => patchTour({ steps: [...editing.tour.steps, { ...emptyTourStep }] })}
            >
              Add step
            </Button>
          </>
        ) : null}
      </Modal>
    </div>
  );
}
