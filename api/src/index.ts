import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import screenshotRouter from "./routes/screenshot.router";
import aiSelectorsRouter from "./routes/ai-selectors.router";
import elementDetails from "./routes/element-details.router";

const app = express();

app.use(cors());
app.use("/screenshot", screenshotRouter);
app.use("/ai-selectors", aiSelectorsRouter);
app.use("/element-details", elementDetails);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

async function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
