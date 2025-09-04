"use client";

import { useParams, usePathname } from "next/navigation";
import React from "react";
import useSWR from "swr";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
}

interface Skill {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  images: string[];
  categories: Category[];
  city: string;
  zipCode: number;
  state: string;
  principal: string;
  compensation?: string;
  isActive: boolean;
  skills: Skill[];
  startingAt: string;
  endingAt: string;
}

type FetchError = Error & { info?: unknown; status?: number };

const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const error: FetchError = new Error(
      "An error occurred while fetching the data."
    );
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }

  return res.json();
};

const ProjectDetailPage = () => {
  const { id } = useParams();
  const pathname = usePathname();
  const parentUrl = pathname?.split("/").slice(0, -1).join("/") || "/";

  const { data, isLoading, isValidating, error } = useSWR<{ data: Project }>(
    id ? `http://localhost:3333/api/projects/${id}` : null,
    fetcher
  );

  if (isLoading || !data) return <div>Lade...</div>;
  if (error) return <div>Fehler: {error.message}</div>;

  const project = data.data;

  return (
    <div>
      <div className="max-w-3xl mx-auto p-6">
        {/* Carousel */}
        <Carousel className="w-full rounded-xl overflow-hidden aspect-square sm:aspect-video mb-8">
          <CarouselContent>
            {project.images && project.images.length > 0 ? (
              project.images.map((image: string, index: number) => (
                <CarouselItem key={index}>
                  <div className="relative w-full aspect-square sm:aspect-video">
                    <Image
                      src={`/images/projects/${image}`}
                      alt={`Projektbild ${index + 1}`}
                      fill
                      className="object-cover rounded-xl"
                      sizes="(max-width: 640px) 100vw, 900px"
                    />
                  </div>
                </CarouselItem>
              ))
            ) : (
              <CarouselItem>
                <div className="w-full h-64 flex items-center justify-center bg-gray-200 text-gray-400">
                  Keine Bilder vorhanden
                </div>
              </CarouselItem>
            )}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>

        {/* Project Name */}
        <h1 className="text-4xl font-bold mb-2">{project.name}</h1>

        {/* Project Status */}
        <Badge
          className="mb-4"
          variant={project.isActive ? "default" : "secondary"}
        >
          {project.isActive ? "Aktiv" : "Abgeschlossen"}
        </Badge>

        {/* Project Description */}
        <p className="text-lg mb-6 text-gray-700">{project.description}</p>

        {/* Project Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <span className="font-semibold">Start:</span>{" "}
            {new Date(project.startingAt).toLocaleDateString()}
          </div>
          <div>
            <span className="font-semibold">Ende:</span>{" "}
            {new Date(project.endingAt).toLocaleDateString()}
          </div>
          <div>
            <span className="font-semibold">Stadt:</span> {project.city}
          </div>
          <div>
            <span className="font-semibold">PLZ:</span> {project.zipCode}
          </div>
          <div>
            <span className="font-semibold">Bundesland:</span> {project.state}
          </div>
          <div>
            <span className="font-semibold">Ansprechpartner:</span>{" "}
            {project.principal}
          </div>
          {project.compensation && (
            <div>
              <span className="font-semibold">Aufwandsentschädigung:</span>{" "}
              {project.compensation}
            </div>
          )}
        </div>

        {/* Skills */}
        <div className="mb-6">
          <span className="font-semibold">Fähigkeiten:</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {project.skills.map((skill: Skill) => (
              <Badge key={skill.id} variant="outline">
                {skill.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Zurück-Link */}
        <Link
          href={parentUrl}
          className="mt-6 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 inline-block"
        >
          Zurück zur Übersicht
        </Link>

        {/* Bewerben-Button */}
        <button
          className="ml-4 mt-6 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 inline-block"
          onClick={() => alert("Bewerbung abgeschickt!")}
        >
          Bewerben
        </button>

        {isValidating && (
          <span className="ml-4 text-gray-400">Lädt neu...</span>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailPage;
