import { OurAI } from "../lib/open-ai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { instructions } from "../utils/ai-instructions";

interface CreateFilesDTO {
  html: string;
  css: string;
  type: string;
  name: string;
}

export async function createFiles({ html, css, type, name }: CreateFilesDTO) {
  // if (process.env.USE_MOCK) {
  //   return JSON.parse(responseMock);
  // }

  try {
    const ourAI = new OurAI();
    const chatModel = ourAI.getInstance();

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", instructions],
      [
        "user",
        "{{ 'html': '{inputHtml}', 'css': '{inputCss}' 'type': '{inputType}', 'name': '{inputName}' }}",
      ],
    ]);

    const chain = prompt.pipe(chatModel);

    const response = await chain.invoke({
      inputHtml: html,
      inputCss: css,
      inputType: type,
      inputName: name,
    });

    console.log(response);

    return JSON.parse(response);
  } catch (error) {
    return error;
  }
}

const responseMock = JSON.stringify({
  library: "react",
  files: [
    {
      file: "Button.tsx",
      description: "This is a button component with an icon and text",
      content:
        "import React from 'react';\nimport 'Button.scss';\n\nexport const Button: React.FC = () => {\n    return (\n        <button className='MuiButton-root MuiButton-variantSolid MuiButton-colorPrimary MuiButton-sizeMd css-4qk412'>\n            <span className='MuiButton-startDecorator css-zcktug'>\n                <svg className='MuiSvgIcon-root MuiSvgIcon-fontSizeXl2 css-l6vif8' focusable='false' aria-hidden='true' viewBox='0 0 24 24' data-testid='FavoriteBorderIcon'>\n                    <path d='M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3m-4.4 15.55-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05'></path>\n                </svg>\n            </span>\n            Hello world\n        </button>\n    );\n};",
    },
    {
      file: "Button.scss",
      description: "This is the styling for the Button component",
      content:
        ".MuiButton-root {\n    --Icon-margin: initial;\n    --Icon-color: currentColor;\n    --Icon-fontSize: var(--joy-fontSize-xl);\n    --CircularProgress-size: 20px;\n    --CircularProgress-thickness: 2px;\n    --Button-gap: 0.5rem;\n    min-height: var(--Button-minHeight, 2.25rem);\n    font-size: var(--joy-fontSize-sm);\n    padding-block: var(--Button-paddingBlock, 0.375rem);\n    padding-inline: 1rem;\n    -webkit-tap-highlight-color: transparent;\n    box-sizing: border-box;\n    border-radius: var(--Button-radius, var(--joy-radius-sm));\n    margin: var(--Button-margin);\n    border: none;\n    background-color: var(--variant-solidBg, var(--joy-palette-primary-solidBg, var(--joy-palette-primary-500, #0B6BCB)));\n    cursor: pointer;\n    display: inline-flex;\n    -webkit-align-items: center;\n    -webkit-box-align: center;\n    -ms-flex-align: center;\n    align-items: center;\n    -webkit-box-pack: center;\n    -ms-flex-pack: center;\n    -webkit-justify-content: center;\n    justify-content: center;\n    position: relative;\n    -webkit-text-decoration: none;\n    text-decoration: none;\n    font-family: var(--joy-fontFamily-body);\n    font-weight: var(--joy-fontWeight-lg);\n    line-height: var(--joy-lineHeight-md);\n    --variant-borderWidth: 0px;\n    color: var(--variant-solidColor, var(--joy-palette-primary-solidColor, var(--joy-palette-common-white, #FFF)));\n}",
    },
  ],
  additionalInformation:
    "This is a button component with an icon and text. It has specific styling for the button and the icon.",
});
