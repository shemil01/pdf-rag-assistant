import { generateEmbeddings } from './src/lib/ai/embedding';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  try {
    const vectors = await generateEmbeddings(["This is a test"]);
    console.log("Vector length:", vectors[0]?.length);
  } catch (e) {
    console.error(e);
  }
}

run();
