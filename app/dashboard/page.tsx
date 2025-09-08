import NgoDashboard from './NgoDashboard';
import UserDashboard from './UserDashboard';

const ProfilePage = ({ entity = 'user' }) => {
  return (
    <>
      {entity === 'user' ? (
        <UserDashboard userId='70e3f3e2-0800-41a4-9eab-adb0f58a6c13' />
      ) : (
        <NgoDashboard ngoId='8604ce87-0656-4284-9200-3f1732a33cc2' />
      )}
    </>
  );
};

export default ProfilePage;
