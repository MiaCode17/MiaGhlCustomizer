import { Outlet } from 'react-router-dom';

export function BlankLayout() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #16253e 0%, #0f1b2d 55%, #09111d 100%)',
      }}
    >
      <Outlet />
    </div>
  );
}
