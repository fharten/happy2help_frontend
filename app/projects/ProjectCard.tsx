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
  const categoryNames = project.categories.slice(0, 3).map((cat) => cat.name);

  return (
    <Card className="w-full max-w-auto bg-[var(--color-light-mint)]/50 border-0 py-2 px-2 shadow-2xl rounded-[2rem] transition-transform duration-200 hover:scale-[1.01] hover:shadow-3xl">
      <div className="flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-10 items-stretch">
        {/* Bild */}
        <div className="flex justify-center w-full md:order-2 order-1">
          <div className="w-full aspect-[4/3]">
            <Image
              className="w-full h-full object-cover rounded-[1.5rem] shadow-2xl border-0"
              src={`/images/projects/${image}`}
              alt={`Bild vom Projekt ${project.name}`}
              width={500}
              height={320}
              sizes="(max-width: 640px) 100vw, 900px"
              style={{
                background: "linear-gradient(135deg, #e0f7fa 0%, #f1f8e9 100%)",
              }}
            />
          </div>
        </div>
        {/* Link & Infos */}
        <div className="flex flex-col justify-between h-full p-4 md:p-8 md:order-1 order-2">
          {/* Titel und Basisinfos */}
          <div>
            <Link href={`/projects/${project.id}`}>
              <CardHeader className="p-0 mb-6">
                <CardTitle className="headline-card text-mint-900 hover:brightness-110 transition-all duration-150 cursor-pointer drop-shadow-sm">
                  {project.name}
                </CardTitle>
                <div className="flex items-center gap-2 text-lg mt-2">
                  <span className="font-medium opacity-50">{project.city}</span>
                </div>
                <CardDescription className="text-lg text-mint-700 mt-3 font-normal">
                  {project.description}
                </CardDescription>
              </CardHeader>
            </Link>
            <CardContent className="p-0">
              <div className="flex flex-col gap-3 text-mint-900">
                <div className="text-base font-medium text-mint-800">
                  von {project.ngo.name}
                </div>
              </div>
            </CardContent>
          </div>
          {/* Badges */}
          <div className="mt-10 flex flex-row gap-2 items-end flex-wrap">
            {categoryNames.length > 0 ? (
              categoryNames.map((name, index) => (
                <Badge
                  key={name + index}
                  className="bg-white/70 text-mint-900 px-3 py-1 text-sm font-medium rounded-full shadow-none hover:bg-white/90 transition-all duration-150"
                >
                  {name}
                </Badge>
              ))
            ) : (
              <Badge className="bg-white/70  text-mint-900 px-3 py-1 text-sm font-medium rounded-full shadow-none">
                Keine Kategorie
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
