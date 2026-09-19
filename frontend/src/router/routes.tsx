import { lazy, Suspense } from 'react';
import { Navigate, RouteObject } from 'react-router-dom';
import { Spin } from 'antd';
import { BlankLayout } from '../layouts/BlankLayout';
import { DefaultLayout } from '../layouts/DefaultLayout';
import { LoginPage } from '../pages/auth/LoginPage';
import { RouteGuard } from './RouteGuard';

const ReadyMadeThemesPage = lazy(() =>
  import('../pages/customizer/theme-builder/ReadyMadeThemesPage').then((m) => ({
    default: m.ReadyMadeThemesPage,
  })),
);
const MakeYourOwnThemePage = lazy(() =>
  import('../pages/customizer/theme-builder/MakeYourOwnThemePage').then((m) => ({
    default: m.MakeYourOwnThemePage,
  })),
);
const ThemeGalleryPage = lazy(() =>
  import('../pages/customizer/theme-builder/ThemeGalleryPage').then((m) => ({
    default: m.ThemeGalleryPage,
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
const DynamicLinksPage = lazy(() =>
  import('../pages/customizer/dynamic-links/DynamicLinksPage').then((m) => ({
    default: m.DynamicLinksPage,
  })),
);
const MenuEditorPage = lazy(() =>
  import('../pages/customizer/menu-editor/MenuEditorPage').then((m) => ({
    default: m.MenuEditorPage,
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
const MiscSettingsPage = lazy(() =>
  import('../pages/customizer/misc-settings/MiscSettingsPage').then((m) => ({
    default: m.MiscSettingsPage,
  })),
);
const PreviewPage = lazy(() =>
  import('../pages/customizer/preview/PreviewPage').then((m) => ({ default: m.PreviewPage })),
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
      { path: '/miaghlcustomizer/theme/ready-made', element: lazyPage(<ReadyMadeThemesPage />) },
      { path: '/miaghlcustomizer/theme/make-your-own', element: lazyPage(<MakeYourOwnThemePage />) },
      { path: '/miaghlcustomizer/theme/gallery', element: lazyPage(<ThemeGalleryPage />) },
      { path: '/miaghlcustomizer/special-theme', element: lazyPage(<SpecialThemePage />) },
      { path: '/miaghlcustomizer/logo', element: lazyPage(<LogoPage />) },
      { path: '/miaghlcustomizer/login-page', element: lazyPage(<LoginPageBuilderPage />) },
      { path: '/miaghlcustomizer/buttons/header', element: lazyPage(<HeaderButtonPage />) },
      { path: '/miaghlcustomizer/buttons/book-a-call', element: lazyPage(<BookACallPage />) },
      { path: '/miaghlcustomizer/buttons/floating-right', element: lazyPage(<FloatingRightButtonPage />) },
      { path: '/miaghlcustomizer/buttons/floating-bottom', element: lazyPage(<FloatingBottomButtonPage />) },
      { path: '/miaghlcustomizer/dynamic-links', element: lazyPage(<DynamicLinksPage />) },
      { path: '/miaghlcustomizer/menu-editor', element: lazyPage(<MenuEditorPage />) },
      { path: '/miaghlcustomizer/custom-fields', element: lazyPage(<CustomFieldsPage />) },
      { path: '/miaghlcustomizer/banners', element: lazyPage(<BannersPage />) },
      { path: '/miaghlcustomizer/chat-bubble', element: lazyPage(<ChatBubblePage />) },
      { path: '/miaghlcustomizer/loader', element: lazyPage(<LoaderPage />) },
      { path: '/miaghlcustomizer/misc-settings', element: lazyPage(<MiscSettingsPage />) },
      { path: '/miaghlcustomizer/preview', element: lazyPage(<PreviewPage />) },
    ],
  },
  { path: '/', element: <Navigate to="/miaghlcustomizer/theme/ready-made" replace /> },
  { path: '*', element: <Navigate to="/miaghlcustomizer/theme/ready-made" replace /> },
];
