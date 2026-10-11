import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { useApi } from '../lib/api'

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

	const [skillFilter, setSkillFilter] = useState('')
	const [visibilityFilter, setVisibilityFilter] = useState('all')
	const [featuredOnly, setFeaturedOnly] = useState(false)

	// Ensures our DB has a row for this Clerk user (your /me route upserts it)
	const meQuery = useQuery({
		queryKey: ['me'],
		queryFn: () => fetchApi('/me'),
	})

	const { data: projects, isLoading, error } = useQuery<Project[]>({
		queryKey: ['projects'],
		queryFn: () => fetchApi('/api/projects'),
		enabled: meQuery.isSuccess, // `enabled`: React Query holds the query until this is true
	})

	const deleteProject = useMutation({
		mutationFn: (id: number) =>
		fetchApi(`/api/projects/${id}`, { method: 'DELETE' }),
		onSuccess: () => {
		queryClient.invalidateQueries({ queryKey: ['projects'] })
		},
	})

	const filteredProjects = projects?.filter((p) => {
	const matchesSkill =
		skillFilter === '' ||
		p.skills.some((s) => s.toLowerCase().includes(skillFilter.toLowerCase()))

	const matchesVisibility =
		visibilityFilter === 'all' || p.visibility === visibilityFilter

	const matchesFeatured = !featuredOnly || p.featured

	return matchesSkill && matchesVisibility && matchesFeatured
	})

	if (meQuery.isLoading || isLoading) return <div>Loading projects...</div>
	if (meQuery.error || error) return <div>Error: {((meQuery.error || error) as Error).message}</div>

	return (
		<div>
		<h1>My Projects</h1>

		{filteredProjects?.length === 0 && <p>No projects match your filters.</p>}

		<Link to="/dashboard/new">Add Project</Link>
		
		<div>
		<input
			type="text"
			placeholder="Filter by skill..."
			value={skillFilter}
			onChange={(e) => setSkillFilter(e.target.value)}
		/>

		<select
			value={visibilityFilter}
			onChange={(e) => setVisibilityFilter(e.target.value)}
		>
			<option value="all">All</option>
			<option value="public">Public</option>
			<option value="private">Private</option>
		</select>

		<label>
			<input
			type="checkbox"
			checked={featuredOnly}
			onChange={(e) => setFeaturedOnly(e.target.checked)}
			/>
			Featured only
		</label>
		</div>

		<ul>
			{filteredProjects?.map((p) => (
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