import React from 'react';
import { Calendar, MapPin, ChevronRight, FileText } from 'lucide-react';
import { Project } from '@shared/types';
import { useNavigate } from 'react-router-dom';

interface ProjectCardProps {
    project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
    const navigate = useNavigate();

    const getStatusColor = (status: Project['status']) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div
            onClick={() => navigate(`/projects/${project.id}`)}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
            <div>
                <div className="flex justify-between items-start mb-3">
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md border ${getStatusColor(project.status)}`}>
                        {project.status === 'draft' ? 'Borrador' : project.status === 'in_progress' ? 'En Curso' : 'Completado'}
                    </span>
                    <span className="text-gray-400">
                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">
                    {project.location}
                </h3>
                <p className="text-sm text-gray-500 mb-4">{project.jobType || 'Sin tipo de trabajo'}</p>

                <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Calendar size={14} />
                        {new Date(project.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <FileText size={14} />
                        {project.measurements?.length || 0} mediciones registradas
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">
                    Responsable: <span className="text-gray-700">{project.firstName}</span>
                </span>
            </div>
        </div>
    );
};
