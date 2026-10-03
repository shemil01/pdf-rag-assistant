import { generateText } from "ai";
import { google } from "@ai-sdk/google";

async function main() {
  const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro"];
  for (const modelName of models) {
    try {
      console.log(`Testing ${modelName}...`);
      const { text } = await generateText({
        model: google(modelName),
        prompt: "Hello",
      });
      console.log(`Success with ${modelName}:`, text);
    } catch (e: any) {
      console.error(`Error with ${modelName}:`, e.message);
    }
  }
}

main().catch(console.error);
