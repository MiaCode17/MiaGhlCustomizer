import { useState } from 'react';
import { Button, Card, Space } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { PageIntro } from '../../../components/PageIntro';
import { SettingsMenuEditor } from './SettingsMenuEditor';
import { useMenuEdit } from './useMenuEdit';

export function SettingsNavPage() {
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const { menuEdit, setMenuEdit, loading, saving, save } = useMenuEdit(groupId);

  return (
    <div className="pt-4">
      <PageIntro
        icon={<SettingOutlined />}
        description="Add custom items to the embedded app's native settings menu."
        groupId={groupId}
        onGroupChange={setGroupId}
      />

      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <Card title="Settings menu additions" loading={loading}>
          <SettingsMenuEditor
            items={menuEdit.settingsMenuItems}
            onChange={(settingsMenuItems) => setMenuEdit({ ...menuEdit, settingsMenuItems })}
          />
        </Card>

        <div className="flex justify-end">
          <Button type="primary" size="large" onClick={save} loading={saving}>
            Save settings nav
          </Button>
        </div>
      </Space>
    </div>
  );
}
