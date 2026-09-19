import { Select, Space, Typography } from 'antd';

interface GroupSelectorProps {
  value: string | undefined;
  onChange: (groupId: string | undefined) => void;
  groups?: { id: string; label: string }[];
}

const GLOBAL_VALUE = '__global__';

export function GroupSelector({ value, onChange, groups = [] }: GroupSelectorProps) {
  return (
    <Space>
      <Typography.Text type="secondary">Saving for:</Typography.Text>
      <Select
        style={{ minWidth: 220 }}
        value={value ?? GLOBAL_VALUE}
        onChange={(next) => onChange(next === GLOBAL_VALUE ? undefined : next)}
        options={[
          { value: GLOBAL_VALUE, label: 'Global (all locations)' },
          ...groups.map((g) => ({ value: g.id, label: g.label })),
        ]}
      />
    </Space>
  );
}
