import express from 'express';
import dotenv from 'dotenv';
import { pool } from "./db/pool.js";
import { clerkMiddleware, getAuth, clerkClient } from '@clerk/express'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(clerkMiddleware())

app.get("/me", async (req, res) => {
    const { isAuthenticated, userId } = getAuth(req)

    if (!isAuthenticated) {
        res.status(401).json({ error: "Unauthorized" })
        return
    }

    const clerkUser = await clerkClient.users.getUser(userId)

    const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress

    if (!primaryEmail) {
        res.status(400).json({ error: "User has no email address" })
        return
    }

    const username = clerkUser.username ?? primaryEmail.split('@')[0]
    const email = primaryEmail
    const avatarUrl = clerkUser.imageUrl

    const result = await pool.query(
        `INSERT INTO users (clerk_id, username, email, avatar_url)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (clerk_id)
         DO UPDATE SET username = $2, email = $3, avatar_url = $4
         RETURNING *`,
        [userId, username, email, avatarUrl]
    )

    res.json({ user: result.rows[0] })
})

app.get("/health", (req, res) => {
    res.json({ status: "ok" })
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});