import { useState } from 'react';
import { Card } from 'antd';
import { DashboardOutlined } from '@ant-design/icons';
import { PageIntro } from '../../../components/PageIntro';
import { ButtonSurfaceTable } from './ButtonSurfaceTable';

export function DashboardButtonPage() {
  const [groupId, setGroupId] = useState<string | undefined>(undefined);

  return (
    <div className="pt-4">
      <PageIntro
        icon={<DashboardOutlined />}
        description="Inject custom buttons into the dashboard."
        groupId={groupId}
        onGroupChange={setGroupId}
      />

      <Card title="Dashboard buttons">
        <ButtonSurfaceTable surface="dashboard" groupId={groupId} />
      </Card>
    </div>
  );
}
