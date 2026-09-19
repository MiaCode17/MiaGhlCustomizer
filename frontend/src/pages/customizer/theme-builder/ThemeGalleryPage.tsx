import { useState } from 'react';
import { Card, Typography } from 'antd';
import { ThemeGallery } from '../../../components/ThemeGallery';

export function ThemeGalleryPage() {
  const [selectedThemeId, setSelectedThemeId] = useState<string | undefined>(undefined);

  return (
    <div>
      <Card title="Theme Gallery">
        <Typography.Paragraph type="secondary">
          Browse themes by category and select one. This is the UI/selection layer only — nothing is
          saved or applied yet.
        </Typography.Paragraph>
        <ThemeGallery selectedThemeId={selectedThemeId} onSelect={setSelectedThemeId} />
        {selectedThemeId && (
          <Typography.Text type="secondary" style={{ display: 'block', marginTop: 16 }}>
            Selected theme id: {selectedThemeId}
          </Typography.Text>
        )}
      </Card>
    </div>
  );
}
