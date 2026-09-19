import { ConfigProvider } from 'antd';
import { useRoutes } from 'react-router-dom';
import { CompanyProvider } from './context/CompanyContext';
import { SessionProvider } from './context/SessionContext';
import { routes } from './router/routes';

function AppRoutes() {
  return useRoutes(routes);
}

export function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#7a1f2b',
          colorLink: '#7a1f2b',
          colorInfo: '#7a1f2b',
          colorBgLayout: 'transparent',
          borderRadius: 10,
          fontFamily:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        },
        components: {
          Layout: {
            siderBg: '#3a0b14',
            headerBg: 'rgba(255,255,255,0.85)',
            bodyBg: 'transparent',
          },
          Menu: {
            darkItemBg: 'transparent',
            darkItemColor: 'rgba(255,255,255,0.72)',
            darkItemHoverColor: '#ffffff',
            darkItemHoverBg: 'rgba(255,255,255,0.08)',
            darkItemSelectedBg: '#5c1220',
            darkItemSelectedColor: '#ffffff',
            itemBorderRadius: 10,
            itemMarginInline: 10,
            itemHeight: 42,
          },
          Card: {
            borderRadiusLG: 16,
            boxShadowTertiary:
              '0 1px 2px rgba(122,31,43,0.04), 0 12px 28px rgba(122,31,43,0.08)',
          },
          Button: {
            borderRadius: 8,
            controlHeight: 38,
            fontWeight: 500,
          },
          Table: {
            borderRadiusLG: 12,
            headerBg: '#fdf0f1',
            headerColor: '#7a1f2b',
          },
          Tabs: {
            inkBarColor: '#7a1f2b',
            itemSelectedColor: '#7a1f2b',
            itemHoverColor: '#7a1f2b',
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
          <AppRoutes />
        </CompanyProvider>
      </SessionProvider>
    </ConfigProvider>
  );
}
