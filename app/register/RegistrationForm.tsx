import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import RegistrationFormCard from "./RegistrationFormCard";

const RegistrationForm = () => (
  <Tabs defaultValue="user">
    <TabsList>
      <TabsTrigger value="user">Nutzer</TabsTrigger>
      <TabsTrigger value="ngo">Verein</TabsTrigger>
    </TabsList>
    <TabsContent value="user">
      <RegistrationFormCard entity="user" />
    </TabsContent>
    <TabsContent value="ngo">
      <RegistrationFormCard entity="ngo" />
    </TabsContent>
  </Tabs>
);

export default RegistrationForm;
