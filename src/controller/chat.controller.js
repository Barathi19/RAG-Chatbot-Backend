import { validate } from "uuid";
import { client } from "../config/ioredis.js";
import asyncHandler from "../middleware/async.js";
import ErrorResponse from "../utils/errorResponse.js";
import { getRelevantChunks } from "../service/pinecone.service.js";
import { getGeminiAnswer } from "../service/gemini.service.js";

const overloadTxt =
  "⚠️ The assistant is currently overloaded. Please try again in a moment.";

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

  const rawHistory = await client.lrange(`chat:${sessionId}`, 0, -1);
  const historyText = rawHistory
    .map((item) => {
      const obj = JSON.parse(item);
      return `${obj.role === "user" ? "User" : "Bot"}: ${obj.text}`;
    })
    .join("\n");

  try {
    const botReply = await getGeminiAnswer(message, contextText, historyText);
    await client.rpush(
      `chat:${sessionId}`,
      JSON.stringify({ role: "bot", text: botReply, sources })
    );

    res.status(200).json({ reply: botReply, sources });
  } catch (error) {
    await client.rpush(
      `chat:${sessionId}`,
      JSON.stringify({ role: "bot", text: overloadTxt })
    );
    return res.json({
      reply: overloadTxt,
    });
  }
});

export default { postMessage };
