// import NgoDashboard from './NgoDashboard';
import UserDashboard from './UserDashboard';

const DashboardPage = ({ entity = 'user' }) => {
  return (
    <>
      {entity === 'user' ? (
        <UserDashboard userId='e98d14dc-2f2d-465a-975a-bbe83841af81' />
      ) : (
        <div>
          {/* <NgoDashboard ngoId='8604ce87-0656-4284-9200-3f1732a33cc2' /> */}
        </div>
      )}
    </>
  );
};

export default DashboardPage;
