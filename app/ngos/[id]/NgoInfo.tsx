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

export default function NgoInfo() {
  const { id } = useParams();
  // get NGO information
  const {
    data: ngoData,
    isLoading: isNgoLoading,
    error: errorNgo,
  } = useSWR(
    id ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/ngos/${id}` : null,
    fetcher
  );

  // get projects of the NGO
  const {
    data: projectsData,
    isLoading: isLoadingProjects,
    error: errorProjects,
  } = useSWR<{
    data: { projects: Projects };
  }>(
    id ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/ngos/${id}/projects` : null,
    fetcher
  );

  // Loading ...
  if (isNgoLoading || isLoadingProjects || !ngoData || !projectsData)
    return <div>Loading...</div>;

  // Error
  if (errorNgo || errorProjects) return <div>Failed to load NGO data</div>;

  // Success
  const ngo = ngoData.data;
  const projects = projectsData.data.projects;
  const image = ngo.image ? ngo.image : "logo_happy2help.jpg";

  const npoString = ngo.isNonProfit
    ? `NPO aus ${ngo.state}`
    : `Verein aus ${ngo.state}`;

  const registeredString = `Registriert: ${new Date(
    ngo.createdAt
  ).toLocaleDateString()}`;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <Image
          src={`/images/projects/${image}`}
          alt="Logo"
          width="400"
          height="300"
          sizes="(max-width: 640px) 100vw, 900px"
        />
        <CardTitle>{ngo.name}</CardTitle>
        <CardDescription>
          <div>{npoString}</div>
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
            <h2 className="font-semibold">Bereiche:</h2>
            <ul>
              {ngo.industry &&
                ngo.industry.map((area: string) => <li key={area}>{area}</li>)}
            </ul>
          </div>
          <div>
            <h2 className="font-semibold">Adresse:</h2>
            <div>{ngo.name}</div>
            <div>{ngo.streetAndNumber}</div>
            <div>
              {ngo.zipCode} {ngo.city}
            </div>
          </div>
          <div>
            <h2 className="font-semibold">Kontakt:</h2>
            <div>{ngo.principal} (Vorstand)</div>
            {ngo.contactEmail && <div>{ngo.contactEmail}</div>}
            {ngo.phone && <div>{ngo.phone}</div>}
          </div>
          <div>{registeredString}</div>
        </div>
      </CardContent>
    </Card>
  );
}
