import { useState } from 'react';
import { Button, Card, Space } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import { PageIntro } from '../../../components/PageIntro';
import { ToolCategoriesEditor } from './ToolCategoriesEditor';
import { useMenuEdit } from './useMenuEdit';

export function ExtendedNavPage() {
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const { menuEdit, setMenuEdit, loading, saving, save } = useMenuEdit(groupId);

  return (
    <div className="pt-4">
      <PageIntro
        icon={<AppstoreOutlined />}
        description="Group tools into custom categories for the embedded app's extended nav / launchpad."
        groupId={groupId}
        onGroupChange={setGroupId}
      />

      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <Card title="Extended nav tool categories" loading={loading}>
          <ToolCategoriesEditor
            categories={menuEdit.toolCategories}
            onChange={(toolCategories) => setMenuEdit({ ...menuEdit, toolCategories })}
          />
        </Card>

        <div className="flex justify-end">
          <Button type="primary" size="large" onClick={save} loading={saving}>
            Save extended nav
          </Button>
        </div>
      </Space>
    </div>
  );
}
