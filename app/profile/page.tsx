'use client';
import jwt from 'jsonwebtoken';
import Cookies from 'js-cookie';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NgoProfileForm from './NgoProfileForm';
import UserProfileForm from './UserProfileForm';

const ProfilePage = ({ entity = 'ngo' }) => {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('token');

    if (!token) {
      router.replace('/login'); // If no token is found, redirect to login page
      return;
    }

    // Validate the token by making an API call
    const validateToken = async () => {
      try {
        const res = await fetch('/api/protected', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Token validation failed');
      } catch (error) {
        console.error(error);
        router.replace('/'); // Redirect to login if token validation fails
      }
    };

    validateToken();
  }, [router]);

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
