import * as cheerio from "cheerio";
import css from "css";

export async function fetchCss(
  html: string,
  selectors: string[][],
  url: string
) {
  const parsedDynamicCss = await parseHtmlToCss({ html, url });

  const rootRule = (
    parsedDynamicCss.stylesheet?.rules.filter((rule) => {
      return (rule as Rule).selectors?.includes(":root");
    }) as Rule[]
  ).flatMap((rule) => rule.declarations);

  const cssTexts = selectors.map((selector) => {
    const cssRules = getRulesByClassSelector(selector, parsedDynamicCss);

    const customProperties = cssRules.flatMap((rule) =>
      rule.declarations.flatMap((declaration) => getUsedVars(declaration))
    );

    const stringifiedRules = stringifyRules(cssRules);

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

interface ParseHtmlToCssProps {
  url: string;
  html: string;
}
//`https://ui.shadcn.com/${href!}`
export async function parseHtmlToCss({ url, html }: ParseHtmlToCssProps) {
  const $ = cheerio.load(html);
  const dynamicCssRules = $("style")
    .map((_, element) => $(element).text())
    .get()
    .join("\n");

  const index = url?.indexOf("/", 8);
  const baseUrl = url?.slice(0, index);

  const linkStyles = $('link[rel="stylesheet"]')
    .map(async (_, element) => {
      const href = $(element).attr("href");
      return await fetch(`${baseUrl}${href!}`)
        .then((res) => res.text())
        .catch((e) => {
          return "";
        });
    })
    .get();
  const responses = await Promise.all(linkStyles);
  const linkCssText = responses.join("\n");

  return css.parse(`${dynamicCssRules}\n${linkCssText}`);
}

export function getRulesByClassSelector(
  classes: string[],
  parsedDynamicCss: css.Stylesheet
): Rule[] {
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
    }, [] as Rule[]) || { type: "rule", selectors: [], declarations: [] }
  );
}

export function stringifyRules(rules: Rule[]) {
  return css.stringify({
    type: "stylesheet",
    stylesheet: { rules },
  });
}

export function getUsedVars(declaration: Declaration) {
  if (!declaration.value.includes("var(")) {
    return [];
  }
  return declaration.value.match(/--[\w-]+/g) ?? [];
}

export interface Position {
  start: {
    line: number;
    column: number;
  };
  end: {
    line: number;
    column: number;
  };
}

export interface Declaration {
  type: "declaration";
  property: string;
  value: string;
  position: Position;
}

export interface Rule {
  type: "rule";
  selectors: string[];
  declarations: Declaration[];
}
