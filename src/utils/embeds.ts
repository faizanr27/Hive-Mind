import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';


export const genAI = new GoogleGenerativeAI(`${process.env.GEMINI_API_KEY}`);
export const model1 = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
export const model2 = genAI.getGenerativeModel({ model: "text-embedding-004" });



export async function createEmbeddings(content:any): Promise<number[]>  {
  const result = await model2.embedContent(content.trim());

  if (!result.embedding?.values) {
    throw new Error("Embedding generation failed.");
  }

  return result.embedding.values;
}
export async function createQueryEmbeddings(query:string): Promise<number[]> {
  const result = await model2.embedContent(query.trim());

  if (!result.embedding?.values) {
    throw new Error("Query embedding generation failed.");
  }

  return result.embedding.values
}

export function cosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) {
      throw new Error("Vectors must have the same length");
  }

  const dotProduct = vec1.reduce((sum, v1, i) => sum + v1 * vec2[i], 0);
  const magnitude1 = Math.sqrt(vec1.reduce((sum, v) => sum + v * v, 0));
  const magnitude2 = Math.sqrt(vec2.reduce((sum, v) => sum + v * v, 0));

  console.log("Dot Product:", dotProduct);
  console.log("Magnitude 1:", magnitude1);
  console.log("Magnitude 2:", magnitude2);

  if (magnitude1 === 0 || magnitude2 === 0) {
      console.warn("One of the vectors has zero magnitude. Returning 0.");
      return 0;
  }

  const similarity = dotProduct / (magnitude1 * magnitude2);
  return similarity;
}

