import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { AuthUser } from '../types/auth';
import { Company, CompanyUpdateInput } from '../types/company';
import { Theme, defaultSidebarStyle } from '../types/theme';
import { SpecialTheme } from '../types/specialTheme';
import { LogoCampaign, LogoCampaignInput } from '../types/logo';
import { LoginPageConfig } from '../types/loginPage';
import { ButtonSurface, InjectedButton, InjectedButtonInput, buttonBehaviorDefaults } from '../types/button';
import { FloatingButton, FloatingButtonInput, floatingButtonDefaults } from '../types/floatingButton';
import { DynamicLink, DynamicLinkInput } from '../types/dynamicLink';
import { allRoles, MenuEdit } from '../types/menuEdit';
import { CustomFieldCampaign, CustomFieldCampaignInput } from '../types/customField';
import { Banner, BannerInput } from '../types/banner';
import { ChatBubbleConfig, emptyChatBubbleConfig } from '../types/chatBubble';
import { SupportMessage, SupportTicket } from '../types/supportChat';
import { LoaderConfig } from '../types/loader';
import { LaunchpadTile, LaunchpadTileInput } from '../types/launchpad';
import { LocationLink } from '../types/locationLink';
import { MiscSettings } from '../types/miscSettings';
import { BookACallConfig } from '../types/bookACall';
import { ConversationStyleConfig, emptyConversationStyle } from '../types/conversationStyle';
import { Group, GroupInput } from '../types/group';

const MOCK_COMPANY_ID = 'mock-company';
const MOCK_GROUP_ID = 'default-group';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let idCounter = 1;
function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function svgDataUri(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const LOGO_SVG_PRIMARY = svgDataUri(
  '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">' +
    '<defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0%" stop-color="#6366F1"/><stop offset="100%" stop-color="#8B5CF6"/>' +
    '</linearGradient></defs>' +
    '<rect width="128" height="128" rx="28" fill="url(#g1)"/>' +
    '<text x="64" y="82" font-family="Poppins, Inter, sans-serif" font-size="56" font-weight="700" fill="#FFFFFF" text-anchor="middle">M</text>' +
    '</svg>',
);

const LOGO_SVG_SECONDARY = svgDataUri(
  '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">' +
    '<defs><linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0%" stop-color="#22C55E"/><stop offset="100%" stop-color="#0EA5E9"/>' +
    '</linearGradient></defs>' +
    '<rect width="128" height="128" rx="28" fill="url(#g2)"/>' +
    '<text x="64" y="82" font-family="Poppins, Inter, sans-serif" font-size="56" font-weight="700" fill="#FFFFFF" text-anchor="middle">S</text>' +
    '</svg>',
);

const LOGIN_BACKGROUND_SVG = svgDataUri(
  '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">' +
    '<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0%" stop-color="#1E293B"/><stop offset="100%" stop-color="#6366F1"/>' +
    '</linearGradient></defs>' +
    '<rect width="800" height="600" fill="url(#bg)"/>' +
    '</svg>',
);

let company: Company = {
  id: MOCK_COMPANY_ID,
  name: 'Mia GHL',
  ghlCompanyId: '',
  hasGhlApiToken: false,
};

// Mock mode starts already "logged in" so the UI preview isn't gated behind
// a login screen; /auth/login and /auth/logout still work to demo the flow.
const MOCK_USER: AuthUser = { id: 'mock-user', email: 'demo@miaghl.com' };
let mockAuthedUser: AuthUser | null = MOCK_USER;

let theme: Theme = {
  themeName: 'Aurora Agency Theme',
  colorRules: [
    { name: 'Header Background', selector: '.hl-header', property: 'background-color', value: '#1E293B' },
    { name: 'Primary Button', selector: '.hl-btn-primary', property: 'background-color', value: '#6366F1' },
    { name: 'Sidebar Background', selector: '.hl-sidebar', property: 'background-color', value: '#0F172A' },
    { name: 'Link Color', selector: '.hl-link', property: 'color', value: '#8B5CF6' },
  ],
  gradients: [
    { target: 'header', from: '#6366F1', to: '#8B5CF6', angle: 135 },
    { target: 'button', from: '#22C55E', to: '#16A34A', angle: 90 },
  ],
  fonts: { heading: 'Poppins', body: 'Inter' },
  borderRadius: '8px',
  shadowIntensity: 'md',
  sidebarStyle: defaultSidebarStyle,
  enabled: true,
};

let specialTheme: SpecialTheme = {
  enabled: true,
  themeKey: 'christmas',
  popup: {
    visible: true,
    title: 'Happy Holidays!',
    message: 'Enjoy festive discounts on all annual plans this December.',
    ctaText: 'View Offers',
    ctaUrl: 'https://miaghl.com/holiday-offers',
  },
  particleEffect: { enabled: true, durationSeconds: 8 },
};

const logoCampaigns: LogoCampaign[] = [
  {
    _id: 'logo-1',
    companyId: MOCK_COMPANY_ID,
    groupId: MOCK_GROUP_ID,
    name: 'Default Branding',
    logoUrl: LOGO_SVG_PRIMARY,
    createdAt: '2026-08-20T09:15:00.000Z',
    updatedAt: '2026-08-20T09:15:00.000Z',
  },
  {
    _id: 'logo-2',
    companyId: MOCK_COMPANY_ID,
    groupId: MOCK_GROUP_ID,
    name: 'Summer Promo Logo',
    logoUrl: LOGO_SVG_SECONDARY,
    createdAt: '2026-08-25T14:30:00.000Z',
    updatedAt: '2026-08-25T14:30:00.000Z',
  },
];

let loginPageConfig: LoginPageConfig = {
  preset: 'split-left',
  logoUrl: LOGO_SVG_PRIMARY,
  backgroundImageUrl: LOGIN_BACKGROUND_SVG,
  cssVariables: [
    { name: '--brand-primary', value: '#6366F1' },
    { name: '--brand-secondary', value: '#8B5CF6' },
  ],
  customCss: '.login-card { border-radius: 16px; }',
};

const BUTTON_STYLE_KIT_DEFAULTS = {
  borderWidth: 0,
  borderRadius: 8,
  iconPosition: 'left' as const,
  shadow: 'none' as const,
  animation: 'none' as const,
  fullWidth: false,
  ...buttonBehaviorDefaults(),
};

const buttons: InjectedButton[] = [
  {
    _id: 'btn-1',
    companyId: MOCK_COMPANY_ID,
    groupId: MOCK_GROUP_ID,
    surface: 'header',
    label: 'Upgrade Plan',
    tooltip: 'Upgrade your subscription',
    icon: 'RocketOutlined',
    style: 'primary',
    size: 'middle',
    targetUrl: 'https://miaghl.com/upgrade',
    order: 0,
    ...BUTTON_STYLE_KIT_DEFAULTS,
    createdAt: '2026-08-15T10:00:00.000Z',
    updatedAt: '2026-08-15T10:00:00.000Z',
  },
  {
    _id: 'btn-2',
    companyId: MOCK_COMPANY_ID,
    groupId: MOCK_GROUP_ID,
    surface: 'dashboard',
    label: 'Book a Demo',
    tooltip: 'Schedule a call with our team',
    icon: 'CalendarOutlined',
    style: 'default',
    size: 'middle',
    targetUrl: 'https://miaghl.com/demo',
    order: 0,
    ...BUTTON_STYLE_KIT_DEFAULTS,
    createdAt: '2026-08-16T10:00:00.000Z',
    updatedAt: '2026-08-16T10:00:00.000Z',
  },
  {
    _id: 'btn-3',
    companyId: MOCK_COMPANY_ID,
    groupId: MOCK_GROUP_ID,
    surface: 'record-detail',
    label: 'Send to Zapier',
    tooltip: 'Trigger a Zapier workflow',
    icon: 'ThunderboltOutlined',
    style: 'dashed',
    size: 'small',
    targetUrl: 'https://zapier.com',
    order: 0,
    ...BUTTON_STYLE_KIT_DEFAULTS,
    createdAt: '2026-08-17T10:00:00.000Z',
    updatedAt: '2026-08-17T10:00:00.000Z',
  },
  {
    _id: 'btn-4',
    companyId: MOCK_COMPANY_ID,
    groupId: MOCK_GROUP_ID,
    surface: 'record-tab',
    label: 'View Insights',
    tooltip: 'Open the analytics tab',
    icon: 'BarChartOutlined',
    style: 'text',
    size: 'small',
    targetUrl: '#',
    order: 0,
    ...BUTTON_STYLE_KIT_DEFAULTS,
    createdAt: '2026-08-18T10:00:00.000Z',
    updatedAt: '2026-08-18T10:00:00.000Z',
  },
];

const floatingButtons: FloatingButton[] = [
  {
    _id: 'fb-1',
    companyId: MOCK_COMPANY_ID,
    groupId: MOCK_GROUP_ID,
    ...floatingButtonDefaults(),
    position: 'right',
    label: 'Quick Help',
    backgroundColor: '#6366F1',
    textColor: '#FFFFFF',
    borderRadius: 999,
    shadow: 'md',
    animation: 'none',
    subItems: [
      { label: 'Help Center', url: 'https://help.miaghl.com' },
      { label: 'Contact Support', url: 'https://miaghl.com/support' },
    ],
    createdAt: '2026-08-19T10:00:00.000Z',
    updatedAt: '2026-08-19T10:00:00.000Z',
  },
  {
    _id: 'fb-2',
    companyId: MOCK_COMPANY_ID,
    groupId: MOCK_GROUP_ID,
    ...floatingButtonDefaults(),
    position: 'bottom',
    label: 'Feedback',
    backgroundColor: '#22C55E',
    textColor: '#FFFFFF',
    borderRadius: 999,
    shadow: 'md',
    animation: 'none',
    subItems: [
      { label: 'Feature Request', url: 'https://miaghl.com/feedback' },
      { label: 'Report a Bug', url: 'https://miaghl.com/bugs' },
    ],
    createdAt: '2026-08-20T10:00:00.000Z',
    updatedAt: '2026-08-20T10:00:00.000Z',
  },
];

const dynamicLinks: DynamicLink[] = [
  {
    _id: 'dl-1',
    companyId: MOCK_COMPANY_ID,
    groupId: MOCK_GROUP_ID,
    title: 'Knowledge Base',
    url: 'https://help.miaghl.com',
    icon: 'BookOutlined',
    openMode: 'new-tab',
    roleTarget: 'all',
    createdAt: '2026-08-10T10:00:00.000Z',
    updatedAt: '2026-08-10T10:00:00.000Z',
  },
  {
    _id: 'dl-2',
    companyId: MOCK_COMPANY_ID,
    groupId: MOCK_GROUP_ID,
    title: 'Billing Portal',
    url: 'https://miaghl.com/billing',
    icon: 'CreditCardOutlined',
    openMode: 'modal',
    roleTarget: 'admin',
    createdAt: '2026-08-11T10:00:00.000Z',
    updatedAt: '2026-08-11T10:00:00.000Z',
  },
  {
    _id: 'dl-3',
    companyId: MOCK_COMPANY_ID,
    groupId: MOCK_GROUP_ID,
    title: 'Partner Program',
    url: 'https://miaghl.com/partners',
    icon: 'TeamOutlined',
    openMode: 'same-tab',
    roleTarget: 'owner',
    createdAt: '2026-08-12T10:00:00.000Z',
    updatedAt: '2026-08-12T10:00:00.000Z',
  },
];

let menuEdit: MenuEdit = {
  renamed: [{ originalLabel: 'Opportunities', newLabel: 'Deals', icon: '💼' }],
  hidden: ['App Marketplace'],
  hiddenByRole: [{ label: 'Reputation', roleKeys: ['account_users'] }],
  moved: [{ label: 'Reporting', position: 'after', target: 'Dashboard' }],
  settingsMenuItems: [
    { type: 'divider', name: 'Brand', link: '', openMode: 'auto' },
    { type: 'link', name: 'Brand Settings', link: '/settings/brand', openMode: 'auto' },
  ],
  navTree: [
    { id: 'nav-1', label: 'Resources', order: 0, icon: '📚', openMode: 'auto', permissions: allRoles() },
    {
      id: 'nav-2',
      label: 'Help Center',
      url: 'https://help.miaghl.com',
      parentId: 'nav-1',
      order: 0,
      openMode: 'modal',
      permissions: allRoles(),
    },
  ],
  extendedTabs: [
    {
      id: 'tab-1',
      label: 'Playbook',
      url: 'https://miaghl.com/playbook?loc={{location.id}}',
      page: 'opportunities',
      permissions: allRoles(),
    },
  ],
  toolCategories: [
    {
      name: 'Growth Tools',
      tools: [
        { label: 'ROI Calculator', url: 'https://miaghl.com/tools/roi' },
        { label: 'Funnel Templates', url: 'https://miaghl.com/tools/funnels' },
      ],
    },
  ],
};

const customFieldCampaigns: CustomFieldCampaign[] = [
  { _id: 'cf-1', name: 'Sales Enablement', exposedFieldKeys: ['contact.lead_source', 'opportunity.close_probability'], mode: 'lock' },
  { _id: 'cf-2', name: 'Onboarding', exposedFieldKeys: ['contact.company_size', 'contact.timezone'], mode: 'hide' },
];

const banners: Banner[] = [
  {
    _id: 'ban-1',
    companyId: MOCK_COMPANY_ID,
    groupId: MOCK_GROUP_ID,
    name: 'Black Friday Promo',
    type: 'promo',
    position: 'top',
    enabled: true,
    content: 'Black Friday Sale: 30% off annual plans through Nov 30!',
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
  },
  {
    _id: 'ban-2',
    companyId: MOCK_COMPANY_ID,
    groupId: MOCK_GROUP_ID,
    name: 'Scheduled Maintenance',
    type: 'warning',
    position: 'bottom',
    enabled: false,
    content: 'Scheduled maintenance this Sunday from 2-4am EST.',
    createdAt: '2026-09-02T10:00:00.000Z',
    updatedAt: '2026-09-02T10:00:00.000Z',
  },
];

let chatBubble: ChatBubbleConfig = {
  ...emptyChatBubbleConfig,
  enabled: true,
  title: 'Chat with us',
  subtitle: 'We typically reply within a few minutes',
  gradientFrom: '#6366F1',
  gradientTo: '#8B5CF6',
  welcomeMessage: 'Hi there! How can we help you today?',
  successMessage: "Thanks! We'll be in touch shortly.",
  errorMessage: 'Something went wrong. Please try again.',
  quickActions: [
    { label: 'Book a Demo', url: 'https://miaghl.com/demo' },
    { label: 'View Pricing', url: 'https://miaghl.com/pricing' },
  ],
};

let loader: LoaderConfig = {
  enabled: true,
  loaderType: 'dots',
  customImageUrl: undefined,
};

let bookACall: BookACallConfig = {
  enabled: true,
  buttonLabel: 'Book a Call',
  bookingUrl: 'https://miaghl.com/book-a-call',
  backgroundColor: '#6366f1',
  textColor: '#ffffff',
};

let conversationStyle: ConversationStyleConfig = emptyConversationStyle;

let launchpadTiles: LaunchpadTile[] = [
  {
    _id: 'lp-1',
    companyId: MOCK_COMPANY_ID,
    groupId: MOCK_GROUP_ID,
    order: 0,
    kind: 'custom',
    nativeId: '',
    description: 'Watch the 3-minute welcome video',
    imageUrl: '',
    buttonText: 'Watch now',
    url: 'https://miaghl.com/welcome?loc={{location.id}}',
    openMode: 'modal',
    hidden: false,
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
  },
];

let locationLinks: LocationLink[] = [
  {
    _id: 'll-1',
    companyId: MOCK_COMPANY_ID,
    locationId: 'loc-1001',
    title: 'Client billing portal',
    url: 'https://billing.example.com',
    icon: '💳',
    openMode: 'modal',
    createdAt: '2026-09-10T10:00:00.000Z',
    updatedAt: '2026-09-10T10:00:00.000Z',
  },
];

const supportMessages: Record<string, SupportMessage[]> = {
  'tk-1': [
    { id: 'sm-1', sender: 'visitor', text: 'Hi, can you help me connect my domain?', authorName: 'Ann Lee', at: Date.now() - 3600_000 },
    { id: 'sm-2', sender: 'agent', text: 'Of course! Which provider is it with?', authorName: 'Support', at: Date.now() - 3500_000 },
    { id: 'sm-3', sender: 'visitor', text: 'GoDaddy. I have the DNS page open.', authorName: 'Ann Lee', at: Date.now() - 600_000 },
  ],
  'tk-2': [{ id: 'sm-4', sender: 'visitor', text: 'Billing question about my last invoice', authorName: 'Bob Stone', at: Date.now() - 86400_000 }],
};
let supportTickets: SupportTicket[] = [
  {
    id: 'tk-1', locationId: 'loc-1001', status: 'open', visitorName: 'Ann Lee', visitorEmail: 'ann@example.com',
    subject: 'Hi, can you help me connect my domain?', lastMessageAt: new Date(Date.now() - 600_000).toISOString(),
    lastMessageFrom: 'visitor', lastMessagePreview: 'GoDaddy. I have the DNS page open.', messageCount: 3, unreadForAgent: 1,
    closedAt: null, closedBy: null, createdAt: new Date(Date.now() - 3600_000).toISOString(),
  },
  {
    id: 'tk-2', locationId: 'loc-1002', status: 'closed', visitorName: 'Bob Stone', visitorEmail: 'bob@example.com',
    subject: 'Billing question about my last invoice', lastMessageAt: new Date(Date.now() - 86400_000).toISOString(),
    lastMessageFrom: 'system', lastMessagePreview: 'The chat was closed by our team.', messageCount: 2, unreadForAgent: 0,
    closedAt: new Date(Date.now() - 86000_000).toISOString(), closedBy: 'agent', createdAt: new Date(Date.now() - 90000_000).toISOString(),
  },
];

let miscSettings: MiscSettings = {
  tooltip: { enabled: true, buttonText: 'Need help?', placement: 'bottom-right' },
  addonBanner: {
    enabled: true,
    placement: 'dashboard',
    showOnOtherPages: true,
    message: 'Unlock premium automation add-ons for your agency.',
    ctaUrl: 'https://miaghl.com/addons',
  },
  membership: {
    enabled: true,
    allowedLocationIds: ['loc-1001', 'loc-1002'],
    buttonLabel: 'My Membership',
    url: 'https://miaghl.com/membership/{{location.id}}',
    openMode: 'modal',
    icon: undefined,
    backgroundColor: '#4f46e5',
    textColor: '#ffffff',
  },
  unreadBadge: { enabled: true, badgeColor: '#2563eb' },
  userLinks: { enabled: true, maxLinks: 10 },
};

let groups: Group[] = [
  {
    _id: MOCK_GROUP_ID,
    companyId: MOCK_COMPANY_ID,
    name: 'VIP clients',
    type: 'custom',
    planIds: [],
    locationIds: ['loc-1001', 'loc-1002'],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
];

function parseBody(config: InternalAxiosRequestConfig): unknown {
  const data: unknown = config.data;
  if (data === undefined || data === null) return undefined;
  if (data instanceof FormData) return data;
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }
  return data;
}

function respond<T>(config: InternalAxiosRequestConfig, data: T, status = 200): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config,
  };
}

export const mockAdapter = async (
  config: InternalAxiosRequestConfig,
): Promise<AxiosResponse> => {
  await sleep(250);

  const method = (config.method ?? 'get').toLowerCase();
  const path = (config.url ?? '').split('?')[0];
  const query = (config.params ?? {}) as Record<string, string>;
  const body = parseBody(config);

  if (method === 'post' && path === '/auth/login') {
    mockAuthedUser = MOCK_USER;
    return respond(config, { user: mockAuthedUser });
  }
  if (method === 'post' && path === '/auth/logout') {
    mockAuthedUser = null;
    return respond(config, { ok: true });
  }
  if (method === 'get' && path === '/auth/me') {
    if (!mockAuthedUser) {
      return Promise.reject({ response: { status: 401, data: { error: 'Not authenticated' } } });
    }
    return respond(config, { user: mockAuthedUser });
  }

  if (method === 'get' && path === '/company') {
    return respond(config, { company });
  }
  if (method === 'put' && path === '/company/ghl-token') {
    company = { ...company, hasGhlApiToken: Boolean((body as { token?: string }).token) };
    return respond(config, { company });
  }
  if (method === 'put' && path === '/company/update') {
    company = { ...company, ...(body as CompanyUpdateInput) };
    return respond(config, { company });
  }

  if (method === 'get' && path === '/theme') {
    return respond(config, { theme });
  }
  if (method === 'put' && path === '/theme/update') {
    theme = body as Theme;
    return respond(config, { theme });
  }

  if (method === 'get' && path === '/special-theme') {
    return respond(config, { specialTheme });
  }
  if (method === 'put' && path === '/special-theme/update') {
    specialTheme = body as SpecialTheme;
    return respond(config, { specialTheme });
  }

  if (method === 'get' && path === '/logo') {
    return respond(config, { campaigns: logoCampaigns });
  }
  if (method === 'post' && path === '/logo') {
    const input = body as LogoCampaignInput;
    const campaign: LogoCampaign = {
      _id: nextId('logo'),
      companyId: MOCK_COMPANY_ID,
      groupId: MOCK_GROUP_ID,
      name: input.name,
      logoUrl: input.logoUrl,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    logoCampaigns.push(campaign);
    return respond(config, { campaign }, 201);
  }
  if (method === 'put' && path.startsWith('/logo/')) {
    const id = path.slice('/logo/'.length);
    const input = body as LogoCampaignInput;
    const index = logoCampaigns.findIndex((item) => item._id === id);
    if (index === -1) return Promise.reject(new Error(`[mockAdapter] Logo campaign not found: ${id}`));
    logoCampaigns[index] = { ...logoCampaigns[index], ...input, updatedAt: nowIso() };
    return respond(config, { campaign: logoCampaigns[index] });
  }
  if (method === 'delete' && path.startsWith('/logo/')) {
    const id = path.slice('/logo/'.length);
    const index = logoCampaigns.findIndex((item) => item._id === id);
    if (index !== -1) logoCampaigns.splice(index, 1);
    return respond(config, {});
  }

  if (method === 'get' && path === '/login-page') {
    return respond(config, { config: loginPageConfig });
  }
  if (method === 'put' && path === '/login-page/update') {
    loginPageConfig = body as LoginPageConfig;
    return respond(config, { config: loginPageConfig });
  }

  if (method === 'get' && path === '/buttons') {
    const surface = query.surface as ButtonSurface | undefined;
    const filtered = surface ? buttons.filter((item) => item.surface === surface) : buttons;
    return respond(config, { buttons: filtered });
  }
  if (method === 'post' && path === '/buttons') {
    const input = body as InjectedButtonInput;
    const button: InjectedButton = {
      _id: nextId('btn'),
      companyId: MOCK_COMPANY_ID,
      groupId: MOCK_GROUP_ID,
      ...input,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    buttons.push(button);
    return respond(config, { button }, 201);
  }
  if (method === 'put' && path.startsWith('/buttons/')) {
    const id = path.slice('/buttons/'.length);
    const input = body as InjectedButtonInput;
    const index = buttons.findIndex((item) => item._id === id);
    if (index === -1) return Promise.reject(new Error(`[mockAdapter] Button not found: ${id}`));
    buttons[index] = { ...buttons[index], ...input, updatedAt: nowIso() };
    return respond(config, { button: buttons[index] });
  }
  if (method === 'delete' && path.startsWith('/buttons/')) {
    const id = path.slice('/buttons/'.length);
    const index = buttons.findIndex((item) => item._id === id);
    if (index !== -1) buttons.splice(index, 1);
    return respond(config, {});
  }

  if (method === 'get' && path === '/book-a-call') {
    return respond(config, { bookACall });
  }
  if (method === 'put' && path === '/book-a-call/update') {
    bookACall = body as BookACallConfig;
    return respond(config, { bookACall });
  }

  if (method === 'get' && path === '/floating-buttons') {
    return respond(config, { buttons: floatingButtons });
  }
  if (method === 'post' && path === '/floating-buttons') {
    const input = body as FloatingButtonInput;
    const button: FloatingButton = {
      _id: nextId('fb'),
      companyId: MOCK_COMPANY_ID,
      groupId: MOCK_GROUP_ID,
      ...input,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    floatingButtons.push(button);
    return respond(config, { button }, 201);
  }
  if (method === 'put' && path.startsWith('/floating-buttons/')) {
    const id = path.slice('/floating-buttons/'.length);
    const input = body as FloatingButtonInput;
    const index = floatingButtons.findIndex((item) => item._id === id);
    if (index === -1) return Promise.reject(new Error(`[mockAdapter] Floating button not found: ${id}`));
    floatingButtons[index] = { ...floatingButtons[index], ...input, updatedAt: nowIso() };
    return respond(config, { button: floatingButtons[index] });
  }
  if (method === 'delete' && path.startsWith('/floating-buttons/')) {
    const id = path.slice('/floating-buttons/'.length);
    const index = floatingButtons.findIndex((item) => item._id === id);
    if (index !== -1) floatingButtons.splice(index, 1);
    return respond(config, {});
  }

  if (method === 'get' && path === '/dynamic-links') {
    return respond(config, { links: dynamicLinks });
  }
  if (method === 'post' && path === '/dynamic-links') {
    const input = body as DynamicLinkInput;
    const link: DynamicLink = {
      _id: nextId('dl'),
      companyId: MOCK_COMPANY_ID,
      groupId: MOCK_GROUP_ID,
      ...input,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    dynamicLinks.push(link);
    return respond(config, { link }, 201);
  }
  if (method === 'put' && path.startsWith('/dynamic-links/')) {
    const id = path.slice('/dynamic-links/'.length);
    const input = body as DynamicLinkInput;
    const index = dynamicLinks.findIndex((item) => item._id === id);
    if (index === -1) return Promise.reject(new Error(`[mockAdapter] Dynamic link not found: ${id}`));
    dynamicLinks[index] = { ...dynamicLinks[index], ...input, updatedAt: nowIso() };
    return respond(config, { link: dynamicLinks[index] });
  }
  if (method === 'delete' && path.startsWith('/dynamic-links/')) {
    const id = path.slice('/dynamic-links/'.length);
    const index = dynamicLinks.findIndex((item) => item._id === id);
    if (index !== -1) dynamicLinks.splice(index, 1);
    return respond(config, {});
  }

  if (method === 'get' && path === '/menu-editor') {
    return respond(config, { menuEdit });
  }
  if (method === 'put' && path === '/menu-editor/update') {
    menuEdit = body as MenuEdit;
    return respond(config, { menuEdit });
  }

  if (method === 'get' && path === '/location-links') {
    const loc = query.locationId;
    return respond(config, { links: loc ? locationLinks.filter((l) => l.locationId === loc) : locationLinks });
  }
  if (method === 'delete' && path.startsWith('/location-links/')) {
    const id = path.slice('/location-links/'.length);
    locationLinks = locationLinks.filter((l) => l._id !== id);
    return respond(config, null, 204);
  }

  if (method === 'get' && path === '/support-chat/unread') {
    return respond(config, { count: supportTickets.filter((t) => t.status === 'open' && t.unreadForAgent > 0).length });
  }
  if (method === 'get' && path === '/support-chat/tickets') {
    const status = query.status ?? 'open';
    const search = (query.search ?? '').toLowerCase();
    const list = supportTickets.filter(
      (t) =>
        (status === 'all' || t.status === status) &&
        (!search || [t.visitorName, t.visitorEmail, t.subject, t.locationId].some((v) => v.toLowerCase().includes(search))),
    );
    return respond(config, { tickets: list, total: list.length, page: 1, limit: 50 });
  }
  const chatMatch = path.match(/^\/support-chat\/tickets\/([^/]+)(?:\/(messages|typing|close|reopen))?$/);
  if (chatMatch) {
    const [, id, action] = chatMatch;
    const found = supportTickets.find((t) => t.id === id);
    if (!found) return Promise.reject({ response: { status: 404, data: { error: 'Chat not found' } } });
    if (method === 'get' && !action) {
      supportTickets = supportTickets.map((t) => (t.id === id ? { ...t, unreadForAgent: 0 } : t));
      return respond(config, { ticket: supportTickets.find((t) => t.id === id), messages: supportMessages[id] ?? [] });
    }
    if (method === 'post' && action === 'messages') {
      const text = String((body as { text?: string }).text ?? '');
      const sent: SupportMessage = { id: nextId('sm'), sender: 'agent', text, authorName: String((body as { authorName?: string }).authorName ?? 'Support'), at: Date.now() };
      supportMessages[id] = [...(supportMessages[id] ?? []), sent];
      supportTickets = supportTickets.map((t) => (t.id === id ? { ...t, lastMessageAt: new Date().toISOString(), lastMessageFrom: 'agent', lastMessagePreview: text, messageCount: t.messageCount + 1 } : t));
      return respond(config, { message: sent }, 201);
    }
    if (method === 'post' && action === 'typing') return respond(config, null, 204);
    if (method === 'post' && (action === 'close' || action === 'reopen')) {
      const closing = action === 'close';
      supportTickets = supportTickets.map((t) => (t.id === id ? { ...t, status: closing ? 'closed' : 'open', closedAt: closing ? new Date().toISOString() : null, closedBy: closing ? 'agent' : null } : t));
      return respond(config, null, 204);
    }
    if (method === 'delete' && !action) {
      supportTickets = supportTickets.filter((t) => t.id !== id);
      delete supportMessages[id];
      return respond(config, null, 204);
    }
  }

  if (method === 'get' && path === '/launchpad') {
    return respond(config, { tiles: launchpadTiles });
  }
  if (method === 'post' && path === '/launchpad') {
    const tile: LaunchpadTile = {
      _id: nextId('lp'),
      companyId: MOCK_COMPANY_ID,
      groupId: MOCK_GROUP_ID,
      ...(body as LaunchpadTileInput),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    launchpadTiles = [...launchpadTiles, tile];
    return respond(config, { tile }, 201);
  }
  if (method === 'put' && path.startsWith('/launchpad/')) {
    const id = path.slice('/launchpad/'.length);
    launchpadTiles = launchpadTiles.map((t) =>
      t._id === id ? { ...t, ...(body as LaunchpadTileInput), updatedAt: nowIso() } : t,
    );
    return respond(config, { tile: launchpadTiles.find((t) => t._id === id) });
  }
  if (method === 'delete' && path.startsWith('/launchpad/')) {
    const id = path.slice('/launchpad/'.length);
    launchpadTiles = launchpadTiles.filter((t) => t._id !== id);
    return respond(config, null, 204);
  }

  if (method === 'get' && path === '/custom-fields') {
    return respond(config, { campaigns: customFieldCampaigns });
  }
  if (method === 'post' && path === '/custom-fields') {
    const input = body as CustomFieldCampaignInput;
    const campaign: CustomFieldCampaign = {
      _id: nextId('cf'),
      name: input.name,
      exposedFieldKeys: input.exposedFieldKeys,
      mode: input.mode,
    };
    customFieldCampaigns.push(campaign);
    return respond(config, { campaign }, 201);
  }
  if (method === 'put' && path.startsWith('/custom-fields/')) {
    const id = path.slice('/custom-fields/'.length);
    const input = body as CustomFieldCampaignInput;
    const index = customFieldCampaigns.findIndex((item) => item._id === id);
    if (index === -1) return Promise.reject(new Error(`[mockAdapter] Custom field campaign not found: ${id}`));
    customFieldCampaigns[index] = { ...customFieldCampaigns[index], ...input };
    return respond(config, { campaign: customFieldCampaigns[index] });
  }
  if (method === 'delete' && path.startsWith('/custom-fields/')) {
    const id = path.slice('/custom-fields/'.length);
    const index = customFieldCampaigns.findIndex((item) => item._id === id);
    if (index !== -1) customFieldCampaigns.splice(index, 1);
    return respond(config, {});
  }

  if (method === 'get' && path === '/banners') {
    return respond(config, { banners });
  }
  if (method === 'post' && path === '/banners') {
    const input = body as BannerInput;
    const banner: Banner = {
      _id: nextId('ban'),
      companyId: MOCK_COMPANY_ID,
      groupId: MOCK_GROUP_ID,
      ...input,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    banners.push(banner);
    return respond(config, { banner }, 201);
  }
  if (method === 'put' && path.startsWith('/banners/')) {
    const id = path.slice('/banners/'.length);
    const input = body as Partial<BannerInput>;
    const index = banners.findIndex((item) => item._id === id);
    if (index === -1) return Promise.reject(new Error(`[mockAdapter] Banner not found: ${id}`));
    banners[index] = { ...banners[index], ...input, updatedAt: nowIso() };
    return respond(config, { banner: banners[index] });
  }
  if (method === 'delete' && path.startsWith('/banners/')) {
    const id = path.slice('/banners/'.length);
    const index = banners.findIndex((item) => item._id === id);
    if (index !== -1) banners.splice(index, 1);
    return respond(config, {});
  }

  if (method === 'get' && path === '/chat-bubble') {
    return respond(config, { chatBubble });
  }
  if (method === 'put' && path === '/chat-bubble/update') {
    chatBubble = body as ChatBubbleConfig;
    return respond(config, { chatBubble });
  }

  if (method === 'get' && path === '/loader') {
    return respond(config, { loader });
  }
  if (method === 'put' && path === '/loader/update') {
    loader = body as LoaderConfig;
    return respond(config, { loader });
  }

  if (method === 'get' && path === '/conversation-style') {
    return respond(config, { conversationStyle });
  }
  if (method === 'put' && path === '/conversation-style/update') {
    conversationStyle = body as ConversationStyleConfig;
    return respond(config, { conversationStyle });
  }

  if (method === 'get' && path === '/misc-settings') {
    return respond(config, { settings: miscSettings });
  }
  if (method === 'put' && path === '/misc-settings/update') {
    miscSettings = body as MiscSettings;
    return respond(config, { settings: miscSettings });
  }

  if (method === 'get' && path === '/groups') {
    return respond(config, { groups });
  }
  if (method === 'post' && path === '/groups') {
    const input = body as GroupInput;
    const group: Group = {
      ...input,
      _id: nextId('group'),
      companyId: MOCK_COMPANY_ID,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    groups = [...groups, group];
    return respond(config, { group }, 201);
  }
  if (method === 'put' && path.startsWith('/groups/')) {
    const id = path.slice('/groups/'.length);
    const input = body as GroupInput;
    groups = groups.map((g) => (g._id === id ? { ...g, ...input, updatedAt: nowIso() } : g));
    return respond(config, { group: groups.find((g) => g._id === id) });
  }
  if (method === 'delete' && path.startsWith('/groups/')) {
    const id = path.slice('/groups/'.length);
    groups = groups.filter((g) => g._id !== id);
    return respond(config, null, 204);
  }

  if (method === 'get' && path === '/runtime/config') {
    const groupId =
      groups.find((g) => query.locationId && g.locationIds.includes(query.locationId))?._id ?? '';
    const on = { enabled: true };
    return respond(config, {
      groupId,
      features: {
        theme: { enabled: theme.enabled },
        'special-theme': { enabled: specialTheme.enabled },
        logo: on,
        buttons: on,
        'floating-buttons': on,
        'book-a-call': { enabled: bookACall.enabled },
        'dynamic-links': on,
        menu: on,
        banners: on,
        'chat-bubble': { enabled: chatBubble.enabled },
        loader: { enabled: loader.enabled },
        'conversation-style': { enabled: conversationStyle.enabled },
        misc: { enabled: miscSettings.tooltip.enabled || miscSettings.addonBanner.enabled },
        membership: { enabled: miscSettings.membership.enabled && Boolean(miscSettings.membership.url) },
        'unread-badge': { enabled: miscSettings.unreadBadge.enabled && company.hasGhlApiToken },
        'custom-fields': { enabled: customFieldCampaigns.length > 0 },
        'opportunity-tabs': { enabled: buttons.some((b) => b.surface === 'opportunity-tab') },
        launchpad: { enabled: launchpadTiles.length > 0 },
        'user-links': { enabled: miscSettings.userLinks.enabled && Boolean(query.locationId) },
      },
    });
  }

  if (method === 'post' && path === '/uploads/image') {
    return respond(config, { url: LOGO_SVG_PRIMARY });
  }

  return Promise.reject(
    new Error(`[mockAdapter] No mock handler for ${method.toUpperCase()} ${path}`),
  );
};
