import { useEffect, useState } from 'react';
import { Button, Card, Space, Typography, message } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { PageIntro } from '../../../components/PageIntro';
import { menuEditorService } from '../../../services/menuEditorService';
import { emptyMenuEdit, MenuEdit } from '../../../types/menuEdit';
import { RenameHideEditor } from './RenameHideEditor';
import { SettingsMenuEditor } from './SettingsMenuEditor';
import { NavTreeEditor } from './NavTreeEditor';
import { ToolCategoriesEditor } from './ToolCategoriesEditor';

export function MenuEditorPage() {
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [menuEdit, setMenuEdit] = useState<MenuEdit>(emptyMenuEdit);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    menuEditorService
      .get(groupId)
      .then((loaded) => {
        if (!cancelled) setMenuEdit(loaded ?? emptyMenuEdit);
      })
      .catch(() => {
        if (!cancelled) message.error('Failed to load menu configuration');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [groupId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await menuEditorService.save(menuEdit, groupId);
      setMenuEdit(saved);
      message.success('Menu configuration saved');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to save menu configuration');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pt-4">
      <PageIntro
        icon={<MenuOutlined />}
        description="Rename, hide, or extend the embedded app's native navigation menu."
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

        <Card title="Settings menu additions" loading={loading}>
          <SettingsMenuEditor
            items={menuEdit.settingsMenuItems}
            onChange={(settingsMenuItems) => setMenuEdit({ ...menuEdit, settingsMenuItems })}
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

        <Card title="Extended nav tool categories" loading={loading}>
          <ToolCategoriesEditor
            categories={menuEdit.toolCategories}
            onChange={(toolCategories) => setMenuEdit({ ...menuEdit, toolCategories })}
          />
        </Card>

        <div className="flex justify-end">
          <Button type="primary" size="large" onClick={handleSave} loading={saving}>
            Save menu configuration
          </Button>
        </div>
      </Space>
    </div>
  );
}
