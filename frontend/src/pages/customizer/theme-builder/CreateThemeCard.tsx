import { useState } from 'react';
import { Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface CreateThemeCardProps {
  onClick: () => void;
}

export function CreateThemeCard({ onClick }: CreateThemeCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
      style={{
        width: 280,
        minHeight: 280,
        cursor: 'pointer',
        borderRadius: 18,
        border: '1.5px dashed #c96b7e',
        background: 'linear-gradient(135deg, #faf3f4, #fdf8f6)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '24px 20px',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 5px 0 0 #f0d7db, 0 16px 22px rgba(122,31,43,0.18)'
          : '0 4px 0 0 #f0d7db, 0 6px 14px rgba(122,31,43,0.1)',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #c96b7e, #7a1f2b)',
          color: '#fff',
          fontSize: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 14,
          boxShadow: '0 4px 10px rgba(122,31,43,0.28), inset 0 1px 2px rgba(255,255,255,0.4)',
        }}
      >
        <PlusOutlined />
      </div>
      <Typography.Text strong style={{ fontSize: 16, color: '#7a1f2b' }}>
        Design your own theme
      </Typography.Text>
      <Typography.Text type="secondary" style={{ fontSize: 14, marginTop: 5 }}>
        Unleash your creativity — build a look that's uniquely yours.
      </Typography.Text>
    </div>
  );
}
