import { Input, Switch, Table } from 'antd';
import { NATIVE_MENU_ITEMS, RenamedMenuItem } from '../../../types/menuEdit';

interface RenameHideEditorProps {
  renamed: RenamedMenuItem[];
  hidden: string[];
  onChange: (renamed: RenamedMenuItem[], hidden: string[]) => void;
}

export function RenameHideEditor({ renamed, hidden, onChange }: RenameHideEditorProps) {
  const updateNewLabel = (originalLabel: string, value: string) => {
    const next = renamed.filter((r) => r.originalLabel !== originalLabel);
    if (value.trim().length > 0 && value !== originalLabel) {
      next.push({ originalLabel, newLabel: value });
    }
    onChange(next, hidden);
  };

  const toggleHidden = (originalLabel: string, checked: boolean) => {
    const next = checked
      ? [...hidden, originalLabel]
      : hidden.filter((label) => label !== originalLabel);
    onChange(renamed, next);
  };

  const dataSource = NATIVE_MENU_ITEMS.map((label) => ({
    key: label,
    originalLabel: label,
    newLabel: renamed.find((r) => r.originalLabel === label)?.newLabel ?? '',
    isHidden: hidden.includes(label),
  }));

  return (
    <Table
      dataSource={dataSource}
      pagination={false}
      size="small"
      columns={[
        {
          title: 'Original label',
          dataIndex: 'originalLabel',
        },
        {
          title: 'New label',
          dataIndex: 'newLabel',
          render: (_, row) => (
            <Input
              value={row.newLabel}
              placeholder={row.originalLabel}
              onChange={(e) => updateNewLabel(row.originalLabel, e.target.value)}
            />
          ),
        },
        {
          title: 'Hidden',
          dataIndex: 'isHidden',
          width: 100,
          render: (_, row) => (
            <Switch
              checked={row.isHidden}
              onChange={(checked) => toggleHidden(row.originalLabel, checked)}
            />
          ),
        },
      ]}
    />
  );
}
