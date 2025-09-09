import { Project } from "@/types/project.d";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";

interface ProjectProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectProps) {
  const image = project.images.length > 0 ? project.images[0] : "";
  const categoryName =
    project.categories.length > 0 ? project.categories[0].name : "";

  return (
    <Card className="w-full max-w-sm">
      <Link href={`/projects/${project.id}`}>
        <CardHeader>
          <CardTitle>{project.name}</CardTitle>
          <CardDescription>
            <Image
              src={`/images/projects/${image}`}
              alt={`Bild vom Projekt ${project.name}`}
              width="500"
              height="300"
              sizes="(max-width: 640px) 100vw, 900px"
            />
          </CardDescription>
        </CardHeader>
      </Link>
      <CardContent>
        <div className="flex items-center gap-2">
          <div className="flex flex-col w-full">
            <Badge variant="secondary">
              {new Date(project.startingAt).toLocaleDateString()}
              <span> - </span>
              {new Date(project.endingAt).toLocaleDateString()}
            </Badge>
            <Badge variant="secondary">Ort: {project.city}</Badge>
            <Badge variant="secondary">Kategorie: {categoryName}, ...</Badge>
          </div>
          <div className="flex flex-col w-full">
            <Badge asChild variant="default">
              <Link href={`/ngos/${project.ngoId}`}>
                Verein: {project.ngo.name}
              </Link>
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
