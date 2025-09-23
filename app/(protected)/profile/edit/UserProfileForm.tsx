'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  MultiSelect,
  type Option as SelectOption,
} from '@/components/ui/multiselect';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import ButtonComponent from '@/components/ButtonComponent';
import useSWR from 'swr';
import { toast, Toaster } from 'sonner';
import { swrFetcher, useAuth } from '@/contexts/AuthContext';
import MainHeadline from '@/components/MainHeadline';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import ImageDropzone from '@/components/ImageDropzone';
import { XCircle } from 'lucide-react';
// import { Switch } from '@/components/ui/switch';

interface Skill {
  id: string;
  name: string;
  description?: string;
}

interface UserProfile {
  firstName?: string;
  lastName?: string;
  contactEmail?: string;
  phone?: string;
  skills?: string[];
  yearOfBirth?: number;
  ngoMemberships?: string[];
  zipCode?: number;
  city?: string;
  state?: string;
  // isDisabled: boolean;
}

// Type for API response when fetching user details
type UserDetailResponse = Omit<UserProfile, 'skills' | 'ngoMemberships'> & {
  id?: string;
  loginEmail?: string;
  image?: string;
  role?: string;
  isActivated?: boolean;
  // isDisabled?: boolean;
  skills?: Array<{ id: string; name: string; description?: string }> | string[];
  ngoMemberships?: Array<{ id: string; name: string }> | string[];
};

function useSkills() {
  const { data, error, isLoading, mutate } = useSWR<Skill[]>(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/skills`,
  );

  return {
    skills: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

// Update user with authentication
async function updateUser(id: string, user: UserProfile, accessToken: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(user),
    },
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to update user profile');
  }

  const updatedUser = await res.json();
  return updatedUser;
}

const formSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  contactEmail: z
    .email({ message: 'Bitte eine gültige E-Mail-Adresse eingeben.' })
    .optional()
    .or(z.literal('')),
  phone: z.string().optional(),
  skills: z.array(z.string()).optional().default([]),
  yearOfBirth: z
    .number()
    .min(1900, { message: 'Geburtsjahr muss nach 1900 liegen.' })
    .max(new Date().getFullYear(), {
      message: 'Geburtsjahr kann nicht in der Zukunft liegen.',
    })
    .optional(),
  ngoMemberships: z.array(z.string()).optional(),
  zipCode: z
    .number()
    .min(10000, { message: 'Postleitzahl muss 5-stellig sein.' })
    .max(99999, { message: 'Postleitzahl muss 5-stellig sein.' })
    .optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  // isDisabled: z.boolean(),
});

const UserEditForm = () => {
  const { skills } = useSkills();
  const { user, tokens } = useAuth();
  const userId = user?.id;
  const router = useRouter();

  const skillOptions: SelectOption[] = (skills ?? []).map((skill) => ({
    value: skill.id,
    label: skill.name,
  }));

  const form = useForm<UserProfile, undefined, UserProfile>({
    resolver: zodResolver<UserProfile, undefined, UserProfile>(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      contactEmail: '',
      phone: '',
      skills: [],
      ngoMemberships: [],
      yearOfBirth: undefined,
      zipCode: undefined,
      city: '',
      state: '',
      // isDisabled: false,
    },
    mode: 'onSubmit',
  });

  const { data: userDetailData, mutate } = useSWR<UserDetailResponse>(
    userId ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${userId}` : null,
    swrFetcher,
  );

  useEffect(() => {
    if (!userDetailData) return;

    // Handle skills - they might be an array of objects or array of strings
    let skillIds: string[] = [];
    if (Array.isArray(userDetailData.skills)) {
      skillIds = userDetailData.skills.map((skill) =>
        typeof skill === 'string' ? skill : skill.id,
      );
    }

    let membershipIds: string[] = [];
    if (Array.isArray(userDetailData.ngoMemberships)) {
      membershipIds = userDetailData.ngoMemberships.map((ngoMembership) =>
        typeof ngoMembership === 'string' ? ngoMembership : ngoMembership.id,
      );
    }

    form.reset(
      {
        firstName: userDetailData.firstName ?? '',
        lastName: userDetailData.lastName ?? '',
        contactEmail: userDetailData.contactEmail ?? '',
        phone: userDetailData.phone ?? '',
        skills: skillIds,
        ngoMemberships: membershipIds,
        yearOfBirth: userDetailData.yearOfBirth ?? undefined,
        zipCode: userDetailData.zipCode ?? undefined,
        city: userDetailData.city ?? '',
        state: userDetailData.state ?? '',
        // isDisabled: userDetailData.isDisabled ?? false,
      },
      { keepDirty: false, keepTouched: true },
    );
  }, [userDetailData, form]);

  const onSubmit: SubmitHandler<UserProfile> = async (data) => {
    if (!tokens?.accessToken) {
      toast.error('Authentifizierung fehlgeschlagen');
      return;
    }

    if (!userId) {
      toast.error('Benutzer-ID nicht gefunden');
      return;
    }

    // Clean up empty strings and undefined values
    const submittedUser = {
      firstName: data.firstName,
      lastName: data.lastName,
      contactEmail: data.contactEmail || undefined,
      phone: data.phone || undefined,
      skills: data.skills,
      yearOfBirth: data.yearOfBirth,
      zipCode: data.zipCode,
      city: data.city,
      state: data.state,
      // isDisabled: data.isDisabled,
    };

    try {
      const req = updateUser(userId, submittedUser, tokens.accessToken);

      toast.promise(req, {
        loading: 'Profil wird aktualisiert…',
        success: 'Profil wurde aktualisiert.',
        error: (error) =>
          error instanceof Error && error.message
            ? `Fehler: ${error.message}`
            : 'Fehler: Das Profil konnte nicht aktualisiert werden.',
      });

      await req;
      router.push(`/users/${userId}`);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteImage = async () => {
    if (!tokens?.accessToken || !userId) {
      toast.error('Authentifizierung fehlgeschlagen');
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${userId}/images`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete image');
      }

      toast.success('Bild wurde gelöscht');

      if (mutate) {
        await mutate();
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Fehler beim Löschen des Bilds');
    }
  };

  // Show loading if we don't have user yet or if trying to edit someone else's profile without permission
  if (!user || !userId) {
    return <div>Lade...</div>;
  }

  return (
    <>
      <MainHeadline variant='page'>
        <span className='font-extralight'>Profil </span>
        <strong className='font-bold'>bearbeiten</strong>
      </MainHeadline>

      <div className='container-site'>
        <Card className='bg-light-mint/10 backdrop-blur-xl border-light-mint/20 shadow-xl'>
          <CardContent className='p-8'>
            <ImageDropzone
              resourceId={userId}
              resourceType='users'
              onUploadSuccess={() => mutate()}
            />

            {userDetailData?.image && (
              <>
                <h2 className='mb-2 font-sans'>Bild</h2>
                <div className='flex mb-8 h-24 gap-x-4'>
                  <Card className='bg-light-mint/10 flex items-center justify-center h-full relative group'>
                    <Image
                      width={100}
                      height={100}
                      src={userDetailData.image}
                      style={{
                        objectFit: 'cover',
                        maxHeight: '100%',
                        maxWidth: '100%',
                      }}
                      alt='Project image'
                    />

                    <button
                      onClick={() => handleDeleteImage}
                      className='absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'
                      type='button'
                    >
                      <XCircle fill='red' />
                    </button>
                  </Card>
                </div>
              </>
            )}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-8'
              >
                {/* Persönliche Informationen */}
                <div className='space-y-6'>
                  <h3 className='text-lg font-semibold text-prussian border-b border-light-mint/30 pb-2'>
                    Persönliche Informationen
                  </h3>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {/* FIRST NAME */}
                    <FormField
                      control={form.control}
                      name='firstName'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vorname</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className='bg-white/50 border border-light-mint/30 rounded-lg h-11 focus:bg-white/70 transition-all duration-200'
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='lastName'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nachname</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className='bg-white/50 border border-light-mint/30 rounded-lg h-11 focus:bg-white/70 transition-all duration-200'
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name='yearOfBirth'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Geburtsjahr</FormLabel>
                        <FormControl>
                          <Input
                            type='text'
                            inputMode='numeric'
                            placeholder='1900'
                            maxLength={4}
                            className='bg-white/50 border border-light-mint/30 rounded-lg h-11 focus:bg-white/70 transition-all duration-200'
                            value={field.value ?? ''}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, ''); // REMOVES NON DIGITS
                              if (value === '') {
                                field.onChange(undefined);
                              } else {
                                const numValue = parseInt(value, 10);
                                const currentYear = new Date().getFullYear();
                                if (
                                  numValue >= 1900 &&
                                  numValue <= currentYear
                                ) {
                                  field.onChange(numValue);
                                } else if (value.length < 4) {
                                  field.onChange(numValue);
                                }
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Fähigkeiten und Engagement */}
                <div className='space-y-6'>
                  <h3 className='text-lg font-semibold text-prussian border-b border-light-mint/30 pb-2'>
                    Fähigkeiten und Engagement
                  </h3>

                  <FormField
                    control={form.control}
                    name='skills'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fähigkeiten</FormLabel>
                        <FormControl>
                          {skillOptions.length > 0 ? (
                            <MultiSelect
                              options={skillOptions}
                              value={field.value ?? []}
                              onChange={field.onChange}
                              placeholder='Fähigkeiten auswählen'
                              searchPlaceholder='Suchen…'
                              className='bg-white/50 border border-light-mint/30 rounded-lg h-11 focus:bg-white/70 transition-all duration-200'
                            />
                          ) : (
                            <div>Lade Fähigkeiten...</div>
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='ngoMemberships'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mitgliedschaften bei Vereinen</FormLabel>
                        <FormControl>
                          <Input
                            className='h-11'
                            value={field.value?.join(', ') ?? ''}
                            onChange={(e) => {
                              const raw = e.target.value;
                              const arr = raw
                                .split(',')
                                .map((s) => s.trim())
                                .filter((s) => s.length > 0);
                              field.onChange(arr);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Optional. Bitte Vereine getrennt von Kommata eingeben
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Kontaktinformationen */}
                <div className='space-y-6'>
                  <h3 className='text-lg font-semibold text-prussian border-b border-light-mint/30 pb-2'>
                    Kontaktinformationen
                  </h3>

                  <FormField
                    control={form.control}
                    name='contactEmail'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kontakt E-Mail</FormLabel>
                        <FormControl>
                          <Input
                            type='email'
                            {...field}
                            className='bg-white/50 border border-light-mint/30 rounded-lg h-11 focus:bg-white/70 transition-all duration-200'
                          />
                        </FormControl>
                        <FormDescription>
                          Optional. Falls du nicht unter deiner Login-E-Mail
                          kontaktiert werden möchtest
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='phone'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefonnummer</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>Optional</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Adressinformationen */}
                <div className='space-y-6'>
                  <h3 className='text-lg font-semibold text-prussian border-b border-light-mint/30 pb-2'>
                    Adresse
                  </h3>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <FormField
                      control={form.control}
                      name='zipCode'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postleitzahl</FormLabel>
                          <FormControl>
                            <Input
                              type='text'
                              inputMode='numeric'
                              placeholder='12345'
                              maxLength={5}
                              className='bg-white/50 border border-light-mint/30 rounded-lg h-11 focus:bg-white/70 transition-all duration-200'
                              value={field.value ?? ''}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, ''); // REMOVES NON DIGITS
                                if (value === '') {
                                  field.onChange(undefined);
                                } else {
                                  field.onChange(parseInt(value, 10));
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='city'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stadt</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className='bg-white/50 border border-light-mint/30 rounded-lg h-11 focus:bg-white/70 transition-all duration-200'
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name='state'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bundesland</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className='bg-white/50 border border-light-mint/30 rounded-lg h-11 focus:bg-white/70 transition-all duration-200'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Kontoeinstellungen */}
                <div className='space-y-6'>
                  <h3 className='text-lg font-semibold text-prussian border-b border-light-mint/30 pb-2'>
                    Kontoeinstellungen
                  </h3>
                  {/* DISABLED */}
                  {/* <FormField
                  control={form.control}
                  name='isDisabled'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border border-light-mint/30 bg-white/50 p-4  transition-colors'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-base font-semibold text-prussian'>
                          Konto vorübergehend deaktivieren?
                        </FormLabel>
                        <FormDescription className='text-prussian/70'>
                          Ihr Konto wird nicht mehr in Suchergebnissen angezeigt
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className='data-[state=checked]:bg-light-mint data-[state=unchecked]:bg-gray-300 border-2'
                        />
                      </FormControl>
                    </FormItem>
                  )}
                /> */}
                </div>

                <div className='flex gap-4'>
                  <ButtonComponent variant='primary' size='md' type='submit'>
                    Speichern
                  </ButtonComponent>
                  <Link href={`/users/${userId}`}>
                    <ButtonComponent variant='secondary' size='md'>
                      Abbrechen
                    </ButtonComponent>
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        <Toaster position='top-center' richColors />
      </div>
    </>
  );
};

export default UserEditForm;
