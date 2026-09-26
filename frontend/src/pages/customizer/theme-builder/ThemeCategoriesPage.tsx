import { useEffect, useMemo, useState } from 'react';
import { Typography, message } from 'antd';
import { BgColorsOutlined } from '@ant-design/icons';
import { PageIntro } from '../../../components/PageIntro';
import { themeService } from '../../../services/themeService';
import { Theme, ThemeCategory } from '../../../types/theme';
import { useBrandTheme } from '../../../context/BrandThemeContext';
import { withAlpha } from '../../../utils/colorUtils';
import { DEFAULT_THEME, PRESET_THEMES, THEME_CATEGORIES } from './presetThemes';
import { ThemeCard } from './ThemeCard';

type CategoryFilter = ThemeCategory | 'all';

function CategoryPill({
  label,
  accent,
  active,
  count,
  onClick,
}: {
  label: string;
  accent: string;
  active: boolean;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 16px',
        borderRadius: 999,
        border: active ? `1.5px solid ${accent}` : '1.5px solid #e8e3df',
        background: active ? withAlpha(accent, 0.1) : '#ffffff',
        boxShadow: active ? `0 6px 16px ${withAlpha(accent, 0.28)}` : '0 1px 2px rgba(31,25,20,0.04)',
        cursor: 'pointer',
        transition: 'transform 0.15s ease, box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease',
        transform: active ? 'translateY(-1px)' : 'translateY(0)',
        fontSize: 13,
        fontWeight: active ? 600 : 500,
        color: active ? '#26201d' : '#4b4440',
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.borderColor = accent;
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.borderColor = '#e8e3df';
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: accent,
          boxShadow: active ? `0 0 0 3px ${withAlpha(accent, 0.22)}` : 'none',
          flexShrink: 0,
          transition: 'box-shadow 0.2s ease',
        }}
      />
      {label}
      <span style={{ opacity: 0.5, fontSize: 12, fontWeight: 500 }}>{count}</span>
    </button>
  );
}

export function ThemeCategoriesPage() {
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const { palette, setActiveTheme } = useBrandTheme();

  useEffect(() => {
    if (!loading) setActiveTheme(theme);
  }, [theme, loading, setActiveTheme]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    themeService
      .get(groupId)
      .then((loaded) => {
        if (!cancelled) setTheme(loaded ?? DEFAULT_THEME);
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

  const counts = useMemo(() => {
    const map = new Map<ThemeCategory, number>();
    for (const t of PRESET_THEMES) {
      if (t.category) map.set(t.category, (map.get(t.category) ?? 0) + 1);
    }
    return map;
  }, []);

  const visible = useMemo(
    () => (activeCategory === 'all' ? PRESET_THEMES : PRESET_THEMES.filter((t) => t.category === activeCategory)),
    [activeCategory],
  );

  const activeLabel =
    activeCategory === 'all' ? 'All themes' : THEME_CATEGORIES.find((c) => c.key === activeCategory)?.label;

  return (
    <div>
      <PageIntro
        icon={<BgColorsOutlined />}
        description="Your entire theme library in one place — filter by aesthetic and apply instantly. Head to Make Your Own to design a fully custom theme."
        groupId={groupId}
        onGroupChange={setGroupId}
      />

      <div
        style={{
          borderRadius: 18,
          border: '1px solid #ede7e2',
          background: 'linear-gradient(180deg, #ffffff, #fdfbfa)',
          padding: '20px 24px 28px',
          boxShadow: '0 1px 2px rgba(31,25,20,0.03), 0 16px 36px rgba(31,25,20,0.05)',
        }}
      >
        <div className="flex flex-wrap gap-2" style={{ marginBottom: 18 }}>
          <CategoryPill
            label="All"
            accent={palette.primary}
            active={activeCategory === 'all'}
            count={PRESET_THEMES.length}
            onClick={() => setActiveCategory('all')}
          />
          {THEME_CATEGORIES.map((c) => (
            <CategoryPill
              key={c.key}
              label={c.label}
              accent={c.accent}
              active={activeCategory === c.key}
              count={counts.get(c.key) ?? 0}
              onClick={() => setActiveCategory(c.key)}
            />
          ))}
        </div>

        <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
          <Typography.Text type="secondary" style={{ fontSize: 13 }}>
            {activeLabel} · {visible.length} theme{visible.length === 1 ? '' : 's'}
          </Typography.Text>
          {applying && (
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              Applying theme…
            </Typography.Text>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <ThemeCard
            key={DEFAULT_THEME.themeName}
            theme={DEFAULT_THEME}
            active={(theme.id ?? theme.themeName) === (DEFAULT_THEME.id ?? DEFAULT_THEME.themeName)}
            onClick={() => applyTheme(DEFAULT_THEME)}
          />
          {visible.map((preset) => (
            <ThemeCard
              key={preset.id ?? preset.themeName}
              theme={preset}
              active={(theme.id ?? theme.themeName) === (preset.id ?? preset.themeName)}
              onClick={() => applyTheme(preset)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
