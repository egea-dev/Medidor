import { useState, useCallback } from 'react';
import { projectService } from '@/services/projectService';
import type { Project, FormData } from '@shared/types';

export function useProjects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        try {
            const data = await projectService.getAll();
            setProjects(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const createProject = async (formData: FormData, userId: string) => {
        try {
            const data = await projectService.create(formData, userId);
            return data;
        } catch (err: any) {
            setError(err.message);
            return null;
        }
    };

    const updateProjectStatus = async (projectId: string, status: Project['status']) => {
        try {
            await projectService.updateStatus(projectId, status);
            setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status } : p));
        } catch (err: any) {
            setError(err.message);
        }
    };

    const deleteProject = async (projectId: string) => {
        try {
            await projectService.delete(projectId);
            setProjects(prev => prev.filter(p => p.id !== projectId));
        } catch (err: any) {
            setError(err.message);
        }
    };

    return { projects, loading, error, fetchProjects, createProject, updateProjectStatus, deleteProject };
}
