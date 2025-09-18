import { Router } from "express";
import { createTask, deleteTask, getTasks, updateTask, getTaskById } from "../Controllers/task.controller.js";
import { verifyJwt } from "../middlewares/Auth.js";

const router = Router();
router.use(verifyJwt);

router.route("/")
  .post(createTask)
  .get(getTasks);

router.route("/:id")
  .put(updateTask)
  .delete(deleteTask)
  .get(getTaskById);

export default router;
