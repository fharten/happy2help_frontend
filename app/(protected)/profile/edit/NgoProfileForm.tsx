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
import { Card, CardContent } from '@/components/ui/card';
import ImageDropzone from '@/components/ImageDropzone';
import { XCircle } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface NgoProfile {
  name?: string;
  contactEmail?: string;
  phone?: string;
  principal?: string;
  streetAndNumber?: string;
  categories?: string[];
  //isDisabled?: boolean;
  zipCode?: number;
  city?: string;
  state?: string;
}

// Type for API response when fetching ngo details
type UserDetailResponse = Omit<NgoProfile, 'skills' | 'categories'> & {
  id?: string;
  loginEmail?: string;
  image?: string;
  role?: string;
  principal?: string;
  streetAndNumber?: string;
  isActivated?: boolean;
  //isDisabled?: boolean;
  skills?: Array<{ id: string; name: string; description?: string }> | string[];
  categories?:
    | Array<{ id: string; name: string; description?: string }>
    | string[];
};

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
async function updateUser(id: string, ngo: NgoProfile, accessToken: string) {
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
  contactEmail: z
    .email({ message: 'Bitte eine gültige E-Mail-Adresse eingeben.' })
    .optional()
    .or(z.literal('')),
  phone: z.string().optional(),
  principal: z
    .string()
    .min(2, {
      message: 'Name des Vorstands muss mindestens 2 Zeichen lang sein.',
    })
    .includes(' ', { message: 'Bitte Vor- und Nachnamen angeben.' }),
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
  //isDisabled: z.boolean(),
});

const NgoEditForm = () => {
  const { categories } = useCategories();
  const { user: ngo, tokens } = useAuth();
  const router = useRouter();

  const ngoId = ngo?.id;

  const categoryOptions: SelectOption[] = (categories ?? []).map(
    (category) => ({
      value: category.id,
      label: category.name,
    }),
  );

  const form = useForm<NgoProfile, undefined, NgoProfile>({
    resolver: zodResolver<NgoProfile, undefined, NgoProfile>(formSchema),
    defaultValues: {
      name: '',
      principal: '',
      streetAndNumber: '',
      contactEmail: '',
      phone: '',
      //isDisabled: false,
      categories: [],
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
        principal: ngoDetailData.principal ?? '',
        contactEmail: ngoDetailData.contactEmail ?? '',
        phone: ngoDetailData.phone ?? '',
        streetAndNumber: ngoDetailData.streetAndNumber ?? '',
        categories: categoryIds,
        zipCode: ngoDetailData.zipCode ?? undefined,
        city: ngoDetailData.city ?? '',
        state: ngoDetailData.state ?? '',
      },
      { keepDirty: false, keepTouched: true },
    );
  }, [ngoDetailData, form]);

  const onSubmit: SubmitHandler<NgoProfile> = async (data) => {
    if (!tokens?.accessToken) {
      toast.error('Authentifizierung fehlgeschlagen');
      return;
    }

    if (!ngoId) {
      toast.error('Benutzer-ID nicht gefunden');
      return;
    }

    // Clean up empty strings and undefined values
    const submittedNgo = {
      name: data.name,
      principal: data.principal,
      contactEmail: data.contactEmail || undefined,
      phone: data.phone || undefined,
      categories: data.categories,
      streetAndNumber: data.streetAndNumber,
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
      toast.error('Fehler beim Löschen des Bilds');
    }
  };

  // Show loading if we don't have ngo yet or if trying to edit someone else's profile without permission
  if (!ngo || !ngoId) {
    return <div>Lade...</div>;
  }

  return (
    <>
      <div className='container-site'>
        <Card className='bg-light-mint/10 backdrop-blur-xl border-light-mint/20 shadow-xl'>
          <CardContent className='p-8'>
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
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-8'
              >
                {/* Grundinformationen */}
                <div className='space-y-6'>
                  <h3 className='text-lg font-semibold text-prussian border-b border-light-mint/30 pb-2'>
                    Grundinformationen
                  </h3>

                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vereinsname</FormLabel>
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
                    name='principal'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vorstand</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className='bg-white/50 border border-light-mint/30 rounded-lg h-11 focus:bg-white/70 transition-all duration-200'
                          />
                        </FormControl>
                        <FormDescription>
                          Vor- und Nachname des Vorstands
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='categories'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tätigkeitsfelder</FormLabel>
                        <FormControl>
                          {categoryOptions.length > 0 ? (
                            <MultiSelect
                              options={categoryOptions}
                              value={field.value ?? []}
                              onChange={field.onChange}
                              placeholder='Kategorien auswählen'
                              searchPlaceholder='Suchen…'
                              className='bg-white/50 border border-light-mint/30 rounded-lg h-11 focus:bg-white/70 transition-all duration-200'
                            />
                          ) : (
                            <div>Lade Kategorien...</div>
                          )}
                        </FormControl>
                        <FormDescription>
                          Wähle die Bereiche aus, in denen deine Organisation
                          tätig ist
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
                          <Input
                            {...field}
                            className='bg-white/50 border border-light-mint/30 rounded-lg h-11 focus:bg-white/70 transition-all duration-200'
                          />
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
                  <FormField
                    control={form.control}
                    name='streetAndNumber'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Straße und Hausnummer</FormLabel>
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
                {/* <div className='space-y-6'>
                  <h3 className='text-lg font-semibold text-prussian border-b border-light-mint/30 pb-2'>
                    Kontoeinstellungen
                  </h3>  */}

                {/* DISABLED */}
                {/* <FormField
                  control={form.control}
                  name='isDisabled'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border border-light-mint/30 bg-white/50 p-4 transition-colors'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-base font-semibold text-prussian'>
                          Verein vorübergehend deaktivieren?
                        </FormLabel>
                        <FormDescription className='text-prussian/70'>
                          Ihr Verein wird nicht mehr in Suchergebnissen
                          angezeigt
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
                /> 
                </div> */}

                <div className='flex gap-4'>
                  <ButtonComponent variant='primary' size='md' type='submit'>
                    Speichern
                  </ButtonComponent>
                  <Link href={`/ngos/${ngoId}`}>
                    <ButtonComponent variant='secondary' size='md'>
                      Abbrechen
                    </ButtonComponent>
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        {/* <Toaster position='top-center' richColors /> */}
      </div>
    </>
  );
};

export default NgoEditForm;
