'use client';

import useSWR from 'swr';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import ButtonComponent from '@/components/ButtonComponent';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { getAuthToken } from '@/lib/auth';
import { swrFetcher, useAuth } from '@/contexts/AuthContext';

interface UserFormData {
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
  yearOfBirth?: string;
  image?: string;
  contactEmail?: string;
  ngoMemberships?: Array<{ id: string; name: string }>;
  zipCode?: number;
  state?: string;
  isDisabled?: boolean;
}

const formSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: 'Vorname muss mindestens 2 Zeichen lang sein.' }),
  lastName: z
    .string()
    .min(2, { message: 'Vorname muss mindestens 2 Zeichen lang sein.' }),
  image: z.string().min(1, { message: 'Dieses Feld ist verpflichtend.' }),
  contactEmail: z
    .email({ message: 'Ungültige E-Mail-Adresse.' })
    .optional()
    .or(z.literal('')),
  phone: z.string().optional(),
  skills: z
    .array(z.string().min(1, { message: 'Dieses Feld ist verpflichtend.' }))
    .min(1, { message: 'Mindestens einen Skill angeben.' }),
  ngoMemberships: z.array(z.string()).optional(),
  yearOfBirth: z.number().optional(),
  zipCode: z.number().int().gte(10000).lte(99999).optional(),
  city: z.string().min(1, { message: 'Dieses Feld ist verpflichtend.' }),
  state: z.string().min(1, { message: 'Dieses Feld ist verpflichtend.' }),
  isDisabled: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

const UserProfileForm = () => {
  const { user } = useAuth();
  const userId = user?.id;

  const router = useRouter();

  const {
    data: userData,
    isLoading,
    isValidating,
    error,
  } = useSWR<UserFormData>(
    userId ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${userId}` : null,
    swrFetcher,
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      image: '',
      contactEmail: '',
      phone: '',
      yearOfBirth: undefined,
      skills: [],
      ngoMemberships: [],
      zipCode: undefined,
      city: '',
      state: '',
      isDisabled: false,
    },
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (!userData) return;

    form.reset({
      firstName: userData.firstName ?? '',
      lastName: userData.lastName ?? '',
      image: userData.image ?? '',
      contactEmail: userData.contactEmail ?? '',
      phone: userData.phone ?? '',
      yearOfBirth: userData.yearOfBirth
        ? parseInt(userData.yearOfBirth, 10)
        : undefined,
      skills: Array.isArray(userData.skills)
        ? userData.skills.map((skill) =>
            typeof skill === 'string' ? skill : skill.name,
          )
        : [],
      ngoMemberships: Array.isArray(userData.ngoMemberships)
        ? userData.ngoMemberships.map((membership) =>
            typeof membership === 'string' ? membership : membership.name,
          )
        : [],
      zipCode:
        typeof userData.zipCode === 'number' ? userData.zipCode : undefined,
      city: userData.city ?? '',
      state: userData.state ?? '',
      isDisabled: !!userData.isDisabled,
    });
  }, [userData, form]);

  const onSubmit = async (values: FormValues) => {
    if (!userId) return;

    try {
      const submitData = {
        ...values,
        contactEmail:
          values.contactEmail === '' ? undefined : values.contactEmail,
      };

      const token = getAuthToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(submitData),
        },
      );

      if (!res.ok) {
        toast.error('Fehler beim Speichern der Änderungen');
        throw new Error(`Update failed with status ${res.status}`);
      }

      toast.success('Profil erfolgreich aktualisiert!');
      router.push('/profile');
    } catch (err) {
      console.error('An error occurred:', err);
      toast.error('Ein Fehler ist aufgetreten');
    }
  };

  if (isLoading || !userData)
    return (
      <div className='flex justify-center items-center min-h-screen'>
        Lade...
      </div>
    );
  if (error)
    return (
      <div className='flex justify-center items-center min-h-screen'>
        Fehler: {error.message}
      </div>
    );

  return (
    <div className='container-site'>
      <Card className='bg-light-mint/10 backdrop-blur-xl border-light-mint/20 shadow-xl'>
        <CardHeader>
          <CardTitle className='text-2xl font-bold text-center text-prussian'>
            Benutzerprofil bearbeiten
          </CardTitle>
        </CardHeader>
        <CardContent className='p-8'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
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
                          <Input {...field} className='h-11' />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* LAST NAME */}
                  <FormField
                    control={form.control}
                    name='lastName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nachname</FormLabel>
                        <FormControl>
                          <Input {...field} className='h-11' />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* IMAGE */}
                <FormField
                  control={form.control}
                  name='image'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profilbild</FormLabel>
                      <FormControl>
                        <Input {...field} className='h-11' />
                      </FormControl>
                      <FormDescription>
                        Link zu Ihrem Profilbild
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* YEAR OF BIRTH */}
                <FormField
                  control={form.control}
                  name='yearOfBirth'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Geburtsjahr</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ''}
                          className='h-11'
                          placeholder='z.B. 1990'
                        />
                      </FormControl>
                      <FormDescription>Optional</FormDescription>
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

                {/* SKILLS */}
                <FormField
                  control={form.control}
                  name='skills'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fähigkeiten</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Kamera, Bühnenbau, Gitarre,...'
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
                        Bitte Skills getrennt von Kommata eingeben
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* NGO MEMBERSHIPS */}
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

                {/* CONTACT EMAIL */}
                <FormField
                  control={form.control}
                  name='contactEmail'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Abweichende Kontakt-E-Mail-Adresse</FormLabel>
                      <FormControl>
                        <Input
                          type='email'
                          {...field}
                          value={field.value || ''}
                          className='h-11'
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

                {/* PHONE */}
                <FormField
                  control={form.control}
                  name='phone'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefonnummer</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ''}
                          className='h-11'
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

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  {/* ZIP CODE */}
                  <FormField
                    control={form.control}
                    name='zipCode'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postleitzahl</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            placeholder='12345'
                            className='h-11'
                            value={field.value ?? ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '') {
                                field.onChange(undefined);
                              } else {
                                const numValue = parseInt(value, 10);
                                if (!isNaN(numValue)) {
                                  field.onChange(numValue);
                                }
                              }
                            }}
                            onKeyDown={(e) => {
                              // ALLOW: navigation and editing keys
                              const allowedKeys = [
                                'Backspace',
                                'Delete',
                                'Tab',
                                'Escape',
                                'Enter',
                                'Home',
                                'End',
                                'ArrowLeft',
                                'ArrowRight',
                                'ArrowDown',
                                'ArrowUp',
                              ];

                              // ALLOW: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                              if (
                                (e.ctrlKey || e.metaKey) &&
                                ['a', 'c', 'v', 'x'].includes(
                                  e.key.toLowerCase(),
                                )
                              ) {
                                return;
                              }

                              // ALLOW navigation and editing keys
                              if (allowedKeys.includes(e.key)) {
                                return;
                              }

                              // ALLOW only numbers (0-9)
                              if (!/^[0-9]$/.test(e.key)) {
                                e.preventDefault();
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* CITY */}
                  <FormField
                    control={form.control}
                    name='city'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stadt</FormLabel>
                        <FormControl>
                          <Input {...field} className='h-11' />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* STATE */}
                <FormField
                  control={form.control}
                  name='state'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bundesland</FormLabel>
                      <FormControl>
                        <Input {...field} className='h-11' />
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
                <FormField
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
                />
              </div>

              {isValidating && (
                <div className='text-center'>
                  <span className='text-prussian/60'>Lädt neu...</span>
                </div>
              )}

              <div className='flex flex-col sm:flex-row gap-4 pt-6'>
                <ButtonComponent
                  type='submit'
                  variant='primary'
                  size='lg'
                  className='flex-1'
                >
                  Änderungen speichern
                </ButtonComponent>
                <ButtonComponent
                  type='button'
                  variant='secondary'
                  size='lg'
                  className='flex-1'
                  onClick={() => router.push('/profile')}
                >
                  Abbrechen
                </ButtonComponent>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Toaster position='top-center' richColors />
    </div>
  );
};

export default UserProfileForm;
