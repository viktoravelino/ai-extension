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

  try {
    const response = (await createFiles({
      html,
      css,
      type: framework,
      name: elementName,
    })) as ResponseDTO;

    const files = response.files.map((file) => {
      return {
        ...file,
        content: file.content.replace(/^```[a-z]*\n/, "").replace(/\n```$/, ""),
      };
    });

    res.json({
      ...response,
      files,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error parsing response",
    });
  }
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
