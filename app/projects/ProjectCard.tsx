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

interface ProjectProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectProps) {
  let image = project.images[0];
  let categoryName = "";
  if (project.categories) {
    categoryName = project.categories[0].name;
  }
  let item = project.categories[0];
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{project.name}</CardTitle>
        <CardDescription>{project.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Image
          src={`/images/projects/${image}`}
          alt="Projektbild"
          width="500"
          height="300"
          sizes="(max-width: 640px) 100vw, 900px"
        />
        <div className="flex items-center gap-2">
          <div className="flex flex-col w-full">
            <Badge variant="secondary">
              Start: {new Date(project.startingAt).toLocaleDateString()}
              <span> </span>
              Ende: {new Date(project.endingAt).toLocaleDateString()}
            </Badge>
            <Badge variant="secondary">Ort: {project.city}</Badge>
          </div>
          <div className="flex flex-col w-full">
            <Badge variant="secondary">Kategorie: {categoryName}</Badge>
            <Badge variant="secondary">Verein: </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
