import { Router } from "express";
import puppeteer, { ElementHandle, Page } from "puppeteer";
import { asyncFilter } from "../utils/asyncFilter";
import { USE_MOCK } from "../config";
import { MOCK_ELEMENTS_SCREENSHOT } from "../mockData";

const router = Router();

router.get("/", async (req, res, next) => {
  const selectors = JSON.parse(req.query.selectors as string) as string[];
  const url = req.query.url as string;

  console.log({ selectors, url });

  if (!selectors || !url) {
    return res.status(400).json({
      message: "Missing selectors or url param",
    });
  }

  if (USE_MOCK) {
    for await (const element of MOCK_ELEMENTS_SCREENSHOT) {
      await new Promise((r) => setTimeout(r, 1000));
      res.write(JSON.stringify(element) + "\n");
    }
    res.end();
    return next();
  }

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  await page.setViewport({ width: 1080, height: 1024 });

  // wait animations to finish
  await new Promise((r) => setTimeout(r, 2000));

  console.log("Finding elements...");
  const elementsFound = await findElementsBySelectors(selectors, page);

  console.log("Filtering elements...");
  const elementsWithContent = await filterElementsWithContent(elementsFound);

  console.log("Filtering unique elements...");
  const uniqueElements = await filterUniqueElements(elementsWithContent);

  console.log("📷  Taking screenshots...");

  for await (const element of uniqueElements) {
    const file = await element.screenshot().catch((err) => {
      console.log(
        'Button not in page; "Might be a11n or in a modal or different viewport": ',
        err
      );
    });

    const classNames = await element.evaluate((el) =>
      el.classList.toString().split(" ").join(".")
    );

    if (!file) continue;

    res.write(
      JSON.stringify({ file, elementSelector: `.${classNames}` }) + "\n"
    );
  }

  await browser.close();

  console.log("Done taking screenshots");
  res.end();
  next();
});

export default router;

async function findElementsBySelectors(selectors: string[], page: Page) {
  let elementsToScreenShot: ElementHandle<Element>[] = [];

  for (let i = 0; i < selectors.length; i++) {
    const selector = selectors[i];
    console.log("🔍 Searching for: ", selector);
    const elements = await page.$$(selector);
    elementsToScreenShot.push(...elements);
  }

  return elementsToScreenShot;
}

async function filterElementsWithContent(
  elementsToScreenShot: ElementHandle<Element>[]
) {
  return await asyncFilter(elementsToScreenShot, async (el) => {
    const hasContent =
      ((await el.evaluate((el) => el.textContent)) !== "" ||
        (await el.evaluate((el) => el.textContent))) !== " ";
    if (!hasContent) {
      console.log("no content");
      return false;
    }
    return true;
  });
}

async function filterUniqueElements(elements: ElementHandle<Element>[]) {
  const elementMap = new Map<
    string,
    {
      element: ElementHandle<Element>;
      index: number;
    }
  >();

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const classes = (
      await element.evaluate((el) => el.classList.toString())
    )?.trim();
    const textContent = (
      await element.evaluate((el) => el.textContent)
    )?.trim();
    // improve uniqueness
    const uniqueString = `${textContent} ${classes}`;

    // skip elements not visible
    if (!(await element.isVisible())) {
      continue;
    }

    elementMap.set(uniqueString, {
      element,
      index: i,
    });
  }

  return Array.from(elementMap.values()).map((el) => el.element);
}
