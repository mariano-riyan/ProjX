import { Router } from "express";
import { createProject, listProjects, updateProject, deleteProject, getProject } from "../controllers/projects.controller.js";

const router = Router();

router.post("/", createProject);

router.get("/", listProjects);

router.get("/:id", getProject);

router.patch("/:id", updateProject);

router.delete("/:id", deleteProject);

export default router;