import { Button, Input, Space, Table } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { ColorRule } from '../../../types/theme';

interface ColorRulesTableProps {
  rules: ColorRule[];
  onChange: (rules: ColorRule[]) => void;
}

function emptyRule(): ColorRule {
  return { name: '', selector: '', property: 'color', value: '#000000' };
}

export function ColorRulesTable({ rules, onChange }: ColorRulesTableProps) {
  const updateRow = (index: number, patch: Partial<ColorRule>) => {
    const next = rules.map((rule, i) => (i === index ? { ...rule, ...patch } : rule));
    onChange(next);
  };

  const removeRow = (index: number) => {
    onChange(rules.filter((_, i) => i !== index));
  };

  return (
    <Table<ColorRule>
      dataSource={rules.map((rule, i) => ({ ...rule, key: i }))}
      pagination={false}
      size="small"
      footer={() => (
        <Button
          icon={<PlusOutlined />}
          onClick={() => onChange([...rules, emptyRule()])}
          type="dashed"
        >
          Add color rule
        </Button>
      )}
      columns={[
        {
          title: 'Name',
          dataIndex: 'name',
          render: (_, row, i) => (
            <Input
              value={row.name}
              onChange={(e) => updateRow(i, { name: e.target.value })}
              placeholder="Primary button text"
            />
          ),
        },
        {
          title: 'CSS selector',
          dataIndex: 'selector',
          render: (_, row, i) => (
            <Input
              value={row.selector}
              onChange={(e) => updateRow(i, { selector: e.target.value })}
              placeholder=".hl-btn-primary"
            />
          ),
        },
        {
          title: 'CSS property',
          dataIndex: 'property',
          render: (_, row, i) => (
            <Input
              value={row.property}
              onChange={(e) => updateRow(i, { property: e.target.value })}
              placeholder="background-color"
            />
          ),
        },
        {
          title: 'Value',
          dataIndex: 'value',
          render: (_, row, i) => (
            <Space>
              <input
                type="color"
                value={/^#[0-9a-fA-F]{6}$/.test(row.value) ? row.value : '#000000'}
                onChange={(e) => updateRow(i, { value: e.target.value })}
              />
              <Input
                value={row.value}
                onChange={(e) => updateRow(i, { value: e.target.value })}
                style={{ width: 120 }}
              />
            </Space>
          ),
        },
        {
          title: '',
          key: 'actions',
          render: (_, _row, i) => (
            <Button danger type="text" icon={<DeleteOutlined />} onClick={() => removeRow(i)} />
          ),
        },
      ]}
    />
  );
}
