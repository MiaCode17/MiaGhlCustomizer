import { useEffect, useState } from 'react';
import { Button, Card, Checkbox, Select, Slider, Space, Typography, message } from 'antd';
import { LayoutOutlined } from '@ant-design/icons';
import { PageIntro } from '../../../components/PageIntro';
import { themeService } from '../../../services/themeService';
import { defaultSidebarStyle, emptyTheme, SidebarStyle, Theme } from '../../../types/theme';

const FONT_OPTIONS = ['Default', 'Inter', 'Poppins', 'Playfair Display', 'Roboto', 'Montserrat'].map(
  (f) => ({ value: f, label: f }),
);

const ICON_STYLE_OPTIONS = [
  { value: 'outline', label: 'Outline' },
  { value: 'bold', label: 'Bold (filled)' },
  { value: 'line', label: 'Line' },
  { value: 'duotone', label: 'Duotone' },
];

const HOVER_EFFECT_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'slide', label: 'Slide' },
  { value: 'fade', label: 'Fade' },
  { value: 'scale', label: 'Scale' },
  { value: 'glow', label: 'Glow' },
];

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Typography.Text style={{ display: 'block', marginBottom: 6, fontSize: 13 }}>{label}</Typography.Text>
      <Space size={10} align="center">
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 32, height: 32, padding: 0, border: '1px solid #d9d9d9', borderRadius: 6 }}
        />
        <Typography.Link onClick={() => onChange('')} style={{ fontSize: 13 }}>
          Reset
        </Typography.Link>
      </Space>
    </div>
  );
}

function SliderField({
  label,
  value,
  defaultValue,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  defaultValue: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ minWidth: 220, flex: 1 }}>
      <div className="flex items-center justify-between">
        <Typography.Text style={{ fontSize: 12, letterSpacing: 0.4, textTransform: 'uppercase' }} type="secondary">
          {label}
        </Typography.Text>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          default ({defaultValue}px)
        </Typography.Text>
      </div>
      <Slider min={min} max={max} value={value} onChange={onChange} />
    </div>
  );
}

export function SidebarStylingPage() {
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [theme, setTheme] = useState<Theme>(emptyTheme);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    themeService
      .get(groupId)
      .then((loaded) => {
        if (!cancelled) setTheme(loaded ?? emptyTheme);
      })
      .catch(() => {
        if (!cancelled) message.error('Failed to load theme');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [groupId]);

  const sidebar: SidebarStyle = theme.sidebarStyle ?? defaultSidebarStyle;
  const update = (patch: Partial<SidebarStyle>) =>
    setTheme({ ...theme, sidebarStyle: { ...sidebar, ...patch } });

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await themeService.save(theme, groupId);
      setTheme(saved);
      message.success('Sidebar styling saved');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to save sidebar styling');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageIntro
        icon={<LayoutOutlined />}
        description="Style the embedded app's native sidebar — typography, icons, layout, and hover states."
        groupId={groupId}
        onGroupChange={setGroupId}
      />

      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <Card title="Sidebar typography" loading={loading}>
          <Space size="large" wrap align="start">
            <div>
              <Typography.Text style={{ display: 'block', marginBottom: 6, fontSize: 13 }}>
                Font family
              </Typography.Text>
              <Select
                value={sidebar.fontFamily}
                options={FONT_OPTIONS}
                style={{ width: 220 }}
                onChange={(fontFamily) => update({ fontFamily })}
              />
            </div>
            <ColorField label="Font color" value={sidebar.fontColor} onChange={(fontColor) => update({ fontColor })} />
          </Space>
          <div style={{ marginTop: 20, maxWidth: 420 }}>
            <SliderField
              label="Font size"
              value={sidebar.fontSize}
              defaultValue={14}
              min={10}
              max={22}
              onChange={(fontSize) => update({ fontSize })}
            />
          </div>
        </Card>

        <Card title="Sidebar icons" loading={loading}>
          <Space size="large" wrap align="start">
            <ColorField label="Icon color" value={sidebar.iconColor} onChange={(iconColor) => update({ iconColor })} />
            <div>
              <Typography.Text style={{ display: 'block', marginBottom: 6, fontSize: 13 }}>
                Custom link icon style
              </Typography.Text>
              <Select
                value={sidebar.iconStyle}
                options={ICON_STYLE_OPTIONS}
                style={{ width: 200 }}
                onChange={(iconStyle) => update({ iconStyle })}
              />
            </div>
          </Space>
          <div className="flex items-end gap-6" style={{ marginTop: 20 }}>
            <div style={{ maxWidth: 320, flex: 1 }}>
              <SliderField
                label="Icon size"
                value={sidebar.iconSize}
                defaultValue={20}
                min={12}
                max={32}
                onChange={(iconSize) => update({ iconSize })}
              />
            </div>
            <Checkbox checked={sidebar.boldIcons} onChange={(e) => update({ boldIcons: e.target.checked })}>
              Bold icons
            </Checkbox>
          </div>
        </Card>

        <Card title="Sidebar layout" loading={loading}>
          <div className="flex flex-wrap gap-6">
            <SliderField
              label="Item spacing"
              value={sidebar.itemSpacing}
              defaultValue={10}
              min={0}
              max={24}
              onChange={(itemSpacing) => update({ itemSpacing })}
            />
            <SliderField
              label="Item padding"
              value={sidebar.itemPadding}
              defaultValue={8}
              min={0}
              max={24}
              onChange={(itemPadding) => update({ itemPadding })}
            />
            <SliderField
              label="Icon ↔ label gap"
              value={sidebar.iconLabelGap}
              defaultValue={8}
              min={0}
              max={24}
              onChange={(iconLabelGap) => update({ iconLabelGap })}
            />
            <SliderField
              label="Corner radius"
              value={sidebar.cornerRadius}
              defaultValue={6}
              min={0}
              max={24}
              onChange={(cornerRadius) => update({ cornerRadius })}
            />
          </div>
        </Card>

        <Card title="Sidebar hover & extras" loading={loading}>
          <div>
            <Typography.Text style={{ display: 'block', marginBottom: 6, fontSize: 13 }}>
              Hover effect
            </Typography.Text>
            <Select
              value={sidebar.hoverEffect}
              options={HOVER_EFFECT_OPTIONS}
              style={{ width: 200 }}
              onChange={(hoverEffect) => update({ hoverEffect })}
            />
          </div>
          <div className="flex flex-wrap gap-6" style={{ marginTop: 20 }}>
            <ColorField
              label="Hover text color"
              value={sidebar.hoverTextColor}
              onChange={(hoverTextColor) => update({ hoverTextColor })}
            />
            <ColorField
              label="Hover background color"
              value={sidebar.hoverBackgroundColor}
              onChange={(hoverBackgroundColor) => update({ hoverBackgroundColor })}
            />
            <ColorField
              label="Scrollbar color"
              value={sidebar.scrollbarColor}
              onChange={(scrollbarColor) => update({ scrollbarColor })}
            />
            <ColorField
              label="Location switcher color"
              value={sidebar.locationSwitcherColor}
              onChange={(locationSwitcherColor) => update({ locationSwitcherColor })}
            />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="primary" size="large" onClick={handleSave} loading={saving}>
            Save sidebar styling
          </Button>
        </div>
      </Space>
    </div>
  );
}
