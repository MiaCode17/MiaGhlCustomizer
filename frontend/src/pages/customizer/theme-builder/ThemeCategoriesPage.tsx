import { useEffect, useMemo, useState } from 'react';
import { Empty, Input, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { GroupSelector } from '../../../components/GroupSelector';
import { themeService } from '../../../services/themeService';
import { Theme, ThemeCategory } from '../../../types/theme';
import { useBrandTheme } from '../../../context/BrandThemeContext';
import { DEFAULT_THEME, PRESET_THEMES, THEME_CATEGORIES } from './presetThemes';
import { withAlpha } from '../../../utils/colorUtils';
import { ThemeCard, ThemePreview, themeSwatches } from './ThemeCard';

type CategoryFilter = ThemeCategory | 'all';

const PAGE_CSS = `
.theme-card:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 14px 28px rgba(31,25,20,0.12); }
.theme-card:focus-visible { outline: 2px solid #26201d; outline-offset: 2px; }
.theme-card .theme-card-apply { opacity: 0; transition: opacity 0.15s ease; }
.theme-card:hover .theme-card-apply, .theme-card:focus-visible .theme-card-apply { opacity: 1; }
@media (max-width: 900px) { .theme-hero { grid-template-columns: minmax(0, 1fr) !important; } }
.theme-chips { scrollbar-width: none; }
.theme-chips::-webkit-scrollbar { display: none; }
`;

function Chip({
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
      aria-pressed={active}
      style={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        padding: '7px 14px',
        borderRadius: 10,
        border: '1px solid transparent',
        background: active ? '#26201d' : 'transparent',
        color: active ? '#fff' : '#5a514b',
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'background 0.15s ease, color 0.15s ease',
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: accent, boxShadow: active ? '0 0 0 2px rgba(255,255,255,0.35)' : 'none' }} />
      {label}
      <span style={{ opacity: 0.55, fontSize: 12 }}>{count}</span>
    </button>
  );
}

export function ThemeCategoriesPage() {
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [query, setQuery] = useState('');
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
    if (applying) return;
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

  const categoryMeta = useMemo(() => new Map(THEME_CATEGORIES.map((c) => [c.key, c])), []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [DEFAULT_THEME, ...PRESET_THEMES].filter((t) => {
      if (activeCategory !== 'all' && t.category !== activeCategory) return false;
      if (!q) return true;
      return `${t.themeName} ${t.description ?? ''} ${t.category ?? ''}`.toLowerCase().includes(q);
    });
  }, [activeCategory, query]);

  const keyOf = (t: Theme) => t.id ?? t.themeName;
  const activeCat = theme.category ? categoryMeta.get(theme.category) : undefined;
  const heroSwatches = themeSwatches(theme);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{PAGE_CSS}</style>

      {/* Hero: what's applied right now */}
      <section
        style={{
          borderRadius: 22,
          padding: 28,
          background: `linear-gradient(135deg, ${withAlpha(heroSwatches[0], 0.1)}, ${withAlpha(heroSwatches[1] ?? heroSwatches[0], 0.04)} 60%, #fff)`,
          border: '1px solid #ece7e3',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)',
          gap: 32,
          alignItems: 'center',
        }}
        className="theme-hero"
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: palette.primary }}>
              Currently applied
            </span>
            {activeCat && (
              <span style={{ fontSize: 12, color: '#6b625b', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: activeCat.accent }} />
                {activeCat.label}
              </span>
            )}
          </div>
          <h1 style={{ margin: 0, fontSize: 32, lineHeight: 1.15, fontWeight: 750, color: '#1f1914' }}>
            {loading ? 'Loading…' : theme.themeName}
          </h1>
          <p style={{ margin: '10px 0 18px', maxWidth: 460, fontSize: 14.5, lineHeight: 1.55, color: '#6b625b' }}>
            {theme.description || 'Pick any theme below to restyle your portal instantly.'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
            {heroSwatches.map((c, i) => (
              <span key={i} style={{ width: 28, height: 28, borderRadius: 9, background: c, border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 6px rgba(0,0,0,0.12)' }} />
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#8a817a' }}>
              <GroupSelector value={groupId} onChange={setGroupId} />
            </div>
          </div>
        </div>
        <ThemePreview theme={theme} height={210} />
      </section>

      {/* Toolbar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 5,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 12px',
          borderRadius: 14,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(8px)',
          border: '1px solid #ece7e3',
        }}
      >
        <div className="theme-chips" style={{ display: 'flex', gap: 4, overflowX: 'auto', flex: 1, minWidth: 0 }}>
          <Chip
            label="All"
            accent={palette.primary}
            active={activeCategory === 'all'}
            count={PRESET_THEMES.length + 1}
            onClick={() => setActiveCategory('all')}
          />
          {THEME_CATEGORIES.map((c) => (
            <Chip
              key={c.key}
              label={c.label}
              accent={c.accent}
              active={activeCategory === c.key}
              count={counts.get(c.key) ?? 0}
              onClick={() => setActiveCategory(c.key)}
            />
          ))}
        </div>
        <Input
          allowClear
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          prefix={<SearchOutlined style={{ color: '#a39a93' }} />}
          placeholder="Search themes"
          style={{ width: 200, flexShrink: 0, borderRadius: 10 }}
        />
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <Empty description="No themes match your search" style={{ padding: '48px 0' }} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, opacity: applying ? 0.75 : 1, transition: 'opacity 0.15s ease' }}>
          {visible.map((t) => {
            const cat = t.category ? categoryMeta.get(t.category) : undefined;
            return (
              <ThemeCard
                key={keyOf(t)}
                theme={t}
                active={keyOf(theme) === keyOf(t)}
                categoryLabel={cat?.label}
                categoryAccent={cat?.accent}
                disabled={applying}
                onClick={() => applyTheme(t)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
