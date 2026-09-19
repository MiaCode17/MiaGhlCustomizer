import { useEffect, useState } from 'react';
import { Card, Typography, message } from 'antd';
import { BgColorsOutlined } from '@ant-design/icons';
import { PageIntro } from '../../../components/PageIntro';
import { themeService } from '../../../services/themeService';
import { emptyTheme, Theme } from '../../../types/theme';
import { CreateThemeCard } from './CreateThemeCard';
import { CreateThemeModal } from './CreateThemeModal';
import { PRESET_THEMES } from './presetThemes';
import { ThemeCard } from './ThemeCard';

export function ReadyMadeThemesPage() {
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [theme, setTheme] = useState<Theme>(emptyTheme);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [customThemes, setCustomThemes] = useState<Theme[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    themeService
      .get(groupId)
      .then((loaded) => {
        if (!cancelled) setTheme(loaded ?? emptyTheme);
      })
      .catch(() => {
        if (!cancelled) message.error('Failed to load theme');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [groupId]);

  const applyTheme = async (next: Theme) => {
    setApplying(true);
    try {
      const saved = await themeService.save(next, groupId);
      setTheme(saved);
      message.success(`${saved.themeName} applied`);
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to apply theme');
    } finally {
      setApplying(false);
    }
  };

  const handleCreateTheme = (created: Theme) => {
    setCustomThemes((prev) => [...prev, created]);
    setCreateModalOpen(false);
    applyTheme(created);
    message.success('Your theme was added — only you can see it');
  };

  return (
    <div>
      <PageIntro
        icon={<BgColorsOutlined />}
        description="Start from a curated palette and apply it instantly. Fine-tune fonts, colors, and gradients under Make Your Own."
        groupId={groupId}
        onGroupChange={setGroupId}
      />

      <Card title="Preset themes" loading={loading}>
        <Typography.Paragraph type="secondary">
          Pick a preset to apply it right away, or design something entirely your own.
        </Typography.Paragraph>
        <div className="flex flex-wrap gap-3">
          {PRESET_THEMES.map((preset) => (
            <ThemeCard
              key={preset.themeName}
              theme={preset}
              active={(theme.id ?? theme.themeName) === (preset.id ?? preset.themeName)}
              onClick={() => applyTheme(preset)}
            />
          ))}
          {customThemes.map((custom) => (
            <ThemeCard
              key={custom.id}
              theme={custom}
              active={(theme.id ?? theme.themeName) === (custom.id ?? custom.themeName)}
              onClick={() => applyTheme(custom)}
            />
          ))}
          <CreateThemeCard onClick={() => setCreateModalOpen(true)} />
        </div>
        {applying && (
          <Typography.Text type="secondary" style={{ display: 'block', marginTop: 12 }}>
            Applying theme…
          </Typography.Text>
        )}
      </Card>

      <CreateThemeModal
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onCreate={handleCreateTheme}
      />
    </div>
  );
}
