import { Button } from "@/components/ui/button";
import { routes } from "@/routes";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export function SearchElementsPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [selectors, setSelectors] = useState<string[]>([]);

  const fetchAPI = useCallback(async () => {
    const url = `http://localhost:3000/ai-selectors?${searchParams.toString()}`;
    const response = await fetch(url);
    const data = await response.json();
    setSelectors(Array.from(new Set<string>(data)));
  }, [searchParams]);

  useEffect(() => {
    setIsLoading(true);
    fetchAPI().finally(() => setIsLoading(false));
  }, [fetchAPI]);

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  return (
    <>
      <h1>Selectors Found:</h1>
      <ul>
        {selectors.map((selector) => (
          <li key={selector}>
            <pre>{selector}</pre>
          </li>
        ))}
      </ul>

      <div>
        <span className="block mb-3 mt-5">
          Would you like to retrieve the elements' screenshots related to these
          selectors?
        </span>
        <div className="space-x-2">
          <Button
            onClick={() => {
              searchParams.set("selectors", JSON.stringify(selectors));
              navigate(`/${routes.listElements}?${searchParams.toString()}`);
            }}
          >
            Yes
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              navigate("/");
            }}
          >
            No
          </Button>
        </div>
      </div>
    </>
  );
}
