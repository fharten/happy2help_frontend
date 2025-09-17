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

interface NgoProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  description?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  categories?: Array<{ id: string; name: string }>;
  projects?: Array<{ id: string; name: string }>;
  createdAt: string;
  updatedAt: string;
  image?: string;
  isDisabled?: boolean;
  zipCode?: string;
  state?: string;
  principal?: string;
  contactEmail?: string;
  streetAndNumber?: string;
  industry?: string[];
}

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Vereinsname muss mindestens 2 Zeichen lang sein.' }),
  image: z.string().min(1, { message: 'Dieses Feld ist verpflichtend.' }),
  principal: z
    .string()
    .min(2, {
      message: 'Name des Vorstands muss mindestens 2 Zeichen lang sein.',
    })
    .includes(' ', { message: 'Bitte Vor- und Nachnamen angeben.' }),
  contactEmail: z
    .email({ message: 'Ungültige E-Mail-Adresse.' })
    .optional()
    .or(z.literal('')),

  phone: z.string().optional(),
  industry: z
    .array(z.string().min(1, { message: 'Dieses Feld ist verpflichtend.' }))
    .min(1, { message: 'Mindestens ein Tätigkeitsfeld angeben.' }),
  streetAndNumber: z
    .string()
    .min(1, { message: 'Dieses Feld ist verpflichtend.' }),
  zipCode: z.number().int().gte(10000).lte(99999).optional(),
  city: z.string().min(1, { message: 'Dieses Feld ist verpflichtend.' }),
  state: z.string().min(1, { message: 'Dieses Feld ist verpflichtend.' }),
  isDisabled: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

const NgoProfileForm = () => {
  const { user } = useAuth();
  const ngoId = user?.id;

  const router = useRouter();

  const {
    data: ngo,
    isLoading,
    isValidating,
    error,
  } = useSWR<NgoProfile>(
    ngoId ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/ngos/${ngoId}` : null,
    swrFetcher,
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      image: '',
      principal: '',
      contactEmail: '',
      phone: '',
      industry: [],
      streetAndNumber: '',
      zipCode: undefined,
      city: '',
      state: '',
      isDisabled: false,
    },
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (!ngo) return;

    form.reset({
      name: ngo.name ?? '',
      image: ngo.image ?? '',
      principal: ngo.principal ?? '',
      contactEmail: ngo.contactEmail ?? '',
      phone: ngo.phone ?? '',
      industry: Array.isArray(ngo.industry) ? ngo.industry : [],
      streetAndNumber: ngo.streetAndNumber ?? '',
      zipCode: typeof ngo.zipCode === 'number' ? ngo.zipCode : undefined,
      city: ngo.city ?? '',
      state: ngo.state ?? '',
      isDisabled: !!ngo.isDisabled,
    });
  }, [ngo, form]);

  const onSubmit = async (values: FormValues) => {
    if (!ngoId) return;

    try {
      const submitData = {
        ...values,
        contactEmail:
          values.contactEmail === '' ? undefined : values.contactEmail,
      };

      const token = getAuthToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/ngos/${ngoId}`,
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

  if (!ngoId)
    return (
      <div className='flex justify-center items-center min-h-screen'>
        Lade...
      </div>
    );
  if (isLoading || !ngo)
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
            Vereinsprofil bearbeiten
          </CardTitle>
        </CardHeader>
        <CardContent className='p-8'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
              {/* Grundinformationen */}
              <div className='space-y-6'>
                <h3 className='text-lg font-semibold text-prussian border-b border-light-mint/30 pb-2'>
                  Grundinformationen
                </h3>

                {/* NAME */}
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vereinsname</FormLabel>
                      <FormControl>
                        <Input {...field} className='h-11' />
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
                      <FormLabel>Vereinslogo</FormLabel>
                      <FormControl>
                        <Input {...field} className='h-11' />
                      </FormControl>
                      <FormDescription>Link zum Vereinslogo</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* PRINCIPAL */}
                <FormField
                  control={form.control}
                  name='principal'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vorstand</FormLabel>
                      <FormControl>
                        <Input {...field} className='h-11' />
                      </FormControl>
                      <FormDescription>
                        Vor- und Nachname des Vorstands
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* INDUSTRY */}
                <FormField
                  control={form.control}
                  name='industry'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tätigkeitsfelder</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Energie, Sport, Kinder, Diversität,...'
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
                        Bitte Tätigkeitsfelder getrennt von Kommata eingeben
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

                {/* ADDRESS */}
                <FormField
                  control={form.control}
                  name='streetAndNumber'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anschrift</FormLabel>
                      <FormControl>
                        <Input {...field} className='h-11' />
                      </FormControl>
                      <FormDescription>Straße und Hausnummer</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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

export default NgoProfileForm;
