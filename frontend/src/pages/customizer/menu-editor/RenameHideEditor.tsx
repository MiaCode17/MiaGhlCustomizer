import { useMemo, useState } from 'react';
import { Button, Input, Select, Space, Switch, Table, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import {
  MovedMenuItem,
  NATIVE_MENU_ITEMS,
  RenamedMenuItem,
  ROLE_KEYS,
  ROLE_LABELS,
  RoleHiddenItem,
  RoleKey,
} from '../../../types/menuEdit';

export interface NativeItemsState {
  renamed: RenamedMenuItem[];
  hidden: string[];
  hiddenByRole: RoleHiddenItem[];
  moved: MovedMenuItem[];
}

interface RenameHideEditorProps extends NativeItemsState {
  onChange: (next: NativeItemsState) => void;
}

const NO_MOVE = '';

export function RenameHideEditor({ renamed, hidden, hiddenByRole, moved, onChange }: RenameHideEditorProps) {
  const [extraDraft, setExtraDraft] = useState('');
  const [extraRows, setExtraRows] = useState<string[]>([]);

  const state: NativeItemsState = { renamed, hidden, hiddenByRole, moved };

  // The built-in list plus anything already configured or added by hand (GHL has more items than we list).
  const labels = useMemo(() => {
    const known = new Set<string>(NATIVE_MENU_ITEMS);
    const extras: string[] = [];
    const add = (label: string) => {
      if (label && !known.has(label) && !extras.includes(label)) extras.push(label);
    };
    renamed.forEach((r) => add(r.originalLabel));
    hidden.forEach(add);
    hiddenByRole.forEach((h) => add(h.label));
    moved.forEach((m) => add(m.label));
    extraRows.forEach(add);
    return [...NATIVE_MENU_ITEMS, ...extras];
  }, [renamed, hidden, hiddenByRole, moved, extraRows]);

  const setRename = (label: string, patch: Partial<RenamedMenuItem>) => {
    const current = renamed.find((r) => r.originalLabel === label);
    const merged = { originalLabel: label, newLabel: current?.newLabel ?? '', icon: current?.icon ?? '', ...patch };
    const newLabel = merged.newLabel.trim() || label;
    const icon = (merged.icon ?? '').trim();
    const rest = renamed.filter((r) => r.originalLabel !== label);
    const keep = newLabel !== label || icon.length > 0;
    onChange({
      ...state,
      renamed: keep ? [...rest, { originalLabel: label, newLabel, ...(icon ? { icon } : {}) }] : rest,
    });
  };

  const setHidden = (label: string, checked: boolean) =>
    onChange({
      ...state,
      hidden: checked ? [...hidden, label] : hidden.filter((l) => l !== label),
    });

  const setHiddenRoles = (label: string, roleKeys: RoleKey[]) => {
    const rest = hiddenByRole.filter((h) => h.label !== label);
    onChange({ ...state, hiddenByRole: roleKeys.length ? [...rest, { label, roleKeys }] : rest });
  };

  const setMove = (label: string, patch: Partial<MovedMenuItem> | null) => {
    const rest = moved.filter((m) => m.label !== label);
    if (patch === null) {
      onChange({ ...state, moved: rest });
      return;
    }
    const current = moved.find((m) => m.label === label);
    const next = { label, position: current?.position ?? 'after', target: current?.target ?? '', ...patch };
    onChange({ ...state, moved: next.target ? [...rest, next as MovedMenuItem] : rest });
  };

  const addExtra = () => {
    const label = extraDraft.trim();
    if (label && !labels.includes(label)) setExtraRows([...extraRows, label]);
    setExtraDraft('');
  };

  const dataSource = labels.map((label) => ({
    key: label,
    label,
    rename: renamed.find((r) => r.originalLabel === label),
    isHidden: hidden.includes(label),
    roleKeys: hiddenByRole.find((h) => h.label === label)?.roleKeys ?? [],
    move: moved.find((m) => m.label === label),
  }));

  return (
    <>
      <Typography.Paragraph type="secondary">
        Items are matched by the label GHL shows (case-insensitive). Rename an item, give it a different
        icon (an emoji or an image URL), hide it for everyone or only for certain users, or move it next
        to another item.
      </Typography.Paragraph>
      <Table
        dataSource={dataSource}
        pagination={false}
        size="small"
        scroll={{ x: 980 }}
        columns={[
          { title: 'Menu item', dataIndex: 'label', width: 140 },
          {
            title: 'New label',
            key: 'newLabel',
            width: 170,
            render: (_, row) => (
              <Input
                value={row.rename && row.rename.newLabel !== row.label ? row.rename.newLabel : ''}
                placeholder={row.label}
                onChange={(e) => setRename(row.label, { newLabel: e.target.value })}
              />
            ),
          },
          {
            title: 'Icon',
            key: 'icon',
            width: 170,
            render: (_, row) => (
              <Input
                value={row.rename?.icon ?? ''}
                placeholder="emoji or image URL"
                onChange={(e) => setRename(row.label, { icon: e.target.value })}
              />
            ),
          },
          {
            title: 'Hide for all',
            key: 'hidden',
            width: 100,
            render: (_, row) => (
              <Switch checked={row.isHidden} onChange={(checked) => setHidden(row.label, checked)} />
            ),
          },
          {
            title: 'Hide only for',
            key: 'roles',
            width: 230,
            render: (_, row) => (
              <Select
                mode="multiple"
                allowClear
                disabled={row.isHidden}
                style={{ width: '100%' }}
                placeholder="Nobody"
                maxTagCount="responsive"
                value={row.roleKeys}
                options={ROLE_KEYS.map((k) => ({ value: k, label: ROLE_LABELS[k] }))}
                onChange={(keys) => setHiddenRoles(row.label, keys as RoleKey[])}
              />
            ),
          },
          {
            title: 'Move',
            key: 'move',
            render: (_, row) => (
              <Space.Compact>
                <Select
                  style={{ width: 90 }}
                  value={row.move?.position ?? 'after'}
                  disabled={!row.move}
                  options={[
                    { value: 'before', label: 'Before' },
                    { value: 'after', label: 'After' },
                  ]}
                  onChange={(position) => setMove(row.label, { position })}
                />
                <Select
                  style={{ width: 150 }}
                  value={row.move?.target ?? NO_MOVE}
                  options={[
                    { value: NO_MOVE, label: "Don't move" },
                    ...labels.filter((l) => l !== row.label).map((l) => ({ value: l, label: l })),
                  ]}
                  onChange={(target) => setMove(row.label, target === NO_MOVE ? null : { target })}
                />
              </Space.Compact>
            ),
          },
        ]}
      />
      <Space.Compact style={{ marginTop: 12, width: 360 }}>
        <Input
          value={extraDraft}
          onChange={(e) => setExtraDraft(e.target.value)}
          onPressEnter={addExtra}
          placeholder="Another GHL menu item, e.g. Memberships"
        />
        <Button icon={<PlusOutlined />} onClick={addExtra}>
          Add
        </Button>
      </Space.Compact>
    </>
  );
}
