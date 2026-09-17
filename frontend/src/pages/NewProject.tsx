import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useApi } from '../lib/api'

export default function NewProject() {
  
	const { fetchApi } = useApi()
	const queryClient = useQueryClient()
	const navigate = useNavigate()

	const createProject = useMutation({
		mutationFn: (newProject: object) =>
			fetchApi('/api/projects', {
				method: 'POST',
				body: JSON.stringify(newProject),
			}),
		onSuccess: () => {
			// tells React Query the cached 'projects' list is outdated — Dashboard will refetch it
			queryClient.invalidateQueries({ queryKey: ['projects'] })
			navigate('/dashboard')
		},
	})

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault() // stops the browser's default full-page-reload form submit
		createProject.mutate({
			title,
			short_description: description, // maps our field name to what the backend expects
			long_description: null,         // not built yet — explicit null, not undefined
			github_url: githubUrl,
			live_demo_url: liveUrl,
			screenshots: [],
			reflection: null,
			visibility,
			featured,
			skills,
		})
	}

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
	const [githubUrl, setGithubUrl] = useState('')
	const [liveUrl, setLiveUrl] = useState('')
	const [visibility, setVisibility] = useState('public') // default matches your DB check constraint
	const [featured, setFeatured] = useState(false)
	const [skills, setSkills] = useState<string[]>([])
	const [skillInput, setSkillInput] = useState('')

  return (
    <div>
      <h1>Add Project</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
				<div>
					<label>GitHub URL</label>
					<input
						type="text"
						value={githubUrl}
						onChange={(e) => setGithubUrl(e.target.value)}
					/>
				</div>
				<div>
					<label>Live Demo URL</label>
					<input
						type="text"
						value={liveUrl}
						onChange={(e) => setLiveUrl(e.target.value)}
					/>
				</div>
				<div>
					<label>Visibility</label>
					<select value={visibility} onChange={(e) => setVisibility(e.target.value)}>
						<option value="public">Public</option>
						<option value="private">Private</option>
					</select>
				</div>
				<div>
					<label>
						<input
							type="checkbox"
							checked={featured}
							onChange={(e) => setFeatured(e.target.checked)}
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
							setSkills([...skills, skillInput.trim()]) // new array, not mutating the old one
							setSkillInput('')
						}}
					>
						Add
					</button>

					<ul>
						{skills.map((skill, i) => (
							<li key={i}>
								{skill}{' '}
								<button
									type="button"
									onClick={() => setSkills(skills.filter((_, idx) => idx !== i))}
								>
									remove
								</button>
							</li>
						))}
					</ul>
				</div>

				<button type="submit" disabled={createProject.isPending}>
					{createProject.isPending ? 'Saving...' : 'Save Project'}
				</button>
      </form>
    </div>
  )
}