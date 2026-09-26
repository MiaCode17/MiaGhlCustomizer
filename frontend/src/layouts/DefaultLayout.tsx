import { useEffect, useState } from 'react';
import { Layout, Menu, Typography, Space, Button, Avatar, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import {
  BgColorsOutlined,
  PictureOutlined,
  LoginOutlined,
  LogoutOutlined,
  AppstoreOutlined,
  MenuOutlined,
  FormOutlined,
  ThunderboltOutlined,
  SettingOutlined,
  EyeOutlined,
  ClusterOutlined,
  CodeOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useCompany } from '../context/CompanyContext';
import { useSession } from '../context/SessionContext';
import { useBrandTheme } from '../context/BrandThemeContext';

const { Header, Sider, Content } = Layout;

interface LeafNavItem {
  key: string;
  icon?: React.ReactNode;
  label: string;
}

interface NavItem extends LeafNavItem {
  children?: LeafNavItem[];
}

const NAV_ITEMS: NavItem[] = [
  {
    key: 'custom-themes',
    icon: <BgColorsOutlined />,
    label: 'Custom Themes',
    children: [
      { key: '/miaghlcustomizer/theme/categories', label: 'Theme Categories' },
      { key: '/miaghlcustomizer/theme/occasional', label: 'Occasional Themes' },
      { key: '/miaghlcustomizer/theme/sidebar-styling', label: 'Sidebar Styling' },
      { key: '/miaghlcustomizer/theme/make-your-own', label: 'Make Your Own' },
    ],
  },
  { key: '/miaghlcustomizer/logo', icon: <PictureOutlined />, label: 'Logo' },
  { key: '/miaghlcustomizer/login-page', icon: <LoginOutlined />, label: 'Login Page' },
  {
    key: 'custom-buttons',
    icon: <AppstoreOutlined />,
    label: 'Custom Buttons',
    children: [
      { key: '/miaghlcustomizer/buttons/header', label: 'Header' },
      { key: '/miaghlcustomizer/buttons/side', label: 'Side' },
      { key: '/miaghlcustomizer/buttons/contact', label: 'Contact' },
      { key: '/miaghlcustomizer/buttons/opportunity', label: 'Opportunity' },
      { key: '/miaghlcustomizer/buttons/dashboard', label: 'Dashboard' },
      { key: '/miaghlcustomizer/buttons/bottom', label: 'Bottom' },
      { key: '/miaghlcustomizer/buttons/book-a-call', label: 'Book a Call' },
    ],
  },
  {
    key: 'menu-builder',
    icon: <MenuOutlined />,
    label: 'Menu Builder',
    children: [
      { key: '/miaghlcustomizer/menu/custom-link', label: 'Custom Menu Link' },
      { key: '/miaghlcustomizer/menu/main-nav', label: 'Main Nav' },
      { key: '/miaghlcustomizer/menu/extended-nav', label: 'Extended Nav' },
      { key: '/miaghlcustomizer/menu/settings-nav', label: 'Settings Nav' },
    ],
  },
  {
    key: 'engagement-hub',
    icon: <ThunderboltOutlined />,
    label: 'Engagement Hub',
    children: [
      { key: '/miaghlcustomizer/engagement/chat-manager', label: 'Chat Manager' },
      { key: '/miaghlcustomizer/engagement/loader', label: 'Loader' },
      { key: '/miaghlcustomizer/engagement/banners', label: 'Banners' },
      { key: '/miaghlcustomizer/engagement/conversations', label: 'Conversation Customization' },
    ],
  },
  { key: '/miaghlcustomizer/custom-fields', icon: <FormOutlined />, label: 'Custom Fields' },
  { key: '/miaghlcustomizer/misc-settings', icon: <SettingOutlined />, label: 'Misc Settings' },
  { key: '/miaghlcustomizer/preview', icon: <EyeOutlined />, label: 'Preview' },
  { key: '/miaghlcustomizer/groups', icon: <ClusterOutlined />, label: 'Location Groups' },
  { key: '/miaghlcustomizer/install', icon: <CodeOutlined />, label: 'Install Script' },
];

function findParentKey(pathname: string): string | undefined {
  return NAV_ITEMS.find((item) => item.children?.some((child) => child.key === pathname))?.key;
}

function findCurrentLeaf(pathname: string): LeafNavItem | undefined {
  for (const item of NAV_ITEMS) {
    if (item.key === pathname) return item;
    const child = item.children?.find((c) => c.key === pathname);
    if (child) return { ...child, icon: item.icon };
  }
  return undefined;
}

export function DefaultLayout() {
  const { company } = useCompany();
  const { user, logout } = useSession();
  const { palette } = useBrandTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };
  const current = findCurrentLeaf(location.pathname);
  const [openKeys, setOpenKeys] = useState<string[]>(() => {
    const parent = findParentKey(location.pathname);
    return parent ? [parent] : [];
  });

  useEffect(() => {
    const parent = findParentKey(location.pathname);
    if (parent) {
      setOpenKeys((prev) => (prev.includes(parent) ? prev : [...prev, parent]));
    }
  }, [location.pathname]);

  const menuItems: MenuProps['items'] = NAV_ITEMS.map((item) =>
    item.children
      ? {
          key: item.key,
          icon: item.icon,
          label: item.label,
          children: item.children.map((child) => ({ key: child.key, label: child.label })),
        }
      : { key: item.key, icon: item.icon, label: item.label },
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={256}
        theme="dark"
        className="app-sider"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'sticky',
          top: 0,
          background: `linear-gradient(180deg, var(--brand-gradient-top, ${palette.gradientTop}) 0%, var(--brand-gradient-mid, ${palette.gradientMid}) 55%, var(--brand-gradient-bottom, ${palette.gradientBottom}) 100%)`,
        }}
      >
        <div
          className="flex items-center gap-3 px-4 app-sider-brand"
          style={{ minHeight: 76, padding: '18px 16px', position: 'relative' }}
        >
          <div
            className="app-sider-logo"
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              flexShrink: 0,
              background: `linear-gradient(135deg, var(--brand-primary-hover, ${palette.primaryHover}), var(--brand-primary, ${palette.primary}))`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 6px 18px var(--brand-glow, ${palette.glow}), inset 0 0 0 1px rgba(255,255,255,0.18)`,
            }}
          >
            <Typography.Text style={{ color: 'var(--brand-on-primary, #fff)', fontWeight: 700, fontSize: 17 }}>
              M
            </Typography.Text>
          </div>
          <div style={{ lineHeight: 1.25, flex: 1, minWidth: 0 }}>
            <Typography.Text style={{ color: '#ffffff', fontWeight: 600, fontSize: 15, display: 'block' }}>
              Mia GHL
            </Typography.Text>
            <Space size={6} align="center">
              <Typography.Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>
                Customizer
              </Typography.Text>
              <Tooltip title="Chrome follows your active theme's color">
                <span
                  className="app-brand-pulse"
                  style={{ background: `var(--brand-accent, ${palette.accent})` }}
                />
              </Tooltip>
            </Space>
          </div>
        </div>
        <div className="app-sider-divider" />
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[location.pathname]}
          openKeys={openKeys}
          onOpenChange={(keys) => setOpenKeys(keys)}
          onClick={({ key }) => navigate(key)}
          items={menuItems}
          style={{ background: 'transparent', padding: '0 0 12px' }}
        />
        {user && (
          <div className="app-sider-footer">
            <Avatar
              size={32}
              style={{
                background: `linear-gradient(135deg, var(--brand-primary-hover, ${palette.primaryHover}), var(--brand-primary, ${palette.primary}))`,
                color: 'var(--brand-on-primary, #fff)',
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {user.email.charAt(0).toUpperCase()}
            </Avatar>
            <div style={{ minWidth: 0, flex: 1 }}>
              <Typography.Text
                style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, display: 'block' }}
                ellipsis
              >
                {user.email}
              </Typography.Text>
              <Typography.Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>
                Signed in
              </Typography.Text>
            </div>
          </div>
        )}
      </Sider>
      <Layout>
        <Header className="app-header flex items-center justify-between px-6">
          <Space size={10}>
            <span
              className="app-header-icon"
              style={{ color: `var(--brand-primary, ${palette.primary})`, fontSize: 18 }}
            >
              {current?.icon}
            </span>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {current?.label ?? 'Customizer'}
            </Typography.Title>
          </Space>
          <Space size={16}>
            {company && (
              <Typography.Text type="secondary">{company.name}</Typography.Text>
            )}
            {user && (
              <Button icon={<LogoutOutlined />} onClick={handleLogout}>
                Log out
              </Button>
            )}
          </Space>
        </Header>
        <Content style={{ padding: '28px 32px' }}>
          <div key={location.pathname} className="app-page-transition">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
