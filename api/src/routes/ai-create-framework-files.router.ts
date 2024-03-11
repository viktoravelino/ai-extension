import { Router } from "express";
import { createFiles } from "../scripts/create-framework-files";

const router = Router();

router.post("/", async (req, res) => {
  const { html, css, framework, elementName } = req.body;

  if (!html || !css || !framework || !elementName) {
    return res.status(400).json({
      message: "Missing required fields",
    });
  }

  const response = (await createFiles({
    html,
    css,
    type: framework,
    name: elementName,
  })) as ResponseDTO;

  res.json({
    ...response,
    files: response.files.map((file) => {
      return {
        ...file,
        content: file.content.replace(/^```[a-z]*\n/, "").replace(/\n```$/, ""),
      };
    }),
  });
});

export default router;

interface ResponseDTO {
  library: string;
  files: {
    file: string;
    description: string;
    content: string;
  }[];
  additionalInformation: string;
}
