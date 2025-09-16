import React from 'react';
import UserInfo from './UserInfo';
import { OwnerOrAdminOrNgoRoute } from '@/components/auth/ProtectedRoute';

const UsersDetailPage = () => {
  return (
    <OwnerOrAdminOrNgoRoute resourceType='user'>
      <UserInfo />
    </OwnerOrAdminOrNgoRoute>
  );
};

export default UsersDetailPage;
