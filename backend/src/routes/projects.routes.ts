import { Router } from "express";
import { createProject, listProjects, updateProject, deleteProject } from "../controllers/projects.controller.js";

const router = Router();

router.post("/", createProject);

router.get("/", listProjects);

router.patch("/:id", updateProject);

router.delete("/:id", deleteProject);

export default router;