import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
import { PINECONE_INDEX } from "../src/constant/index.js";
dotenv.config();

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

async function checkIndex() {
  const index = pinecone.Index(PINECONE_INDEX);

  const stats = await index.describeIndexStats();
  console.log("Index stats:", JSON.stringify(stats, null, 2));
}

checkIndex();
