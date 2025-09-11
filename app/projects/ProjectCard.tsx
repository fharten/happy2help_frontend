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
import { Link as LucideLink } from "lucide-react";
import { Calendar, Building2 } from "lucide-react";

interface ProjectProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectProps) {
  const availableImages = ["project1_img1.jpg", "project1_img2.jpg"];

  const getImageSrc = () => {
    if (project.images.length > 0 && project.images[0]) {
      const requestedImage = project.images[0];
      if (availableImages.includes(requestedImage)) {
        return `/images/projects/${requestedImage}`;
      }
    }
    return "/images/fallback.png";
  };

  const categoryNames = project.categories.slice(0, 3).map((cat) => cat.name);

  return (
    <Card className="w-full max-w-auto bg-[var(--color-light-mint)]/50 border-0 py-0 px-0 shadow-2xl rounded-[2rem] transition-transform duration-200 hover:scale-[1.01] hover:shadow-3xl">
      <div className="flex flex-col md:grid md:grid-cols-2 lg:gap-6 md:gap-10 items-stretch">
        {/* Bild */}
        <div className="flex justify-center w-full md:order-2 order-1">
          <div className="w-full aspect-[4/3]">
            <Image
              className="w-full h-full object-cover rounded-t-[1.5rem] lg:rounded-tl-[0rem] lg:rounded-r-[1.5rem] shadow-2xl border-0"
              src={getImageSrc()}
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
            <CardHeader className="p-0 lg:mb-6">
              <div className="flex flex-row items-center justify-between gap-2">
                <Link
                  href={`/projects/${project.id}`}
                  className="flex-1 min-w-0 group"
                >
                  <CardTitle className="headline-card text-mint-900 group-hover:brightness-110 transition-all duration-150 cursor-pointer drop-shadow-sm m-0 p-0 truncate">
                    {project.name}
                  </CardTitle>
                </Link>
                <Link
                  href={`/ngos/${project.ngo.id}`}
                  className="inline-flex items-center gap-1.5 text-mint-800 hover:text-mint-600 group transition-colors text-sm md:text-base font-medium whitespace-nowrap"
                >
                  <LucideLink
                    size={14}
                    className="md:size-[15px] opacity-70 md:opacity-60 group-hover:opacity-100 transition-opacity duration-150"
                  />
                  <span className="opacity-70 md:opacity-60 group-hover:opacity-100 transition-opacity duration-150">
                    {project.ngo.name}
                  </span>
                </Link>
              </div>
              <div className="flex flex-row justify-between">
                <div className="flex flex-wrap gap-2 w-full mt-2 mb-4">
                  <span className="flex items-center text-mint-700 text-[15px] font-normal opacity-80">
                    <span className="flex items-center gap-1 mr-1">
                      <Building2 size={15} className="text-mint-400 mr-1" />
                      {project.city}
                    </span>
                    <span className="hidden md:inline-block text-mint-300 mx-2">
                      |
                    </span>
                    <span className="flex items-center gap-1 ml-2">
                      <Calendar size={15} className="text-mint-400 mr-1" />
                      {project.startingAt
                        ? new Date(project.startingAt).toLocaleString("de-DE", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : ""}
                    </span>
                  </span>
                </div>
              </div>
              <div className="hidden md:block">
                <CardDescription className="text-base text-mint-700 mt-6 font-normal">
                  {project.description.length > 160
                    ? project.description.substring(0, 157) + "..."
                    : project.description}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0"></CardContent>
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
