"use client";

import React from "react";
import useSWR from "swr";
import ProjectCard from "./ProjectCard";
import { Project } from "@/types/project.d";

// Fetcher function
const fetcher = async (url: string) =>
  await fetch(url).then((res) => res.json());

export default function Projects() {
  const { data, error, isLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/projects`,
    fetcher
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Failed to load projects</div>;

  if (!data?.data) return <>Keine Projekte vorhanden</>;

  const projects = data.data;

  return (
    <>
      <div className="container-site">
        <ul className="flex flex-col gap-5">
          {projects &&
            projects.map((project: Project) => (
              <li key={project.id}>
                <ProjectCard project={project} />
              </li>
            ))}
        </ul>
      </div>
    </>
  );
}
