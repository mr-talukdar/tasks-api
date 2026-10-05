import express from "express";
import supabase from "../../util/db/supabaseClient.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

const saltRounds = parseInt(process.env.PW_SALTS);
const jwtSecret = process.env.JWT_SECRET_KEY;

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const { error } = await supabase.from("users").insert({
      name,
      email,
      password: hashedPassword,
    });
    if (error) {
      return res.status(400).send("invalid request");
    }
    res.status(201).send({
      message: "User Created",
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const response = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();
    if (!response.data || response.data.length === 0) {
      return res.status(401).send({
        message: "wrong password or user doesnt exist",
      });
    }

    const pwMatch = await bcrypt.compare(password, user.data.password);
    if (!pwMatch) {
      return res.status(401).send({
        message: "wrong password",
      });
    }

    const token = jwt.sign(
      JSON.stringify({
        userId: response.data.id,
        email: response.data.email,
      }),
      jwtSecret,
    );

    if (!token) {
      throw new Error("Error generating JWT");
    }

    res.status(200).send({
      message: "user logged in",
      token,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

export default router;
