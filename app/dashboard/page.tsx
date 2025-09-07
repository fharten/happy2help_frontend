import NgoDashboard from './NgoDashboard';
import UserDashboard from './UserDashboard';

const ProfilePage = ({ entity = 'user' }) => {
  return (
    <>
      {entity === 'user' ? (
        <UserDashboard userId='80feec7c-dc9f-498d-ab93-4d8a434f6e33' />
      ) : (
        <NgoDashboard ngoId='8604ce87-0656-4284-9200-3f1732a33cc2' />
      )}
    </>
  );
};

export default ProfilePage;
