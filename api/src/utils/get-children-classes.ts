import { parseHTMLToObject } from "./parseHtml";

export function getChildrenClassesFromHtmlElement(
  parsedHtml: ReturnType<typeof parseHTMLToObject>
): string[][] {
  const children = parsedHtml.children;
  if (!children || children.length === 0) return [];
  return children.reduce((acc: any, child: any) => {
    const classes = child.attributes?.class;
    if (classes) {
      acc.push([...classes.split(" ")]);
    }
    acc.push(...getChildrenClassesFromHtmlElement(child));
    return acc;
  }, []);
}
