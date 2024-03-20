import { env } from "@/env";
import { useFetch } from "@/hooks/use-fetch";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export function ElementDetails() {
  const { fetchJSON, isLoading } = useFetch(env.API_URL, true);
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState({
    htmlText: "",
    cssText: "",
  });
  //   const navigate = useNavigate();

  const fetchAPI = useCallback(async () => {
    const url = searchParams.get("url");
    const selector = searchParams.get("selector");

    if (!url || !selector) {
      //   return navigate("/");
    }

    const data = await fetchJSON(`element-details?${searchParams.toString()}`);
    setCode(data as { htmlText: string; cssText: string });
  }, [fetchJSON, searchParams]);

  useEffect(() => {
    fetchAPI();
  }, [fetchAPI]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Element Details</h1>
      <pre>
        <code>{code.htmlText}</code>
      </pre>
      <pre>{code.cssText}</pre>
    </div>
  );
}
