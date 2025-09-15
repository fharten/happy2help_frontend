'use client';

import NgoDashboard from './NgoDashboard';
import UserDashboard from './UserDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { getUserEntityType } from '@/lib/user-utils';

const DashboardPage = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div>Lade...</div>
      </div>
    );
  }

  const entityType = getUserEntityType(user!);

  return <>{entityType === 'user' ? <UserDashboard /> : <NgoDashboard />}</>;
};

export default DashboardPage;
