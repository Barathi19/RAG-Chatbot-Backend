# RAG Chat Backend

This is the backend service for a **Retrieval-Augmented Generation (RAG) chatbot** that answers user questions based on contextual news data.  
It uses **Redis** for session management, **Pinecone** for vector search, and **Google Gemini** for AI responses.

---

## Features

- Session management with Redis (24-hour expiry per session).
- Retrieval of relevant chunks from Pinecone for grounding.
- Gemini-powered AI answers with context + history.
- Chat history persistence per session.
- API responses include **sources** for transparency.
- Clean error handling and retry mechanism for Gemini overload.

---

## Tech Stack

- **Node.js + Express** – API server
- **Redis / Upstash Redis** – Session storage
- **Pinecone** – Vector database for retrieval
- **Google Gemini API** – Large Language Model
- **UUID** – Session IDs

---

## Installation

```bash
# Clone repo
git clone https://github.com/Barathi19/RAG-Chatbot-Backend.git
cd backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
```
---
## Environment Variable
**Create a .env file with:**
```
PORT=5000
REDIS_URL=redis://localhost:6379   # or Upstash Redis URL
PINECONE_API_KEY=your-pinecone-api-key
JINA_API_KEY=your-api-key
GEMINI_API_KEY=your-gemini-api-key
```
---
# Run Server
### Development
npm run dev
### Production
npm start

Server runs on http://localhost:5000

---

# API Endpoints

## Session Management
### 1. Start Session

##### POST /api/session
***Response:***
```
{
  "success": true,
  "data": { "sessionId": "uuid" }
}
```

### 2. Get Chat History

##### GET /api/session/:sessionId


### 3. Delete Session
##### DELETE /api/session/:sessionId

### Chat
### Send Message
##### POST /api/chat


***Request:***
```
{
  "sessionId": "uuid",
  "message": "Hi there"
}
```
***Response:***
```
{
  "reply": "Here’s the answer...",
  "sources": ["https://example.com/article1", "https://example.com/article2"]
}
```
---

# Project Structure
```
scripts/
├── createEmbeddingsPinecone/     # script for store embedding in Vector DB 
├── fetchNews/                    # script to generate articles.json from RSS feed 
src/
├── config/                       # Redis & other config
├── constants/                    # constant varaibles
├── controllers/                  # Session & chat controllers
├── middleware/                   # Async handler, error handler
├── router/                       # Session & chat router
├── service/                      # Pinecone + Gemini services
├── utils/                        # Helpers (error, response)
├── server.js                     # App entry
```
---
## Example Flow

- Frontend calls Start Session → gets sessionId.
- User sends message → backend retrieves context from Pinecone.
- Gemini generates an answer → backend stores reply in Redis.
- Sources are returned alongside AI response.
- Chat history available until session is reset or expired (24h).

---

# Error Handling

- Invalid session → 400 Bad Request
- Session not found → 404 Not Found
- Gemini overload → returns fallback:
```
{ "reply": "⚠️ The assistant is currently overloaded. Please try again in a moment." }
```

---
