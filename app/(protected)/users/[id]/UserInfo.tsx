'use client';

import React from 'react';
import useSWR from 'swr';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { authenticatedFetcher } from '@/lib/auth';
import { MapPin, Calendar, Mail, Phone, User as UserIcon } from 'lucide-react';

interface UserProfileInfo {
  id: string;
  firstname: string;
  lastname: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  description?: string;
  city?: string;
  country?: string;
  skills?: Array<{ id: string; name: string }>;
  projects?: Array<{ id: string; name: string }>;
  createdAt: string;
  updatedAt: string;
  image?: string;
  zipCode?: string;
  state?: string;
  yearOfBirth?: string;
  contactEmail?: string;
  ngoMemberships?: Array<{ id: string; name: string }>;
}

export default function UserInfo() {
  const { id } = useParams();

  const { data, isLoading, error } = useSWR<{ data: UserProfileInfo }>(
    id ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${id}` : null,
    authenticatedFetcher
  );

  if (isLoading || !data)
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

  const user = data.data;
  const userImage = user.image || '/images/users/default-user.jpg';

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
                {imageUrl.startsWith('http') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt={`Profilbild von ${user.firstName} ${user.lastName}`}
                    className='w-full h-full rounded-full object-cover border-4 border-light-mint/40 shadow-lg'
                    onError={(e) => {
                      e.currentTarget.src = '/images/users/default-user.jpg';
                    }}
                  />
                ) : (
                  <Image
                    src={imageUrl}
                    alt={`Profilbild von ${user.firstName} ${user.lastName}`}
                    fill
                    className='rounded-full object-cover border-4 border-light-mint/40 shadow-lg'
                    sizes='128px'
                  />
                )}
              </div>
            </div>
            <div className='space-y-2'>
              <CardTitle className='text-3xl font-bold text-prussian'>
                {user.firstName} {user.lastName}
              </CardTitle>
              <div className='flex items-center gap-2 text-prussian/70'>
                <MapPin size={16} />
                <span>
                  {user.zipCode && `${user.zipCode} `}
                  {user.city}, {user.state}
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
              {user.yearOfBirth && (
                <div className='flex items-center gap-3'>
                  <Calendar size={16} className='text-prussian/60' />
                  <div>
                    <div className='text-sm text-prussian/60'>Geburtsjahr</div>
                    <div className='font-medium text-prussian'>
                      {user.yearOfBirth}
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
                    {new Date(user.createdAt).toLocaleDateString('de-DE', {
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
          {(user.contactEmail || user.phone) && (
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold text-prussian border-b border-light-mint/30 pb-2 flex items-center gap-2'>
                <Mail size={20} />
                Kontaktinformationen
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {user.contactEmail && (
                  <div className='flex items-center gap-3'>
                    <Mail size={16} className='text-prussian/60' />
                    <div>
                      <div className='text-sm text-prussian/60'>E-Mail</div>
                      <div className='font-medium text-prussian'>
                        {user.contactEmail}
                      </div>
                    </div>
                  </div>
                )}
                {user.phone && (
                  <div className='flex items-center gap-3'>
                    <Phone size={16} className='text-prussian/60' />
                    <div>
                      <div className='text-sm text-prussian/60'>Telefon</div>
                      <div className='font-medium text-prussian'>
                        {user.phone}
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
              {user.skills && user.skills.length > 0 ? (
                user.skills.map((skill: { id: string; name: string }) => (
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
          {user.ngoMemberships && user.ngoMemberships.length > 0 && (
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold text-prussian border-b border-light-mint/30 pb-2'>
                Vereinsmitgliedschaften
              </h3>
              <div className='flex flex-wrap gap-2'>
                {user.ngoMemberships.map(
                  (membership: { id: string; name: string }) => (
                    <Badge
                      key={membership.id}
                      variant='outline'
                      className='border-light-mint/40 text-prussian hover:bg-light-mint/10'
                    >
                      {membership.name}
                    </Badge>
                  )
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
