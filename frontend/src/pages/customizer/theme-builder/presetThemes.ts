import { Theme } from '../../../types/theme';

function preset(theme: Omit<Theme, 'enabled'>): Theme {
  return { ...theme, enabled: true };
}

export const PRESET_THEMES: Theme[] = [
  preset({
    themeName: 'Midnight Wine',
    description: 'Deep, moody reds for a bold, premium feel.',
    colorRules: [
      { name: 'Header background', selector: '.hl-header', property: 'background-color', value: '#3a0b14' },
      { name: 'Sidebar background', selector: '.hl-sidebar', property: 'background-color', value: '#2b070d' },
      { name: 'Primary button', selector: '.hl-btn-primary', property: 'background-color', value: '#7a1f2b' },
      { name: 'Link color', selector: '.hl-link', property: 'color', value: '#c96b7e' },
    ],
    gradients: [
      { target: 'header', from: '#4a0f1a', to: '#7a1f2b', angle: 135 },
      { target: 'button', from: '#c96b7e', to: '#7a1f2b', angle: 135 },
    ],
    fonts: { heading: 'Poppins', body: 'Inter' },
    borderRadius: '10px',
    shadowIntensity: 'md',
  }),
  preset({
    themeName: 'Ocean Breeze',
    description: 'Cool, calm blues that keep things light and easy.',
    colorRules: [
      { name: 'Header background', selector: '.hl-header', property: 'background-color', value: '#0c4a6e' },
      { name: 'Sidebar background', selector: '.hl-sidebar', property: 'background-color', value: '#082f49' },
      { name: 'Primary button', selector: '.hl-btn-primary', property: 'background-color', value: '#0284c7' },
      { name: 'Link color', selector: '.hl-link', property: 'color', value: '#38bdf8' },
    ],
    gradients: [
      { target: 'header', from: '#0ea5e9', to: '#0c4a6e', angle: 120 },
      { target: 'button', from: '#38bdf8', to: '#0284c7', angle: 120 },
    ],
    fonts: { heading: 'Inter', body: 'Inter' },
    borderRadius: '8px',
    shadowIntensity: 'sm',
  }),
  preset({
    themeName: 'Sunset Gradient',
    description: 'Warm oranges that bring energy and optimism.',
    colorRules: [
      { name: 'Header background', selector: '.hl-header', property: 'background-color', value: '#7c2d12' },
      { name: 'Sidebar background', selector: '.hl-sidebar', property: 'background-color', value: '#431407' },
      { name: 'Primary button', selector: '.hl-btn-primary', property: 'background-color', value: '#ea580c' },
      { name: 'Link color', selector: '.hl-link', property: 'color', value: '#fb923c' },
    ],
    gradients: [
      { target: 'header', from: '#f97316', to: '#7c2d12', angle: 120 },
      { target: 'button', from: '#fb923c', to: '#ea580c', angle: 120 },
    ],
    fonts: { heading: 'Poppins', body: 'Inter' },
    borderRadius: '12px',
    shadowIntensity: 'md',
  }),
  preset({
    themeName: 'Emerald Forest',
    description: 'Grounded greens for a fresh, natural look.',
    colorRules: [
      { name: 'Header background', selector: '.hl-header', property: 'background-color', value: '#064e3b' },
      { name: 'Sidebar background', selector: '.hl-sidebar', property: 'background-color', value: '#022c22' },
      { name: 'Primary button', selector: '.hl-btn-primary', property: 'background-color', value: '#059669' },
      { name: 'Link color', selector: '.hl-link', property: 'color', value: '#34d399' },
    ],
    gradients: [
      { target: 'header', from: '#10b981', to: '#064e3b', angle: 135 },
      { target: 'button', from: '#34d399', to: '#059669', angle: 135 },
    ],
    fonts: { heading: 'Inter', body: 'Inter' },
    borderRadius: '8px',
    shadowIntensity: 'sm',
  }),
  preset({
    themeName: 'Royal Purple',
    description: 'Rich violets with a confident, luxurious edge.',
    colorRules: [
      { name: 'Header background', selector: '.hl-header', property: 'background-color', value: '#4c1d95' },
      { name: 'Sidebar background', selector: '.hl-sidebar', property: 'background-color', value: '#2e1065' },
      { name: 'Primary button', selector: '.hl-btn-primary', property: 'background-color', value: '#7c3aed' },
      { name: 'Link color', selector: '.hl-link', property: 'color', value: '#a78bfa' },
    ],
    gradients: [
      { target: 'header', from: '#8b5cf6', to: '#4c1d95', angle: 135 },
      { target: 'button', from: '#a78bfa', to: '#7c3aed', angle: 135 },
    ],
    fonts: { heading: 'Poppins', body: 'Inter' },
    borderRadius: '10px',
    shadowIntensity: 'md',
  }),
  preset({
    themeName: 'Slate Minimal',
    description: 'Clean, understated grays for a distraction-free UI.',
    colorRules: [
      { name: 'Header background', selector: '.hl-header', property: 'background-color', value: '#1e293b' },
      { name: 'Sidebar background', selector: '.hl-sidebar', property: 'background-color', value: '#0f172a' },
      { name: 'Primary button', selector: '.hl-btn-primary', property: 'background-color', value: '#334155' },
      { name: 'Link color', selector: '.hl-link', property: 'color', value: '#94a3b8' },
    ],
    gradients: [{ target: 'button', from: '#475569', to: '#1e293b', angle: 135 }],
    fonts: { heading: 'Inter', body: 'Inter' },
    borderRadius: '4px',
    shadowIntensity: 'none',
  }),
  preset({
    themeName: 'Glassmorphism Frost',
    description: 'Soft, airy neutrals with a frosted-glass feel.',
    colorRules: [
      { name: 'Header background', selector: '.hl-header', property: 'background-color', value: '#e2e8f0' },
      { name: 'Sidebar background', selector: '.hl-sidebar', property: 'background-color', value: '#f1f5f9' },
      { name: 'Primary button', selector: '.hl-btn-primary', property: 'background-color', value: '#ffffff' },
      { name: 'Link color', selector: '.hl-link', property: 'color', value: '#64748b' },
    ],
    gradients: [{ target: 'header', from: '#f8fafc', to: '#cbd5e1', angle: 120 }],
    fonts: { heading: 'Poppins', body: 'Inter' },
    borderRadius: '16px',
    shadowIntensity: 'lg',
  }),
  preset({
    themeName: 'Cyberpunk Neon',
    description: 'Electric pinks and cyans for a bold, futuristic vibe.',
    colorRules: [
      { name: 'Header background', selector: '.hl-header', property: 'background-color', value: '#0d0221' },
      { name: 'Sidebar background', selector: '.hl-sidebar', property: 'background-color', value: '#030014' },
      { name: 'Primary button', selector: '.hl-btn-primary', property: 'background-color', value: '#ff2079' },
      { name: 'Link color', selector: '.hl-link', property: 'color', value: '#00e5ff' },
    ],
    gradients: [
      { target: 'header', from: '#ff2079', to: '#7b2ff7', angle: 135 },
      { target: 'button', from: '#00e5ff', to: '#ff2079', angle: 135 },
    ],
    fonts: { heading: 'Poppins', body: 'Inter' },
    borderRadius: '6px',
    shadowIntensity: 'lg',
  }),
  preset({
    themeName: 'Golden Luxe',
    description: 'Black and gold for a high-end, exclusive feel.',
    colorRules: [
      { name: 'Header background', selector: '.hl-header', property: 'background-color', value: '#0a0a0a' },
      { name: 'Sidebar background', selector: '.hl-sidebar', property: 'background-color', value: '#000000' },
      { name: 'Primary button', selector: '.hl-btn-primary', property: 'background-color', value: '#d4af37' },
      { name: 'Link color', selector: '.hl-link', property: 'color', value: '#f5d576' },
    ],
    gradients: [
      { target: 'header', from: '#d4af37', to: '#0a0a0a', angle: 135 },
      { target: 'button', from: '#f5d576', to: '#d4af37', angle: 135 },
    ],
    fonts: { heading: 'Playfair Display', body: 'Inter' },
    borderRadius: '4px',
    shadowIntensity: 'md',
  }),
  preset({
    themeName: 'Coral Sunrise',
    description: 'Playful pinks and corals with a friendly energy.',
    colorRules: [
      { name: 'Header background', selector: '.hl-header', property: 'background-color', value: '#9d174d' },
      { name: 'Sidebar background', selector: '.hl-sidebar', property: 'background-color', value: '#500724' },
      { name: 'Primary button', selector: '.hl-btn-primary', property: 'background-color', value: '#f43f5e' },
      { name: 'Link color', selector: '.hl-link', property: 'color', value: '#fda4af' },
    ],
    gradients: [
      { target: 'header', from: '#fb7185', to: '#9d174d', angle: 120 },
      { target: 'button', from: '#fda4af', to: '#f43f5e', angle: 120 },
    ],
    fonts: { heading: 'Poppins', body: 'Inter' },
    borderRadius: '12px',
    shadowIntensity: 'sm',
  }),
];
