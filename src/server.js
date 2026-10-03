import "dotenv/config";
import express from "express";
import jwt from "jsonwebtoken";

const app = express();
const PORT = process.env.EXPRESS_PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Server Running",
  });
});

app.listen(PORT, () => {
  console.log("Server running at : ", PORT);
});
