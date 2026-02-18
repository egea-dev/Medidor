import React from 'react';

interface WizardProgressProps {
    progress: number;
}

export const WizardProgress: React.FC<WizardProgressProps> = ({ progress }) => {
    return (
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100 z-50">
            <div
                className="h-full bg-brand-500 transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
};
