import { Select, Space, Typography } from 'antd';
import { useGroups } from '../context/GroupsContext';

interface GroupSelectorProps {
  value: string | undefined;
  onChange: (groupId: string | undefined) => void;
}

const GLOBAL_VALUE = '__global__';

export function GroupSelector({ value, onChange }: GroupSelectorProps) {
  const { groups, isLoading } = useGroups();

  return (
    <Space>
      <Typography.Text type="secondary">Saving for:</Typography.Text>
      <Select
        style={{ minWidth: 220 }}
        loading={isLoading}
        value={value ?? GLOBAL_VALUE}
        onChange={(next) => onChange(next === GLOBAL_VALUE ? undefined : next)}
        options={[
          { value: GLOBAL_VALUE, label: 'Global (all locations)' },
          ...groups.map((g) => ({
            value: g._id,
            label: `${g.name} · ${g.type === 'saas-plan' ? 'SaaS plan' : 'Custom'}`,
          })),
        ]}
      />
    </Space>
  );
}
