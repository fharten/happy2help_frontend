'use client';
<<<<<<< HEAD
import jwt from 'jsonwebtoken';
import Cookies from 'js-cookie';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
=======

import React from 'react';
>>>>>>> 484c6b3fed525376ef713c3c969fccaafade65bd
import NgoProfileForm from './NgoProfileForm';
import UserProfileForm from './UserProfileForm';
import { useEffect, useState } from 'react';
import { getUserType, isAuthenticated } from '@/lib/auth';
import { useRouter } from 'next/navigation';

<<<<<<< HEAD
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
=======
const ProfilePage = () => {
  const [userType, setUserType] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const type = getUserType();
    setUserType(type);
  }, [router]);

  if (!userType) return <div>Lade...</div>;

  return <>{userType === 'users' ? <UserProfileForm /> : <NgoProfileForm />}</>;
>>>>>>> 484c6b3fed525376ef713c3c969fccaafade65bd
};

export default ProfilePage;
