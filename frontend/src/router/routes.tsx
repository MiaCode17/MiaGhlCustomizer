import { lazy, Suspense } from 'react';
import { Navigate, RouteObject } from 'react-router-dom';
import { Spin } from 'antd';
import { BlankLayout } from '../layouts/BlankLayout';
import { DefaultLayout } from '../layouts/DefaultLayout';
import { LoginPage } from '../pages/auth/LoginPage';
import { RouteGuard } from './RouteGuard';

const ThemeCategoriesPage = lazy(() =>
  import('../pages/customizer/theme-builder/ThemeCategoriesPage').then((m) => ({
    default: m.ThemeCategoriesPage,
  })),
);
const SidebarStylingPage = lazy(() =>
  import('../pages/customizer/theme-builder/SidebarStylingPage').then((m) => ({
    default: m.SidebarStylingPage,
  })),
);
const MakeYourOwnThemePage = lazy(() =>
  import('../pages/customizer/theme-builder/MakeYourOwnThemePage').then((m) => ({
    default: m.MakeYourOwnThemePage,
  })),
);
const SpecialThemePage = lazy(() =>
  import('../pages/customizer/special-theme/SpecialThemePage').then((m) => ({
    default: m.SpecialThemePage,
  })),
);
const LogoPage = lazy(() =>
  import('../pages/customizer/logo/LogoPage').then((m) => ({ default: m.LogoPage })),
);
const LoginPageBuilderPage = lazy(() =>
  import('../pages/customizer/login-page/LoginPageBuilderPage').then((m) => ({
    default: m.LoginPageBuilderPage,
  })),
);
const HeaderButtonPage = lazy(() =>
  import('../pages/customizer/button-builder/HeaderButtonPage').then((m) => ({
    default: m.HeaderButtonPage,
  })),
);
const DashboardButtonPage = lazy(() =>
  import('../pages/customizer/button-builder/DashboardButtonPage').then((m) => ({
    default: m.DashboardButtonPage,
  })),
);
const ContactButtonPage = lazy(() =>
  import('../pages/customizer/button-builder/ContactButtonPage').then((m) => ({
    default: m.ContactButtonPage,
  })),
);
const OpportunityButtonPage = lazy(() =>
  import('../pages/customizer/button-builder/OpportunityButtonPage').then((m) => ({
    default: m.OpportunityButtonPage,
  })),
);
const BookACallPage = lazy(() =>
  import('../pages/customizer/button-builder/BookACallPage').then((m) => ({
    default: m.BookACallPage,
  })),
);
const FloatingRightButtonPage = lazy(() =>
  import('../pages/customizer/floating-buttons/FloatingRightButtonPage').then((m) => ({
    default: m.FloatingRightButtonPage,
  })),
);
const FloatingBottomButtonPage = lazy(() =>
  import('../pages/customizer/floating-buttons/FloatingBottomButtonPage').then((m) => ({
    default: m.FloatingBottomButtonPage,
  })),
);
const MainNavPage = lazy(() =>
  import('../pages/customizer/menu-editor/MainNavPage').then((m) => ({ default: m.MainNavPage })),
);
const ExtendedNavPage = lazy(() =>
  import('../pages/customizer/menu-editor/ExtendedNavPage').then((m) => ({
    default: m.ExtendedNavPage,
  })),
);
const SettingsNavPage = lazy(() =>
  import('../pages/customizer/menu-editor/SettingsNavPage').then((m) => ({
    default: m.SettingsNavPage,
  })),
);
const DynamicLinksPage = lazy(() =>
  import('../pages/customizer/dynamic-links/DynamicLinksPage').then((m) => ({
    default: m.DynamicLinksPage,
  })),
);
const CustomFieldsPage = lazy(() =>
  import('../pages/customizer/custom-fields/CustomFieldsPage').then((m) => ({
    default: m.CustomFieldsPage,
  })),
);
const BannersPage = lazy(() =>
  import('../pages/customizer/banners/BannersPage').then((m) => ({ default: m.BannersPage })),
);
const ChatBubblePage = lazy(() =>
  import('../pages/customizer/chat-bubble/ChatBubblePage').then((m) => ({
    default: m.ChatBubblePage,
  })),
);
const LoaderPage = lazy(() =>
  import('../pages/customizer/loader/LoaderPage').then((m) => ({ default: m.LoaderPage })),
);
const ConversationCustomizationPage = lazy(() =>
  import('../pages/customizer/conversation-style/ConversationCustomizationPage').then((m) => ({
    default: m.ConversationCustomizationPage,
  })),
);
const MiscSettingsPage = lazy(() =>
  import('../pages/customizer/misc-settings/MiscSettingsPage').then((m) => ({
    default: m.MiscSettingsPage,
  })),
);
const PreviewPage = lazy(() =>
  import('../pages/customizer/preview/PreviewPage').then((m) => ({ default: m.PreviewPage })),
);

const GroupsPage = lazy(() =>
  import('../pages/customizer/groups/GroupsPage').then((m) => ({ default: m.GroupsPage })),
);
const InstallPage = lazy(() =>
  import('../pages/customizer/install/InstallPage').then((m) => ({ default: m.InstallPage })),
);

function lazyPage(node: React.ReactNode) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Spin size="large" />
        </div>
      }
    >
      {node}
    </Suspense>
  );
}

export const routes: RouteObject[] = [
  {
    element: <BlankLayout />,
    children: [{ path: '/login', element: lazyPage(<LoginPage />) }],
  },
  {
    element: (
      <RouteGuard>
        <DefaultLayout />
      </RouteGuard>
    ),
    children: [
      { path: '/miaghlcustomizer/theme/categories', element: lazyPage(<ThemeCategoriesPage />) },
      { path: '/miaghlcustomizer/theme/occasional', element: lazyPage(<SpecialThemePage />) },
      { path: '/miaghlcustomizer/theme/sidebar-styling', element: lazyPage(<SidebarStylingPage />) },
      { path: '/miaghlcustomizer/theme/make-your-own', element: lazyPage(<MakeYourOwnThemePage />) },
      { path: '/miaghlcustomizer/logo', element: lazyPage(<LogoPage />) },
      { path: '/miaghlcustomizer/login-page', element: lazyPage(<LoginPageBuilderPage />) },
      { path: '/miaghlcustomizer/buttons/header', element: lazyPage(<HeaderButtonPage />) },
      { path: '/miaghlcustomizer/buttons/side', element: lazyPage(<FloatingRightButtonPage />) },
      { path: '/miaghlcustomizer/buttons/contact', element: lazyPage(<ContactButtonPage />) },
      { path: '/miaghlcustomizer/buttons/opportunity', element: lazyPage(<OpportunityButtonPage />) },
      { path: '/miaghlcustomizer/buttons/dashboard', element: lazyPage(<DashboardButtonPage />) },
      { path: '/miaghlcustomizer/buttons/bottom', element: lazyPage(<FloatingBottomButtonPage />) },
      { path: '/miaghlcustomizer/buttons/book-a-call', element: lazyPage(<BookACallPage />) },
      { path: '/miaghlcustomizer/menu/custom-link', element: lazyPage(<DynamicLinksPage />) },
      { path: '/miaghlcustomizer/menu/main-nav', element: lazyPage(<MainNavPage />) },
      { path: '/miaghlcustomizer/menu/extended-nav', element: lazyPage(<ExtendedNavPage />) },
      { path: '/miaghlcustomizer/menu/settings-nav', element: lazyPage(<SettingsNavPage />) },
      { path: '/miaghlcustomizer/custom-fields', element: lazyPage(<CustomFieldsPage />) },
      { path: '/miaghlcustomizer/engagement/chat-manager', element: lazyPage(<ChatBubblePage />) },
      { path: '/miaghlcustomizer/engagement/loader', element: lazyPage(<LoaderPage />) },
      { path: '/miaghlcustomizer/engagement/banners', element: lazyPage(<BannersPage />) },
      {
        path: '/miaghlcustomizer/engagement/conversations',
        element: lazyPage(<ConversationCustomizationPage />),
      },
      { path: '/miaghlcustomizer/misc-settings', element: lazyPage(<MiscSettingsPage />) },
      { path: '/miaghlcustomizer/preview', element: lazyPage(<PreviewPage />) },
      { path: '/miaghlcustomizer/groups', element: lazyPage(<GroupsPage />) },
      { path: '/miaghlcustomizer/install', element: lazyPage(<InstallPage />) },
    ],
  },
  { path: '/', element: <Navigate to="/miaghlcustomizer/theme/categories" replace /> },
  { path: '*', element: <Navigate to="/miaghlcustomizer/theme/categories" replace /> },
];
