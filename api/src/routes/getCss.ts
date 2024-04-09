import { Router } from "express";
import { parseHTMLToObject } from "../utils/parseHtml";
import { getChildrenClassesFromHtmlElement } from "../utils/get-children-classes";
import { fetchCss } from "../utils/fetch-css";

const router = Router();

router.post("/", async (req, res) => {
  const { html, url } = req.body;

  if (!html || !url) {
    return res.status(400).json({
      error: "You must provide an html and a url",
    });
  }

  const response = await fetch(url);
  const pageHtml = await response.text();

  const parsedHTML = parseHTMLToObject(html);
  const allClasses = getChildrenClassesFromHtmlElement(parsedHTML);
  const cssText = await fetchCss(pageHtml, allClasses, url);

  res.json({ cssText });
});

export default router;
