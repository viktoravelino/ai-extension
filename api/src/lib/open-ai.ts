import { OpenAI } from "@langchain/openai";

export class OurAI {
  private _openAiClient: OpenAI | undefined;

  public getInstance() {
    if (!this._openAiClient) {
      this._openAiClient = new OpenAI({
        modelName: "gpt-3.5-turbo-1106",
        temperature: 0.5,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
        maxTokens: 1000,
        modelKwargs: {
          response_format: { type: "json_object" },
        },
      });
    }

    return this._openAiClient;
  }
}
