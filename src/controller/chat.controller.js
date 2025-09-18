import { validate } from "uuid";
import { client } from "../config/ioredis.js";
import asyncHandler from "../middleware/async.js";
import ErrorResponse from "../utils/errorResponse.js";
import { getRelevantChunks } from "../service/pinecone.service.js";
import { getGeminiAnswer } from "../service/gemini.service.js";

const postMessage = asyncHandler(async (req, res) => {
  const { sessionId, message } = req.body;

  if (!sessionId || !message) {
    throw new ErrorResponse("sessionId and message required", 400);
  }

  if (!validate(sessionId)) {
    throw new ErrorResponse("Invalid sessionId", 400);
  }

  await client.rpush(
    `chat:${sessionId}`,
    JSON.stringify({ role: "user", text: message })
  );

  const results = await getRelevantChunks(message);

  const contextText = results.map((r) => r.metadata.text).join("\n\n");

  const sources = results.map((r) => r.metadata.link);

  try {
    const botReply = await getGeminiAnswer(message, contextText, sources);
    await client.rpush(
      `chat:${sessionId}`,
      JSON.stringify({ role: "bot", text: botReply, sources })
    );

    res.status(200).json({ reply: botReply, sources });
  } catch (error) {
    return res.json({
      reply:
        "⚠️ The assistant is currently overloaded. Please try again in a moment.",
    });
  }
});

export default { postMessage };
