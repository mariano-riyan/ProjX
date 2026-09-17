import { useQuery } from '@tanstack/react-query'
import { useApi } from '../lib/api'
import { Link } from 'react-router-dom'

// Matches the shape your listProjects controller returns
interface Project {
  id: number
  title: string
  description: string
  skills: string[]
  visibility: 'public' | 'private'
  featured: boolean
}

export default function Dashboard() {
  const { fetchApi } = useApi()

  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: ['projects'],       // cache key — React Query stores results under this
    queryFn: () => fetchApi('/api/projects'),
  })

  if (isLoading) return <div>Loading projects...</div>
  if (error) return <div>Error: {(error as Error).message}</div>

  return (
    <div>
      <h1>My Projects</h1>

      {projects?.length === 0 && <p>No projects yet.</p>}

      <Link to="/dashboard/new">Add Project</Link>
      
      <ul>
        {projects?.map((p) => (
          <li key={p.id}>
            <strong>{p.title}</strong> — {p.skills.join(', ')}
          </li>
        ))}
      </ul>
    </div>
  )
}