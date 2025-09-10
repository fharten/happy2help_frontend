"use client";

import { useParams } from "next/navigation";
import React from "react";
import useSWR from "swr";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { Projects } from "@/types/project";
import Link from "next/link";

// Fetcher function
const fetcher = async (url: string) =>
  await fetch(url).then((res) => res.json());

export default function UserInfo() {
  const { id } = useParams();

  // get user information
  const {
    data: userData,
    isLoading: isUserLoading,
    error: errorUser,
  } = useSWR(
    id ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${id}` : null,
    fetcher
  );

  // get projects of the user
  const {
    data: projectsData,
    isLoading: isLoadingProjects,
    error: errorProjects,
  } = useSWR<{
    data: { projects: Projects };
  }>(
    id ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${id}/projects` : null,
    fetcher
  );

  // Loading ...
  if (isUserLoading || isLoadingProjects || !userData || !projectsData)
    return <div>Loading...</div>;

  // Error
  if (errorUser || errorProjects) return <div>Failed to load NGO data</div>;

  // Success
  const user = userData.data;
  const projects = projectsData.data.projects;
  const image = user.image ? user.image : "logo_happy2help.jpg";

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <Image
          src={`/images/users/${image}`}
          alt="Logo"
          width="400"
          height="300"
          sizes="(max-width: 640px) 100vw, 900px"
        />
        <CardTitle>
          {user.firstName} {user.lastName}, {user.city}
        </CardTitle>
        <CardDescription>
          <div>Geburtsjahr: {user.yearOfBirth}</div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <h2 className="font-semibold">Projekte:</h2>
            <ul>
              {projects &&
                projects.map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    {project.name}
                  </Link>
                ))}
            </ul>
          </div>
          <div>
            <h2 className="font-semibold">Fähigkeiten:</h2>
            <ul>
              {user.skills &&
                user.skills.map((area: string) => <li key={area}>{area}</li>)}
            </ul>
          </div>
          <div>
            <h2 className="font-semibold">Wohnort:</h2>
            <div>
              {user.zipCode} {user.city}
            </div>
            <div>{user.state}</div>
          </div>
          <div>
            <h2 className="font-semibold">Kontakt:</h2>
            {user.contactEmail && <div>{user.contactEmail}</div>}
            {user.phone && <div>{user.phone}</div>}
          </div>
        </div>
        <div>Registriert: {new Date(user.createdAt).toLocaleDateString()}</div>
      </CardContent>
    </Card>
  );
}
