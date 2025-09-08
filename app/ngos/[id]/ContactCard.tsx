import { Ngo } from "@/types/ngo.d";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface NgoProps {
  ngo: Ngo;
}

export default function ContactCard({ ngo }: NgoProps) {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Kontakt:</CardTitle>
        <CardDescription></CardDescription>
        <div>{ngo.principal} (Vorstand)</div>
        {ngo.contactEmail && <div>{ngo.contactEmail}</div>}
        {ngo.phone && <div>{ngo.phone}</div>}
      </CardHeader>
      <CardContent></CardContent>
    </Card>
  );
}
