import { CSSProperties } from 'react';
import { Button, Input, Popover, Space, Typography } from 'antd';
import { ICON_LIBRARY } from '../utils/iconLibrary';

const IMAGE_URL = /^(https?:\/\/|\/|data:image\/)/i;

interface IconGlyphProps {
  /** A built-in icon name, an image URL or an emoji/text. */
  value: string | undefined;
  size?: number;
  style?: CSSProperties;
}

/** Draws an icon value the way the embed script does: built-in SVG, image, or text. */
export function IconGlyph({ value, size = 16, style }: IconGlyphProps) {
  const v = (value ?? '').trim();
  if (!v) return null;
  const paths = Object.prototype.hasOwnProperty.call(ICON_LIBRARY, v) ? ICON_LIBRARY[v] : null;
  if (paths) {
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{ display: 'inline-block', flexShrink: 0, ...style }}
      >
        {paths.map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
    );
  }
  if (IMAGE_URL.test(v)) {
    return <img src={v} alt="" style={{ width: size, height: size, objectFit: 'contain', ...style }} />;
  }
  return <span style={{ fontSize: size, lineHeight: 1, ...style }}>{v}</span>;
}

interface IconPickerProps {
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  width?: number | string;
}

/** A text box for an icon (name, emoji or image URL) with a grid of the built-in icons to pick from. */
export function IconPicker({ value, onChange, placeholder, width }: IconPickerProps) {
  const names = Object.keys(ICON_LIBRARY);
  const grid = (
    <div style={{ width: 300 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
        {names.map((name) => (
          <Button
            key={name}
            title={name}
            type={value === name ? 'primary' : 'default'}
            onClick={() => onChange(name)}
            style={{ padding: 0, height: 40 }}
          >
            <IconGlyph value={name} size={18} />
          </Button>
        ))}
      </div>
      <Space style={{ marginTop: 8 }}>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          Or type an emoji or an image URL.
        </Typography.Text>
        {value ? (
          <Button size="small" type="link" onClick={() => onChange('')}>
            Clear
          </Button>
        ) : null}
      </Space>
    </div>
  );

  return (
    <Popover content={grid} trigger="click" placement="bottomLeft">
      <Input
        style={{ width }}
        value={value ?? ''}
        placeholder={placeholder ?? 'Pick, or type an emoji / URL'}
        onChange={(e) => onChange(e.target.value)}
        prefix={value ? <IconGlyph value={value} size={16} /> : null}
        allowClear
      />
    </Popover>
  );
}
