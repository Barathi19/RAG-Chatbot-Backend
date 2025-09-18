import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function safeGeminiCall(prompt, retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      if (i < retries - 1) {
        console.warn(`Retrying Gemini... attempt ${i + 1}`);
        await new Promise((res) => setTimeout(res, delay));
      } else {
        throw err;
      }
    }
  }
}

export const getGeminiAnswer = async (
  question,
  context,
  sources,
  historyText
) => {
  const prompt = `
You are a helpful assistant. Use the following context to answer the user's question.
Include relevant sources if available.

Previous conversation:
${historyText}

New question:
${question}

context:
${context}

Answer:
`;

  const reply = await safeGeminiCall(prompt);
  return reply;
};
