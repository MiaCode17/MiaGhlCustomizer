import { useState } from 'react';
import { Card } from 'antd';
import { DollarOutlined } from '@ant-design/icons';
import { PageIntro } from '../../../components/PageIntro';
import { ButtonSurfaceTable } from './ButtonSurfaceTable';

export function OpportunityButtonPage() {
  const [groupId, setGroupId] = useState<string | undefined>(undefined);

  return (
    <div className="pt-4">
      <PageIntro
        icon={<DollarOutlined />}
        description="Inject custom buttons into the opportunity record view."
        groupId={groupId}
        onGroupChange={setGroupId}
      />

      <Card title="Opportunity buttons">
        <ButtonSurfaceTable surface="opportunity" groupId={groupId} />
      </Card>
    </div>
  );
}
