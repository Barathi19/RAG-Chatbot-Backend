import { client } from "../config/ioredis.js";
import asyncHandler from "../middleware/async.js";
import { v4 as uuidv4, validate } from "uuid";
import { sendResponse } from "../utils/response.js";
import ErrorResponse from "../utils/errorResponse.js";

const startSession = asyncHandler(async (_, res) => {
  const sessionId = uuidv4();
  await client.del(`chat:${sessionId}`);
  await client.expire(`chat:${sessionId}`, 60 * 60 * 24); // 24 hours
  sendResponse({ sessionId }, 201, res);
});

const getHistory = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  if (!validate(sessionId)) {
    throw new ErrorResponse("Invalid sessionId", 400);
  }

  const exists = await client.exists(`chat:${sessionId}`);
  if (!exists) {
    throw new ErrorResponse("Session not found", 404);
  }

  const history = await client.lrange(`chat:${sessionId}`, 0, -1);
  const parsed = history.map((msg) => JSON.parse(msg));

  sendResponse(parsed, 200, res);
});

const deleteSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  if (!validate(sessionId)) {
    throw new ErrorResponse("Invalid sessionId", 400);
  }

  await client.del(`chat:${sessionId}`);

  res.json({ success: true, message: "Session reset successfully" });
});

export default {
  startSession,
  getHistory,
  deleteSession,
};
