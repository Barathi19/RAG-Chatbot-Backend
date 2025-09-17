import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import errorHandler from "./middleware/errorHandler.js";
import router from "./router/index.js";
import morgan from "morgan";
import { client } from "./config/ioredis.js";

dotenv.config();

const PORT = process.env.PORT || 4000;
const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded());
app.use(morgan("dev"));

app.get("/", (_, res) => {
  res.send("Hello world");
});

router(app);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
