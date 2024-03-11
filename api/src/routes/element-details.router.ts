import { Router } from "express";
import * as cheerio from "cheerio";
import css from "css";
import beautify from "js-beautify";

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
    const [htmlText, cssText] = await Promise.all([
      fetchHtml(pageHtml, selector),
      fetchCss(pageHtml, selector),
    ]);
    res.json({
      htmlText: beautify.html(htmlText!, { indent_size: 2, inline: [] }),
      cssText: beautify.css(cssText!, { indent_size: 2 }),
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

  const elementHtml = $(selector).prop("outerHTML");

  return elementHtml;
}

async function fetchCss(html: string, selector: string) {
  const $ = cheerio.load(html);

  // Extract CSS rules from style elements
  const dynamicCssRules = $("style")
    .map((_, element) => $(element).text())
    .get()
    .join("\n");

  const parsedDynamicCss = css.parse(dynamicCssRules);

  const classes = selector.split(".").filter(Boolean);

  const cssRules = getRulesByClassSelector(classes, parsedDynamicCss);

  const declarationsArray = createArrayOfUniqueDeclarations(cssRules);

  const stringifiedRules = stringifyRules([
    {
      type: "rule",
      selectors: [`.${classes[0]}`], // maybe change to be the target name
      declarations: declarationsArray,
    },
  ]);

  return stringifiedRules;
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
): Rule[] {
  return classes.reduce((acc, classSelector) => {
    const classRules = parsedDynamicCss?.stylesheet?.rules.filter((rule) => {
      const ruleCopy = rule as Rule; // just to fiz TS errors

      return (
        ruleCopy.type === "rule" &&
        ruleCopy.selectors.some(
          (selector: string) => selector === `.${classSelector}` // it does not include other states like :hover, :active, etc.
        )
      );
    }) as Rule[];

    return [...acc, ...classRules];
  }, [] as Rule[]);
}

function createArrayOfUniqueDeclarations(rules: Rule[]) {
  return Array.from(
    rules
      .reduce((acc, rule) => {
        rule.declarations.forEach((declaration) => {
          acc.set(declaration.property, declaration);
        });

        return acc;
      }, new Map<string, Declaration>())
      .values()
  );
}

function stringifyRules(rules: css.Rule[]) {
  return css.stringify({
    type: "stylesheet",
    stylesheet: { rules },
  });
}
