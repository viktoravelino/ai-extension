import { useCallback, useState } from "react";

interface FetchStreamOptions {
  onStreamData: (stream: ReadableStream<Uint8Array>) => Promise<void>;
}

export function useFetch(baseUrl: string, initialLoading = false) {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);

  const fetchStream = useCallback(
    async (endpoint: string, options: FetchStreamOptions) => {
      const { onStreamData } = options;
      setIsLoading(true);

      try {
        const response = await fetch(`${baseUrl}/${endpoint}`);
        await onStreamData(response.body!);
      } catch (error) {
        console.error(error);
        setError("Error fetching. Please go back and try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [baseUrl]
  );

  const fetchJSON = useCallback(
    async <T>(endpoint: string) => {
      setIsLoading(true);

      try {
        const response = await fetch(`${baseUrl}/${endpoint}`);
        const data = (await response.json()) as T;
        return data;
      } catch (err: unknown) {
        setError("Error fetching. Please go back and try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [baseUrl]
  );

  interface FetchJSONWithBodyOptions<D> {
    endpoint: string;
    method?: "POST";
    body: D;
  }

  const fetchJSONWithBody = useCallback(
    async <T, D>({
      body,
      endpoint,
      method = "POST",
    }: FetchJSONWithBodyOptions<D>) => {
      setIsLoading(true);

      try {
        const response = await fetch(`${baseUrl}/${endpoint}`, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
        const data = (await response.json()) as T;
        return data;
      } catch (err: unknown) {
        setError("Error fetching. Please go back and try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [baseUrl]
  );

  return { fetchJSON, isLoading, error, fetchStream, fetchJSONWithBody };
}
