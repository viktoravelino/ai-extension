import { Router } from "express";
import * as cheerio from "cheerio";
import css from "css";

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

  const childrenClasses = getChildrenClasses(parseHTML(elementHtml));

  return {
    elementHtml,
    childrenClasses,
  };
}

function getChildrenClasses(parsedHtml: any) {
  const children = parsedHtml.children;
  if (!children || children.length === 0) return [];
  return children.reduce((acc: any, child: any) => {
    const classes = child.attributes?.class;
    if (classes) {
      acc.push([...classes.split(" ")]);
    }
    acc.push(...getChildrenClasses(child));

    return acc;
  }, []);
}

async function fetchCss(html: string, selectors: string[][]) {
  const $ = cheerio.load(html);
  const dynamicCssRules = $("style")
    .map((_, element) => $(element).text())
    .get()
    .join("\n");

  const parsedDynamicCss = css.parse(dynamicCssRules);

  let cssText = "";
  let usedVars: string[] = [];

  for (const selector of selectors) {
    const cssRules = getRulesByClassSelector(selector, parsedDynamicCss);

    cssRules[0].declarations.forEach((declaration) => {
      if (declaration.value.includes("var(")) {
        const customProperties = declaration.value.match(/--[\w-]+/g) ?? [];
        usedVars.push(...customProperties);
      }
    });

    const stringifiedRules = css.stringify({
      type: "stylesheet",
      stylesheet: { rules: cssRules },
    });

    cssText += `${stringifiedRules}\n`;
  }

  const rootRule = (
    parsedDynamicCss.stylesheet?.rules.filter((rule) => {
      return (rule as Rule).selectors?.includes(":root");
    }) as Rule[]
  )
    .map((rule) => rule.declarations)
    .flat();

  const varsValuesPairs = rootRule.filter((declaration) => {
    return usedVars.includes(declaration.property);
  });

  const newRule: Rule = {
    type: "rule",
    selectors: [":root"],
    declarations: varsValuesPairs,
  };

  const rootDeclarations = css.stringify({
    type: "stylesheet",
    stylesheet: { rules: [newRule] },
  });

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
): Rule[] {
  return classes.reduce((acc, classSelector) => {
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
  }, [] as Rule[]);
}

interface Node {
  type: string;
  children?: Node[];
  tag?: string;
  attributes?: { [key: string]: string };
  content?: string;
}

function parseHTML(rawHTML: string) {
  const stack = [];
  const rootNode = { type: "document", children: [] };
  let currentNode: Node = rootNode;

  const regexTag = /<(\/)?([a-zA-Z]+)([^<]*)?>/g;
  const regexAttributes = /([a-zA-Z\-]+)="([^"]*)"/g;

  let match;
  let lastIndex = 0;

  while ((match = regexTag.exec(rawHTML)) !== null) {
    const [tag, isClosing, tagName, attributesStr] = match;
    const index = match.index;

    const text = rawHTML.slice(lastIndex, index);
    if (text.trim().length > 0) {
      currentNode.children?.push({ type: "text", content: text.trim() });
    }

    lastIndex = regexTag.lastIndex;

    if (!isClosing) {
      const node: any = {
        type: "element",
        tag: tagName,
        attributes: {},
        children: [],
      };

      let attrMatch;
      while ((attrMatch = regexAttributes.exec(attributesStr)) !== null) {
        const [, attrName, attrValue] = attrMatch;
        node.attributes[attrName] = attrValue;
      }

      currentNode.children?.push(node);

      if (!/\/>$/.test(tag)) {
        stack.push(currentNode);
        currentNode = node;
      }
    } else {
      currentNode = stack.pop()!;
    }
  }

  const remainingText = rawHTML.slice(lastIndex);
  if (remainingText.trim().length > 0) {
    currentNode.children?.push({ type: "text", content: remainingText.trim() });
  }

  return rootNode;
}
