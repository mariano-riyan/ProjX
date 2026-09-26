import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

interface Project {
	id: number
	title: string
	short_description?: string
    long_description?: string
    github_url?: string
    live_demo_url?: string
    screenshots?: string[]
    reflection?: string
	skills: string[]
	visibility: 'public' | 'private'
	featured: boolean
}

interface Profile {
    id: number
    username: string
    bio: string | null
    avatar_url: string
    projects: Project[]
}

export default function PublicProfile() {
    
    const { username } = useParams();

    const url = `${import.meta.env.VITE_API_URL}/public-profile/${username}`;

    const { data: profile, isLoading, error } = useQuery<Profile>({
        queryKey: [username],
        queryFn: async () => {
            const response = await fetch(url)

            if (!response.ok) {
                throw new Error("Can't fetch the profile.")
            }

            return response.json();
        }
    });

    if (isLoading) return <div>Loading projects...</div>
	if (error) return <div>Error: {(error as Error).message}</div>

    if (profile === undefined) return null

    const featuredProject = profile.projects.find((project) => project.featured === true);
    const otherProjects = profile.projects.filter((project) => !project.featured);

    const skills = profile.projects.flatMap((project) => project.skills);
    const uniqueSkills = [...new Set(skills)];

    return(
        <>
            <div>
                <p>{profile.username}</p>
                <img src={profile.avatar_url} alt="avatar" />
                <p>{profile.bio}</p>
            </div>

            <div>
                <p>{featuredProject?.title}</p>
                {featuredProject?.skills.map((skills) => (
                    <p key={skills}>{skills}</p>
                ))}

                <p>{featuredProject?.short_description}</p>
                {featuredProject?.screenshots?.map((url) => (
                    <img
                        key={url}
                        src={url}
                        alt={featuredProject.title}
                    />
                ))}
            </div>

            {otherProjects.map((project) => (
                <div key={project.id}>
                    <p>{project.title}</p>
                    <p>{project.short_description}</p>
                    {project.skills.map((skill) => (
                        <p key={skill}>{skill}</p>
                    ))}
                </div>
            ))}

            {uniqueSkills.map((skill) => (
                <p key={skill}>{skill}</p>
            ))}
        </>
    );
}