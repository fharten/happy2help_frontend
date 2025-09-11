'use client';

import useSWR from 'swr';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
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
import { Label } from '@/components/ui/label';
import { authenticatedFetcher, getUserId, getAuthToken } from '@/lib/auth';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  image: string;
  contactEmail?: string;
  phone?: string;
  skills: string[];
  ngoMemberships: string[];
  yearOfBirth?: number;
  zipCode: number;
  city: string;
  state: string;
  isActivated: boolean;
  isDisabled: boolean;
  createdAt: Date;
  updatedAt: Date;
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
  const router = useRouter();
  const userId = getUserId();

  // redirect to login if not authenticated
  useEffect(() => {
    if (!userId) {
      router.push('/login');
    }
  }, [userId, router]);

  const { data, isLoading, isValidating, error } = useSWR<{ data: User }>(
    userId ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${userId}` : null,
    authenticatedFetcher
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
    if (!data?.data) return;
    const user = data.data;

    form.reset({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      image: user.image ?? '',
      contactEmail: user.contactEmail ?? '',
      phone: user.phone ?? '',
      yearOfBirth: user.yearOfBirth ?? undefined,
      skills: Array.isArray(user.skills) ? user.skills : [],
      ngoMemberships: Array.isArray(user.ngoMemberships)
        ? user.ngoMemberships
        : [],
      zipCode: typeof user.zipCode === 'number' ? user.zipCode : undefined,
      city: user.city ?? '',
      state: user.state ?? '',
      isDisabled: !!user.isDisabled,
    });
  }, [data, form]);

  const onSubmit = async (values: FormValues) => {
    if (!userId) return;

    console.log('first');
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
        }
      );

      console.log(res);

      if (!res.ok) throw new Error(`Update failed with status ${res.status}`);

      router.push(`/users/${userId}`);
    } catch (err) {
      console.error('An error occurred:', err);
    }
  };

  if (isLoading || !data) return <div>Lade...</div>;
  if (error) return <div>Fehler: {error.message}</div>;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        {/* FIRST NAME */}
        <FormField
          control={form.control}
          name='firstName'
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

        {/* LAST NAME */}
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

        {/* IMAGE */}
        <FormField
          control={form.control}
          name='image'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bild</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>Link zum Vereinslogo.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* CONTACT EMAIL */}
        <FormField
          control={form.control}
          name='contactEmail'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Abweichende Kontakt-E-Mail-Adresse</FormLabel>
              <FormControl>
                <Input type='email' {...field} value={field.value || ''} />
              </FormControl>
              <FormDescription>
                Optional. Falls du nicht unter deiner Login-E-Mail kontaktiert
                werden möchtest.
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
                <Input {...field} value={field.value || ''} />
              </FormControl>
              <FormDescription>Optional.</FormDescription>
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
                <Input {...field} value={field.value || ''} />
              </FormControl>
              <FormDescription>Optional.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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
                Bitte Skills getrennt von Kommata eingeben.
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
                Optional. Bitte Vereine getrennt von Kommata eingeben.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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
                      ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())
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
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* STATE */}
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

        {/* DISABLED */}
        <FormField
          control={form.control}
          name='isDisabled'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Konto vorübergehend deaktivieren?</FormLabel>
              <FormControl>
                <Switch
                  id='disable-user'
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <Label htmlFor='disable-user'>
                {field.value ? 'Ja' : 'Nein'}
              </Label>
              <FormMessage />
            </FormItem>
          )}
        />

        {isValidating && (
          <span className='ml-4 text-gray-400'>Lädt neu...</span>
        )}

        <Button type='submit'>Änderungen speichern</Button>
      </form>
    </Form>
  );
};

export default UserProfileForm;
