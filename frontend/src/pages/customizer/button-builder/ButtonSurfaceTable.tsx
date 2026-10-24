import { CSSProperties, useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Slider,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { buttonBuilderService } from '../../../services/buttonBuilderService';
import {
  ButtonAnimation,
  ButtonIconPosition,
  ButtonIconSize,
  ButtonMenuItem,
  ButtonOpenMode,
  ButtonPermissions,
  ButtonShadow,
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

const ICON_POSITION_OPTIONS: { value: ButtonIconPosition; label: string }[] = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
];

const ICON_SIZE_OPTIONS: { value: ButtonIconSize; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

const SHADOW_OPTIONS: { value: ButtonShadow; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
];

const ANIMATION_OPTIONS: { value: ButtonAnimation; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'pulse', label: 'Pulse' },
  { value: 'bounce', label: 'Bounce' },
  { value: 'shimmer', label: 'Shimmer' },
];

const OPEN_MODE_OPTIONS: { value: ButtonOpenMode; label: string }[] = [
  { value: 'modal', label: 'Pop-up window' },
  { value: 'drawer', label: 'Side drawer' },
  { value: 'new-tab', label: 'New tab' },
  { value: 'same-tab', label: 'Same tab' },
];

const ROLE_LABELS: Record<keyof ButtonPermissions, string> = {
  agency_admins: 'Agency admins',
  agency_users: 'Agency users',
  account_admins: 'Sub-account admins',
  account_users: 'Sub-account users',
};

// Surfaces that have a contact / opportunity in context, where contact details can be sent along.
const CONTACT_AWARE: ButtonSurface[] = ['contact', 'opportunity', 'record-detail'];

const PREVIEW_SIZES = {
  small: { height: 24, padding: '0 8px', fontSize: 12 },
  middle: { height: 32, padding: '0 14px', fontSize: 14 },
  large: { height: 40, padding: '0 18px', fontSize: 16 },
};
const PREVIEW_ICON_SIZES = { small: 12, medium: 16, large: 20 };
const PREVIEW_SHADOWS = {
  none: 'none',
  sm: '0 1px 3px rgba(0,0,0,0.14)',
  md: '0 6px 16px rgba(0,0,0,0.18)',
  lg: '0 14px 32px rgba(0,0,0,0.24)',
};

/** Mirrors how the embed script draws a button, so the admin sees roughly what GHL will show. */
function ButtonPreview({ form }: { form: InjectedButtonInput }) {
  const base =
    form.style === 'primary'
      ? { bg: '#4f46e5', color: '#ffffff', border: '#4f46e5', borderStyle: 'solid' }
      : form.style === 'dashed'
        ? { bg: '#ffffff', color: '#1f2937', border: '#cbd5e1', borderStyle: 'dashed' }
        : form.style === 'text'
          ? { bg: 'transparent', color: '#1f2937', border: 'transparent', borderStyle: 'solid' }
          : { bg: '#ffffff', color: '#1f2937', border: '#d9d9d9', borderStyle: 'solid' };
  const size = PREVIEW_SIZES[form.size];
  const bg = form.backgroundColor || base.bg;
  const isDropdown = form.menuItems.length > 0;
  const showLabel = form.label && !(form.iconOnly && form.icon);
  const label = isDropdown && showLabel ? `${form.label} ▾` : form.label;

  const style: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: size.height,
    padding: size.padding,
    fontSize: size.fontSize,
    fontWeight: form.bold ? 700 : 500,
    textTransform: form.uppercase ? 'uppercase' : 'none',
    textDecoration: form.underline ? 'underline' : 'none',
    background: form.gradient && form.gradientColor ? `linear-gradient(135deg, ${bg}, ${form.gradientColor})` : bg,
    color: form.textColor || base.color,
    borderStyle: base.borderStyle as CSSProperties['borderStyle'],
    borderColor: form.borderColor || base.border,
    borderWidth: form.borderWidth || (form.style === 'text' ? 0 : 1),
    borderRadius: form.borderRadius,
    boxShadow: PREVIEW_SHADOWS[form.shadow],
    opacity: form.opacity / 100,
    width: form.fullWidth ? '100%' : undefined,
    flexDirection: form.iconPosition === 'right' ? 'row-reverse' : 'row',
    whiteSpace: 'nowrap',
  };

  return (
    <div
      style={{
        background: '#f3f4f6',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        textAlign: 'center',
      }}
    >
      <span style={style} title={form.tooltip || undefined}>
        {form.icon ? <span style={{ fontSize: PREVIEW_ICON_SIZES[form.iconSize] }}>{form.icon}</span> : null}
        {showLabel ? <span>{label || 'Button'}</span> : null}
      </span>
      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 8 }}>Live preview (approximate)</div>
    </div>
  );
}

function emptyMenuItem(): ButtonMenuItem {
  return { label: '', url: '', openMode: 'new-tab', sendContact: false, sendCustomFields: false };
}

export function ButtonSurfaceTable({ surface, groupId }: ButtonSurfaceTableProps) {
  const [buttons, setButtons] = useState<InjectedButton[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<InjectedButtonInput>(emptyButtonInput(surface));
  const [saving, setSaving] = useState(false);

  const contactAware = CONTACT_AWARE.includes(surface);

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, companyId, groupId: _g, createdAt, updatedAt, ...rest } = button;
    const defaults = emptyButtonInput(surface);
    setForm({
      ...defaults,
      ...rest,
      tooltip: rest.tooltip ?? '',
      icon: rest.icon ?? '',
      targetUrl: rest.targetUrl ?? '',
      backgroundColor: rest.backgroundColor ?? '',
      textColor: rest.textColor ?? '',
      borderColor: rest.borderColor ?? '',
      gradientColor: rest.gradientColor ?? '',
      placementSelector: rest.placementSelector ?? '',
      permissions: { ...defaults.permissions, ...(rest.permissions ?? {}) },
      menuItems: rest.menuItems ?? [],
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
    if (!form.label.trim()) {
      message.error('A label is required');
      return;
    }
    if (form.menuItems.some((m) => !m.label.trim() || !m.url.trim())) {
      message.error('Every menu item needs a label and a URL');
      return;
    }
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

  const updateMenuItem = (index: number, patch: Partial<ButtonMenuItem>) =>
    setForm({
      ...form,
      menuItems: form.menuItems.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    });

  const contentTab = (
    <>
      <Form.Item label="Label" required>
        <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
      </Form.Item>
      <Form.Item label="Tooltip">
        <Input value={form.tooltip} onChange={(e) => setForm({ ...form, tooltip: e.target.value })} />
      </Form.Item>
      <Form.Item label="Icon" extra="An emoji or an image URL.">
        <Input
          value={form.icon}
          onChange={(e) => setForm({ ...form, icon: e.target.value })}
          placeholder="e.g. ⭐ or https://…/icon.png"
        />
      </Form.Item>
      <Form.Item label="Order" extra="Lower numbers appear first.">
        <InputNumber
          value={form.order}
          onChange={(order) => setForm({ ...form, order: order ?? 0 })}
          style={{ width: '100%' }}
        />
      </Form.Item>
    </>
  );

  const linkTab = (
    <>
      <Form.Item
        label="Target URL"
        extra={
          <>
            Placeholders: <code>{'{{location.id}}'}</code> <code>{'{{user.id}}'}</code>{' '}
            <code>{'{{user.email}}'}</code> <code>{'{{company.id}}'}</code>
            {contactAware && (
              <>
                {' '}
                <code>{'{{contact.id}}'}</code> <code>{'{{contact.email}}'}</code>{' '}
                <code>{'{{contact.custom.<key>}}'}</code>
              </>
            )}{' '}
            <code>{'{{custom_values.<key>}}'}</code>. Ignored when the button has a dropdown menu.
          </>
        }
      >
        <Input
          value={form.targetUrl}
          onChange={(e) => setForm({ ...form, targetUrl: e.target.value })}
          placeholder="https://example.com/page?loc={{location.id}}"
        />
      </Form.Item>
      <Form.Item label="Opens in">
        <Select
          value={form.openMode}
          options={OPEN_MODE_OPTIONS}
          onChange={(openMode) => setForm({ ...form, openMode })}
          style={{ width: 200 }}
        />
      </Form.Item>
      {contactAware && (
        <Space direction="vertical" style={{ marginBottom: 16 }}>
          <Checkbox
            checked={form.sendContact}
            onChange={(e) => setForm({ ...form, sendContact: e.target.checked })}
          >
            Send the contact&apos;s details (name, email, phone, ID) to the URL
          </Checkbox>
          <Checkbox
            checked={form.sendCustomFields}
            onChange={(e) => setForm({ ...form, sendCustomFields: e.target.checked })}
          >
            Send the contact&apos;s custom fields to the URL
          </Checkbox>
        </Space>
      )}
      {surface !== 'header' && (
        <Form.Item
          label="Custom placement (CSS selector)"
          extra="Optional. Put this surface's buttons inside the element matching this selector instead of the default spot."
        >
          <Input
            value={form.placementSelector}
            onChange={(e) => setForm({ ...form, placementSelector: e.target.value })}
            placeholder="#my-container"
          />
        </Form.Item>
      )}
      <Form.Item label="Who can see it">
        <Space direction="vertical">
          {(Object.keys(ROLE_LABELS) as (keyof ButtonPermissions)[]).map((role) => (
            <Checkbox
              key={role}
              checked={form.permissions[role]}
              onChange={(e) =>
                setForm({ ...form, permissions: { ...form.permissions, [role]: e.target.checked } })
              }
            >
              {ROLE_LABELS[role]}
            </Checkbox>
          ))}
        </Space>
      </Form.Item>
    </>
  );

  const appearanceTab = (
    <>
      <Space size="large" wrap style={{ marginBottom: 16 }}>
        <Form.Item label="Style" style={{ marginBottom: 0 }}>
          <Select
            value={form.style}
            options={STYLE_OPTIONS}
            style={{ width: 120 }}
            onChange={(style) => setForm({ ...form, style })}
          />
        </Form.Item>
        <Form.Item label="Size" style={{ marginBottom: 0 }}>
          <Select
            value={form.size}
            options={SIZE_OPTIONS}
            style={{ width: 120 }}
            onChange={(size) => setForm({ ...form, size })}
          />
        </Form.Item>
        <Form.Item label="Icon size" style={{ marginBottom: 0 }}>
          <Select
            value={form.iconSize}
            options={ICON_SIZE_OPTIONS}
            style={{ width: 120 }}
            onChange={(iconSize) => setForm({ ...form, iconSize })}
          />
        </Form.Item>
        <Form.Item label="Icon position" style={{ marginBottom: 0 }}>
          <Select
            value={form.iconPosition}
            options={ICON_POSITION_OPTIONS}
            style={{ width: 120 }}
            onChange={(iconPosition) => setForm({ ...form, iconPosition })}
          />
        </Form.Item>
      </Space>
      <Space size="large" wrap style={{ marginBottom: 16 }}>
        <Form.Item label="Background" style={{ marginBottom: 0 }}>
          <input
            type="color"
            value={form.backgroundColor || '#7a1f2b'}
            onChange={(e) => setForm({ ...form, backgroundColor: e.target.value })}
          />
        </Form.Item>
        <Form.Item label="Text" style={{ marginBottom: 0 }}>
          <input
            type="color"
            value={form.textColor || '#ffffff'}
            onChange={(e) => setForm({ ...form, textColor: e.target.value })}
          />
        </Form.Item>
        <Form.Item label="Border" style={{ marginBottom: 0 }}>
          <input
            type="color"
            value={form.borderColor || '#000000'}
            onChange={(e) => setForm({ ...form, borderColor: e.target.value })}
          />
        </Form.Item>
        <Form.Item label="Border width (px)" style={{ marginBottom: 0 }}>
          <InputNumber
            min={0}
            max={8}
            value={form.borderWidth}
            onChange={(v) => setForm({ ...form, borderWidth: v ?? 0 })}
          />
        </Form.Item>
        <Form.Item label="Corner radius (px)" style={{ marginBottom: 0 }}>
          <InputNumber
            min={0}
            max={999}
            value={form.borderRadius}
            onChange={(v) => setForm({ ...form, borderRadius: v ?? 0 })}
          />
        </Form.Item>
      </Space>
      <Space size="large" wrap style={{ marginBottom: 16 }} align="end">
        <Form.Item label="Gradient" style={{ marginBottom: 0 }}>
          <Checkbox
            checked={form.gradient}
            onChange={(e) => setForm({ ...form, gradient: e.target.checked })}
          >
            Fade to a second color
          </Checkbox>
        </Form.Item>
        {form.gradient && (
          <Form.Item label="Second color" style={{ marginBottom: 0 }}>
            <input
              type="color"
              value={form.gradientColor || '#000000'}
              onChange={(e) => setForm({ ...form, gradientColor: e.target.value })}
            />
          </Form.Item>
        )}
        <Form.Item label="Shadow" style={{ marginBottom: 0 }}>
          <Select
            value={form.shadow}
            options={SHADOW_OPTIONS}
            style={{ width: 120 }}
            onChange={(shadow) => setForm({ ...form, shadow })}
          />
        </Form.Item>
        <Form.Item label="Animation" style={{ marginBottom: 0 }}>
          <Select
            value={form.animation}
            options={ANIMATION_OPTIONS}
            style={{ width: 130 }}
            onChange={(animation) => setForm({ ...form, animation })}
          />
        </Form.Item>
      </Space>
      <Form.Item label={`Opacity (${form.opacity}%)`}>
        <Slider
          min={10}
          max={100}
          value={form.opacity}
          onChange={(opacity) => setForm({ ...form, opacity })}
        />
      </Form.Item>
      <Space size="large" wrap>
        <Checkbox checked={form.fullWidth} onChange={(e) => setForm({ ...form, fullWidth: e.target.checked })}>
          Full width
        </Checkbox>
        <Checkbox checked={form.iconOnly} onChange={(e) => setForm({ ...form, iconOnly: e.target.checked })}>
          Icon only (hide the label)
        </Checkbox>
        <Checkbox checked={form.uppercase} onChange={(e) => setForm({ ...form, uppercase: e.target.checked })}>
          Uppercase
        </Checkbox>
        <Checkbox checked={form.bold} onChange={(e) => setForm({ ...form, bold: e.target.checked })}>
          Bold
        </Checkbox>
        <Checkbox checked={form.underline} onChange={(e) => setForm({ ...form, underline: e.target.checked })}>
          Underline
        </Checkbox>
        <Checkbox
          checked={form.hoverEffect}
          onChange={(e) => setForm({ ...form, hoverEffect: e.target.checked })}
        >
          Hover effect
        </Checkbox>
      </Space>
    </>
  );

  const menuTab = (
    <>
      <Typography.Paragraph type="secondary">
        Add items to turn this button into a dropdown. Each item opens its own URL.
      </Typography.Paragraph>
      <Space direction="vertical" style={{ width: '100%' }} size={12}>
        {form.menuItems.map((item, index) => (
          <div key={index} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  style={{ width: '35%' }}
                  placeholder="Label"
                  value={item.label}
                  onChange={(e) => updateMenuItem(index, { label: e.target.value })}
                />
                <Input
                  placeholder="https://…"
                  value={item.url}
                  onChange={(e) => updateMenuItem(index, { url: e.target.value })}
                />
              </Space.Compact>
              <Space wrap>
                <Select
                  value={item.openMode}
                  options={OPEN_MODE_OPTIONS}
                  style={{ width: 160 }}
                  onChange={(openMode) => updateMenuItem(index, { openMode })}
                />
                {contactAware && (
                  <>
                    <Checkbox
                      checked={item.sendContact}
                      onChange={(e) => updateMenuItem(index, { sendContact: e.target.checked })}
                    >
                      Send contact
                    </Checkbox>
                    <Checkbox
                      checked={item.sendCustomFields}
                      onChange={(e) => updateMenuItem(index, { sendCustomFields: e.target.checked })}
                    >
                      Send custom fields
                    </Checkbox>
                  </>
                )}
                <Button
                  danger
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() =>
                    setForm({ ...form, menuItems: form.menuItems.filter((_, i) => i !== index) })
                  }
                />
              </Space>
            </Space>
          </div>
        ))}
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          disabled={form.menuItems.length >= 20}
          onClick={() => setForm({ ...form, menuItems: [...form.menuItems, emptyMenuItem()] })}
        >
          Add menu item
        </Button>
      </Space>
    </>
  );

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
          {
            title: 'Type',
            key: 'type',
            render: (_, row) =>
              (row.menuItems ?? []).length > 0 ? (
                <Tag color="purple">Dropdown ({row.menuItems.length})</Tag>
              ) : (
                <Tag>Button</Tag>
              ),
          },
          { title: 'Style', dataIndex: 'style' },
          {
            title: 'Opens in',
            key: 'openMode',
            render: (_, row) =>
              OPEN_MODE_OPTIONS.find((o) => o.value === row.openMode)?.label ?? row.openMode,
          },
          { title: 'Order', dataIndex: 'order' },
          { title: 'Target URL', dataIndex: 'targetUrl', ellipsis: true },
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
        width={720}
      >
        <ButtonPreview form={form} />
        <Form layout="vertical">
          <Tabs
            items={[
              { key: 'content', label: 'Content', children: contentTab },
              { key: 'link', label: 'Link & access', children: linkTab },
              { key: 'appearance', label: 'Appearance', children: appearanceTab },
              {
                key: 'menu',
                label: `Dropdown${form.menuItems.length ? ` (${form.menuItems.length})` : ''}`,
                children: menuTab,
              },
            ]}
          />
        </Form>
      </Modal>
    </div>
  );
}
