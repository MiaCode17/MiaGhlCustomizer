import { useState } from 'react';
import { Card } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { PageIntro } from '../../../components/PageIntro';
import { ButtonSurfaceTable } from './ButtonSurfaceTable';

export function ContactButtonPage() {
  const [groupId, setGroupId] = useState<string | undefined>(undefined);

  return (
    <div className="pt-4">
      <PageIntro
        icon={<UserOutlined />}
        description="Inject custom buttons into the contact record view."
        groupId={groupId}
        onGroupChange={setGroupId}
      />

      <Card title="Contact buttons">
        <ButtonSurfaceTable surface="contact" groupId={groupId} />
      </Card>
    </div>
  );
}
