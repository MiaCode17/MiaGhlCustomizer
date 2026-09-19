import { useState } from 'react';

export type ThemeCategory = 'Dark' | 'Light' | 'Bold' | 'Muted' | 'Neon' | 'Monochromatic';

export interface Theme {
  id: string;
  name: string;
  category: ThemeCategory;
  colors: {
    background: string;
    primary: string;
    secondary: string;
    text: string;
  };
}

const SAMPLE_THEMES: Theme[] = [
  {
    id: 'dark-midnight',
    name: 'Midnight',
    category: 'Dark',
    colors: { background: '#121417', primary: '#2563EB', secondary: '#1F2937', text: '#E5E7EB' },
  },
  {
    id: 'dark-obsidian-wine',
    name: 'Obsidian Wine',
    category: 'Dark',
    colors: { background: '#1A0E12', primary: '#B33951', secondary: '#2A161C', text: '#F3E9EC' },
  },
  {
    id: 'light-clean-slate',
    name: 'Clean Slate',
    category: 'Light',
    colors: { background: '#FFFFFF', primary: '#2563EB', secondary: '#F3F4F6', text: '#111827' },
  },
  {
    id: 'light-warm-ivory',
    name: 'Warm Ivory',
    category: 'Light',
    colors: { background: '#FDF8F0', primary: '#D97706', secondary: '#F5EDE1', text: '#292524' },
  },
];

const CATEGORIES: Array<ThemeCategory | 'All'> = ['All', 'Dark', 'Light', 'Bold', 'Muted', 'Neon', 'Monochromatic'];

interface ThemeCardProps {
  theme: Theme;
  selected: boolean;
  onSelect: (themeId: string) => void;
}

function ThemeCard({ theme, selected, onSelect }: ThemeCardProps) {
  const [hovered, setHovered] = useState(false);
  const lifted = hovered || selected;
  const { background, primary, secondary, text } = theme.colors;

  return (
    <button
      type="button"
      onClick={() => onSelect(theme.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-pressed={selected}
      className="group relative flex w-full flex-col items-start overflow-hidden rounded-2xl bg-white p-3 text-left transition-transform duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c96b7e] focus-visible:ring-offset-2"
      style={{
        border: selected ? '1px solid rgba(122,31,43,0.35)' : '1px solid #ece6e2',
        transform: lifted ? 'translateY(-6px) scale(1.015)' : 'translateY(0) scale(1)',
        boxShadow: selected
          ? '0 0 0 2px #7a1f2b, 0 22px 34px -14px rgba(122,31,43,0.45)'
          : lifted
            ? '0 20px 30px -16px rgba(58,19,25,0.28)'
            : '0 2px 8px rgba(58,19,25,0.06)',
      }}
    >
      {selected && (
        <span
          className="absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full text-white ring-2 ring-white"
          style={{ background: 'linear-gradient(135deg, #d4af37, #a9791f)' }}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
            <path
              fillRule="evenodd"
              d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 111.42-1.42l2.79 2.79 6.79-6.79a1 1 0 011.42 0z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      )}

      {/* Mini live preview built from the theme's own palette */}
      <div
        className="relative mb-3 h-28 w-full overflow-hidden rounded-xl transition-transform duration-300"
        style={{
          background,
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)',
          transform: lifted ? 'scale(1.03)' : 'scale(1)',
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.16), rgba(255,255,255,0) 55%)' }}
        />
        <div className="relative flex h-full flex-col justify-between p-3.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: primary }} />
            <span className="h-1.5 w-12 rounded-full" style={{ background: text, opacity: 0.35 }} />
            <span className="h-1.5 w-6 rounded-full" style={{ background: text, opacity: 0.2 }} />
          </div>
          <div className="flex items-end gap-2">
            <span className="h-8 flex-1 rounded-lg" style={{ background: secondary }} />
            <span
              className="h-8 w-10 rounded-lg"
              style={{ background: primary, boxShadow: `0 4px 10px -2px ${primary}99` }}
            />
          </div>
        </div>
      </div>

      <div className="flex w-full items-start justify-between gap-2 px-1">
        <div>
          <span className="block text-sm font-semibold leading-tight" style={{ color: '#2c1014' }}>
            {theme.name}
          </span>
          <span
            className="mt-1.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium tracking-wide"
            style={{ background: '#f4ece9', color: '#7a1f2b' }}
          >
            {theme.category}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1 pt-0.5">
          {[background, primary, secondary, text].map((color, i) => (
            <span
              key={i}
              style={{
                backgroundColor: color,
                border: '1px solid rgba(0,0,0,0.08)',
              }}
              className="h-3.5 w-3.5 rounded-full"
            />
          ))}
        </div>
      </div>
    </button>
  );
}

export interface ThemeGalleryProps {
  themes?: Theme[];
  selectedThemeId?: string;
  defaultSelectedThemeId?: string;
  onSelect?: (themeId: string) => void;
}

export function ThemeGallery({ themes = SAMPLE_THEMES, selectedThemeId, defaultSelectedThemeId, onSelect }: ThemeGalleryProps) {
  const [internalSelectedId, setInternalSelectedId] = useState<string | undefined>(defaultSelectedThemeId);
  const [activeCategory, setActiveCategory] = useState<(typeof CATEGORIES)[number]>('All');

  const currentSelectedId = selectedThemeId ?? internalSelectedId;

  const handleSelect = (themeId: string) => {
    if (selectedThemeId === undefined) setInternalSelectedId(themeId);
    onSelect?.(themeId);
  };

  const filteredThemes = activeCategory === 'All' ? themes : themes.filter((t) => t.category === activeCategory);

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        {CATEGORIES.map((category) => {
          const isActive = activeCategory === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'text-white'
                  : 'border border-[#e8e3df] bg-white text-[#7a1f2b]/70 hover:bg-[#f4ece9] hover:text-[#7a1f2b]'
              }`}
              style={
                isActive
                  ? {
                      background: 'linear-gradient(135deg, #c96b7e, #7a1f2b)',
                      boxShadow: '0 6px 16px rgba(122,31,43,0.3)',
                    }
                  : undefined
              }
            >
              {category}
            </button>
          );
        })}
      </div>

      {filteredThemes.length === 0 ? (
        <p
          className="rounded-xl border border-dashed p-6 text-center text-sm"
          style={{ borderColor: '#e5e1dc', color: '#8a7b76' }}
        >
          No themes in this category yet.
        </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
          {filteredThemes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              selected={theme.id === currentSelectedId}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
