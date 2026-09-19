import { Spin } from 'antd';
import { Navigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useSession();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
