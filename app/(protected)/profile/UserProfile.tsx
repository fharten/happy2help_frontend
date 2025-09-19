'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ButtonComponent from '@/components/ButtonComponent';
import Image from 'next/image';
import {
  Edit,
  MapPin,
  Calendar,
  Mail,
  Phone,
  User as UserIcon,
  Eye,
} from 'lucide-react';
import { swrFetcher, useAuth } from '@/contexts/AuthContext';

interface Skill {
  id: string;
  name: string;
}

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  image: string;
  skills: Skill[];
  ngoMemberships: string[];
  city: string;
  state: string;
  zipCode?: number;
  yearOfBirth?: number;
  contactEmail?: string;
  phone?: string;
  createdAt: string;
}

const UserProfile = () => {
  const { user } = useAuth();
  const userId = user?.id;

  const router = useRouter();

  const {
    data: userData,
    isLoading,
    error,
  } = useSWR<UserProfile>(
    userId ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${userId}` : null,
    swrFetcher,
  );

  const [hasImgError, setHasImgError] = useState(false);

  if (isLoading || !userData)
    return (
      <div className='container-site'>
        <div className='bg-light-mint/10 backdrop-blur-xl rounded-[2rem] p-8 lg:p-10 text-center'>
          <div className='text-prussian font-medium'>Lade Profil...</div>
        </div>
      </div>
    );

    
  if (error)
    return (
      <div className='container-site'>
        <div className='bg-red-50/80 backdrop-blur-xl rounded-[2rem] p-8 lg:p-10 text-center border border-red-200'>
          <div className='text-red-700 font-medium'>
            Fehler beim Laden: {error.message}
          </div>
        </div>
      </div>
    );

  const userImage = userData?.image || '/images/users/default-user.jpg';

  const imageUrl =
    userImage.startsWith('http') || userImage.startsWith('/')
      ? userImage
      : `/images/projects/${userImage}`;



  return (
    <div className='container-site'>
      <Card className='bg-light-mint/10 backdrop-blur-xl border-light-mint/20 shadow-xl'>
        <CardHeader className='text-center pb-6'>
          <div className='flex flex-col items-center gap-6'>
            <div className='relative'>
              <div className='relative w-32 h-32'>
                {hasImgError ? (
                  <div className='w-32 h-32 rounded-full border-4 border-light-mint/40 shadow-lg bg-prussian/10 flex items-center justify-center text-prussian font-semibold'>
                    {userData.firstName?.[0]}
                    {userData.lastName?.[0]}
                  </div>
                ) : imageUrl.startsWith('http') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt={`Profilbild von ${userData.firstName} ${userData.lastName}`}
                    className='w-full h-full rounded-full object-cover border-4 border-light-mint/40 shadow-lg'
                    onError={() => setHasImgError(true)}
                  />
                ) : (
                  <Image
                    src={imageUrl}
                    alt={`Profilbild von ${userData.firstName} ${userData.lastName}`}
                    fill
                    className='rounded-full object-cover border-4 border-light-mint/40 shadow-lg'
                    sizes='128px'
                    onError={() => setHasImgError(true)}
                  />
                )}
              </div>
            </div>
            <div className='space-y-2'>
              <CardTitle className='text-3xl font-bold text-prussian'>
                {userData.firstName} {userData.lastName}
              </CardTitle>
              <div className='flex items-center gap-2 text-prussian/70'>
                <MapPin size={16} />
                <span>
                  {userData.zipCode && `${userData.zipCode} `}
                  {userData.city}, {userData.state}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className='space-y-8'>
          {/* Persönliche Informationen */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold text-prussian border-b border-light-mint/30 pb-2 flex items-center gap-2'>
              <UserIcon size={20} />
              Persönliche Informationen
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {userData.yearOfBirth && (
                <div className='flex items-center gap-3'>
                  <Calendar size={16} className='text-prussian/60' />
                  <div>
                    <div className='text-sm text-prussian/60'>Geburtsjahr</div>
                    <div className='font-medium text-prussian'>
                      {userData.yearOfBirth}
                    </div>
                  </div>
                </div>
              )}
              <div className='flex items-center gap-3'>
                <Calendar size={16} className='text-prussian/60' />
                <div>
                  <div className='text-sm text-prussian/60'>
                    Registriert seit
                  </div>
                  <div className='font-medium text-prussian'>
                    {new Date(userData.createdAt).toLocaleDateString('de-DE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Kontaktinformationen */}
          {(userData.contactEmail || userData.phone) && (
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold text-prussian border-b border-light-mint/30 pb-2 flex items-center gap-2'>
                <Mail size={20} />
                Kontaktinformationen
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {userData.contactEmail && (
                  <div className='flex items-center gap-3'>
                    <Mail size={16} className='text-prussian/60' />
                    <div>
                      <div className='text-sm text-prussian/60'>E-Mail</div>
                      <div className='font-medium text-prussian'>
                        {userData.contactEmail}
                      </div>
                    </div>
                  </div>
                )}
                {userData.phone && (
                  <div className='flex items-center gap-3'>
                    <Phone size={16} className='text-prussian/60' />
                    <div>
                      <div className='text-sm text-prussian/60'>Telefon</div>
                      <div className='font-medium text-prussian'>
                        {userData.phone}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fähigkeiten */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold text-prussian border-b border-light-mint/30 pb-2'>
              Fähigkeiten
            </h3>
            <div className='flex flex-wrap gap-2'>
              {userData.skills && userData.skills.length > 0 ? (
                userData.skills.map((skill) => (
                  <Badge
                    key={skill.id}
                    variant='secondary'
                    className='bg-light-mint/20 text-prussian border-light-mint/30 hover:bg-light-mint/30'
                  >
                    {skill.name}
                  </Badge>
                ))
              ) : (
                <span className='text-prussian/60'>
                  Keine Fähigkeiten angegeben
                </span>
              )}
            </div>
          </div>

          {/* Vereinsmitgliedschaften */}
          {userData.ngoMemberships && userData.ngoMemberships.length > 0 && (
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold text-prussian border-b border-light-mint/30 pb-2'>
                Vereinsmitgliedschaften
              </h3>
              <div className='flex flex-wrap gap-2'>
                {userData.ngoMemberships.map(
                  (membership: string, index: number) => (
                    <Badge
                      key={index}
                      variant='outline'
                      className='border-light-mint/40 text-prussian hover:bg-light-mint/10'
                    >
                      {membership}
                    </Badge>
                  ),
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className='pt-6 border-t border-light-mint/20'>
            <div className='flex flex-col sm:flex-row gap-4'>
              <ButtonComponent
                variant='primary'
                size='lg'
                onClick={() => router.push('/profile/edit')}
                className='flex-1'
              >
                <Edit size={18} className='mr-2' />
                Profil bearbeiten
              </ButtonComponent>
              <ButtonComponent
                variant='secondary'
                size='lg'
                onClick={() => router.push(`/users/${userId}`)}
                className='flex-1'
              >
                <Eye size={18} className='mr-2' />
                Öffentliches Profil ansehen
              </ButtonComponent>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
