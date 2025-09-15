'use client';

import React from 'react';
import useSWR from 'swr';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { authenticatedFetcher } from '@/lib/auth';
import { Projects } from '@/types/project';
import {
  MapPin,
  Calendar,
  Mail,
  Phone,
  Building,
  User as UserIcon,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

interface NgoProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  description?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  categories?: Array<{ id: string; name: string }>;
  projects?: Array<{ id: string; name: string }>;
  createdAt: string;
  updatedAt: string;
  image?: string;
  isDisabled?: boolean;
  zipCode?: string;
  state?: string;
  principal?: string;
  contactEmail?: string;
  streetAndNumber?: string;
  industry?: string[];
}

export default function NgoInfo() {
  const { id } = useParams();

  const { data, isLoading, error } = useSWR<{ data: NgoProfile }>(
    id ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/ngos/${id}` : null,
    authenticatedFetcher
  );

  // get projects of the ngo
  const {
    data: projectsData,
    isLoading: isLoadingProjects,
    error: errorProjects,
  } = useSWR<{
    data: { projects: Projects };
  }>(
    id ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/ngos/${id}/projects` : null,
    authenticatedFetcher
  );

  if (isLoading || isLoadingProjects || !data || !projectsData)
    return (
      <div className="container-site">
        <div className="bg-light-mint/10 backdrop-blur-xl rounded-[2rem] p-8 lg:p-10 text-center">
          <div className="text-prussian font-medium">Lade Vereinsprofil...</div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="container-site">
        <div className="bg-red-50/80 backdrop-blur-xl rounded-[2rem] p-8 lg:p-10 text-center border border-red-200">
          <div className="text-red-700 font-medium">
            Fehler beim Laden: {error.message}
          </div>
        </div>
      </div>
    );

  if (errorProjects)
    return (
      <div className="container-site">
        <div className="bg-red-50/80 backdrop-blur-xl rounded-[2rem] p-8 lg:p-10 text-center border border-red-200">
          <div className="text-red-700 font-medium">
            Fehler beim Laden: {errorProjects.message}
          </div>
        </div>
      </div>
    );

  const ngo = data.data;
  const ngoImage = ngo.image || '/images/projects/logo_happy2help.jpg';
  const projects = projectsData.data.projects;

  console.log('PROJECTS: ', projects);

  const imageUrl =
    ngoImage.startsWith('http') || ngoImage.startsWith('/')
      ? ngoImage
      : `/images/projects/${ngoImage}`;

  return (
    <div className="container-site">
      <Card className="bg-light-mint/10 backdrop-blur-xl border-light-mint/20 shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="relative w-32 h-32">
                {imageUrl.startsWith('http') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt={`Logo von ${ngo.name}`}
                    className="w-full h-full rounded-full object-cover border-4 border-light-mint/40 shadow-lg"
                    onError={(e) => {
                      e.currentTarget.src =
                        '/images/projects/logo_happy2help.jpg';
                    }}
                  />
                ) : (
                  <Image
                    src={imageUrl}
                    alt={`Logo von ${ngo.name}`}
                    fill
                    className="rounded-full object-cover border-4 border-light-mint/40 shadow-lg"
                    sizes="128px"
                  />
                )}
              </div>
              {ngo.isDisabled && (
                <div className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1">
                  <AlertCircle size={16} className="text-white" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold text-prussian">
                {ngo.name}
              </CardTitle>
              <div className="flex items-center gap-2 text-prussian/70">
                <MapPin size={16} />
                <span>
                  {ngo.zipCode} {ngo.city}, {ngo.state}
                </span>
              </div>
              {ngo.isDisabled && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span className="font-medium">
                      Verein ist vorübergehend deaktiviert
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Grundinformationen */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-prussian border-b border-light-mint/30 pb-2 flex items-center gap-2">
              <Building size={20} />
              Vereinsinformationen
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <UserIcon size={16} className="text-prussian/60" />
                <div>
                  <div className="text-sm text-prussian/60">Vorstand</div>
                  <div className="font-medium text-prussian">
                    {ngo.principal}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-prussian/60" />
                <div>
                  <div className="text-sm text-prussian/60">
                    Registriert seit
                  </div>
                  <div className="font-medium text-prussian">
                    {new Date(ngo.createdAt).toLocaleDateString('de-DE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Kontaktinformationen */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-prussian border-b border-light-mint/30 pb-2 flex items-center gap-2">
              <Mail size={20} />
              Kontaktinformationen
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ngo.contactEmail && (
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-prussian/60" />
                  <div>
                    <div className="text-sm text-prussian/60">E-Mail</div>
                    <div className="font-medium text-prussian">
                      {ngo.contactEmail}
                    </div>
                  </div>
                </div>
              )}
              {ngo.phone && (
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-prussian/60" />
                  <div>
                    <div className="text-sm text-prussian/60">Telefon</div>
                    <div className="font-medium text-prussian">{ngo.phone}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Adresse */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-prussian border-b border-light-mint/30 pb-2 flex items-center gap-2">
              <MapPin size={20} />
              Adresse
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-prussian">
              <div className="flex items-center gap-3">
                <Building size={16} className="text-prussian/60" />
                <div>
                  <div className="text-sm text-prussian/60">Name</div>
                  <div className="font-medium text-prussian">{ngo.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-prussian/60" />
                <div>
                  <div className="text-sm text-prussian/60">Straße & Nr.</div>
                  <div className="font-medium text-prussian">
                    {ngo.streetAndNumber}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-prussian/60" />
                <div>
                  <div className="text-sm text-prussian/60">PLZ & Ort</div>
                  <div className="font-medium text-prussian">
                    {ngo.zipCode} {ngo.city}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-prussian/60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3C7.03 3 3 7.03 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-4.97-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7 0-3.87 3.13-7 7-7 3.87 0 7 3.13 7 7 0 3.87-3.13 7-7 7z"
                  />
                </svg>
                <div>
                  <div className="text-sm text-prussian/60">Bundesland</div>
                  <div className="font-medium text-prussian">{ngo.state}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tätigkeitsfelder */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-prussian border-b border-light-mint/30 pb-2">
              Tätigkeitsfelder
            </h3>
            <div className="flex flex-wrap gap-2">
              {ngo.industry && ngo.industry.length > 0 ? (
                ngo.industry.map((field: string) => (
                  <Badge
                    key={field}
                    variant="secondary"
                    className="bg-light-mint/20 text-prussian border-light-mint/30 hover:bg-light-mint/30"
                  >
                    {field}
                  </Badge>
                ))
              ) : (
                <span className="text-prussian/60">
                  Keine Tätigkeitsfelder angegeben
                </span>
              )}
            </div>
          </div>
          {/* Projekte */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-prussian border-b border-light-mint/30 pb-2">
              Projekte
            </h3>
            <div className="font-medium text-prussian">
              <ul>
                {projects &&
                  projects.map((project) => (
                    <Link key={project.id} href={`/projects/${project.id}`}>
                      {project.name}
                    </Link>
                  ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
