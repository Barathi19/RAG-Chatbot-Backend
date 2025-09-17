import { Pinecone } from "@pinecone-database/pinecone";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { JINA, PINECONE_INDEX } from "../constant/index.js";
import dotenv from "dotenv";
dotenv.config();

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});
const index = pinecone.Index(PINECONE_INDEX);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function answerWithGemini(queryText) {
  const queryEmbedding = await getEmbeddings([queryText]);

  const results = await index.query({
    vector: queryEmbedding[0],
    topK: 5,
    includeMetadata: true,
  });

  const context = results.matches
    .map((m, i) => `(${i + 1}) ${m.metadata.text}`)
    .join("\n");

  const prompt = `
You are a helpful assistant. Use the following context to answer the user question.

Context:
${context}

Question: ${queryText}

Answer:
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
