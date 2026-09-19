import { Outlet } from 'react-router-dom';

export function BlankLayout() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #4a0f1a 0%, #300a11 55%, #250509 100%)',
      }}
    >
      <Outlet />
    </div>
  );
}
