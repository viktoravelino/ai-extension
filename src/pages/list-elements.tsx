import { ElementList } from "@/components/element-list";
import { Error } from "@/components/error";
import { env } from "@/env";
import { useFetch } from "@/hooks/use-fetch";
import { streamToData, Element } from "@/lib/stream-to-data";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export function ListElements() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { fetchStream, isLoading, error } = useFetch(env.API_URL, true);

  const [elements, setElements] = useState<Element[]>([]);

  const fetchAPI = useCallback(async () => {
    setElements([]);

    const url = searchParams.get("url");
    const selectors = searchParams.get("selectors");

    if (!url || !selectors) return navigate("/");

    await fetchStream(`screenshot?${searchParams.toString()}`, {
      onStreamData: async (stream) => {
        await streamToData(stream, (element) => {
          setElements((state) => {
            return [...state, element];
          });
        });
      },
    });
  }, [searchParams, fetchStream, navigate]);

  useEffect(() => {
    fetchAPI();
  }, [fetchAPI]);

  if (error) {
    return (
      <Error
        error={error}
        onAction={() => {
          navigate("/");
        }}
      />
    );
  }

  return (
    <>
      {isLoading && <p>Loading...</p>}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          justifyContent: "center",
        }}
      >
        <ElementList elements={elements} />
      </div>
    </>
  );
}
