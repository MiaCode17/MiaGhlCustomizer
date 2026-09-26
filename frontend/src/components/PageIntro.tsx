import { ReactNode } from 'react';
import { Typography } from 'antd';
import { useBrandTheme } from '../context/BrandThemeContext';
import { GroupSelector } from './GroupSelector';

interface PageIntroProps {
  icon: ReactNode;
  description: string;
  groupId: string | undefined;
  onGroupChange: (groupId: string | undefined) => void;
}

export function PageIntro({ icon, description, groupId, onGroupChange }: PageIntroProps) {
  const { palette } = useBrandTheme();

  return (
    <div
      className="flex items-center justify-between gap-4 flex-wrap"
      style={{
        background: 'linear-gradient(135deg, #faf8f6, #f3f0ed)',
        border: '1px solid #e8e3df',
        borderRadius: 14,
        padding: '16px 20px',
        marginBottom: 24,
        transition: 'background 0.4s ease',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            flexShrink: 0,
            background: `linear-gradient(135deg, ${palette.primaryHover}, ${palette.primary})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: palette.onPrimary,
            fontSize: 17,
            boxShadow: `0 6px 16px ${palette.softShadow}`,
            transition: 'background 0.4s ease, box-shadow 0.4s ease',
          }}
        >
          {icon}
        </div>
        <Typography.Text style={{ color: palette.primary, maxWidth: 560 }}>{description}</Typography.Text>
      </div>
      <GroupSelector value={groupId} onChange={onGroupChange} />
    </div>
  );
}
