import { ReactNode } from 'react';
import { Typography } from 'antd';
import { GroupSelector } from './GroupSelector';

interface PageIntroProps {
  icon: ReactNode;
  description: string;
  groupId: string | undefined;
  onGroupChange: (groupId: string | undefined) => void;
}

export function PageIntro({ icon, description, groupId, onGroupChange }: PageIntroProps) {
  return (
    <div
      className="flex items-center justify-between gap-4 flex-wrap"
      style={{
        background: 'linear-gradient(135deg, #faf8f6, #f3f0ed)',
        border: '1px solid #e8e3df',
        borderRadius: 14,
        padding: '16px 20px',
        marginBottom: 24,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            flexShrink: 0,
            background: 'linear-gradient(135deg, #c96b7e, #7a1f2b)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: 17,
            boxShadow: '0 6px 16px rgba(122,31,43,0.28)',
          }}
        >
          {icon}
        </div>
        <Typography.Text style={{ color: '#5c1220', maxWidth: 560 }}>{description}</Typography.Text>
      </div>
      <GroupSelector value={groupId} onChange={onGroupChange} />
    </div>
  );
}
