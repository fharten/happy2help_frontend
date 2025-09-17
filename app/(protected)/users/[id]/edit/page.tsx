import { UserOwnerOnlyRoute } from '@/components/auth/ProtectedRoute';
import UserEditForm from './UserEditForm';

const UserEditPage = () => {
  return (
    <UserOwnerOnlyRoute>
      <UserEditForm />
    </UserOwnerOnlyRoute>
  );
};

export default UserEditPage;
