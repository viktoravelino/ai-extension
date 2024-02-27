import { Button } from "@/components/ui/button";
import { streamToData, Element } from "@/lib/stream-to-data";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
// import { mockScreenshotElement } from "./mock";

export function ListElements() {
  const navigate = useNavigate();
  const [elements, setElements] = useState<Element[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  const call = useCallback(async () => {
    const url = searchParams.get("url");
    const elementTarget = searchParams.get("target");

    if (!url || !elementTarget) return;

    try {
      setElements([]);
      setLoading(true);
      const response = await fetch(
        `http://localhost:3000/screenshot?${searchParams.toString()}`
      );
      await streamToData(response.body!, (element) => {
        setElements((state) => {
          return [...state, element];
        });
      });
    } catch (error) {
      console.log(error);
      setError("Error fetching elements. Please go back and try again.");
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    call();
    // setElements(mockScreenshotElement as Element[]);
  }, [call]);

  if (error) {
    return (
      <>
        <p>{error}</p>
        <Button
          onClick={() => {
            navigate("/");
          }}
        >
          Go back
        </Button>
      </>
    );
  }

  return (
    <>
      {loading && <p>Loading...</p>}

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

interface ElementListProps {
  elements: Element[];
}

function ElementList(props: ElementListProps) {
  const { elements } = props;

  return elements.map((element, i) => {
    const imageBase64 = window.btoa(String.fromCharCode(...element.file.data));

    if (elements.length <= 0) {
      return null;
    }

    return (
      <Link
        to={`/element-details?selector=${JSON.stringify(
          element.elementSelector
        )}`}
        style={{
          border: "1px solid black",
          borderRadius: "5px",
          width: "200px",
          height: "200px",
          placeItems: "center",
          display: "grid",
        }}
        key={i}
      >
        <img src={`data:image/png;base64,${imageBase64}`} alt="image" />
      </Link>
    );
  });
}
