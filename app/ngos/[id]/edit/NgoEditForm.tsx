'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

import {
  MultiSelect,
  type Option as SelectOption,
} from '@/components/ui/multiselect';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import ButtonComponent from '@/components/ButtonComponent';
import useSWR from 'swr';
import { toast } from 'sonner';
import { swrFetcher, useAuth } from '@/contexts/AuthContext';

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
import { Card } from '@/components/ui/card';
import ImageDropzone from '@/components/ImageDropzone';
import { XCircle } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  description?: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface UserProfile {
  name?: string;
  lastName?: string;
  contactEmail?: string;
  phone?: string;
  skills?: string[];
  categories?: string[];
  yearOfBirth?: number;
  zipCode?: number;
  city?: string;
  state?: string;
}

// Type for API response when fetching ngo details
type UserDetailResponse = Omit<UserProfile, 'skills' | 'categories'> & {
  id?: string;
  loginEmail?: string;
  image?: string;
  role?: string;
  isActivated?: boolean;
  isDisabled?: boolean;
  skills?: Array<{ id: string; name: string; description?: string }> | string[];
  categories?:
    | Array<{ id: string; name: string; description?: string }>
    | string[];
};

function useSkills() {
  const { data, error, isLoading, mutate } = useSWR<Skill[]>(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/skills`,
    swrFetcher,
  );

  return {
    skills: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

function useCategories() {
  const { data, error, isLoading, mutate } = useSWR<Category[]>(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/categories`,
    swrFetcher,
  );

  return {
    categories: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

// Update ngo with authentication
async function updateUser(id: string, ngo: UserProfile, accessToken: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/ngos/${id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(ngo),
    },
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to update ngo profile');
  }

  const updatedUser = await res.json();
  return updatedUser;
}

const formSchema = z.object({
  name: z.string().optional(),
  lastName: z.string().optional(),
  contactEmail: z
    .email({ message: 'Bitte eine gültige E-Mail-Adresse eingeben.' })
    .optional()
    .or(z.literal('')),
  phone: z.string().optional(),
  skills: z.array(z.string()).optional().default([]),
  categories: z.array(z.string()).optional().default([]),
  yearOfBirth: z
    .number()
    .min(1900, { message: 'Geburtsjahr muss nach 1900 liegen.' })
    .max(new Date().getFullYear(), {
      message: 'Geburtsjahr kann nicht in der Zukunft liegen.',
    })
    .optional(),
  zipCode: z
    .number()
    .min(10000, { message: 'Postleitzahl muss 5-stellig sein.' })
    .max(99999, { message: 'Postleitzahl muss 5-stellig sein.' })
    .optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

const NgoEditForm = () => {
  const { skills } = useSkills();
  const { categories } = useCategories();
  const { user: ngo, tokens } = useAuth();
  const router = useRouter();

  const params = useParams<{ id: string }>();
  const ngoId = params?.id;

  const skillOptions: SelectOption[] = (skills ?? []).map((skill) => ({
    value: skill.id,
    label: skill.name,
  }));

  const categoryOptions: SelectOption[] = (categories ?? []).map(
    (category) => ({
      value: category.id,
      label: category.name,
    }),
  );

  const form = useForm<UserProfile, undefined, UserProfile>({
    resolver: zodResolver<UserProfile, undefined, UserProfile>(formSchema),
    defaultValues: {
      name: '',
      lastName: '',
      contactEmail: '',
      phone: '',
      skills: [],
      categories: [],
      yearOfBirth: undefined,
      zipCode: undefined,
      city: '',
      state: '',
    },
    mode: 'onSubmit',
  });

  const { data: ngoDetailData, mutate } = useSWR<UserDetailResponse>(
    ngoId ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/ngos/${ngoId}` : null,
    swrFetcher,
  );

  useEffect(() => {
    if (!ngoDetailData) return;

    // Handle skills - they might be an array of objects or array of strings
    let skillIds: string[] = [];
    if (Array.isArray(ngoDetailData.skills)) {
      skillIds = ngoDetailData.skills.map((skill) =>
        typeof skill === 'string' ? skill : skill.id,
      );
    }

    // Handle categories - they might be an array of objects or array of strings
    let categoryIds: string[] = [];
    if (Array.isArray(ngoDetailData.categories)) {
      categoryIds = ngoDetailData.categories.map((category) =>
        typeof category === 'string' ? category : category.id,
      );
    }

    form.reset(
      {
        name: ngoDetailData.name ?? '',
        lastName: ngoDetailData.lastName ?? '',
        contactEmail: ngoDetailData.contactEmail ?? '',
        phone: ngoDetailData.phone ?? '',
        skills: skillIds,
        categories: categoryIds,
        yearOfBirth: ngoDetailData.yearOfBirth ?? undefined,
        zipCode: ngoDetailData.zipCode ?? undefined,
        city: ngoDetailData.city ?? '',
        state: ngoDetailData.state ?? '',
      },
      { keepDirty: false, keepTouched: true },
    );
  }, [ngoDetailData, form]);

  const onSubmit: SubmitHandler<UserProfile> = async (data) => {
    if (!tokens?.accessToken) {
      toast.error('Authentifizierung fehlgeschlagen');
      return;
    }

    if (!ngoId) {
      toast.error('Benutzer ID nicht gefunden');
      return;
    }

    // Clean up empty strings and undefined values
    const submittedNgo = {
      name: data.name,
      lastName: data.lastName,
      contactEmail: data.contactEmail || undefined,
      phone: data.phone || undefined,
      skills: data.skills,
      categories: data.categories,
      yearOfBirth: data.yearOfBirth,
      zipCode: data.zipCode,
      city: data.city,
      state: data.state,
    };

    try {
      const req = updateUser(ngoId, submittedNgo, tokens.accessToken);

      toast.promise(req, {
        loading: 'Profil wird aktualisiert…',
        success: 'Profil wurde aktualisiert.',
        error: (error) =>
          error instanceof Error && error.message
            ? `Fehler: ${error.message}`
            : 'Fehler: Das Profil konnte nicht aktualisiert werden.',
      });

      await req;
      router.push(`/ngos/${ngoId}`);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteImage = async () => {
    if (!tokens?.accessToken || !ngoId) {
      toast.error('Authentifizierung fehlgeschlagen');
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/ngos/${ngoId}/images`,
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
      toast.error('Fehler beim Löschen des Bildes');
    }
  };

  // Show loading if we don't have ngo yet or if trying to edit someone else's profile without permission
  if (!ngo || !ngoId) {
    return <div>Lade...</div>;
  }

  return (
    <div className='container-site'>
      <ImageDropzone
        resourceId={ngoId}
        resourceType='ngos'
        onUploadSuccess={() => mutate()}
      />

      {ngoDetailData?.image && (
        <>
          <h2 className='mb-2 font-sans'>Bild</h2>
          <div className='flex mb-8 h-24 gap-x-4'>
            <Card className='bg-light-mint/10 flex items-center justify-center h-full relative group'>
              <Image
                width={100}
                height={100}
                src={ngoDetailData.image}
                style={{
                  objectFit: 'cover',
                  maxHeight: '100%',
                  maxWidth: '100%',
                }}
                alt='Project image'
              />

              <button
                onClick={() => handleDeleteImage()}
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
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vorname</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='contactEmail'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kontakt E-Mail</FormLabel>
                <FormControl>
                  <Input type='email' {...field} />
                </FormControl>
                <FormDescription>
                  Optional. Falls du nicht unter deiner Login-E-Mail kontaktiert
                  werden möchtest
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
                <FormLabel>Telefon</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>Optional</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    className='h-11'
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, ''); // REMOVES NON DIGITS
                      if (value === '') {
                        field.onChange(undefined);
                      } else {
                        const numValue = parseInt(value, 10);
                        const currentYear = new Date().getFullYear();
                        if (numValue >= 1900 && numValue <= currentYear) {
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

          <FormField
            control={form.control}
            name='city'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stadt</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    className='h-11'
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
            name='state'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bundesland</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='categories'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kategorien</FormLabel>
                <FormControl>
                  {categoryOptions.length > 0 ? (
                    <MultiSelect
                      options={categoryOptions}
                      value={field.value ?? []}
                      onChange={field.onChange}
                      placeholder='Kategorien auswählen'
                      searchPlaceholder='Suchen…'
                    />
                  ) : (
                    <div>Lade Kategorien...</div>
                  )}
                </FormControl>
                <FormDescription>
                  Wähle die Bereiche aus, in denen deine Organisation tätig ist
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    />
                  ) : (
                    <div>Lade Fähigkeiten...</div>
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='flex gap-4'>
            <ButtonComponent variant='primary' size='md' type='submit'>
              Speichern
            </ButtonComponent>
            <Link href={`/users/${ngoId}`}>
              <ButtonComponent variant='secondary' size='md'>
                Abbrechen
              </ButtonComponent>
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default NgoEditForm;
