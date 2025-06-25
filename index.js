import express from "express";
import "dotenv/config";
import { connectDb } from "./lib/db.js";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/booksRoutes.js"
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

const PORT=process.env.PORT || 3000;

app.use("/api/auth",authRoutes);
app.use("/api/books",bookRoutes);    

app.listen(3000, '0.0.0.0', () => {
  console.log('Server running on port 3000');
  connectDb();
});