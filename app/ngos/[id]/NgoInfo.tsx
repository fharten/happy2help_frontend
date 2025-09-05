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
import AddressCard from "./AddressCard";
import ContactCard from "./ContactCard";
import IndustryCard from "../IndustryCard";

// Fetcher function
const fetcher = async (url: string) =>
  await fetch(url).then((res) => res.json());

export default function NgoInfo() {
  const { id } = useParams();

  const { data, error, isLoading } = useSWR(
    id ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/ngos/${id}` : null,
    fetcher
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Failed to load projects</div>;

  if (!data?.data) return <>NGO Seite nicht gefunden</>;

  const ngo = data.data;

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
        <IndustryCard industry={ngo.industry} />
        <AddressCard ngo={ngo} />
        <ContactCard ngo={ngo} />
        <div>{registeredString}</div>
      </CardContent>
    </Card>
  );
}
