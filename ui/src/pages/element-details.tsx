import { Button } from "@/components/ui/button";
import { env } from "@/env";
import { useFetch } from "@/hooks/use-fetch";
import { routes } from "@/routes";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export function ElementDetails() {
  const { fetchJSON, isLoading } = useFetch(env.API_URL, true);
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState({
    htmlText: "",
    cssText: "",
  });
  const navigate = useNavigate();
  const url = searchParams.get("url");
  const selector = searchParams.get("selector");

  const fetchAPI = useCallback(async () => {
    const data = await fetchJSON(`element-details?${searchParams.toString()}`);
    setCode(data as { htmlText: string; cssText: string });
  }, [fetchJSON, searchParams]);

  function buildReact() {
    localStorage.setItem(
      "data",
      JSON.stringify({
        type: "react",
        name: "Button",
        html: code.htmlText,
        css: code.cssText,
      })
    );

    navigate(`/${routes.elementFrameworkCreation}`);
  }

  function buildAngular() {
    localStorage.setItem(
      "data",
      JSON.stringify({
        type: "angular",
        name: "Button",
        html: code.htmlText,
        css: code.cssText,
      })
    );

    navigate(`/${routes.elementFrameworkCreation}`);
  }

  useEffect(() => {
    if (!url || !selector) {
      return navigate("/");
    }

    fetchAPI();
  }, [fetchAPI, navigate, selector, url]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <div>
        <h1>Element Details</h1>
        <pre>
          <code>{code.htmlText}</code>
        </pre>
        <pre>{code.cssText}</pre>
      </div>

      <div className="space-x-5 mt-5">
        <Button onClick={buildReact}>Build React</Button>
        <Button onClick={buildAngular}>Build Angular</Button>
      </div>
    </div>
  );
}
