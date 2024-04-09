import { Router } from "express";
import * as cheerio from "cheerio";
import { parseHTMLToObject } from "../utils/parseHtml";
import { fetchCss } from "../utils/fetch-css";
import { forbidden } from "../utils/filter";

const router = Router();

router.get("/", async (req, res) => {
  const selector = (req.query.selector as string).replace(/"/g, "");
  const url = req.query.url as string;

  console.log("selector", selector);

  if (!selector || !url) {
    return res.status(400).json({
      error: "You must provide a selector and a url",
    });
  }

  console.log(url);

  const response = await fetch(url);
  const pageHtml = await response.text();

  const filteredSelector = selector
    .split(".")
    .filter((s) => !forbidden.some((f) => s.includes(f)))
    .join(".");

  try {
    const { childrenClasses, elementHtml } = await fetchHtml(
      pageHtml,
      filteredSelector
    );

    const cssText = await fetchCss(pageHtml, childrenClasses, url);

    res.json({
      files: [
        { file: "index.html", content: elementHtml },
        { file: "index.scss", content: cssText },
      ],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "An error occurred while fetching the element details",
    });
  }
});

export default router;

async function fetchHtml(html: string, selector: string) {
  const $ = cheerio.load(html);
  const element = $(selector);
  const elementHtml = element.prop("outerHTML")!;
  const childrenClasses = getChildrenClassesFromHtmlElement(
    parseHTMLToObject(elementHtml)
  );
  return {
    elementHtml,
    childrenClasses,
  };
}

// It retrieves all the classes from the children of the element
function getChildrenClassesFromHtmlElement(
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
