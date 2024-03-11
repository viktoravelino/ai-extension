import { Router } from "express";
import { fetchHtmlAndCreateDataFile } from "../scripts/create-data";
import { OpenAIEmbeddings } from "@langchain/openai";
import { prepareDocsIntoVectorStore } from "../scripts/prepare-docs";
import { fetchSelectorsFromOpenAI } from "../scripts/openAI";
import { USE_MOCK } from "../config";
import { MOCK_SELECTORS_FROM_AI } from "../mockData";

const router = Router();

router.get("/", async (req, res) => {
  if (USE_MOCK) {
    return res.json(MOCK_SELECTORS_FROM_AI);
  }

  const url = req.query.url as string;
  const target = req.query.target as string;

  if (!url || !target) {
    return res.status(400).json({
      message: "Missing url or target param",
    });
  }

  const docsCreated = await fetchHtmlAndCreateDataFile(url);
  const embeddings = new OpenAIEmbeddings();

  // prepare the docs into a vector store
  const vectorStore = await prepareDocsIntoVectorStore(docsCreated, embeddings);

  // fetch the selectors from openai
  const selectors = await fetchSelectorsFromOpenAI(vectorStore, {
    target,
  });

  res.json(selectors);
});

export default router;
