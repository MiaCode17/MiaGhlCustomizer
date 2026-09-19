import { Button, InputNumber, Select, Space, Table } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Gradient, GradientTarget } from '../../../types/theme';

interface GradientEditorProps {
  gradients: Gradient[];
  onChange: (gradients: Gradient[]) => void;
}

const TARGET_OPTIONS: { value: GradientTarget; label: string }[] = [
  { value: 'header', label: 'Header' },
  { value: 'sidebar', label: 'Sidebar' },
  { value: 'button', label: 'Buttons' },
];

function emptyGradient(): Gradient {
  return { target: 'header', from: '#6366f1', to: '#8b5cf6', angle: 90 };
}

export function GradientEditor({ gradients, onChange }: GradientEditorProps) {
  const updateRow = (index: number, patch: Partial<Gradient>) => {
    onChange(gradients.map((g, i) => (i === index ? { ...g, ...patch } : g)));
  };

  const removeRow = (index: number) => {
    onChange(gradients.filter((_, i) => i !== index));
  };

  return (
    <Table<Gradient>
      dataSource={gradients.map((g, i) => ({ ...g, key: i }))}
      pagination={false}
      size="small"
      footer={() => (
        <Button
          icon={<PlusOutlined />}
          onClick={() => onChange([...gradients, emptyGradient()])}
          type="dashed"
        >
          Add gradient
        </Button>
      )}
      columns={[
        {
          title: 'Target',
          dataIndex: 'target',
          render: (_, row, i) => (
            <Select
              value={row.target}
              options={TARGET_OPTIONS}
              style={{ width: 140 }}
              onChange={(target) => updateRow(i, { target })}
            />
          ),
        },
        {
          title: 'From',
          dataIndex: 'from',
          render: (_, row, i) => (
            <Space>
              <input type="color" value={row.from} onChange={(e) => updateRow(i, { from: e.target.value })} />
            </Space>
          ),
        },
        {
          title: 'To',
          dataIndex: 'to',
          render: (_, row, i) => (
            <Space>
              <input type="color" value={row.to} onChange={(e) => updateRow(i, { to: e.target.value })} />
            </Space>
          ),
        },
        {
          title: 'Angle',
          dataIndex: 'angle',
          render: (_, row, i) => (
            <InputNumber
              value={row.angle}
              min={0}
              max={360}
              onChange={(angle) => updateRow(i, { angle: angle ?? 0 })}
              addonAfter="°"
            />
          ),
        },
        {
          title: 'Preview',
          key: 'preview',
          render: (_, row) => (
            <div
              style={{
                width: 80,
                height: 24,
                borderRadius: 4,
                background: `linear-gradient(${row.angle}deg, ${row.from}, ${row.to})`,
              }}
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
