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
    if (error)
      throw new Error({
        error: error,
      });
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
    const user = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();
    if (!user) {
      res.status(401).send({
        message: "wrong password",
      });
      throw new Error({
        message: "user doesnt exist, please register",
      });
    }

    const pwMatch = await bcrypt.compare(password, user.data.password);
    if (!pwMatch) {
      res.status(401).send({
        message: "wrong password",
      });
    }

    const token = await jwt.sign(
      JSON.stringify({
        userId: user.data.id,
        email: user.data.email,
      }),
      jwtSecret,
    );

    if (!token)
      throw new Error({
        message: "Error generating JWT",
      });

    res.status(201).send({
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
