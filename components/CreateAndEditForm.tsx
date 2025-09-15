"use client"
import { useEffect } from "react";
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation'

import { format, parse, parseISO, isValid } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react"
import { de } from 'date-fns/locale';
import { MultiSelect, type Option as SelectOption } from "./ui/multiselect";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import ButtonComponent from "@/components/ButtonComponent";
import { Calendar } from "@/components/ui/calendar";
import useSWR from "swr";
import { toast } from "sonner"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input"
import { Textarea } from "./ui/textarea";


// hardcoded NGO id for testing
const ngo: string = "294a4429-8b0d-4132-a723-fe6d872dd6d8";

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

interface SkillResponse {
  success: boolean;
  message: string;
  data: Skill[] | undefined;
  count: number;
}

interface CategoryResponse {
  success: boolean;
  message: string;
  data: Category[] | undefined;
  count: number;
}

interface Project {
  name: string;
  description: string;
  city: string;
  zipCode: number | undefined;
  state: string;
  principal: string;
  compensation?: string;
  images?: string[],
  skills: string[],
  categories: string[],
  isActive: boolean;
  startingAt: string;
  endingAt: string;
  ngoId: string;
}

type ProjectDetailResponse = Partial<Project> & {
  id?: string;
  skills?: Array<string | { id: string }>;
  categories?: Array<string | { id: string }>;
};

const fetcher = async (url: string): Promise<SkillResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch skill data");
  }
  return res.json();
};

function useSkills() {
  const { data, error, isLoading, mutate } = useSWR<SkillResponse>(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/skills`,
    fetcher,
  );

  let skillData: Skill[] | undefined = [];

  if (data && data.hasOwnProperty("data")) {
    skillData = data.data;
  }

  return {
    skills: skillData,
    isLoading,
    isError: error,
    mutate,
  };
}

function useCategories() {
  const { data, error, isLoading, mutate } = useSWR<CategoryResponse>(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/categories`,
    fetcher,
  );

  let categoryData: Category[] | undefined = [];

  if (data && data.hasOwnProperty("data")) {
    categoryData = data.data;
  }

  return {
    categories: categoryData,
    isLoading,
    isError: error,
    mutate,
  };
}

interface ProjectGetResponse {
  success: boolean;
  message: string;
  data: Project;
}



// Create new project
export async function createProject(project: Project) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/projects/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(project),
  });

  console.log("Response from server: ", res);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to create project");
    
  }

  const newProject = await res.json();

  return newProject;
}

// Update project
export async function updateProject(id: string, project: Project) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/projects/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(project),
  });

  console.log("Response from server (update): ", res);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to update project");
  }

  const updatedProject = await res.json();
  return updatedProject;
}


const formSchema = z.object({
  name: z.string().min(2, { message: 'Projektname muss mindestens 2 Zeichen lang sein.' }),
  description: z.string().min(50, { message: 'Die Beschreibung muss mindestens 50 Zeichen lang sein.' }),
  city: z.string().min(1, { message: 'Dieses Feld ist verpflichtend.' }),
  zipCode: z.number( { message: 'Bitte eine gültige Postleitzahl angeben.'}),
  state: z.string().min(1, { message: 'Dieses Feld ist verpflichtend.' }),
  principal: z.string().min(1, { message: 'Dieses Feld ist verpflichtend.' }),
  compensation: z.string().optional(),
  images: z.array(z.string().min(1)).optional().default([]),
  skills: z.array(z.string().min(1)).min(1, { message: "Mindestens eine gesuchte Fähigkeit muss angegeben werden." }),
  categories: z.array(z.string().min(1)).min(1, { message: 'Mindestens eine Kategorie muss ausgewählt werden.' }),
  startingAt: z.iso.date({ message: 'Bitte das Startdatum des Projekts angeben.' }),
  endingAt: z.iso.date({ message: 'Bitte das Enddatum des Projekts angeben.' }),
  isActive: z.boolean(),
  ngoId: z.string(),
});

export function ProjectForm({ isUpdate = false }: { isUpdate?: boolean }) {
    const { skills } = useSkills();
    const { categories } = useCategories();
    const router = useRouter();

    const params = useParams<{ id: string }>();
    const projectId = params?.id;


    const skillOptions: SelectOption[] = (skills ?? []).map((skill) => ({
  value: skill.id,
  label: skill.name,
}));
const categoryOptions: SelectOption[] = (categories ?? []).map((category) => ({
  value: category.id,
  label: category.name,
}));

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
      startingAt: "",
      endingAt: "",
      isActive: true,
      ngoId: ngo,
    },
    mode: 'onSubmit',
  });


  const { data: projectDetailResponse } = useSWR<ProjectGetResponse>(
    isUpdate && projectId
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/projects/${projectId}`
      : null,
    (url: string) => fetch(url).then((r) => r.json())
  );


  const projectDetailData = projectDetailResponse?.data as ProjectDetailResponse | undefined;
useEffect(() => {
  if (!isUpdate || !projectDetailData) return;

  const data = projectDetailData;

  // Server-Datum → "yyyy-MM-dd" normalisieren
  const toYmd = (value?: string) => {
    if (!value) return "";
    if (value.includes("T") && value.length >= 10) return value.slice(0, 10);
    const parsedDate = parseISO(value);
    return isValid(parsedDate) ? format(parsedDate, "yyyy-MM-dd") : "";

  };

  // Skills und Categories von Array auf id-Strings mappen
  const skillIds: string[] =
  Array.isArray(data.skills)
    ? ((data.skills as Array<{ id: string }>)
        .map((entry) => entry.id)
        .filter(Boolean) as string[])
    : [];

  const categoryIds: string[] =
  Array.isArray(data.categories)
    ? ((data.categories as Array<{ id: string }>)
        .map((entry) => entry.id)
        .filter(Boolean) as string[])
    : [];

  form.reset(
    {
      name: data.name ?? "",
      description: data.description ?? "",
      city: data.city ?? "",
      zipCode: (data.zipCode as number | undefined) ?? undefined,
      state: data.state ?? "",
      principal: (data.principal as string | undefined) ?? "",
      compensation: (data.compensation as string | undefined) ?? "",
      images: (data.images as string[] | undefined) ?? [],
      skills: skillIds as string[],
      categories: categoryIds as string[],
      startingAt: toYmd(data.startingAt as string | undefined),
      endingAt: toYmd(data.endingAt as string | undefined),
      isActive: typeof data.isActive === "boolean" ? data.isActive : true,
      ngoId: (data.ngoId as string | undefined) ?? ngo,
    },
    { keepDirty: false, keepTouched: true }
  );
}, [isUpdate, projectDetailData, form]);

  const onSubmit: SubmitHandler<Project> = async (data) => {
      const submittedProject = {
        name: data.name,
      description: data.description,
      city: data.city,
      zipCode: data.zipCode,
      state: data.state,
      principal: data.principal,
      compensation: data.compensation || undefined,
      images: ['dummy.jpg'],
      skills: data.skills,
      categories: data.categories,
      isActive: data.isActive,
      startingAt: new Date(data.startingAt).toISOString(),
      endingAt: new Date(data.endingAt).toISOString(),
      ngoId: ngo,
      };
  
      try {

    const req = isUpdate && projectId
        ? updateProject(projectId, submittedProject)
        : createProject(submittedProject);


     toast.promise(req, {
        loading: isUpdate ? "Projekt wird aktualisiert…" : "Projekt wird angelegt…",
        success: isUpdate
          ? "Projekt wurde aktualisiert. Leite zur Projektseite weiter."
          : "Projekt wurde angelegt. Leite zurück zum Dashboard.",
        error: (error) =>
          error instanceof Error && error.message
            ? `Fehler: ${error.message}`
            : isUpdate
            ? "Fehler: Das Projekt konnte nicht aktualisiert werden."
            : "Fehler: Das Projekt konnte nicht angelegt werden.",
      });

    const createdOrUpdated = await req;
      console.log(isUpdate ? "Updated project:" : "Created project:", createdOrUpdated);

      if (isUpdate && projectId) {
        router.push(`/projects/${projectId}`);
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error(error);
    }
};


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Projektname*</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

                <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stadt*</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

                <FormField
  control={form.control}
  name="zipCode"
  render={({ field }) => (
    <FormItem>
      <FormLabel>PLZ*</FormLabel>
      <FormControl>
        <Input
          type="number"
          inputMode="numeric"
          value={field.value ?? ""}
          onChange={(event) => {
            const value = event.target.valueAsNumber;
            field.onChange(!value ? undefined : Number(value));
          }}
          onBlur={field.onBlur}
          name={field.name}
          ref={field.ref}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>


                <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bundesland*</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="principal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ansprechpartner*</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="compensation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vergütung (optional)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

                <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Projektbeschreibung*</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Beschreibe deine Projektidee."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />



        <FormField
  control={form.control}
  name="startingAt"
  render={({ field }) => {
    const toDate = (value?: string) => {
      if (!value) return undefined;
      const candidates = [() => parseISO(value), () => parse(value, "yyyy-MM-dd", new Date()), () => new Date(value)];
      for (const mk of candidates) {
        const date = mk();
        if (isValid(date)) return date;
      }
      return undefined;
    };

    const selectedDate = toDate(field.value);

    return (
      <FormItem className="flex flex-col">
        <FormLabel>Startdatum*</FormLabel>
        <Popover>
          <PopoverTrigger asChild>
            <FormControl>
              <ButtonComponent
                variant="secondary"
                size="md"
                className={cn("w-[240px] pl-3 text-left font-normal", !selectedDate && "text-muted-foreground")}
              >
                {selectedDate && isValid(selectedDate) ? format(selectedDate, "PPP", { locale: de }) : <span>Datum wählen</span>}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </ButtonComponent>
            </FormControl>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
              disabled={(date) => date < new Date("2024-12-31")}
              captionLayout="dropdown" locale={ de }
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
  name="endingAt"
  render={({ field }) => {
    const toDate = (value: unknown) => {
  if (!value) return undefined;

    if (value instanceof Date) return isValid(value) ? value : undefined;

  if (typeof value === "string") {
    const candidates = [
      () => parseISO(value),                          
      () => parse(value, "yyyy-MM-dd", new Date()),   
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
      <FormItem className="flex flex-col">
        <FormLabel>Enddatum*</FormLabel>
        <Popover>
          <PopoverTrigger asChild>
            <FormControl>
              <ButtonComponent
                variant="secondary"
                size="md"
                className={cn("w-[240px] pl-3 text-left font-normal", !selectedDate && "text-muted-foreground")}
              >
                {selectedDate && isValid(selectedDate) ? format(selectedDate, "PPP", { locale: de }) : <span>Datum wählen</span>}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </ButtonComponent>
            </FormControl>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
              disabled={(date) => date < new Date("2024-12-31")}
              captionLayout="dropdown" locale={ de }
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
          name="skills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gesuchte Fähigkeiten*</FormLabel>
              <FormControl>
                <MultiSelect
                  options={skillOptions}
                  value={field.value ?? []}
                  onChange={field.onChange}
                  placeholder="Fähigkeiten auswählen"
                  searchPlaceholder="Suchen…"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

<FormField
          control={form.control}
          name="categories"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Projektkategorie</FormLabel>
              <FormControl>
                <MultiSelect
                  options={categoryOptions}
                  value={field.value ?? []}
                  onChange={field.onChange}
                  placeholder="Kategorien auswählen"
                  searchPlaceholder="Suchen…"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <ButtonComponent variant="primary" size="md" type="submit">
          Speichern
        </ButtonComponent>
        <Link href="./../dashboard">
          <ButtonComponent variant="secondary" size="md">
            Abbrechen
          </ButtonComponent>
        </Link>
      </form>
    </Form>
  )
}
