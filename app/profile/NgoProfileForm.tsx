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

interface Ngo {
  id: string;
  name: string;
  image: string;
  isNonProfit: boolean;
  industry: string[];
  streetAndNumber: string;
  zipCode: number;
  city: string;
  state: string;
  principal: string;
  contactEmail?: string;
  phone?: string;
  isActivated: boolean;
  isDisabled: boolean;
  createdAt: Date;
  updatedAt: Date;
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

type FetchError = Error & { info?: unknown; status?: number };

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error: FetchError = new Error(
      'An error occurred while fetching the data.',
    );
    try {
      error.info = await res.json();
    } catch {}
    error.status = res.status;
    throw error;
  }
  return res.json();
};

const NgoProfileForm = ({ ngoId }: { ngoId: string }) => {
  const router = useRouter();

  const { data, isLoading, isValidating, error } = useSWR<{ data: Ngo }>(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/ngos/${ngoId}`,
    fetcher,
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
    if (!data?.data) return;
    const ngo = data.data;

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
  }, [data, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      const submitData = {
        ...values,
        contactEmail:
          values.contactEmail === '' ? undefined : values.contactEmail,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/ngos/${ngoId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData),
        },
      );

      if (!res.ok) throw new Error(`Update failed with status ${res.status}`);

      router.push(`/ngos/${ngoId}`);
    } catch (err) {
      console.error('An error occurred:', err);
    }
  };

  if (isLoading || !data) return <div>Lade...</div>;
  if (error) return <div>Fehler: {error.message}</div>;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        {/* NAME */}
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vereinsname</FormLabel>
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

        {/* PRINCIPAL */}
        <FormField
          control={form.control}
          name='principal'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vorstand</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
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
                Bitte Tätigkeitsfelder getrennt von Kommata eingeben.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ADDRESS*/}
        <FormField
          control={form.control}
          name='streetAndNumber'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Anschrift</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>Straße und Hausnummer</FormDescription>
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
                    // Allow: navigation and editing keys
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

                    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                    if (
                      (e.ctrlKey || e.metaKey) &&
                      ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())
                    ) {
                      return;
                    }

                    // Allow navigation and editing keys
                    if (allowedKeys.includes(e.key)) {
                      return;
                    }

                    // Allow only numbers (0-9)
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
              <FormLabel>Verein vorübergehend deaktivieren?</FormLabel>
              <FormControl>
                <Switch
                  id='disable-ngo'
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <Label htmlFor='disable-ngo'>{field.value ? 'Ja' : 'Nein'}</Label>
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

export default NgoProfileForm;
