import type { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { pool } from "../db/pool.js";

export async function createProject(req: Request, res: Response) {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

  const {
    title, short_description, long_description,
    github_url, live_demo_url, screenshots,
    reflection, visibility, featured, skills, // skills: string[] from request body
  } = req.body;

  if (!title) return res.status(400).json({ error: "Title is required" });

  const client = await pool.connect(); // checkout a single connection so all queries share one transaction
  try {
    await client.query("BEGIN");

    // 1. resolve internal user id from clerk_id
    const userResult = await client.query(
      "SELECT id FROM users WHERE clerk_id = $1",
      [clerkId]
    );
    if (userResult.rows.length === 0) {
      throw new Error("User not found");
    }
    const userId = userResult.rows[0].id;

    // 2. insert the project
    const projectResult = await client.query(
      `INSERT INTO projects
        (user_id, title, short_description, long_description, github_url, live_demo_url, screenshots, reflection, visibility, featured)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [userId, title, short_description, long_description, github_url, live_demo_url, screenshots, reflection, visibility ?? "private", featured ?? false]
    );
    const project = projectResult.rows[0];

    // 3. upsert each skill, then link it
    for (const name of skills ?? []) {
      const skillResult = await client.query(
        `INSERT INTO skills (user_id, name) VALUES ($1, $2)
         ON CONFLICT (user_id, name) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`, // ON CONFLICT ... DO UPDATE is a trick to get RETURNING id even when it already existed
        [userId, name]
      );
      const skillId = skillResult.rows[0].id;

      await client.query(
        `INSERT INTO project_skills (project_id, skill_id) VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [project.id, skillId]
      );
    }

    await client.query("COMMIT");
    res.status(201).json(project);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Failed to create project" });
  } finally {
    client.release(); // always release the connection back to the pool
  }
}

export async function listProjects(req: Request, res: Response) {
    try {
        const { userId: clerkId } = getAuth(req);
        if (!clerkId) return res.status(404).json({ error: "Unauthorized" });

        const userResult = await pool.query(
            "SELECT id FROM users WHERE clerk_id = $1", [clerkId]
        );
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        const userId = userResult.rows[0].id;

        const result = await pool.query(
            `SELECT p.*, 
                COALESCE(json_agg(s.name) FILTER (WHERE s.name IS NOT NULL), '[]') AS skills
            FROM projects p
            LEFT JOIN project_skills ps ON ps.project_id = p.id
            LEFT JOIN skills s ON s.id = ps.skill_id
            WHERE p.user_id = $1
            GROUP BY p.id
            ORDER BY p.created_at DESC`,
            [userId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch projects" })
    }
}

export async function updateProject(req: Request, res: Response) {
  try {
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

    const userResult = await pool.query(
      "SELECT id FROM users WHERE clerk_id = $1",
      [clerkId]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const userId = userResult.rows[0].id;
    const { id } = req.params; // :id from the route path, e.g. /api/projects/5

    const projectResult = await pool.query(
      "SELECT * FROM projects WHERE id = $1",
      [id]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    const project = projectResult.rows[0];

    if (project.user_id !== userId) {
      return res.status(403).json({ error: "Forbidden" }); // exists, but doesn't belong to you
    }

        const {
      title, short_description, long_description,
      github_url, live_demo_url, screenshots,
      reflection, visibility, featured,
    } = req.body;

    const updateResult = await pool.query(
      `UPDATE projects SET
        title = COALESCE($1, title),
        short_description = COALESCE($2, short_description),
        long_description = COALESCE($3, long_description),
        github_url = COALESCE($4, github_url),
        live_demo_url = COALESCE($5, live_demo_url),
        screenshots = COALESCE($6, screenshots),
        reflection = COALESCE($7, reflection),
        visibility = COALESCE($8, visibility),
        featured = COALESCE($9, featured),
        updated_at = now()
       WHERE id = $10
       RETURNING *`,
      [title, short_description, long_description, github_url, live_demo_url, screenshots, reflection, visibility, featured, id]
    );

    res.json(updateResult.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update project" });
  }
}

export async function deleteProject(req: Request, res: Response) {
  try {
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

    const userResult = await pool.query(
      "SELECT id FROM users WHERE clerk_id = $1",
      [clerkId]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const userId = userResult.rows[0].id;
    const { id } = req.params;

    const projectResult = await pool.query(
      "SELECT * FROM projects WHERE id = $1",
      [id]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    const project = projectResult.rows[0];

    if (project.user_id !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await pool.query("DELETE FROM projects WHERE id = $1", [id]);

    res.status(204).send();

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete project" });
  }
}