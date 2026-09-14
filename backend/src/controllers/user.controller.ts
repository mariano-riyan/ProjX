import type { Request, Response } from 'express'
import { getAuth, clerkClient } from '@clerk/express'
import { pool } from '../db/pool.js'

export const getMe = async (req: Request, res: Response) => {
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
}