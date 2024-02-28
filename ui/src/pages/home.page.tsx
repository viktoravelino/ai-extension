import { AutoSearchForm } from "@/components/auto-search-form/auto-search-form.component";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function HomePage() {
  return (
    <Tabs
      defaultValue="auto-search"
      className="w-[400px] flex flex-col items-center justify-center m-auto"
    >
      <TabsList>
        <TabsTrigger value="auto-search">Automatic Search</TabsTrigger>
        <TabsTrigger value="manual-search">Manual Search</TabsTrigger>
      </TabsList>

      <TabsContent value="auto-search" className="w-full">
        <AutoSearchForm />
      </TabsContent>

      <TabsContent value="manual-search">Manual Search 2</TabsContent>
    </Tabs>
  );
}
