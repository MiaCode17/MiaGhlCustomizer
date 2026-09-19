import { useEffect, useState } from 'react';
import { Layout, Menu, Typography, Tag, Space } from 'antd';
import type { MenuProps } from 'antd';
import {
  BgColorsOutlined,
  GiftOutlined,
  PictureOutlined,
  LoginOutlined,
  AppstoreOutlined,
  LinkOutlined,
  MenuOutlined,
  FormOutlined,
  NotificationOutlined,
  MessageOutlined,
  LoadingOutlined,
  SettingOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useCompany } from '../context/CompanyContext';

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
      { key: '/miaghlcustomizer/theme/ready-made', label: 'Ready Made' },
      { key: '/miaghlcustomizer/theme/make-your-own', label: 'Make Your Own' },
      { key: '/miaghlcustomizer/theme/gallery', label: 'Theme Gallery' },
    ],
  },
  { key: '/miaghlcustomizer/special-theme', icon: <GiftOutlined />, label: 'Special Theme' },
  { key: '/miaghlcustomizer/logo', icon: <PictureOutlined />, label: 'Logo' },
  { key: '/miaghlcustomizer/login-page', icon: <LoginOutlined />, label: 'Login Page' },
  {
    key: 'custom-buttons',
    icon: <AppstoreOutlined />,
    label: 'Custom Buttons',
    children: [
      { key: '/miaghlcustomizer/buttons/header', label: 'Header button' },
      { key: '/miaghlcustomizer/buttons/book-a-call', label: 'Book a Call' },
      { key: '/miaghlcustomizer/buttons/floating-right', label: 'Floating Right button' },
      { key: '/miaghlcustomizer/buttons/floating-bottom', label: 'Floating Bottom Button' },
    ],
  },
  { key: '/miaghlcustomizer/dynamic-links', icon: <LinkOutlined />, label: 'Dynamic Links' },
  { key: '/miaghlcustomizer/menu-editor', icon: <MenuOutlined />, label: 'Menu Editor' },
  { key: '/miaghlcustomizer/custom-fields', icon: <FormOutlined />, label: 'Custom Fields' },
  { key: '/miaghlcustomizer/banners', icon: <NotificationOutlined />, label: 'Banners' },
  { key: '/miaghlcustomizer/chat-bubble', icon: <MessageOutlined />, label: 'Chat Bubble' },
  { key: '/miaghlcustomizer/loader', icon: <LoadingOutlined />, label: 'Loader' },
  { key: '/miaghlcustomizer/misc-settings', icon: <SettingOutlined />, label: 'Misc Settings' },
  { key: '/miaghlcustomizer/preview', icon: <EyeOutlined />, label: 'Preview' },
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

const PLAN_COLORS: Record<string, string> = {
  free: '#64748b',
  pro: '#7a1f2b',
  agency: '#a16207',
};

export function DefaultLayout() {
  const { company } = useCompany();
  const navigate = useNavigate();
  const location = useLocation();
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
        width={252}
        theme="dark"
        className="app-sider"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'sticky',
          top: 0,
          background: 'linear-gradient(180deg, #4a0f1a 0%, #300a11 55%, #250509 100%)',
        }}
      >
        <div
          className="flex items-center gap-3 px-4"
          style={{ minHeight: 72, padding: '16px', position: 'relative' }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              flexShrink: 0,
              background: 'linear-gradient(135deg, #c96b7e, #7a1f2b)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.15)',
            }}
          >
            <Typography.Text style={{ color: '#ffffff', fontWeight: 700, fontSize: 16 }}>M</Typography.Text>
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <Typography.Text style={{ color: '#ffffff', fontWeight: 600, fontSize: 15, display: 'block' }}>
              Mia GHL
            </Typography.Text>
            <Typography.Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>
              Customizer
            </Typography.Text>
          </div>
        </div>
        <div
          style={{
            height: 1,
            margin: '0 16px 12px',
            background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.55), transparent)',
          }}
        />
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
      </Sider>
      <Layout>
        <Header
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid rgba(122,31,43,0.14)',
          }}
          className="flex items-center justify-between px-6"
        >
          <Space size={10}>
            <span style={{ color: '#7a1f2b', fontSize: 18 }}>{current?.icon}</span>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {current?.label ?? 'Customizer'}
            </Typography.Title>
          </Space>
          {company && (
            <Space size={10}>
              <Typography.Text type="secondary">{company.name}</Typography.Text>
              <Tag
                color={PLAN_COLORS[company.plan]}
                style={{ textTransform: 'capitalize', borderRadius: 999, padding: '2px 12px' }}
              >
                {company.plan}
              </Tag>
            </Space>
          )}
        </Header>
        <Content style={{ padding: '28px 32px' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
