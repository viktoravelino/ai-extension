import { Element } from "@/lib/stream-to-data";
import { Link } from "react-router-dom";

interface ElementListProps {
  elements: Element[];
}

export function ElementList(props: ElementListProps) {
  const { elements } = props;

  if (elements.length <= 0) {
    return null;
  }

  return elements.map((element, i) => {
    const imageBase64 = window.btoa(String.fromCharCode(...element.file.data));

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
