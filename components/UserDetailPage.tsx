"use client";

import React from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  image: string;
  skills: string[];
  ngoMemberships: string[];
  city: string;
  state: string;
  zipCode?: number;
  principal?: string;
  createdAt: string;
}

interface UserDetailPageProps {
  userId: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const UserDetailPage = ({ userId }: UserDetailPageProps) => {
  const { data, error, isLoading, isValidating } = useSWR(
    userId ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${userId}` : null,
    fetcher
  );

  if (isLoading) return <div>Lade Benutzerdaten...</div>;
  if (error)
    return <div>Fehler beim Laden der Benutzerdaten: {error.message}</div>;
  if (!data?.data) return <div>Benutzer nicht gefunden</div>;

  const user: User = data.data;
  const userImage = user.image || "/images/projects/project1_img1.jpg";

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Benutzerdetails</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profilbild und Name */}
            <div className="lg:col-span-1 flex flex-col items-center">
              <div className="relative w-32 h-32 mb-4">
                <Image
                  src={userImage}
                  alt={`Profilbild von ${user.firstName ?? ""} ${
                    user.lastName ?? ""
                  }`}
                  fill
                  className="rounded-full object-cover border-4 border-[#34E3B0]"
                  sizes="128px"
                />
              </div>
              <h2 className="text-2xl font-bold text-center">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-gray-600 text-center mt-2">
                Registriert seit:{" "}
                {new Date(user.createdAt).toLocaleDateString("de-DE", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {/* Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Skills */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Fähigkeiten</h3>
                <div className="flex flex-wrap gap-2">
                  {user.skills && user.skills.length > 0 ? (
                    user.skills.map((skill) => (
                      <Badge
                        className="text-[#34E3B0]"
                        key={skill}
                        variant="secondary"
                      >
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-500">
                      Keine Fähigkeiten angegeben
                    </span>
                  )}
                </div>
              </div>
              {/* Tätigkeitsfeld (NGO Memberships) */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Tätigkeitsfelder</h3>
                <div className="flex flex-wrap gap-2">
                  {user.ngoMemberships && user.ngoMemberships.length > 0 ? (
                    user.ngoMemberships.map((membership, index) => (
                      <Badge key={index} variant="outline">
                        {membership}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-500">
                      Keine Vereinsmitgliedschaften angegeben
                    </span>
                  )}
                </div>
              </div>
              {/* Adresse */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Adresse</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p>
                    {user.zipCode && `${user.zipCode} `}
                    {user.city}
                  </p>
                  <p className="text-gray-600">{user.state}</p>
                </div>
              </div>
            </div>
          </div>

          {isValidating && (
            <div className="mt-4 text-center">
              <span className="text-gray-400">Aktualisiere Daten...</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDetailPage;
