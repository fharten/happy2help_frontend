import React from 'react';
import NgoProfileForm from './NgoProfileForm';
import UserProfileForm from './UserProfileForm';

const ProfilePage = ({ entity = 'user' }) => {
  return (
    <>
      {entity === 'user' ? (
        <UserProfileForm userId='eacf848a-d5bc-48c7-864d-a43688404938' />
      ) : (
        <NgoProfileForm ngoId='9f8f3507-ab92-4511-b3e4-48a838b12965' />
      )}
    </>
  );
};

export default ProfilePage;
