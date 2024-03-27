import { Router } from "express";
import * as cheerio from "cheerio";
import css from "css";
import { parseHTMLToObject } from "../utils/parseHtml";

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

  const response = await fetch(url);
  const pageHtml = await response.text();

  try {
    const { childrenClasses, elementHtml } = await fetchHtml(
      pageHtml,
      selector
    );
    const cssText = await fetchCss(pageHtml, childrenClasses);

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

// get css vars that are used in the dynamic css
function getUsedVars(declaration: Declaration) {
  if (!declaration.value.includes("var(")) {
    return [];
  }
  return declaration.value.match(/--[\w-]+/g) ?? [];
}

async function fetchCss(html: string, selectors: string[][]) {
  const parsedDynamicCss = parseHtmlToCss(html);

  const rootRule = (
    parsedDynamicCss.stylesheet?.rules.filter((rule) => {
      return (rule as Rule).selectors?.includes(":root");
    }) as Rule[]
  ).flatMap((rule) => rule.declarations);

  const cssTexts = selectors.map((selector) => {
    const cssRules = getRulesByClassSelector(selector, parsedDynamicCss);

    const customProperties = cssRules.declarations.flatMap((declaration) =>
      getUsedVars(declaration)
    );

    const stringifiedRules = stringifyRules([cssRules]);

    return { customProperties, stringifiedRules };
  });

  const usedVars = cssTexts.flatMap((cssText) => cssText.customProperties);
  const cssText = cssTexts
    .map((cssText) => cssText.stringifiedRules)
    .join("\n");

  const varsValuesPairs = rootRule.filter((declaration) => {
    return usedVars.includes(declaration.property);
  });

  const newRule: Rule = {
    type: "rule",
    selectors: [":root"],
    declarations: varsValuesPairs,
  };

  const rootDeclarations = stringifyRules([newRule]);

  return `${rootDeclarations}\n${cssText}`;
}

interface Position {
  start: {
    line: number;
    column: number;
  };
  end: {
    line: number;
    column: number;
  };
}

interface Declaration {
  type: "declaration";
  property: string;
  value: string;
  position: Position;
}

interface Rule {
  type: "rule";
  selectors: string[];
  declarations: Declaration[];
}

function getRulesByClassSelector(
  classes: string[],
  parsedDynamicCss: css.Stylesheet
): Rule {
  return (
    classes.reduce((acc, classSelector) => {
      const classRules = parsedDynamicCss?.stylesheet?.rules.filter((rule) => {
        const ruleCopy = rule as Rule; // just to fix TS errors

        return (
          ruleCopy.type === "rule" &&
          ruleCopy.selectors.some(
            (selector: string) => selector === `.${classSelector}` // it does not include other states like :hover, :active, etc.
          )
        );
      }) as Rule[];

      return [...acc, ...classRules];
    }, [] as Rule[])[0] || { type: "rule", selectors: [], declarations: [] }
  );
}

function stringifyRules(rules: Rule[]) {
  return css.stringify({
    type: "stylesheet",
    stylesheet: { rules },
  });
}

function parseHtmlToCss(html: string) {
  const $ = cheerio.load(html);
  const dynamicCssRules = $("style")
    .map((_, element) => $(element).text())
    .get()
    .join("\n");

  return css.parse(dynamicCssRules);
}
