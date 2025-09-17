import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
import { JINA, PINECONE_INDEX } from "../constant/index.js";
import axios from "axios";
dotenv.config();

async function getEmbeddings(chunks) {
  const response = await axios.post(
    JINA.URL,
    { model: JINA.MODEL, input: chunks },
    { headers: { Authorization: `Bearer ${process.env.JINA_API_KEY}` } }
  );

  return response.data.data.map((item) => item.embedding);
}

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const index = pinecone.Index(PINECONE_INDEX);

export const getRelevantChunks = async (query) => {
  const queryEmbedding = await getEmbeddings([query]);

  const queryResponse = await index.query({
    vector: queryEmbedding[0],
    topK: 5,
    includeMetadata: true,
  });

  return queryResponse.matches || [];
};
