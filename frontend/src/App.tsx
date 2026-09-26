import { ConfigProvider } from 'antd';
import { useRoutes } from 'react-router-dom';
import { CompanyProvider } from './context/CompanyContext';
import { GroupsProvider } from './context/GroupsContext';
import { SessionProvider } from './context/SessionContext';
import { BrandThemeProvider, useBrandTheme } from './context/BrandThemeContext';
import { routes } from './router/routes';

function AppRoutes() {
  return useRoutes(routes);
}

function ThemedApp() {
  const { palette } = useBrandTheme();

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: palette.primary,
          colorLink: palette.primary,
          colorInfo: palette.primary,
          colorBgLayout: 'transparent',
          borderRadius: 10,
          fontFamily:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        },
        components: {
          Layout: {
            siderBg: palette.gradientMid,
            headerBg: 'rgba(255,255,255,0.85)',
            bodyBg: 'transparent',
          },
          Menu: {
            darkItemBg: 'transparent',
            darkItemColor: 'rgba(255,255,255,0.72)',
            darkItemHoverColor: '#ffffff',
            darkItemHoverBg: palette.menuHoverBg,
            darkItemSelectedBg: palette.menuSelectedBg,
            darkItemSelectedColor: '#ffffff',
            itemBorderRadius: 10,
            itemMarginInline: 10,
            itemHeight: 42,
          },
          Card: {
            borderRadiusLG: 16,
            boxShadowTertiary: `0 1px 2px ${palette.whisper}, 0 12px 28px ${palette.softShadow}`,
          },
          Button: {
            borderRadius: 8,
            controlHeight: 38,
            fontWeight: 500,
          },
          Table: {
            borderRadiusLG: 12,
            headerBg: palette.tintBg,
            headerColor: palette.primary,
          },
          Tabs: {
            inkBarColor: palette.primary,
            itemSelectedColor: palette.primary,
            itemHoverColor: palette.primary,
          },
          Input: { borderRadius: 8, controlHeight: 38 },
          Select: { borderRadius: 8, controlHeight: 38 },
          Modal: { borderRadiusLG: 18 },
          Tag: { borderRadiusSM: 6 },
        },
      }}
    >
      <SessionProvider>
        <CompanyProvider>
          <GroupsProvider>
            <AppRoutes />
          </GroupsProvider>
        </CompanyProvider>
      </SessionProvider>
    </ConfigProvider>
  );
}

export function App() {
  return (
    <BrandThemeProvider>
      <ThemedApp />
    </BrandThemeProvider>
  );
}
