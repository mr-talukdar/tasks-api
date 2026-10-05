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
    return res.status(500).send({
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
    res.status(500).send({
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
      return res.status(404).json({
        message: "No tasks",
      });
    res.status(200).send(data[0]);
  } catch (error) {
    return res.status(500).send({
      message: "There was an error",
      error,
    });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    const { userId } = req.user;
    const { title, description, completed } = req.body;
    let updatePayload = {};
    if (title) updatePayload.title = title;
    if (description) updatePayload.description = description;
    if (completed === true || completed === false)
      updatePayload.completed = completed;
    updatePayload = { ...updatePayload, updated_at: new Date().toISOString() };
    const { data: patchedData, error: err } = await supabase
      .from("tasks")
      .update(updatePayload)
      .eq("id", taskId)
      .eq("user_id", userId)
      .select();

    if (err) {
      return res.status(400).json({
        message: "Error updating the task",
        error: err,
      });
    }

    res.status(200).send({
      message: `Updated the task ${taskId}`,
      currentValue: patchedData,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    const { userId } = req.user;
    const { data, error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId)
      .eq("user_id", userId)
      .select();
    if (error) {
      return res.status(500).json({
        message: "Task cant be deleted",
      });
    }
    if (!data || data.length === 0) {
      return res
        .status(404)
        .json({ message: "Task not found or unauthorized" });
    }
    res.status(200).send({
      message: "Task Deleted Sucessfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "An internal Server error occurred",
      error,
    });
  }
});

export default router;
