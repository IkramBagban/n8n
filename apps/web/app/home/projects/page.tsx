'use client'
import { ProjectList } from "@/components/project-list"
import axios from "axios";
import { useEffect, useState } from "react";

export default function ProjectsPage() {

  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('/api/rest/projects');

        setProjects(response.data?.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      <ProjectList projects={projects} />
    </div>
  )
}