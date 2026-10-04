import { GoogleGenerativeAI } from '@google/generative-ai';

async function main() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    console.error("No API key");
    return;
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.models) {
    const chatModels = data.models.filter((m: any) => m.supportedGenerationMethods.includes('generateContent') || m.supportedGenerationMethods.includes('streamGenerateContent'));
    console.log("Available chat models:");
    chatModels.forEach((m: any) => console.log(m.name));
  } else {
    console.log("No models returned", data);
  }
}

main().catch(console.error);
