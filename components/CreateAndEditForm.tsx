'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

import { format, parse, parseISO, isValid } from 'date-fns';
import { Calendar as CalendarIcon, XCircle } from 'lucide-react';
import { de } from 'date-fns/locale';
import { MultiSelect, type Option as SelectOption } from './ui/multiselect';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import ButtonComponent from '@/components/ButtonComponent';
import { Calendar } from '@/components/ui/calendar';
import useSWR from 'swr';
import { toast } from 'sonner';
import { swrFetcher, useAuth } from '@/contexts/AuthContext';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from './ui/textarea';
import ImageDropzone from './ImageDropzone';
import Image from 'next/image';
import { Card, CardContent } from './ui/card';
import MainHeadline from './MainHeadline';

interface Skill {
  id: string;
  name: string;
  description: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
}

interface Project {
  name: string;
  description: string;
  city: string;
  zipCode: number | undefined;
  state: string;
  principal: string;
  compensation?: string;
  images?: string[];
  skills: string[];
  categories: string[];
  isActive: boolean;
  startingAt: string;
  endingAt: string;
  ngoId: string;
}

// Type for API response when fetching project details
type ProjectDetailResponse = Omit<Project, 'skills' | 'categories'> & {
  id?: string;
  skills?: Array<{ id: string; name: string; description: string }>;
  categories?: Array<{ id: string; name: string; description: string }>;
};

function useSkills() {
  const { data, error, isLoading, mutate } = useSWR<Skill[]>(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/skills`
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
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/categories`
  );

  return {
    categories: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

// Create new project with authentication
async function createProject(project: Project, accessToken: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/projects/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(project),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create project');
  }

  const newProject = await res.json();
  return newProject;
}

// Update project with authentication
async function updateProject(
  id: string,
  project: Project,
  accessToken: string
) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/projects/${id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(project),
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to update project');
  }

  const updatedProject = await res.json();
  return updatedProject;
}

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Projektname muss mindestens 2 Zeichen lang sein.' }),
  description: z.string().min(50, {
    message: 'Die Beschreibung muss mindestens 50 Zeichen lang sein.',
  }),
  city: z.string().min(1, { message: 'Dieses Feld ist verpflichtend.' }),
  zipCode: z.number({ message: 'Bitte eine gültige Postleitzahl angeben.' }),
  state: z.string().min(1, { message: 'Dieses Feld ist verpflichtend.' }),
  principal: z.string().min(1, { message: 'Dieses Feld ist verpflichtend.' }),
  compensation: z.string().optional(),
  images: z.array(z.string().min(1)).optional().default([]),
  skills: z.array(z.string().min(1)).min(1, {
    message: 'Mindestens eine gesuchte Fähigkeit muss angegeben werden.',
  }),
  categories: z
    .array(z.string().min(1))
    .min(1, { message: 'Mindestens eine Kategorie muss ausgewählt werden.' }),
  startingAt: z.iso.date({
    message: 'Bitte das Startdatum des Projekts angeben.',
  }),
  endingAt: z.iso.date({ message: 'Bitte das Enddatum des Projekts angeben.' }),
  isActive: z.boolean(),
  ngoId: z.string(),
});

export function ProjectForm({ isUpdate = false }: { isUpdate: boolean }) {
  const { skills } = useSkills();
  const { categories } = useCategories();
  const { user, tokens } = useAuth();
  const router = useRouter();

  const params = useParams<{ id: string }>();
  const projectId = params?.id;

  const ngoId = user?.id;

  const skillOptions: SelectOption[] = (skills ?? []).map((skill) => ({
    value: skill.id,
    label: skill.name,
  }));

  const categoryOptions: SelectOption[] = (categories ?? []).map(
    (category) => ({
      value: category.id,
      label: category.name,
    })
  );

  const form = useForm<Project, undefined, Project>({
    resolver: zodResolver<Project, undefined, Project>(formSchema),
    defaultValues: {
      name: '',
      description: '',
      city: '',
      zipCode: undefined,
      state: '',
      principal: '',
      compensation: '',
      images: [],
      skills: [],
      categories: [],
      startingAt: '',
      endingAt: '',
      isActive: true,
      ngoId: ngoId || '', // Use authenticated user's ID
    },
    mode: 'onSubmit',
  });

  const { data: projectDetailData, mutate } = useSWR<ProjectDetailResponse>(
    isUpdate && projectId
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/projects/${projectId}`
      : null,
    swrFetcher
  );

  useEffect(() => {
    if (!isUpdate || !projectDetailData) return;

    // Server-Datum → "yyyy-MM-dd" normalisieren
    const toYmd = (value?: string) => {
      if (!value) return '';
      if (value.includes('T') && value.length >= 10) return value.slice(0, 10);
      const parsedDate = parseISO(value);
      return isValid(parsedDate) ? format(parsedDate, 'yyyy-MM-dd') : '';
    };

    // Skills und Categories von Array auf id-Strings mappen - FIXED
    const skillIds: string[] = Array.isArray(projectDetailData.skills)
      ? projectDetailData.skills.map((skill) => skill.id)
      : [];

    const categoryIds: string[] = Array.isArray(projectDetailData.categories)
      ? projectDetailData.categories.map((category) => category.id)
      : [];

    form.reset(
      {
        name: projectDetailData.name ?? '',
        description: projectDetailData.description ?? '',
        city: projectDetailData.city ?? '',
        zipCode: projectDetailData.zipCode ?? undefined,
        state: projectDetailData.state ?? '',
        principal: projectDetailData.principal ?? '',
        compensation: projectDetailData.compensation ?? '',
        images: projectDetailData.images ?? [],
        skills: skillIds,
        categories: categoryIds,
        startingAt: toYmd(projectDetailData.startingAt),
        endingAt: toYmd(projectDetailData.endingAt),
        isActive: projectDetailData.isActive ?? true,
        ngoId: projectDetailData.ngoId ?? (ngoId || ''),
      },
      { keepDirty: false, keepTouched: true }
    );
  }, [isUpdate, projectDetailData, form, ngoId]);

  const onSubmit: SubmitHandler<Project> = async (data) => {
    if (!tokens?.accessToken) {
      toast.error('Authentifizierung fehlgeschlagen');
      return;
    }

    if (!ngoId) {
      toast.error('NGO ID nicht gefunden');
      return;
    }

    const submittedProject = {
      name: data.name,
      description: data.description,
      city: data.city,
      zipCode: data.zipCode,
      state: data.state,
      principal: data.principal,
      compensation: data.compensation || undefined,
      images: data.images,
      skills: data.skills,
      categories: data.categories,
      isActive: data.isActive,
      startingAt: new Date(data.startingAt).toISOString(),
      endingAt: new Date(data.endingAt).toISOString(),
      ngoId: ngoId,
    };

    try {
      const req =
        isUpdate && projectId
          ? updateProject(projectId, submittedProject, tokens.accessToken)
          : createProject(submittedProject, tokens.accessToken);

      toast.promise(req, {
        loading: isUpdate
          ? 'Projekt wird aktualisiert…'
          : 'Projekt wird angelegt…',
        success: isUpdate
          ? 'Projekt wurde aktualisiert. Leite zur Projektseite weiter.'
          : 'Projekt wurde angelegt. Leite zurück zum Dashboard.',
        error: (error) =>
          error instanceof Error && error.message
            ? `Fehler: ${error.message}`
            : isUpdate
            ? 'Fehler: Das Projekt konnte nicht aktualisiert werden.'
            : 'Fehler: Das Projekt konnte nicht angelegt werden.',
      });

      await req;

      if (isUpdate && projectId) {
        router.push(`/projects/${projectId}`);
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteImage = async (imageIndex: number) => {
    if (!tokens?.accessToken || !projectId) {
      toast.error('Authentifizierung fehlgeschlagen');
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/projects/${projectId}/images/${imageIndex}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        }
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

  // Show loading if we don't have user yet
  if (!user || !ngoId) {
    return <div>Lade...</div>;
  }

  return (
    <>
      <MainHeadline variant='page'>
        <span className='font-extralight'>
          {isUpdate ? 'Projekt ' : 'Neues Projekt '}
        </span>
        <strong className='font-bold'>
          {isUpdate ? 'bearbeiten' : 'erstellen'}
        </strong>
      </MainHeadline>

      <div className='container-site'>
        <Card className='bg-light-mint/10 backdrop-blur-xl border-light-mint/20 shadow-xl'>
          <CardContent className='p-8'>
            <ImageDropzone
              resourceId={projectId}
              resourceType='projects'
              onUploadSuccess={() => mutate()}
            />

            {projectDetailData?.images &&
              projectDetailData?.images.length > 0 && (
                <>
                  <h2 className='mb-2 font-sans'>Projektbilder</h2>
                  <div className='flex mb-8 h-24 gap-x-4'>
                    {projectDetailData?.images.map((image, index) => (
                      <Card
                        className='bg-light-mint/10 flex items-center justify-center h-full relative group'
                        key={image}
                      >
                        <Image
                          width={100}
                          height={100}
                          src={image}
                          style={{
                            objectFit: 'cover',
                            maxHeight: '100%',
                            maxWidth: '100%',
                          }}
                          alt={`Bild für Projekt ${projectDetailData.name}`}
                        />

                        <button
                          onClick={() => handleDeleteImage(index)}
                          className='absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'
                          type='button'
                        >
                          <XCircle fill='red' />
                        </button>
                      </Card>
                    ))}
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
                    Projektinformationen
                  </h3>

                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Projektname*</FormLabel>
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
                    name='description'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Projektbeschreibung*</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='Beschreibe deine Projektidee.'
                            className='resize-none bg-white/50 border border-light-mint/30 rounded-lg h-24 focus:bg-white/70 transition-all duration-200'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Ort und Zeit */}
                <div className='space-y-6'>
                  <h3 className='text-lg font-semibold text-prussian border-b border-light-mint/30 pb-2'>
                    Ort und Zeit
                  </h3>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <FormField
                      control={form.control}
                      name='city'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stadt*</FormLabel>
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
                  </div>

                  <FormField
                    control={form.control}
                    name='state'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bundesland*</FormLabel>
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
                      name='startingAt'
                      render={({ field }) => {
                        const toDate = (value?: string) => {
                          if (!value) return undefined;
                          const candidates = [
                            () => parseISO(value),
                            () => parse(value, 'yyyy-MM-dd', new Date()),
                            () => new Date(value),
                          ];
                          for (const mk of candidates) {
                            const date = mk();
                            if (isValid(date)) return date;
                          }
                          return undefined;
                        };

                        const selectedDate = toDate(field.value);

                        return (
                          <FormItem className='flex flex-col'>
                            <FormLabel>Startdatum*</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <ButtonComponent
                                    variant='secondary'
                                    size='md'
                                    enableHoverEffect={false}
                                    className={cn(
                                      'w-full pl-3 text-left font-normal bg-white/50 border border-light-mint/30 rounded-lg h-11 hover:bg-white/70 transition-all duration-200',
                                      !selectedDate && 'text-muted-foreground'
                                    )}
                                  >
                                    {selectedDate && isValid(selectedDate) ? (
                                      format(selectedDate, 'PPP', {
                                        locale: de,
                                      })
                                    ) : (
                                      <span>Datum wählen</span>
                                    )}
                                    <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                  </ButtonComponent>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className='w-auto p-0 bg-white/95 backdrop-blur border border-light-mint/30 shadow-xl rounded-lg'
                                align='start'
                              >
                                <Calendar
                                  mode='single'
                                  selected={selectedDate}
                                  onSelect={(date) =>
                                    field.onChange(
                                      date ? format(date, 'yyyy-MM-dd') : ''
                                    )
                                  }
                                  disabled={(date) =>
                                    date < new Date('2024-12-31')
                                  }
                                  captionLayout='dropdown'
                                  locale={de}
                                  className='bg-white'
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    <FormField
                      control={form.control}
                      name='endingAt'
                      render={({ field }) => {
                        const toDate = (value: unknown) => {
                          if (!value) return undefined;

                          if (value instanceof Date)
                            return isValid(value) ? value : undefined;

                          if (typeof value === 'string') {
                            const candidates = [
                              () => parseISO(value),
                              () => parse(value, 'yyyy-MM-dd', new Date()),
                              () => new Date(value),
                            ];
                            for (const mk of candidates) {
                              const date = mk();
                              if (isValid(date)) return date;
                            }
                          }

                          return undefined;
                        };

                        const selectedDate = toDate(field.value);

                        return (
                          <FormItem className='flex flex-col'>
                            <FormLabel>Enddatum*</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <ButtonComponent
                                    variant='secondary'
                                    size='md'
                                    enableHoverEffect={false}
                                    className={cn(
                                      'w-full pl-3 text-left font-normal bg-white/50 border border-light-mint/30 rounded-lg h-11 hover:bg-white/70 transition-all duration-200',
                                      !selectedDate && 'text-muted-foreground'
                                    )}
                                  >
                                    {selectedDate && isValid(selectedDate) ? (
                                      format(selectedDate, 'PPP', {
                                        locale: de,
                                      })
                                    ) : (
                                      <span>Datum wählen</span>
                                    )}
                                    <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                  </ButtonComponent>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className='w-auto p-0 bg-white/95 backdrop-blur border border-light-mint/30 shadow-xl rounded-lg'
                                align='start'
                              >
                                <Calendar
                                  mode='single'
                                  selected={selectedDate}
                                  onSelect={(date) =>
                                    field.onChange(
                                      date ? format(date, 'yyyy-MM-dd') : ''
                                    )
                                  }
                                  disabled={(date) =>
                                    date < new Date('2024-12-31')
                                  }
                                  captionLayout='dropdown'
                                  locale={de}
                                  className='bg-white'
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </div>
                </div>

                {/* Kontakt und Vergütung */}
                <div className='space-y-6'>
                  <h3 className='text-lg font-semibold text-prussian border-b border-light-mint/30 pb-2'>
                    Kontakt und Vergütung
                  </h3>

                  <FormField
                    control={form.control}
                    name='principal'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ansprechpartner*</FormLabel>
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
                    name='compensation'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vergütung (optional)</FormLabel>
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

                {/* Fähigkeiten und Kategorien */}
                <div className='space-y-6'>
                  <h3 className='text-lg font-semibold text-prussian border-b border-light-mint/30 pb-2'>
                    Fähigkeiten und Kategorien
                  </h3>

                  <FormField
                    control={form.control}
                    name='skills'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gesuchte Fähigkeiten*</FormLabel>
                        <FormControl>
                          {skillOptions.length > 0 ? (
                            <MultiSelect
                              options={skillOptions}
                              value={field.value ?? []}
                              onChange={field.onChange}
                              placeholder='Fähigkeiten auswählen'
                              searchPlaceholder='Suchen…'
                              className='bg-white/50 border border-light-mint/30 rounded-lg h-11 hover:bg-white/70  transition-all duration-200'
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
                    name='categories'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Projektkategorie*</FormLabel>
                        <FormControl>
                          {categoryOptions.length > 0 ? (
                            <MultiSelect
                              options={categoryOptions}
                              value={field.value ?? []}
                              onChange={field.onChange}
                              placeholder='Kategorien auswählen'
                              searchPlaceholder='Suchen…'
                              className='bg-white/50 border border-light-mint/30 rounded-lg h-11 hover:bg-white/70 transition-all duration-200'
                            />
                          ) : (
                            <div>Lade Kategorien...</div>
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='flex gap-4'>
                  <ButtonComponent
                    variant='primary'
                    size='md'
                    type='submit'
                    className='bg-white/50 border border-light-mint/30 rounded-lg'
                  >
                    Speichern
                  </ButtonComponent>
                  <Link href='/dashboard'>
                    <ButtonComponent
                      variant='secondary'
                      size='md'
                      className='bg-white/50 border border-light-mint/30 rounded-lg'
                    >
                      Abbrechen
                    </ButtonComponent>
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
