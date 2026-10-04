import "dotenv/config";
import express from "express";

import authRoutes from "./routes/auth.js";
import authenticate from "../middleware/authenticate.js";

const app = express();
const PORT = process.env.EXPRESS_PORT || 3000;

app.use(express.json());

app.use("/auth", authRoutes);
app.use(authenticate);

app.listen(PORT, () => {
  console.log("Server running at : ", PORT);
});
