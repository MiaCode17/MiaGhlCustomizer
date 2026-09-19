import { Button, Collapse, Input, Space } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { ToolCategory, ToolCategoryTool } from '../../../types/menuEdit';

interface ToolCategoriesEditorProps {
  categories: ToolCategory[];
  onChange: (categories: ToolCategory[]) => void;
}

function emptyCategory(): ToolCategory {
  return { name: '', tools: [] };
}

function emptyTool(): ToolCategoryTool {
  return { label: '', url: '' };
}

export function ToolCategoriesEditor({ categories, onChange }: ToolCategoriesEditorProps) {
  const updateCategory = (index: number, patch: Partial<ToolCategory>) => {
    onChange(categories.map((category, i) => (i === index ? { ...category, ...patch } : category)));
  };

  const removeCategory = (index: number) => {
    onChange(categories.filter((_, i) => i !== index));
  };

  const updateTool = (categoryIndex: number, toolIndex: number, patch: Partial<ToolCategoryTool>) => {
    const category = categories[categoryIndex];
    const tools = category.tools.map((tool, i) => (i === toolIndex ? { ...tool, ...patch } : tool));
    updateCategory(categoryIndex, { tools });
  };

  const removeTool = (categoryIndex: number, toolIndex: number) => {
    const category = categories[categoryIndex];
    updateCategory(categoryIndex, { tools: category.tools.filter((_, i) => i !== toolIndex) });
  };

  return (
    <div>
      <Collapse
        items={categories.map((category, categoryIndex) => ({
          key: categoryIndex,
          label: (
            <Space onClick={(e) => e.stopPropagation()}>
              <Input
                value={category.name}
                placeholder="Category name"
                onChange={(e) => updateCategory(categoryIndex, { name: e.target.value })}
              />
              <Button
                danger
                type="text"
                icon={<DeleteOutlined />}
                onClick={() => removeCategory(categoryIndex)}
              />
            </Space>
          ),
          children: (
            <Space direction="vertical" style={{ width: '100%' }}>
              {category.tools.map((tool, toolIndex) => (
                <Space key={toolIndex}>
                  <Input
                    value={tool.label}
                    placeholder="Tool label"
                    onChange={(e) => updateTool(categoryIndex, toolIndex, { label: e.target.value })}
                  />
                  <Input
                    value={tool.url}
                    placeholder="Tool URL"
                    onChange={(e) => updateTool(categoryIndex, toolIndex, { url: e.target.value })}
                  />
                  <Button
                    danger
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => removeTool(categoryIndex, toolIndex)}
                  />
                </Space>
              ))}
              <Button
                icon={<PlusOutlined />}
                type="dashed"
                onClick={() =>
                  updateCategory(categoryIndex, { tools: [...category.tools, emptyTool()] })
                }
              >
                Add tool
              </Button>
            </Space>
          ),
        }))}
      />
      <Button
        icon={<PlusOutlined />}
        type="dashed"
        style={{ marginTop: 16 }}
        onClick={() => onChange([...categories, emptyCategory()])}
      >
        Add category
      </Button>
    </div>
  );
}
