import { Button } from "@/components/ui/button";
import { env } from "@/env";
import { useFetch } from "@/hooks/use-fetch";
import { routes } from "@/routes";
import { javascript } from "@codemirror/lang-javascript";
import { sass } from "@codemirror/lang-sass";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CodeMirror from "@uiw/react-codemirror";
interface AIFrameworkFilesFile {
  file: string;
  content: string;
}

interface AIFrameworkFilesDTO {
  library: string;
  files: AIFrameworkFilesFile[];
}

export function ElementDetails() {
  const { fetchJSON, isLoading } = useFetch(env.API_URL, true);
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<AIFrameworkFilesDTO | null>(null);

  const navigate = useNavigate();
  const url = searchParams.get("url");
  const selector = searchParams.get("selector");

  const fetchAPI = useCallback(async () => {
    const response = await fetchJSON<AIFrameworkFilesDTO>(
      `element-details?${searchParams.toString()}`
    );

    setData(response!);
  }, [fetchJSON, searchParams]);

  function buildReact() {
    localStorage.setItem(
      "data",
      JSON.stringify({
        type: "react",
        name: "Button",
        html: data?.files.find((file) => file.file === "index.html")?.content,
        css: data?.files.find((file) => file.file === "index.scss")?.content,
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
        html: data?.files.find((file) => file.file === "index.html")?.content,
        css: data?.files.find((file) => file.file === "index.scss")?.content,
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
        {data?.files.map((file) => {
          const isSass = file.file.endsWith(".scss");
          const extensions = isSass
            ? [sass()]
            : [javascript({ typescript: true, jsx: true })];

          return (
            <div key={file.file}>
              <h1 className="font-bold text-lg">{file.file}</h1>
              <CodeMirror
                value={file.content}
                extensions={extensions}
                editable={false}
              />
            </div>
          );
        })}
      </div>

      <div className="space-x-5 mt-5">
        <Button onClick={buildReact}>Build React</Button>
        <Button onClick={buildAngular}>Build Angular</Button>
      </div>
    </div>
  );
}
