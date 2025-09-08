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

export default function AddressCard({ ngo }: NgoProps) {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Adresse:</CardTitle>
        <CardDescription></CardDescription>
        <div>{ngo.name}</div>
        <div>{ngo.streetAndNumber}</div>
        <div>
          {ngo.zipCode} {ngo.city}
        </div>
      </CardHeader>
      <CardContent></CardContent>
    </Card>
  );
}
