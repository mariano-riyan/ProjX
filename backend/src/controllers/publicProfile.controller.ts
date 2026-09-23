import type { Request, Response } from 'express';
import { pool } from '../db/pool.js';


export const getPublicProfile = async (req: Request, res: Response) => {

    try {
        
        const username = req.params.username;

        if (!username) {
            return res.status(404).json({ error: "User not found." })
        }

        const result = await pool.query(
            `SELECT id, username, bio, avatar_url
            FROM users
            WHERE username = $1`,
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found." })
        }

        const user = result.rows[0];

        const projectResult = await pool.query(
            `SELECT p.*, 
                COALESCE(json_agg(s.name) FILTER (WHERE s.name IS NOT NULL), '[]') AS skills
            FROM projects p
            LEFT JOIN project_skills ps ON ps.project_id = p.id
            LEFT JOIN skills s ON s.id = ps.skill_id
            WHERE p.user_id = $1 AND p.visibility = 'public'
            GROUP BY p.id
            ORDER BY p.featured DESC, p.created_at DESC`,
            [user.id]
        );

        res.json({
            ...user,
            projects: projectResult.rows
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch user" })
    }
}