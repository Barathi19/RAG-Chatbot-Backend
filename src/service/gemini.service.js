import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const getGeminiAnswer = async (question, context, sources) => {
  const prompt = `
You are a helpful assistant. Use the following context to answer the user's question.
If relevant, also provide the source links.

Question: ${question}

Context:
${context}

Sources:
${sources.join("\n")}

Answer:
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};
