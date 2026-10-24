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
        <Card title="Native menu items" loading={loading}>
          <RenameHideEditor
            renamed={menuEdit.renamed}
            hidden={menuEdit.hidden}
            hiddenByRole={menuEdit.hiddenByRole}
            moved={menuEdit.moved}
            onChange={(native) => setMenuEdit({ ...menuEdit, ...native })}
          />
        </Card>

        <Card title="Custom page navigation tree" loading={loading}>
          <Typography.Paragraph type="secondary">
            Add your own pages to the sidebar. Set a parent to nest an item under a folder (a folder is
            an item with no URL, and collapses its children when clicked), use order to control
            placement among siblings, and limit each item to the kinds of user who should see it.
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
