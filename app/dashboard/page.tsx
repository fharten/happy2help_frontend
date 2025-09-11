import NgoDashboard from "./NgoDashboard";
import UserDashboard from "./UserDashboard";

const ProfilePage = ({ entity = "user" }) => {
  return (
    <>
      {entity === "user" ? (
        <UserDashboard userId="19398e16-283e-408e-8c1b-460979cd6856" />
      ) : (
        <NgoDashboard ngoId="345aa229-7677-4249-ad89-8cba5f632476" />
      )}
    </>
  );
};

export default ProfilePage;
