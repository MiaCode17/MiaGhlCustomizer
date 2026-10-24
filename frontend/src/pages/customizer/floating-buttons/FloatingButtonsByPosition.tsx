import { CSSProperties, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Select,
  Slider,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { PageIntro } from '../../../components/PageIntro';
import { IconGlyph, IconPicker } from '../../../components/IconPicker';
import { floatingButtonsService } from '../../../services/floatingButtonsService';
import {
  FloatingButton,
  FloatingButtonAnimation,
  FloatingButtonDrawerDirection,
  FloatingButtonInput,
  FloatingButtonNavTab,
  FloatingButtonOpenMode,
  FloatingButtonPosition,
  FloatingButtonShadow,
  FloatingButtonSize,
  FloatingButtonVariant,
  emptyFloatingButtonInput,
  normalizeFloatingButton,
} from '../../../types/floatingButton';
import { SubItemsEditor } from './SubItemsEditor';

interface FloatingButtonsByPositionProps {
  /** The edges this page manages, the first being the default for new buttons. */
  positions: FloatingButtonPosition[];
  description: string;
}

const EDGE_LABELS: Record<FloatingButtonPosition, string> = {
  right: 'Right edge',
  left: 'Left edge',
  bottom: 'Bottom edge',
  top: 'Top edge',
};

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

const VARIANT_OPTIONS: { value: FloatingButtonVariant; label: string }[] = [
  { value: 'solid', label: 'Solid' },
  { value: 'split', label: 'Split (icon + label)' },
  { value: 'outline', label: 'Outline' },
  { value: 'ghost', label: 'Ghost' },
];

const SIZE_OPTIONS: { value: FloatingButtonSize; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

const OPEN_MODE_OPTIONS: { value: FloatingButtonOpenMode; label: string }[] = [
  { value: 'drawer', label: 'Side drawer' },
  { value: 'modal', label: 'Pop-up window' },
  { value: 'new-tab', label: 'New tab' },
  { value: 'same-tab', label: 'Same tab' },
];

const DRAWER_DIRECTION_OPTIONS: { value: FloatingButtonDrawerDirection; label: string }[] = [
  { value: 'auto', label: "From the button's edge" },
  { value: 'right', label: 'From the right' },
  { value: 'left', label: 'From the left' },
  { value: 'top', label: 'From the top' },
  { value: 'bottom', label: 'From the bottom' },
];

const SIZES = {
  small: { h: 32, font: 12, icon: 14, pad: 12 },
  medium: { h: 40, font: 14, icon: 16, pad: 16 },
  large: { h: 48, font: 16, icon: 20, pad: 20 },
};
const SHADOWS = {
  none: 'none',
  sm: '0 1px 3px rgba(0,0,0,0.14)',
  md: '0 6px 16px rgba(0,0,0,0.18)',
  lg: '0 14px 32px rgba(0,0,0,0.24)',
};

function withAlpha(hex: string, alpha: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/** ISO string ⇄ the value a datetime-local input uses (local time, no seconds). */
function toLocalInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromLocalInput(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** Mirrors how the embed script draws a button, so the admin sees roughly what GHL will show. */
function FloatingPreview({ form }: { form: FloatingButtonInput }) {
  const size = SIZES[form.size];
  const side = form.position === 'left' || form.position === 'right';
  const vertical = form.layout === 'vertical' && side;
  const variant = form.variant === 'split' && !form.icon ? 'solid' : form.variant;
  const label = form.label || 'Button';

  const style: CSSProperties = {
    display: 'inline-flex',
    flexDirection: vertical ? 'column' : 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    boxSizing: 'border-box',
    fontSize: size.font,
    fontWeight: 600,
    borderRadius: form.borderRadius,
    boxShadow: SHADOWS[form.shadow],
    overflow: 'hidden',
    [vertical ? 'width' : 'height']: size.h,
    padding: vertical ? `${size.pad}px 0` : `0 ${size.pad}px`,
  };
  const text: CSSProperties = vertical ? { writingMode: 'vertical-rl', whiteSpace: 'nowrap' } : { whiteSpace: 'nowrap' };

  let content;
  if (variant === 'split') {
    Object.assign(style, { padding: 0, gap: 0, background: '#fff', color: '#111827', border: '1px solid rgba(0,0,0,.08)' });
    content = (
      <>
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: size.h,
            height: size.h,
            background: form.backgroundColor,
            color: form.textColor,
          }}
        >
          <IconGlyph value={form.icon} size={size.icon} />
        </span>
        <span style={{ ...text, padding: vertical ? `${size.pad / 2}px 0` : `0 ${size.pad}px 0 ${size.pad / 1.5}px` }}>
          {label}
        </span>
      </>
    );
  } else {
    if (variant === 'outline') Object.assign(style, { background: '#fff', color: form.backgroundColor, border: `2px solid ${form.backgroundColor}` });
    else if (variant === 'ghost') Object.assign(style, { background: withAlpha(form.backgroundColor, 0.14), color: form.backgroundColor });
    else Object.assign(style, { background: form.backgroundColor, color: form.textColor });
    content = (
      <>
        <IconGlyph value={form.icon} size={size.icon} />
        <span style={text}>{label}</span>
      </>
    );
  }

  return (
    <div style={{ background: '#f3f4f6', borderRadius: 8, padding: 16, marginBottom: 12, textAlign: 'center' }}>
      <span style={style}>{content}</span>
      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 8 }}>Live preview (approximate)</div>
    </div>
  );
}

function NavTabsEditor({ tabs, onChange }: { tabs: FloatingButtonNavTab[]; onChange: (tabs: FloatingButtonNavTab[]) => void }) {
  const update = (i: number, patch: Partial<FloatingButtonNavTab>) =>
    onChange(tabs.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {tabs.map((tab, i) => (
        <Space.Compact key={i} style={{ width: '100%' }}>
          <Input
            style={{ width: '30%' }}
            placeholder="Tab name"
            value={tab.label}
            onChange={(e) => update(i, { label: e.target.value })}
          />
          <Input placeholder="https://…" value={tab.url} onChange={(e) => update(i, { url: e.target.value })} />
          <Button icon={<DeleteOutlined />} danger onClick={() => onChange(tabs.filter((_, idx) => idx !== i))} />
        </Space.Compact>
      ))}
      <Button
        type="dashed"
        icon={<PlusOutlined />}
        disabled={tabs.length >= 8}
        onClick={() => onChange([...tabs, { label: '', url: '' }])}
      >
        Add tab
      </Button>
    </Space>
  );
}

function scheduleTag(button: FloatingButton) {
  if (!button.startAt && !button.endAt) return null;
  const now = Date.now();
  const start = button.startAt ? new Date(button.startAt).getTime() : null;
  const end = button.endAt ? new Date(button.endAt).getTime() : null;
  if (end !== null && now >= end) return <Tag>Ended</Tag>;
  if (start !== null && now < start) return <Tag color="gold">Scheduled</Tag>;
  return <Tag color="green">Live</Tag>;
}

export function FloatingButtonsByPosition({ positions, description }: FloatingButtonsByPositionProps) {
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [buttons, setButtons] = useState<FloatingButton[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FloatingButtonInput>(emptyFloatingButtonInput(positions[0]));
  const [saving, setSaving] = useState(false);

  const positionsKey = positions.join(',');

  const load = () => {
    setLoading(true);
    floatingButtonsService
      .list(groupId)
      .then((all) =>
        setButtons(all.map(normalizeFloatingButton).filter((button) => positions.includes(button.position))),
      )
      .catch((err) => message.error(err instanceof Error ? err.message : 'Failed to load floating buttons'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, positionsKey]);

  const openCreate = () => {
    setEditingId(null);
    const side = positions[0] === 'right' || positions[0] === 'left';
    setForm({ ...emptyFloatingButtonInput(positions[0]), layout: side ? 'vertical' : 'horizontal' });
    setModalOpen(true);
  };

  const openEdit = (button: FloatingButton) => {
    setEditingId(button._id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, companyId, groupId: _g, createdAt, updatedAt, ...rest } = button;
    setForm({ ...rest, icon: rest.icon ?? '' });
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
    if (!form.label.trim()) {
      message.error('A label is required');
      return;
    }
    if (form.navTabs.some((t) => !t.label.trim() || !t.url.trim())) {
      message.error('Every tab needs a name and a URL');
      return;
    }
    if (form.startAt && form.endAt && new Date(form.endAt) <= new Date(form.startAt)) {
      message.error('The end time must be after the start time');
      return;
    }
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

  const hasTabs = form.navTabs.length > 0;
  const placed = form.positionPercent !== null;
  const sideEdge = form.position === 'left' || form.position === 'right';

  const contentTab = (
    <>
      <Form.Item label="Label" required>
        <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
      </Form.Item>
      <Form.Item label="Icon" extra="Pick a built-in icon, or type an emoji or an image URL.">
        <IconPicker value={form.icon} onChange={(icon) => setForm({ ...form, icon })} />
      </Form.Item>
      <Typography.Text strong style={{ display: 'block', margin: '4px 0 8px' }}>
        When someone clicks it
      </Typography.Text>
      <Form.Item
        label="Nav tabs"
        extra="Opens a drawer with a tab bar; each tab shows its own page and the first one is shown first."
      >
        <NavTabsEditor tabs={form.navTabs} onChange={(navTabs) => setForm({ ...form, navTabs })} />
      </Form.Item>
      {!hasTabs && (
        <>
          <Form.Item
            label="Page to open"
            extra={
              <>
                Placeholders such as <code>{'{{location.id}}'}</code> and <code>{'{{user.email}}'}</code> work here.
                Leave empty to use the quick links below instead.
              </>
            }
          >
            <Input
              value={form.url}
              placeholder="https://example.com/help?loc={{location.id}}"
              onChange={(e) => setForm({ ...form, url: e.target.value })}
            />
          </Form.Item>
          <Form.Item label="Quick links" extra="Shown as a menu (a single link opens straight away) when there is no page above.">
            <SubItemsEditor subItems={form.subItems} onChange={(subItems) => setForm({ ...form, subItems })} />
          </Form.Item>
        </>
      )}
      <Space size="large" wrap align="start">
        <Form.Item label="Opens in">
          <Select
            style={{ width: 170 }}
            value={hasTabs ? 'drawer' : form.openMode}
            disabled={hasTabs}
            options={OPEN_MODE_OPTIONS}
            onChange={(openMode) => setForm({ ...form, openMode })}
          />
        </Form.Item>
        {(hasTabs || form.openMode === 'drawer') && (
          <>
            <Form.Item label="Drawer slides in">
              <Select
                style={{ width: 200 }}
                value={form.drawerDirection}
                options={DRAWER_DIRECTION_OPTIONS}
                onChange={(drawerDirection) => setForm({ ...form, drawerDirection })}
              />
            </Form.Item>
            <Form.Item label={`Drawer size (${form.drawerPercent}%)`} style={{ width: 200 }}>
              <Slider
                min={20}
                max={100}
                value={form.drawerPercent}
                onChange={(drawerPercent) => setForm({ ...form, drawerPercent })}
              />
            </Form.Item>
          </>
        )}
      </Space>
    </>
  );

  const lookTab = (
    <>
      <Space size="large" wrap>
        <Form.Item label="Style">
          <Select
            style={{ width: 190 }}
            value={form.variant}
            options={VARIANT_OPTIONS}
            onChange={(variant) => setForm({ ...form, variant })}
          />
        </Form.Item>
        <Form.Item label="Size">
          <Select
            style={{ width: 120 }}
            value={form.size}
            options={SIZE_OPTIONS}
            onChange={(size) => setForm({ ...form, size })}
          />
        </Form.Item>
        <Form.Item label="Label direction">
          <Radio.Group
            value={form.layout}
            onChange={(e) => setForm({ ...form, layout: e.target.value })}
            optionType="button"
            options={[
              { value: 'horizontal', label: 'Horizontal' },
              { value: 'vertical', label: 'Vertical' },
            ]}
            disabled={!sideEdge}
          />
        </Form.Item>
      </Space>
      {!sideEdge && (
        <Typography.Paragraph type="secondary" style={{ marginTop: -8 }}>
          A vertical label only applies to buttons on the left or right edge.
        </Typography.Paragraph>
      )}
      <Space size="large" wrap>
        <Form.Item label="Color">
          <input
            type="color"
            value={form.backgroundColor}
            onChange={(e) => setForm({ ...form, backgroundColor: e.target.value })}
          />
        </Form.Item>
        <Form.Item label="Icon / text color">
          <input type="color" value={form.textColor} onChange={(e) => setForm({ ...form, textColor: e.target.value })} />
        </Form.Item>
        <Form.Item label="Corner radius (px)">
          <InputNumber min={0} max={999} value={form.borderRadius} onChange={(v) => setForm({ ...form, borderRadius: v ?? 0 })} />
        </Form.Item>
        <Form.Item label="Shadow">
          <Select style={{ width: 120 }} value={form.shadow} options={SHADOW_OPTIONS} onChange={(shadow) => setForm({ ...form, shadow })} />
        </Form.Item>
        <Form.Item label="Animation">
          <Select
            style={{ width: 140 }}
            value={form.animation}
            options={ANIMATION_OPTIONS}
            onChange={(animation) => setForm({ ...form, animation })}
          />
        </Form.Item>
      </Space>
    </>
  );

  const placementTab = (
    <>
      <Form.Item label="Screen edge">
        <Radio.Group
          value={form.position}
          optionType="button"
          options={positions.map((p) => ({ value: p, label: EDGE_LABELS[p] }))}
          onChange={(e) => {
            const position = e.target.value as FloatingButtonPosition;
            const side = position === 'left' || position === 'right';
            setForm({ ...form, position, layout: side ? form.layout : 'horizontal' });
          }}
        />
      </Form.Item>
      <Form.Item
        label="Position"
        extra="Stacked buttons share a dock on the edge. Choose a position to place this one on its own."
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Switch
            checked={placed}
            checkedChildren="Placed"
            unCheckedChildren="Stacked"
            onChange={(on) => setForm({ ...form, positionPercent: on ? 50 : null })}
            disabled={form.draggable}
          />
          {(placed || form.draggable) && (
            <>
              <Typography.Text type="secondary">
                {sideEdge ? 'Distance from the top' : 'Distance from the left'}: {form.positionPercent ?? 50}%
              </Typography.Text>
              <Slider
                min={0}
                max={100}
                value={form.positionPercent ?? 50}
                onChange={(positionPercent) => setForm({ ...form, positionPercent })}
              />
              <Form.Item label="Distance from the edge (px)" style={{ marginBottom: 0 }}>
                <InputNumber
                  min={0}
                  max={400}
                  value={form.edgeOffset}
                  onChange={(edgeOffset) => setForm({ ...form, edgeOffset: edgeOffset ?? 16 })}
                />
              </Form.Item>
            </>
          )}
        </Space>
      </Form.Item>
      <Form.Item
        extra="Viewers can drag it anywhere; it snaps to the nearest edge when released, and their choice is remembered in their browser."
      >
        <Checkbox
          checked={form.draggable}
          onChange={(e) =>
            setForm({
              ...form,
              draggable: e.target.checked,
              positionPercent: e.target.checked && form.positionPercent === null ? 50 : form.positionPercent,
            })
          }
        >
          Let viewers drag this button
        </Checkbox>
      </Form.Item>
    </>
  );

  const scheduleTab = (
    <>
      <Typography.Paragraph type="secondary">
        Show this button only for a limited time, for example a launch offer. Leave both empty to always show it.
        Times use your browser&apos;s time zone and are checked against the server clock.
      </Typography.Paragraph>
      <Space size="large" wrap>
        <Form.Item label="Show from">
          <Input
            type="datetime-local"
            value={toLocalInput(form.startAt)}
            onChange={(e) => setForm({ ...form, startAt: fromLocalInput(e.target.value) })}
          />
        </Form.Item>
        <Form.Item label="Hide after">
          <Input
            type="datetime-local"
            value={toLocalInput(form.endAt)}
            onChange={(e) => setForm({ ...form, endAt: fromLocalInput(e.target.value) })}
          />
        </Form.Item>
      </Space>
      <Form.Item>
        <Checkbox
          checked={form.showCountdown}
          disabled={!form.endAt}
          onChange={(e) => setForm({ ...form, showCountdown: e.target.checked })}
        >
          Show a live countdown to the end time on the button
        </Checkbox>
      </Form.Item>
      {form.showCountdown && !form.endAt && <Alert type="warning" showIcon message="Set a hide-after time to use a countdown." />}
    </>
  );

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
            {
              title: 'Button',
              key: 'label',
              render: (_, row) => (
                <Space>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 26,
                      height: 26,
                      borderRadius: 6,
                      background: row.backgroundColor,
                      color: row.textColor,
                    }}
                  >
                    <IconGlyph value={row.icon} size={14} />
                  </span>
                  {row.label}
                  {scheduleTag(row)}
                </Space>
              ),
            },
            { title: 'Edge', dataIndex: 'position', render: (p: FloatingButtonPosition) => EDGE_LABELS[p] },
            {
              title: 'Style',
              key: 'style',
              render: (_, row) => `${VARIANT_OPTIONS.find((o) => o.value === row.variant)?.label.split(' ')[0] ?? row.variant}, ${row.size}`,
            },
            {
              title: 'Opens',
              key: 'opens',
              render: (_, row) =>
                row.navTabs.length > 0
                  ? `Drawer, ${row.navTabs.length} tabs`
                  : row.url
                    ? OPEN_MODE_OPTIONS.find((o) => o.value === row.openMode)?.label
                    : row.subItems.length > 0
                      ? `${row.subItems.length} quick link${row.subItems.length === 1 ? '' : 's'}`
                      : '—',
            },
            {
              title: 'Position',
              key: 'pos',
              render: (_, row) => (row.positionPercent === null ? 'Stacked' : `${row.positionPercent}%${row.draggable ? ', draggable' : ''}`),
            },
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
        title={editingId ? 'Edit floating button' : 'Add floating button'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={saving}
        destroyOnClose
        width={720}
      >
        <FloatingPreview form={form} />
        <Form layout="vertical">
          <Tabs
            items={[
              { key: 'content', label: 'Content', children: contentTab },
              { key: 'look', label: 'Look', children: lookTab },
              { key: 'placement', label: 'Placement', children: placementTab },
              {
                key: 'schedule',
                label: `Schedule${form.startAt || form.endAt ? ' •' : ''}`,
                children: scheduleTab,
              },
            ]}
          />
        </Form>
      </Modal>
    </div>
  );
}
