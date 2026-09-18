import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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

  const queryClient = useQueryClient()

  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: ['projects'],       // cache key — React Query stores results under this
    queryFn: () => fetchApi('/api/projects'),
  })

  const deleteProject = useMutation({
    mutationFn: (id: number) =>
      fetchApi(`/api/projects/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
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
            <Link to={`/dashboard/edit/${p.id}`}>Edit</Link>
            <button onClick={() => deleteProject.mutate(p.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}