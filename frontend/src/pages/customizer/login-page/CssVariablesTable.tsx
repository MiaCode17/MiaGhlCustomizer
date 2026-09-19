import { Button, Input, Table } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { CssVariable } from '../../../types/loginPage';

interface CssVariablesTableProps {
  variables: CssVariable[];
  onChange: (variables: CssVariable[]) => void;
}

function emptyVariable(): CssVariable {
  return { name: '--brand-color', value: '#000000' };
}

export function CssVariablesTable({ variables, onChange }: CssVariablesTableProps) {
  const updateRow = (index: number, patch: Partial<CssVariable>) => {
    const next = variables.map((v, i) => (i === index ? { ...v, ...patch } : v));
    onChange(next);
  };

  const removeRow = (index: number) => {
    onChange(variables.filter((_, i) => i !== index));
  };

  return (
    <Table<CssVariable>
      dataSource={variables.map((v, i) => ({ ...v, key: i }))}
      pagination={false}
      size="small"
      footer={() => (
        <Button
          icon={<PlusOutlined />}
          onClick={() => onChange([...variables, emptyVariable()])}
          type="dashed"
        >
          Add CSS variable
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
              placeholder="--brand-color"
            />
          ),
        },
        {
          title: 'Value',
          dataIndex: 'value',
          render: (_, row, i) => (
            <Input
              value={row.value}
              onChange={(e) => updateRow(i, { value: e.target.value })}
              placeholder="#1677ff"
            />
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
