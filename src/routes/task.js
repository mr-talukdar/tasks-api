import express from "express";
import supabase from "../../util/db/supabaseClient.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { userId } = req.user;
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId);
    if (error) throw new Error({ message: error });

    res.status(200).send(data);
  } catch (err) {
    return res.status(401).send({
      message: err.message,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { userId } = req.user;
    const { title, description, completed } = req.body;
    const { error } = await supabase.from("tasks").insert({
      user_id: userId,
      title,
      description,
      completed,
      updated_at: new Date().toISOString(),
    });
    if (error)
      return res.status(400).json({
        message: "An error happened trying to write",
        error,
      });
    res.status(201).json({
      message: "Task Created Successfully",
    });
  } catch (error) {
    res.status(501).send({
      message: error.message,
      error,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    const { userId } = req.user;
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("id", taskId);
    if (error) {
      return res.status(400).json({
        message: "No tasks or you are not authorised for the task",
        error,
      });
    }
    if (!data.length)
      return res.status(400).json({
        message: "No tasks",
      });
    res.status(200).json({
      message: "Here is the data requested",
      data,
    });
  } catch (error) {
    return res.status(401).send({
      message: "There was an error",
      error,
    });
  }
});

export default router;
