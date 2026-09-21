import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useApi } from '../lib/api'

interface FormData {
  title: string
  description: string
  githubUrl: string
  liveUrl: string
  visibility: string
  featured: boolean
  skills: string[]
}

export default function NewProject() {
	
	const { fetchApi } = useApi()
	const queryClient = useQueryClient()
	const navigate = useNavigate()
	const { id } = useParams()
	const isEditMode = Boolean(id)

	const [skillInput, setSkillInput] = useState('')

	const [formData, setFormData] = useState<FormData>({
		title: '',
		description: '',
		githubUrl: '',
		liveUrl: '',
		visibility: 'public',
		featured: false,
		skills: [],
	})

	const {
		data: existingProject,
		isLoading: isProjectLoading,
		error: projectError,
	} = useQuery({
		queryKey: ['projects', id],
		queryFn: () => fetchApi(`/api/projects/${id}`),
		enabled: isEditMode,
	})

	

	
	useEffect(() => {
		if (existingProject) {
			// eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: hydrating form state from an async fetch (React Query), not derivable during render
			setFormData({
			title: existingProject.title,
			description: existingProject.short_description ?? '',
			githubUrl: existingProject.github_url ?? '',
			liveUrl: existingProject.live_demo_url ?? '',
			visibility: existingProject.visibility,
			featured: existingProject.featured,
			skills: existingProject.skills ?? [],
			})
		}
		
	}, [existingProject])

	const saveProject = useMutation({
		mutationFn: (projectData: object) =>
			isEditMode
			? fetchApi(`/api/projects/${id}`, {
				method: 'PATCH',
				body: JSON.stringify(projectData),
				})
			: fetchApi('/api/projects', {
				method: 'POST',
				body: JSON.stringify(projectData),
				}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['projects'] })
			navigate('/dashboard')
		},
	})

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault() // stops the browser's default full-page-reload form submit
		saveProject.mutate({
			title: formData.title,
			short_description: formData.description, // maps our field name to what the backend expects
			long_description: null,         // not built yet — explicit null, not undefined
			github_url: formData.githubUrl,
			live_demo_url: formData.liveUrl,
			screenshots: isEditMode ? undefined : [],
			reflection: null,
			visibility: formData.visibility,
			featured: formData.featured,
			skills: formData.skills,
		})
	}

	if (isEditMode && isProjectLoading) return <div>Loading project...</div>
	if (isEditMode && projectError) return <div>Error: {(projectError as Error).message}</div>

	return (
		<div>
		<h1>Add Project</h1>
		<form onSubmit={handleSubmit}>
			<div>
			<label>Title</label>
			<input
				type="text"
				value={formData.title}
				onChange={(e) => setFormData({ ...formData, title: e.target.value })}
			/>
			</div>
			<div>
			<label>Description</label>
			<textarea
				value={formData.description}
				onChange={(e) => setFormData({ ...formData, description: e.target.value })}
			/>
			</div>
			<div>
				<label>GitHub URL</label>
				<input
					type="text"
					value={formData.githubUrl}
					onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
				/>
			</div>
			<div>
				<label>Live Demo URL</label>
				<input
					type="text"
					value={formData.liveUrl}
					onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
				/>
			</div>
			<div>
				<label>Visibility</label>
				<select 
					value={formData.visibility} 
					onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
				>
					<option value="public">Public</option>
					<option value="private">Private</option>
				</select>
			</div>
			<div>
				<label>
					<input
						type="checkbox"
						checked={formData.featured}
						onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
					/>
					Featured
				</label>
			</div>
			<div>
				<label>Skills</label>
				<input
					type="text"
					value={skillInput}
					onChange={(e) => setSkillInput(e.target.value)}
					placeholder="e.g. React"
				/>
				<button
					type="button"
					onClick={() => {
						if (skillInput.trim() === '') return
						setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] })
						setSkillInput('')
					}}
				>
					Add
				</button>
				<ul>
					{formData.skills.map((skill, i) => (
						<li key={i}>
							{skill}{' '}
							<button
								type="button"
								onClick={() => setFormData({
									...formData,
									skills: formData.skills.filter((_, idx) => idx !== i)
								})}
							>
								remove
							</button>
						</li>
					))}
				</ul>
			</div>
			<button type="submit" disabled={saveProject.isPending}>
				{saveProject.isPending ? 'Saving...' : 'Save Project'}
			</button>
		</form>
		</div>
	)
}