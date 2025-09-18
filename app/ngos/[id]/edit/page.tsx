import { UserOwnerOnlyRoute } from '@/components/auth/ProtectedRoute';
import NgoEditForm from './NgoEditForm';

const NgoEditPage = () => {
  return (
    <UserOwnerOnlyRoute>
      <NgoEditForm />
    </UserOwnerOnlyRoute>
  );
};

export default NgoEditPage;
