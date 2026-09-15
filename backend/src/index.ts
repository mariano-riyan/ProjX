import { clerkMiddleware } from '@clerk/express';
import dotenv from 'dotenv';
import express from 'express';

import healthRoutes from './routes/health.routes.js';
import userRoutes from './routes/user.routes.js';
import projectsRoutes from './routes/projects.routes.js'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(clerkMiddleware())

app.use('/health', healthRoutes)
app.use('/', userRoutes)
app.use('/api/projects', projectsRoutes)

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});