import { Ngo } from "@/types/ngo.d";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function IndustryCard({ industry }: { industry: string[] }) {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Bereiche:</CardTitle>
        <CardDescription></CardDescription>
        <ul>
          {industry &&
            industry.map((area: string) => <li key={area}>{area}</li>)}
        </ul>
      </CardHeader>
      <CardContent></CardContent>
    </Card>
  );
}
