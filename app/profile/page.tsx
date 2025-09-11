import React from 'react';
import NgoProfileForm from './NgoProfileForm';
import UserProfileForm from './UserProfileForm';

const ProfilePage = ({ entity = 'ngo' }) => {
  return (
    <>
      {entity === 'user' ? (
        <UserProfileForm userId='80feec7c-dc9f-498d-ab93-4d8a434f6e33' />
      ) : (
        <NgoProfileForm ngoId='8604ce87-0656-4284-9200-3f1732a33cc2' />
      )}
    </>
  );
};

export default ProfilePage;
