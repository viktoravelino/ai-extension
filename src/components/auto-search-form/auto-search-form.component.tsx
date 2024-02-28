import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import { useEffect } from "react";
import { useConfigContext } from "@/contexts/config-context";
import { routes } from "@/routes";
import { useNavigate } from "react-router-dom";
import { env } from "@/env";

const formSchema = z.object({
  url: z.string().url(),
  target: z.string().min(1),
});

type AutoSearchFormValues = z.infer<typeof formSchema>;

export function AutoSearchForm() {
  const { isExtension } = useConfigContext();
  const navigate = useNavigate();

  const form = useForm<AutoSearchFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "https://mui.com/joy-ui/react-button",
      target: "button",
    },
  });

  function onSubmit(data: AutoSearchFormValues) {
    const params = new URLSearchParams({ url: data.url, target: data.target });
    const paramString = params.toString();

    const url = new URL(routes.searchSelectors, env.APP_URL);
    url.search = paramString;

    if (isExtension) {
      window.open(url.toString(), "_blank")?.focus();
    } else {
      navigate(`/${routes.searchSelectors}?${paramString}`);
    }
  }

  useEffect(() => {
    if (!isExtension) return;

    async function getUrl() {
      const tabs = await chrome?.tabs?.query({ active: true });
      const url = tabs ? tabs[0]?.url : "";
      form.setValue("url", url ?? "");
    }

    getUrl();
  }, [form, isExtension]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input placeholder="url" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="target"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Element</FormLabel>
              <FormControl>
                <Input placeholder="e.g. button" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Search Elements
        </Button>
      </form>
    </Form>
  );
}
