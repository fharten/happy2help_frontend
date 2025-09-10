"use client";
import { Card } from "@/components/ui/card";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import useSWR from "swr";
import { ProjectForm } from "@/components/CreateAndEditForm";

interface Skill {
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

interface Project {
  name: string;
  description: string;
  city: string;
  zipCode: number;
  state: string;
  principal: string;
  compensation?: string;
  isActive: boolean;
  startingAt: string;
  endingAt: string;
}

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

export async function createProject(project: Project) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/projects/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(project),
  });

  console.log("Response from server: ", res);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to create project");
  }

  const newProject = await res.json();

  return newProject;
}

export default function AddNewProject() {
  const { skills, isLoading, isError } = useSkills();
  console.log("Skills loaded?: ", skills);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Project>();

  const onSubmit: SubmitHandler<Project> = async (data) => {
    const submittedProject = {
      name: data.name,
      description: data.description,
      city: data.city,
      zipCode: Number(data.zipCode),
      state: data.state,
      principal: data.principal,
      compensation: data.compensation || undefined,
      isActive: !!data.isActive,
      startingAt: data.startingAt ? new Date(data.startingAt) : null,
      endingAt: data.endingAt ? new Date(data.endingAt) : null,
    };

    // try {
    //   const created = await createProject(submittedProject as Project);
    //   console.log("Created project:", created);
    //   // TODO: show a toast, reset form, navigate, etc.
    // } catch (err) {
    //   console.error(err);
    //   // TODO: surface error to the user
    // }

    console.log("Submit project:", submittedProject);
  };

  return (
    <ProjectForm/>
    // <section className="flex flex-row justify-center">
    //   <Card>
    //     <form
    //       className="mr-[24px] ml-[24px] flex min-w-[75vw] flex-col"
    //       onSubmit={handleSubmit(onSubmit)}
    //     >
    //       <label className="mb-[8px] flex flex-col" htmlFor="name">
    //         Projektname*
    //         <Input
    //           id="name"
    //           {...register("name", { required: true, maxLength: 200 })}
    //         />
    //         {errors.name && <span>Dieses Feld ist verpflichtend.</span>}
    //       </label>

    //       <label className="mb-[8px] flex flex-col" htmlFor="description">
    //         Beschreibung*
    //         <Textarea
    //           id="description"
    //           {...register("description", { required: true })}
    //         />
    //         {errors.description && (
    //           <span>Dieses Feld ist verpflichtend.</span>
    //         )}
    //       </label>

    //       <label className="mb-[8px] flex flex-col" htmlFor="city">
    //         Stadt*
    //         <Input
    //           id="city"
    //           {...register("city", { required: true, maxLength: 200 })}
    //         />
    //         {errors.city && <span>Dieses Feld ist verpflichtend.</span>}
    //       </label>

    //       <label className="mb-[8px] flex flex-col" htmlFor="zipCode">
    //         PLZ*
    //         <Input
    //           id="zipCode"
    //           type="number"
    //           {...register("zipCode", {
    //             required: true,
    //             valueAsNumber: true,
    //           })}
    //         />
    //         {errors.zipCode && <span>Dieses Feld ist verpflichtend.</span>}
    //       </label>

    //       <label className="mb-[8px] flex flex-col" htmlFor="state">
    //         Bundesland*
    //         <Input
    //           id="state"
    //           {...register("state", { required: true, maxLength: 200 })}
    //         />
    //         {errors.state && <span>Dieses Feld ist verpflichtend.</span>}
    //       </label>

    //       <label className="mb-[8px] flex flex-col" htmlFor="principal">
    //         Ansprechpartner*:
    //         <Input
    //           id="principal"
    //           {...register("principal", { required: true, maxLength: 200 })}
    //         />
    //         {errors.principal && (
    //           <span>Dieses Feld ist verpflichtend.</span>
    //         )}
    //       </label>

    //       <label className="mb-[8px] flex flex-col" htmlFor="compensation">
    //         Vergütung (optional)
    //         <Input id="compensation" {...register("compensation")} />
    //       </label>

    //       <label className="mb-[8px] flex flex-col" htmlFor="startingAt">
    //         Startdatum*
    //         <Input
    //           id="startingAt"
    //           type="date"
    //           {...register("startingAt", { required: true })}
    //         />
    //         {errors.startingAt && (
    //           <span>Dieses Feld ist verpflichtend.</span>
    //         )}
    //       </label>

    //       <label className="mb-[8px] flex flex-col" htmlFor="endingAt">
    //         Enddatum*
    //         <Input
    //           id="endingAt"
    //           type="date"
    //           {...register("endingAt", { required: true })}
    //         />
    //         {errors.endingAt && (
    //           <span>Dieses Feld ist verpflichtend.</span>
    //         )}
    //       </label>

    //       <Button type="submit">Projekt hinzufügen</Button>
    //     </form>
    //     <ul>
    //       {!isLoading
    //         ? skills?.map((skill: Skill) => (
    //             <li key={skill.id}>{skill.name}</li>
    //           ))
    //         : []}
    //     </ul>
    //   </Card>
    // </section>
  );
}
