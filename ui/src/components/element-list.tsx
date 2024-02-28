import { Element } from "@/lib/stream-to-data";
import { Link, useSearchParams } from "react-router-dom";

interface ElementListProps {
  elements: Element[];
}

export function ElementList(props: ElementListProps) {
  const { elements } = props;
  const [searchParams] = useSearchParams();

  function createSearchParams(element: Element) {
    const url = searchParams.get("url")!;
    const selector = element.elementSelector;
    const newSearchParams = new URLSearchParams({ url, selector });
    return newSearchParams;
  }

  if (elements.length <= 0) {
    return null;
  }

  return elements.map((element, i) => {
    const imageBase64 = window.btoa(String.fromCharCode(...element.file.data));

    return (
      <Link
        to={`/element-details?${createSearchParams(element)}`}
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
