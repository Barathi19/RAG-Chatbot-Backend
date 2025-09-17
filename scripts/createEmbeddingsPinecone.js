import fs from "fs";
import axios from "axios";
import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
import { JINA, PINECONE_INDEX } from "../src/constant/index.js";
dotenv.config();

// Split text into chunks
function chunkText(text, chunkSize = 250, overlap = 50) {
  const words = text.split(" ");
  const chunks = [];
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    chunks.push(words.slice(i, i + chunkSize).join(" "));
  }
  return chunks;
}

// Initialize Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const index = pinecone.Index(PINECONE_INDEX);

const articles = JSON.parse(fs.readFileSync("articles.json", "utf-8"));

// Jina embeddings API call
async function getEmbeddings(chunks) {
  const response = await axios.post(
    JINA.URL,
    { model: JINA.MODEL, input: chunks },
    { headers: { Authorization: `Bearer ${process.env.JINA_API_KEY}` } }
  );

  return response.data.data.map((item) => item.embedding);
}

let idCounter = 1;
for (const article of articles) {
  const chunks = chunkText(`${article.title}. ${article.description}`);

  const embeddings = await getEmbeddings(chunks);

  console.log(embeddings, "EM");

  const vectors = embeddings.map((emb, i) => ({
    id: `chunk_${idCounter + i}`,
    values: emb,
    metadata: {
      title: article.title,
      link: article.link,
      text: chunks[i],
    },
  }));

  console.log("Vectors:", vectors);
  console.log("Vector to upsert:", vectors[0]);

  await index.upsert(vectors);

  idCounter += chunks.length;
  console.log(`Processed article: ${article.title}`);
}

console.log("✅ All embeddings created and stored in Pinecone DB");
