import { useState } from 'react';
import { Button, Card, Space, Typography } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { PageIntro } from '../../../components/PageIntro';
import { RenameHideEditor } from './RenameHideEditor';
import { NavTreeEditor } from './NavTreeEditor';
import { useMenuEdit } from './useMenuEdit';

export function MainNavPage() {
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const { menuEdit, setMenuEdit, loading, saving, save } = useMenuEdit(groupId);

  return (
    <div className="pt-4">
      <PageIntro
        icon={<MenuOutlined />}
        description="Rename, hide, or extend the embedded app's native left navigation."
        groupId={groupId}
        onGroupChange={setGroupId}
      />

      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <Card title="Rename / hide native menu items" loading={loading}>
          <RenameHideEditor
            renamed={menuEdit.renamed}
            hidden={menuEdit.hidden}
            onChange={(renamed, hidden) => setMenuEdit({ ...menuEdit, renamed, hidden })}
          />
        </Card>

        <Card title="Custom page navigation tree" loading={loading}>
          <Typography.Paragraph type="secondary">
            Build a flat list of custom pages. Set a parent to nest an item, and use order to
            control placement among siblings.
          </Typography.Paragraph>
          <NavTreeEditor
            items={menuEdit.navTree}
            onChange={(navTree) => setMenuEdit({ ...menuEdit, navTree })}
          />
        </Card>

        <div className="flex justify-end">
          <Button type="primary" size="large" onClick={save} loading={saving}>
            Save main nav
          </Button>
        </div>
      </Space>
    </div>
  );
}
