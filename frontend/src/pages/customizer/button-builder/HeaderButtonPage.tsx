import { useState } from 'react';
import { Card } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import { PageIntro } from '../../../components/PageIntro';
import { ButtonSurfaceTable } from './ButtonSurfaceTable';

export function HeaderButtonPage() {
  const [groupId, setGroupId] = useState<string | undefined>(undefined);

  return (
    <div className="pt-4">
      <PageIntro
        icon={<AppstoreOutlined />}
        description="Inject custom buttons into the header."
        groupId={groupId}
        onGroupChange={setGroupId}
      />

      <Card title="Header buttons">
        <ButtonSurfaceTable surface="header" groupId={groupId} />
      </Card>
    </div>
  );
}
